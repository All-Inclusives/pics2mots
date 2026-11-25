/* ==========================================================================
   Catalogue des pictogrammes et base locale
   Chargement depuis l'appareil ou depuis ARASAAC, conservation dans la
   base locale du navigateur, et interface de gestion des catalogues.
   Expose : window.Atelier.catalogue
   ========================================================================== */
(function () {
  window.Atelier = window.Atelier || {};

  /* Catalogues chargés en mémoire. Deux au maximum : sur une tablette, garder
     les huit langues actives coûterait plusieurs centaines de mégaoctets.
     Les autres restent dans la base locale et se rechargent à la demande. */
  const basesParLangue = new Map();

    function remplirDatalist(base) {
      const freq = new Map();
      for (const p of base) {
        for (const t of [...(p.categories || []), ...(p.tags || [])]) {
          const clean = (t || "").trim();
          if (clean.length >= 2) freq.set(clean, (freq.get(clean) || 0) + 1);
        }
      }
      const top = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 300).map(([k]) => k);
      document.getElementById("datalist-tags").innerHTML = top
        .map(t => `<option value="${t.replace(/"/g, "&quot;")}">`)
        .join("");
    }

    /* ---------------------------------------------------------------
       BASE LOCALE DES CATALOGUES
       Un catalogue de langue pèse environ 6,6 Mo. Le retélécharger à
       chaque recherche sollicitait inutilement le site d'ARASAAC et
       interdisait tout usage hors connexion. Il est désormais conservé
       sur l'appareil, en deux parties : le contenu, et un inventaire
       léger qui permet d'afficher l'état sans tout relire.
    --------------------------------------------------------------- */

    const NOM_BASE_CATALOGUES = "arasaac-catalogues-v1";
    const LANGUES_BASE = [
      ["fr", "Français"], ["en", "Anglais"], ["es", "Espagnol"], ["de", "Allemand"],
      ["it", "Italien"], ["pt", "Portugais"], ["ar", "Arabe"], ["uk", "Ukrainien"]
    ];

    let baseCatalogues = null;
    const inventaireBases = new Map();

    function ouvrirBaseCatalogues() {
      if (baseCatalogues) return Promise.resolve(baseCatalogues);
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error("stockage local indisponible"));
          return;
        }
        const requete = window.indexedDB.open(NOM_BASE_CATALOGUES, 1);
        requete.onupgradeneeded = () => {
          const base = requete.result;
          if (!base.objectStoreNames.contains("langues")) base.createObjectStore("langues");
          if (!base.objectStoreNames.contains("inventaire")) base.createObjectStore("inventaire");
        };
        requete.onsuccess = () => {
          baseCatalogues = requete.result;
          resolve(baseCatalogues);
        };
        requete.onerror = () => reject(requete.error || new Error("base locale inaccessible"));
      });
    }

    async function lireContenuStocke(langue) {
      try {
        const base = await ouvrirBaseCatalogues();
        return await new Promise((resolve) => {
          const transaction = base.transaction("langues", "readonly");
          const requete = transaction.objectStore("langues").get(langue);
          requete.onsuccess = () => resolve(requete.result || null);
          requete.onerror = () => resolve(null);
        });
      } catch (erreur) {
        return null;
      }
    }

    async function lireInventaire() {
      try {
        const base = await ouvrirBaseCatalogues();
        return await new Promise((resolve) => {
          const transaction = base.transaction("inventaire", "readonly");
          const requete = transaction.objectStore("inventaire").getAll();
          requete.onsuccess = () => resolve(requete.result || []);
          requete.onerror = () => resolve([]);
        });
      } catch (erreur) {
        return [];
      }
    }

    async function ecrireCatalogueStocke(langue, contenu, metadonnees) {
      try {
        const base = await ouvrirBaseCatalogues();
        await new Promise((resolve) => {
          const transaction = base.transaction(["langues", "inventaire"], "readwrite");
          transaction.objectStore("langues").put(contenu, langue);
          transaction.objectStore("inventaire").put(metadonnees, langue);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        });
        inventaireBases.set(langue, metadonnees);
        return true;
      } catch (erreur) {
        // quota dépassé ou stockage refusé : la recherche reste possible,
        // seule la conservation sur l'appareil est perdue.
        return false;
      }
    }

    async function supprimerCatalogueStocke(langue) {
      try {
        const base = await ouvrirBaseCatalogues();
        await new Promise((resolve) => {
          const transaction = base.transaction(["langues", "inventaire"], "readwrite");
          transaction.objectStore("langues").delete(langue);
          transaction.objectStore("inventaire").delete(langue);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        });
        inventaireBases.delete(langue);
        basesParLangue.delete(langue);
        return true;
      } catch (erreur) {
        return false;
      }
    }

    function empreinteCatalogue(donnees) {
      let somme = 0;
      let derniere = "";
      for (const fiche of donnees) {
        somme += fiche._id || 0;
        if (fiche.lastUpdated && fiche.lastUpdated > derniere) derniere = fiche.lastUpdated;
      }
      return donnees.length + "-" + somme + "-" + derniere;
    }

    /* Deux catalogues en mémoire au maximum : sur une tablette, garder les
       huit langues actives coûterait plusieurs centaines de mégaoctets. */
    function memoriserBase(langue, donnees) {
      basesParLangue.set(langue, donnees);
      while (basesParLangue.size > 2) {
        const plusAncienne = basesParLangue.keys().next().value;
        if (plusAncienne === langue) break;
        basesParLangue.delete(plusAncienne);
      }
    }

    async function chargerBaseLangue(langue, forcerReseau) {
      if (!forcerReseau && basesParLangue.has(langue)) {
        return basesParLangue.get(langue);
      }

      // 1. copie conservée sur l'appareil
      if (!forcerReseau) {
        const contenu = await lireContenuStocke(langue);
        if (contenu) {
          try {
            const donnees = JSON.parse(contenu);
            if (Array.isArray(donnees) && donnees.length) {
              memoriserBase(langue, donnees);
              return donnees;
            }
          } catch (erreur) {
            // copie illisible : elle sera remplacée par un téléchargement
          }
        }
      }

      // 2. téléchargement depuis ARASAAC, puis conservation
      const reponse = await fetch("https://api.arasaac.org/v1/pictograms/all/" + langue);
      if (!reponse.ok) throw new Error("téléchargement impossible (" + reponse.status + ")");

      const contenu = await reponse.text();
      const donnees = JSON.parse(contenu);
      if (!Array.isArray(donnees) || !donnees.length) throw new Error("catalogue vide");

      memoriserBase(langue, donnees);

      const metadonnees = {
        langue: langue,
        quand: new Date().toISOString(),
        octets: new Blob([contenu]).size,
        pictogrammes: donnees.length,
        empreinte: empreinteCatalogue(donnees)
      };
      await ecrireCatalogueStocke(langue, contenu, metadonnees);
      rafraichirBaseLocale();

      return donnees;
    }
    /* ---------------------------------------------------------------
       GESTION DE LA BASE LOCALE (affichage et actions)
    --------------------------------------------------------------- */

    function poidsLisible(octets) {
      if (!octets) return "—";
      if (octets < 1024 * 1024) return Math.round(octets / 1024) + " Ko";
      return (octets / (1024 * 1024)).toFixed(1) + " Mo";
    }

    function dateLisible(iso) {
      if (!iso) return "—";
      try {
        return new Date(iso).toLocaleDateString(undefined, {
          year: "numeric", month: "2-digit", day: "2-digit"
        });
      } catch (erreur) {
        return String(iso).slice(0, 10);
      }
    }

    function rafraichirBaseLocale() {
      const corps = document.getElementById("corps-base-locale");
      if (!corps) return;

      corps.innerHTML = LANGUES_BASE.map(([code, nom]) => {
        const entree = inventaireBases.get(code);
        const presente = Boolean(entree);
        return `
          <tr>
            <td>${nom} <span class="mono">${code}</span></td>
            <td class="${presente ? "etat-disponible" : "etat-absente"}">${presente ? "disponible" : "absente"}</td>
            <td class="col-poids">${presente ? poidsLisible(entree.octets) : "—"}</td>
            <td>${presente ? dateLisible(entree.quand) : "—"}</td>
            <td>
              <button type="button" class="btn-mini" data-base="${code}" data-action="telecharger"${presente ? "" : ""}>${presente ? "Actualiser" : "Télécharger"}</button>
              ${presente ? `<button type="button" class="btn-mini" data-base="${code}" data-action="supprimer" title="Supprimer">✕</button>` : ""}
            </td>
          </tr>`;
      }).join("");

      const total = [...inventaireBases.values()].reduce((somme, entree) => somme + (entree.octets || 0), 0);
      const etat = document.getElementById("etat-base-locale");
      if (etat) {
        etat.textContent = inventaireBases.size
          ? inventaireBases.size + " langue(s) conservée(s) — " + poidsLisible(total)
          : "aucun catalogue conservé";
      }
    }

    function majEtatBaseLocale(message) {
      const etat = document.getElementById("etat-base-locale");
      if (etat) etat.textContent = message || "";
    }

    document.getElementById("corps-base-locale").addEventListener("click", async (evenement) => {
      const bouton = evenement.target.closest ? evenement.target.closest("button[data-base]") : null;
      if (!bouton) return;

      const code = bouton.dataset.base;
      const action = bouton.dataset.action;
      bouton.disabled = true;

      if (action === "supprimer") {
        await supprimerCatalogueStocke(code);
      } else {
        majEtatBaseLocale("Téléchargement de " + code + "…");
        try {
          await chargerBaseLangue(code, true);
          majEtatBaseLocale("Catalogue " + code + " à jour.");
        } catch (erreur) {
          majEtatBaseLocale("Échec : " + ((erreur && erreur.message) || erreur));
        }
      }

      bouton.disabled = false;
      rafraichirBaseLocale();
    });

    document.getElementById("btn-tout-telecharger").addEventListener("click", async (evenement) => {
      const bouton = evenement.currentTarget;
      const confirme = window.confirm(
        "Télécharger les huit catalogues ?\n\n"
        + "Environ 51 Mo au total, une seule fois. Ils seront conservés sur cet appareil "
        + "et la recherche fonctionnera ensuite sans réseau."
      );
      if (!confirme) return;

      bouton.disabled = true;
      for (const [code, nom] of LANGUES_BASE) {
        majEtatBaseLocale("Téléchargement : " + nom + "…");
        try {
          await chargerBaseLangue(code, true);
        } catch (erreur) {
          majEtatBaseLocale(nom + " : échec (" + ((erreur && erreur.message) || erreur) + ")");
        }
        rafraichirBaseLocale();
      }
      majEtatBaseLocale("Base locale complète.");
      bouton.disabled = false;
      rafraichirBaseLocale();
    });

    document.getElementById("btn-verifier-bases").addEventListener("click", async (evenement) => {
      const codes = [...inventaireBases.keys()];
      if (!codes.length) {
        majEtatBaseLocale("Aucun catalogue à vérifier.");
        return;
      }

      const confirme = window.confirm(
        "Vérifier les mises à jour ?\n\n"
        + "ARASAAC ne fournit aucun indicateur de version : la vérification retélécharge "
        + "les " + codes.length + " catalogue(s) conservé(s). C'est la seule méthode possible, "
        + "et cela reste sans effet si rien n'a changé."
      );
      if (!confirme) return;

      const bouton = evenement.currentTarget;
      bouton.disabled = true;
      const changements = [];

      for (const code of codes) {
        const ancienne = inventaireBases.get(code);
        const nom = (LANGUES_BASE.find(([c]) => c === code) || [code, code])[1];
        majEtatBaseLocale("Vérification : " + nom + "…");
        try {
          await chargerBaseLangue(code, true);
          const nouvelle = inventaireBases.get(code);
          if (ancienne && nouvelle && ancienne.empreinte !== nouvelle.empreinte) {
            const ecart = nouvelle.pictogrammes - ancienne.pictogrammes;
            changements.push(nom + " : " + (ecart > 0 ? "+" + ecart : ecart) + " pictogramme(s)");
          }
        } catch (erreur) {
          changements.push(nom + " : vérification impossible");
        }
      }

      majEtatBaseLocale(changements.length
        ? "Changements — " + changements.join(" · ")
        : "Tous les catalogues sont à jour.");
      bouton.disabled = false;
      rafraichirBaseLocale();
    });

    lireInventaire().then((entrees) => {
      entrees.forEach((entree) => {
        if (entree && entree.langue) inventaireBases.set(entree.langue, entree);
      });
      rafraichirBaseLocale();
    });

  /* Alimente la liste de suggestions du champ de recherche avec les tags
     les plus fréquents du catalogue déjà chargé pour cette langue. */
  function afficherSuggestions(langue) {
    if (basesParLangue.has(langue)) remplirDatalist(basesParLangue.get(langue));
  }

  /* Libellé d'un pictogramme dans une langue donnée, si le catalogue de cette
     langue est en mémoire. Évite une requête réseau quand on réécrit les mots
     d'une planche dans la langue de référence. Renvoie null si le catalogue
     n'est pas chargé ou si la fiche n'a pas de mot. */
  function libelle(id, langue, typeVoulu) {
    const base = basesParLangue.get(langue);
    if (!base) return null;

    for (const fiche of base) {
      if (fiche._id !== id) continue;
      const mots = (fiche.keywords || []).filter(k => (k.keyword || "").trim());
      if (!mots.length) return null;
      if (typeVoulu) {
        const prefere = mots.find(k => k.type === typeVoulu);
        if (prefere) return prefere.keyword.trim();
      }
      return mots[0].keyword.trim();
    }
    return null;
  }

  window.Atelier.catalogue = {
    charger: chargerBaseLangue,
    remplirDatalist: remplirDatalist,
    afficherSuggestions: afficherSuggestions,
    libelle: libelle
  };
})();
