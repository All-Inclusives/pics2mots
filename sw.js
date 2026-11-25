/*
  Service worker de Pics2Mots.

  Rôle : permettre l'ouverture de l'outil sans réseau, et conserver les
  pictogrammes déjà consultés.

  Principes retenus :
  - la page elle-même est cherchée sur le réseau d'abord, pour que les mises à
    jour arrivent dès qu'il y a une connexion ; le cache ne sert que de secours ;
  - les fichiers de l'application (logo, icônes, manifest) sont servis depuis le
    cache, ce qui rend le démarrage instantané ;
  - les images ARASAAC sont mises en cache au passage, mais l'application gère
    déjà son propre cache d'images : on ne fait ici qu'un filet de sécurité ;
  - aucune donnée de recherche n'est mise en cache : le catalogue doit rester
    géré par l'application, pas par ce fichier.
*/

const NOM_CACHE = "pics2mots-v2";

const FICHIERS_APPLICATION = [
  "./index.html",
  "./retours.html",
  "./depouillement.html",
  "./styles/app.css",
  "./js/donnees.js",
  "./js/catalogue.js",
  "./js/audio.js",
  "./js/app.js",
  "./logo.png",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-masquable-512.png",
  "./manifest.json"
];

self.addEventListener("install", (evenement) => {
  evenement.waitUntil(
    caches.open(NOM_CACHE)
      .then(async (cache) => {
        // Fichier par fichier : un fichier manquant ne doit pas empêcher
        // l'installation du service worker.
        for (const fichier of FICHIERS_APPLICATION) {
          try {
            await cache.add(new Request(fichier, { cache: "reload" }));
          } catch (erreur) {
            // ignoré volontairement
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms
          .filter((nom) => nom !== NOM_CACHE && nom.startsWith("pics2mots-"))
          .map((nom) => caches.delete(nom))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evenement) => {
  const requete = evenement.request;

  if (requete.method !== "GET") return;

  const url = new URL(requete.url);

  // 1. Navigation : réseau d'abord, cache ensuite.
  //
  // Attention : le site comporte plusieurs pages (l'application, le
  // questionnaire de retour, le dépouillement). Une réponse ne doit être
  // enregistrée sous « index.html » que si c'est bien l'application ;
  // sinon on écraserait la page principale par une autre.
  if (requete.mode === "navigate") {
    evenement.respondWith((async () => {
      const chemin = new URL(requete.url).pathname;
      const estApplication = chemin.endsWith("/") || chemin.endsWith("/index.html");

      try {
        const reponse = await fetch(requete);
        if (reponse && reponse.ok) {
          const cache = await caches.open(NOM_CACHE);
          await cache.put(estApplication ? "./index.html" : requete, reponse.clone());
        }
        return reponse;
      } catch (erreur) {
        const enCache = await caches.match(requete);
        if (enCache) return enCache;
        const application = await caches.match("./index.html");
        return application || Response.error();
      }
    })());
    return;
  }

  // 2. Ressources de l'application : cache d'abord.
  if (url.origin === self.location.origin) {
    evenement.respondWith(
      caches.match(requete).then((enCache) => {
        if (enCache) return enCache;
        return fetch(requete).then((reponse) => {
          if (reponse && reponse.ok && reponse.type === "basic") {
            const copie = reponse.clone();
            caches.open(NOM_CACHE).then((cache) => cache.put(requete, copie));
          }
          return reponse;
        });
      })
    );
    return;
  }

  // 3. Images ARASAAC : filet de sécurité hors ligne.
  if (url.hostname === "api.arasaac.org" && requete.destination === "image") {
    evenement.respondWith(
      caches.match(requete).then((enCache) => {
        if (enCache) return enCache;
        return fetch(requete).then((reponse) => {
          if (reponse && reponse.ok) {
            const copie = reponse.clone();
            caches.open(NOM_CACHE).then((cache) => cache.put(requete, copie));
          }
          return reponse;
        });
      })
    );
  }
});
