/* ==========================================================================
   Oralisation
   Voix naturelle calculée sur l'appareil (Piper), sons mémorisés,
   et repli sur la voix du navigateur.
   Expose : window.aiLire (utilisé par les cartes de l'imagier)
   ========================================================================== */
(function () {
  window.Atelier = window.Atelier || {};

  const TRADUCTIONS_UI = window.Atelier.donnees.TRADUCTIONS_UI;

  /* Le cœur de l'application (js/app.js) se charge après ce module : il publie
     ici ses accesseurs. On les lit au moment de l'appel, jamais au chargement,
     pour que l'ordre de chargement des fichiers n'ait aucune importance. */
  function contexte() {
    return window.Atelier.contexte || {};
  }

  function langueUi() {
    const c = contexte();
    return c.langueUi ? c.langueUi() : "fr";
  }

  function cartesPlanche() {
    const c = contexte();
    return c.imagier ? c.imagier() : [];
  }

  function langueCibleActuelle() {
    const c = contexte();
    return c.langueCible ? c.langueCible() : "en";
  }

    /* ---------------------------------------------------------------
       ORALISATION DE QUALITÉ
       Remplace la voix du navigateur par une voix naturelle calculée
       sur l'appareil, sans serveur. Le modèle est téléchargé une seule
       fois, puis chaque mot prononcé est conservé : la première écoute
       coûte une à deux secondes, les suivantes sont immédiates et
       fonctionnent hors ligne.
    --------------------------------------------------------------- */

    const CLE_PREFS_AUDIO = "arasaac-audio-prefs-v1";
    const NOM_BASE_AUDIO = "arasaac-audio-v1";

    /* Pour chaque langue : la voix de qualité, puis la voix légère
       destinée aux tablettes peu puissantes. */
    const VOIX_PAR_LANGUE = {
      fr: ["fr_FR-siwis-medium", "fr_FR-siwis-low"],
      en: ["en_US-lessac-medium", "en_US-lessac-low"],
      es: ["es_ES-sharvard-medium", "es_ES-carlfm-x_low"],
      de: ["de_DE-thorsten-medium", "de_DE-thorsten-low"],
      it: ["it_IT-paola-medium", "it_IT-riccardo-x_low"],
      pt: ["pt_BR-faber-medium", "pt_BR-edresson-low"],
      ar: ["ar_JO-kareem-medium", "ar_JO-kareem-low"],
      uk: ["uk_UA-ukrainian_tts-medium", "uk_UA-lada-x_low"]
    };

    let prefsAudio = { actif: false, profil: "medium" };
    let moteurPiper = null;
    let baseAudio = null;
    let chaineSynthese = Promise.resolve();
    let preparationEnCours = false;
    let arretPreparation = false;

    const elChkAudio = document.getElementById("chk-audio-piper");
    const elProfilAudio = document.getElementById("select-profil-audio");
    const elBtnPreparer = document.getElementById("btn-preparer-audio");
    const elEtatAudio = document.getElementById("etat-audio");
    const elZoneProgression = document.getElementById("zone-progression-audio");
    const elBarreAudio = document.getElementById("barre-audio");
    const elEtatPreparation = document.getElementById("etat-preparation-audio");

    function majEtatAudio(message) {
      if (!elEtatAudio) return;
      elEtatAudio.textContent = message || "";
    }

    function lirePrefsAudio() {
      try {
        const brut = window.localStorage.getItem(CLE_PREFS_AUDIO);
        if (!brut) return;
        const donnees = JSON.parse(brut);
        if (donnees && typeof donnees === "object") {
          prefsAudio.actif = Boolean(donnees.actif);
          prefsAudio.profil = donnees.profil === "low" ? "low" : "medium";
        }
      } catch (erreur) {
        // préférences illisibles : on garde les valeurs par défaut
      }
    }

    function sauverPrefsAudio() {
      try {
        window.localStorage.setItem(CLE_PREFS_AUDIO, JSON.stringify(prefsAudio));
      } catch (erreur) {
        // stockage indisponible : le réglage ne survivra pas au rechargement
      }
    }

    function voixPour(langue) {
      const paire = VOIX_PAR_LANGUE[langue] || VOIX_PAR_LANGUE.fr;
      return prefsAudio.profil === "low" ? paire[1] : paire[0];
    }

    /* ---------- stockage des sons ---------- */

    function ouvrirBaseAudio() {
      if (baseAudio) return Promise.resolve(baseAudio);
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error("stockage local indisponible"));
          return;
        }
        const requete = window.indexedDB.open(NOM_BASE_AUDIO, 1);
        requete.onupgradeneeded = () => requete.result.createObjectStore("sons");
        requete.onsuccess = () => {
          baseAudio = requete.result;
          resolve(baseAudio);
        };
        requete.onerror = () => reject(requete.error || new Error("base audio inaccessible"));
      });
    }

    async function lireSonEnCache(voix, texte) {
      try {
        const base = await ouvrirBaseAudio();
        return await new Promise((resolve) => {
          const transaction = base.transaction("sons", "readonly");
          const requete = transaction.objectStore("sons").get(voix + "|" + texte);
          requete.onsuccess = () => resolve(requete.result || null);
          requete.onerror = () => resolve(null);
        });
      } catch (erreur) {
        return null;
      }
    }

    async function ecrireSonEnCache(voix, texte, blob) {
      try {
        const base = await ouvrirBaseAudio();
        await new Promise((resolve) => {
          const transaction = base.transaction("sons", "readwrite");
          transaction.objectStore("sons").put(blob, voix + "|" + texte);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        });
      } catch (erreur) {
        // sans stockage, le son sera simplement recalculé la fois suivante
      }
    }

    /* ---------- moteur ---------- */

    async function chargerMoteurPiper() {
      if (moteurPiper) return moteurPiper;

      const sources = [
        "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web/+esm",
        "https://esm.sh/@diffusionstudio/vits-web"
      ];
      let derniereErreur = null;

      for (const source of sources) {
        try {
          moteurPiper = await import(source);
          return moteurPiper;
        } catch (erreur) {
          derniereErreur = erreur;
        }
      }

      throw new Error("moteur de synthèse indisponible"
        + (derniereErreur ? " (" + derniereErreur.message + ")" : ""));
    }

    async function obtenirSon(texte, langue) {
      const voix = voixPour(langue);
      const enCache = await lireSonEnCache(voix, texte);
      if (enCache) return enCache;

      const moteur = await chargerMoteurPiper();

      if (!preparationEnCours) majEtatAudio("…");
      const tache = chaineSynthese.then(async () => {
        const blob = await moteur.predict(
          { text: texte, voiceId: voix },
          (info) => {
            // Le modèle se télécharge à la première utilisation : on affiche
            // l'avancement, en clair et sans texte à traduire.
            if (preparationEnCours || !info || !info.total) return;
            majEtatAudio("↓ " + Math.round((info.loaded * 100) / info.total) + " %");
          }
        );
        await ecrireSonEnCache(voix, texte, blob);
        return blob;
      });
      // la chaîne survit à un échec pour ne pas bloquer les sons suivants
      chaineSynthese = tache.catch(() => {});

      const blob = await tache;
      if (!preparationEnCours) majEtatAudio("");
      return blob;
    }

    function jouerSon(blob) {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const liberer = () => URL.revokeObjectURL(url);
      audio.onended = liberer;
      audio.onerror = liberer;
      const lecture = audio.play();
      if (lecture && typeof lecture.catch === "function") {
        lecture.catch(liberer);
      }
    }

    function desactiverAudioNaturel(raison) {
      prefsAudio.actif = false;
      sauverPrefsAudio();
      elChkAudio.checked = false;
      const t = TRADUCTIONS_UI[langueUi()] || TRADUCTIONS_UI.fr;
      majEtatAudio((t.audioRepli || "") + (raison ? " — " + raison : ""));
    }

    /* ---------- préparation de l'audio d'une planche ---------- */

    async function preparerAudioPlanche() {
      if (preparationEnCours) {
        arretPreparation = true;
        return;
      }
      const cartes = cartesPlanche();
      if (!cartes.length) {
        elEtatPreparation.textContent = "";
        return;
      }

      const cibles = [];
      const vues = new Set();
      cartes.forEach(carte => {
        const langueSource = carte.langueSource || "fr";
        if (carte.motSource) {
          const cle = langueSource + "|" + carte.motSource;
          if (!vues.has(cle)) { vues.add(cle); cibles.push({ texte: carte.motSource, langue: langueSource }); }
        }
        const langueCible = langueCibleActuelle();
        if (carte.motCible && carte.motCible !== "—") {
          const cle = langueCible + "|" + carte.motCible;
          if (!vues.has(cle)) { vues.add(cle); cibles.push({ texte: carte.motCible, langue: langueCible }); }
        }
      });

      if (!cibles.length) return;

      preparationEnCours = true;
      arretPreparation = false;
      const t = TRADUCTIONS_UI[langueUi()] || TRADUCTIONS_UI.fr;
      elZoneProgression.style.display = "flex";
      elBarreAudio.style.width = "0%";
      elBtnPreparer.textContent = t.audioArreter;

      let faits = 0;
      let erreurs = 0;

      for (const cible of cibles) {
        if (arretPreparation) break;
        elEtatPreparation.textContent = `${faits + 1} / ${cibles.length}`;
        try {
          await obtenirSon(cible.texte, cible.langue);
        } catch (erreur) {
          erreurs++;
        }
        faits++;
        elBarreAudio.style.width = Math.round((faits * 100) / cibles.length) + "%";
      }

      elEtatPreparation.textContent = arretPreparation
        ? `${faits} / ${cibles.length}`
        : (t.audioPret || "Audio prêt") + (erreurs ? ` — ${erreurs} échec(s)` : "");

      elBtnPreparer.textContent = t.preparerAudio;
      preparationEnCours = false;
      arretPreparation = false;
    }

    /* ---------- réglages ---------- */

    function appliquerPrefsAudio() {
      elChkAudio.checked = prefsAudio.actif;
      elProfilAudio.value = prefsAudio.profil;
      elProfilAudio.disabled = !prefsAudio.actif;
      elBtnPreparer.disabled = !prefsAudio.actif;
    }

    elChkAudio.addEventListener("change", () => {
      prefsAudio.actif = elChkAudio.checked;
      if (prefsAudio.actif && !("indexedDB" in window)) {
        desactiverAudioNaturel("stockage local indisponible");
        return;
      }
      sauverPrefsAudio();
      appliquerPrefsAudio();
      majEtatAudio("");
    });

    elProfilAudio.addEventListener("change", () => {
      prefsAudio.profil = elProfilAudio.value === "low" ? "low" : "medium";
      sauverPrefsAudio();
      majEtatAudio("");
    });

    elBtnPreparer.addEventListener("click", preparerAudioPlanche);

    lirePrefsAudio();
    appliquerPrefsAudio();
    function lireVoixSysteme(texte, lang) {
      if (!("speechSynthesis" in window) || !texte || texte === "—") return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      const locales = { fr: "fr-FR", en: "en-US", es: "es-ES", de: "de-DE", it: "it-IT", pt: "pt-PT", ar: "ar-SA", uk: "uk-UA" };
      const loc = locales[lang] || lang;
      u.lang = loc;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang.toLowerCase().startsWith(loc.split("-")[0].toLowerCase()));
      if (match) u.voice = match;
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }

    /* Les boutons audio des cartes passent par ici : voix naturelle si elle est
       activée, repli immédiat sur la voix du navigateur sinon. */
    window.aiLire = async function (texte, lang, bouton) {
      if (!texte || texte === "—") return;

      if (prefsAudio.actif) {
        if (bouton) bouton.classList.add("en-cours");
        try {
          majEtatAudio("");
          const blob = await obtenirSon(texte, lang);
          jouerSon(blob);
          return;
        } catch (erreur) {
          desactiverAudioNaturel(String((erreur && erreur.message) || erreur));
          return;
        } finally {
          if (bouton) bouton.classList.remove("en-cours");
        }
      }

      lireVoixSysteme(texte, lang);
    };
})();
