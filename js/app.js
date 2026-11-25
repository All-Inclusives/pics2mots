/* ==========================================================================
   Cœur de Pics2Mots
   État de la planche, moteur de recherche, rendu, sauvegarde.
   Charge en dernier : il définit le contexte partagé avec les modules.
   ========================================================================== */
(function () {
    window.Atelier = window.Atelier || {};

    /* Données et catalogue vivent dans leurs propres fichiers ; on les
       référence ici pour que le reste du code s'écrive sans préfixe. */
    const TRADUCTIONS_UI = window.Atelier.donnees.TRADUCTIONS_UI;
    const ENRICHISSEMENT_REFERENTIEL = window.Atelier.donnees.ENRICHISSEMENT_REFERENTIEL;
    const catalogue = window.Atelier.catalogue;

    const CACHE_IMG_NAME = "arasaac-pictos-cache-v1";
    const blobUrlsCache = new Map();

    let langUiActuelle = "fr";
    let ongletActif = "atelier";
    let propositions = [];
    let imagier = [];
    let imagierFixe = false;
    let modeEntrainement = false;
    let masquagePortee = "deux";
    /* Langue dans laquelle s'écrivent les mots des pictogrammes. Indépendante
       de la langue d'interface : on peut chercher en espagnol et vouloir des
       mots en français. */
    let langueLibelles = "fr";
    let indexDragSource = null;

    const elCatalogue = document.getElementById("catalogue");
    const elGrille = document.getElementById("grille");
    const elPanelImagier = document.getElementById("panel-imagier");
    const elLangue = document.getElementById("select-langue");
    const elNature = document.getElementById("select-nature");
    const elTheme = document.getElementById("input-theme");
    const elInspecteurTags = document.getElementById("ai-inspecteur-tags");
    const elVueAtelier = document.getElementById("vue-atelier");
    const elVueEmploi = document.getElementById("vue-mode-emploi");
    const elNomImagier = document.getElementById("nom-imagier");
    const elBanniereReprise = document.getElementById("banniere-reprise");

    const CLE_AUTOSAVE = "arasaac-imagier-autosave-v1";
    const CLE_REPRISE_VUE = "arasaac-reprise-annoncee";
    let minuteurAutosave = null;
    let sauvegardeActive = false;

    /* Contexte publié pour les modules (audio notamment), qui ne peuvent pas
       atteindre les variables de ce fichier. Ce sont des accesseurs : les
       modules lisent toujours l'état courant, jamais une copie figée. */
    window.Atelier.contexte = {
      imagier: () => imagier,
      langueUi: () => langUiActuelle,
      langueCible: () => elLangue.value
    };

    function normaliser(s) {
      return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    function radicalStrict(s) {
      const n = normaliser(s);
      if (n.length >= 6) return n.slice(0, 6);
      if (n.length >= 4) return n.slice(0, -1);
      return n;
    }

    function choisirLibelleActif(p, kwNature, motCandidat, termesRecherches) {
      const motsValides = (p.keywords || [])
        .map(k => (k.keyword || "").trim())
        .filter(Boolean);

      if (motCandidat && motsValides.includes(motCandidat)) {
        return motCandidat;
      }

      if (kwNature && (kwNature.keyword || "").trim()) {
        return kwNature.keyword.trim();
      }

      if (termesRecherches && termesRecherches.length) {
        const matchExact = motsValides.find(m =>
          termesRecherches.some(t => normaliser(m) === normaliser(t))
        );
        if (matchExact) return matchExact;
      }

      if (motsValides.length) {
        return motsValides[0];
      }

      const tagOuCat = [...(p.tags || []), ...(p.categories || [])]
        .map(s => (s || "").trim())
        .find(Boolean);
      return tagOuCat || "—";
    }

    function analyserRequeteOrdonnee(valeurBrute) {
      const morceaux = (valeurBrute || "")
        .split(/[;,]/)
        .map(m => m.trim())
        .filter(Boolean);

      const criteres = morceaux.map((m, rang) => {
        const mn = normaliser(m);
        const estLsf = mn === "lsf" || mn === "langue des signes" || mn === "sign language";
        const poidsPosition = Math.max(10, 80 - rang * 25);
        return {
          raw: m,
          norm: mn,
          rang,
          estLsf,
          poidsPosition
        };
      });

      const aCritereLsf = criteres.some(c => c.estLsf);
      const termesMots = criteres.filter(c => !c.estLsf);

      return { criteres, termesMots, aCritereLsf };
    }

    function correspondTermeSurPicto(p, termeBrut) {
      const termeExact = normaliser(termeBrut);
      const rad = radicalStrict(termeBrut);
      let score = 0;
      let motMatch = "";
      const raisons = [];

      const kwExact = (p.keywords || []).find(k => (k.keyword || "").trim() && normaliser(k.keyword) === termeExact);
      const kwContient = (p.keywords || []).find(k => (k.keyword || "").trim() && normaliser(k.keyword).includes(termeExact));
      if (kwExact) {
        score += 100;
        motMatch = kwExact.keyword.trim();
        raisons.push(`Mot-clé : ${kwExact.keyword.trim()}`);
      } else if (kwContient) {
        score += 75;
        motMatch = kwContient.keyword.trim();
        raisons.push(`Mot-clé : ${kwContient.keyword.trim()}`);
      }

      for (const t of (p.tags || [])) {
        const tn = normaliser(t);
        if (tn === termeExact) {
          score += 65;
          raisons.push(`Tag : ${t}`);
        } else if (tn.includes(termeExact)) {
          score += 45;
          raisons.push(`Tag : ${t}`);
        }
      }

      for (const c of (p.categories || [])) {
        const cn = normaliser(c);
        if (cn === termeExact) {
          score += 55;
          raisons.push(`Catégorie : ${c}`);
        } else if (cn.includes(termeExact)) {
          score += 35;
          raisons.push(`Catégorie : ${c}`);
        }
      }

      if (score === 0 && rad.length >= 4) {
        const kwRad = (p.keywords || []).find(k => (k.keyword || "").trim() && normaliser(k.keyword).startsWith(rad));
        const tagRad = (p.tags || []).find(t => normaliser(t).startsWith(rad));
        const catRad = (p.categories || []).find(c => normaliser(c).startsWith(rad));

        if (kwRad) {
          score += 25;
          motMatch = kwRad.keyword.trim();
          raisons.push(`Mot-clé : ${kwRad.keyword.trim()}`);
        }
        if (tagRad) {
          score += 20;
          raisons.push(`Tag : ${tagRad}`);
        }
        if (catRad) {
          score += 15;
          raisons.push(`Catégorie : ${catRad}`);
        }
      }

      return { score, motMatch, raisons };
    }

    function estPictoLsf(p) {
      if (p.lsf === true) return true;
      const textes = [...(p.tags || []), ...(p.categories || []), ...(p.keywords || []).map(k => k.keyword)];
      return textes.some(txt => {
        const n = normaliser(txt);
        return n === "lsf" || n.includes("langue des signes") || n.includes("sign language") || n.includes("geste");
      });
    }

    function changerOnglet(nomOnglet) {
      ongletActif = nomOnglet === "emploi" ? "emploi" : "atelier";
      elVueAtelier.style.display = ongletActif === "atelier" ? "block" : "none";
      elVueEmploi.style.display = ongletActif === "emploi" ? "block" : "none";
      document.getElementById("tab-atelier").classList.toggle("actif", ongletActif === "atelier");
      document.getElementById("tab-emploi").classList.toggle("actif", ongletActif === "emploi");
    }

    document.getElementById("tab-atelier").addEventListener("click", () => changerOnglet("atelier"));
    document.getElementById("tab-emploi").addEventListener("click", () => changerOnglet("emploi"));

    /* Le mode d'emploi est décrit dans les données, pour suivre la langue de
       l'interface au lieu de rester figé en français dans le HTML. */
    function rendreGuide(t) {
      const zone = document.getElementById("guide-contenu");
      if (!zone) return;

      const blocs = Array.isArray(t.guideBlocs) ? t.guideBlocs : [];
      zone.innerHTML = blocs.map(bloc => `
        <div class="guide-bloc">
          <h3>${bloc.titre}</h3>
          <ul>${(bloc.points || []).map(point => `<li>${point}</li>`).join("")}</ul>
        </div>`).join("");
    }

    function appliquerTraductionUi(code) {
      langUiActuelle = TRADUCTIONS_UI[code] ? code : "fr";
      const t = TRADUCTIONS_UI[langUiActuelle] || TRADUCTIONS_UI.fr;
      const estRtl = langUiActuelle === "ar";

      document.querySelector(".conteneur").setAttribute("dir", estRtl ? "rtl" : "ltr");

      document.getElementById("ui-titre").textContent = t.titre;
      document.getElementById("ui-sous-titre").textContent = t.sousTitre;
      document.getElementById("ui-label-langue-ui").textContent = t.langueUi;
      document.getElementById("tab-atelier").textContent = t.tabAtelier;
      document.getElementById("tab-emploi").textContent = t.tabEmploi;
      document.getElementById("ui-titre-propositions").textContent = t.propositions;
      const aideProp = document.getElementById("ui-aide-propositions");
      if (aideProp) aideProp.textContent = t.aidePropositions;

      elTheme.placeholder = t.placeholderTheme;
      document.getElementById("ui-astuce-recherche").innerHTML = t.astuceRecherche;
      document.getElementById("opt-nat-all").textContent = t.natAll;
      document.getElementById("opt-nat-3").textContent = t.nat3;
      document.getElementById("opt-nat-2").textContent = t.nat2;
      document.getElementById("opt-nat-4").textContent = t.nat4;
      document.getElementById("ui-label-qte").textContent = t.qte;
      document.getElementById("btn-chercher").textContent = t.chercher;
      document.getElementById("btn-tout-ajouter").textContent = t.toutAjouter;
      document.getElementById("ui-label-langue-cible").textContent = t.langueCible;
      document.getElementById("btn-entrainement").textContent = modeEntrainement ? t.entrainementOn : t.entrainementOff;
      document.getElementById("btn-fixer").textContent = imagierFixe ? t.deverrouiller : t.fixer;
      document.getElementById("btn-imprimer").textContent = t.imprimer;
      document.getElementById("btn-vider").textContent = t.vider;
      document.getElementById("nom-imagier").placeholder = t.placeholderNom;
      document.getElementById("btn-save-ordi").textContent = t.saveOrdi;
      document.getElementById("ui-btn-ouvrir").textContent = t.ouvrirOrdi;
      document.getElementById("ui-label-audio-piper").textContent = t.audioOption;
      document.getElementById("opt-audio-medium").textContent = t.audioMedium;
      document.getElementById("opt-audio-low").textContent = t.audioLow;
      document.getElementById("btn-preparer-audio").textContent = t.preparerAudio;
      document.getElementById("opt-langue-aucune").textContent = t.langueAucune;
      document.getElementById("ui-base-locale-titre").textContent = t.baseLocaleTitre;
      document.getElementById("ui-base-locale-aide").textContent = t.baseLocaleAide;
      document.getElementById("ui-label-masquage").textContent = t.masquer;
      document.getElementById("ui-label-langue-mots").textContent = t.langueMots;
      document.getElementById("opt-masq-deux").textContent = t.masqDeux;
      document.getElementById("opt-masq-source").textContent = t.masqSource;
      document.getElementById("opt-masq-cible").textContent = t.masqCible;

      const selectMasquage = document.getElementById("select-masquage");
      selectMasquage.value = masquagePortee;
      selectMasquage.disabled = !modeEntrainement;
      document.getElementById("ui-titre-imagier").textContent = t.titreImagier;
      document.getElementById("badge-fixe").textContent = t.badgeFixe;
      document.getElementById("badge-train").textContent = t.badgeTrain;
      document.getElementById("ui-guide-titre").textContent = t.guideTitre;
      document.getElementById("ui-guide-intro").textContent = t.guideIntro;
      rendreGuide(t);

      document.querySelectorAll(".btn-drapeau").forEach(btn => {
        btn.classList.toggle("actif", btn.dataset.uiLang === langUiActuelle);
      });

      /* Rafraîchit les suggestions d'autocomplétion si le catalogue de cette
         langue est déjà en mémoire (sinon elles se rempliront à la recherche). */
      catalogue.afficherSuggestions(langUiActuelle);

      rendreImagier();
    }

    document.querySelectorAll(".btn-drapeau").forEach(btn => {
      btn.addEventListener("click", () => appliquerTraductionUi(btn.dataset.uiLang));
    });

    async function getCachedImageUrl(id) {
      if (blobUrlsCache.has(id)) return blobUrlsCache.get(id);
      const url = `https://api.arasaac.org/v1/pictograms/${id}`;
      if ("caches" in window) {
        const cache = await caches.open(CACHE_IMG_NAME);
        let resp = await cache.match(url);
        if (!resp) {
          resp = await fetch(url);
          if (resp.ok) await cache.put(url, resp.clone());
        }
        if (resp && resp.ok) {
          const objUrl = URL.createObjectURL(await resp.blob());
          blobUrlsCache.set(id, objUrl);
          return objUrl;
        }
      }
      return url;
    }

    async function hydrateImagesInGrid() {
      const imgs = elGrille.querySelectorAll("img[data-picto-id]");
      for (const img of imgs) {
        const id = img.getAttribute("data-picto-id");
        img.src = await getCachedImageUrl(id);
      }
    }

    async function rechercher() {
      const langueRecherche = langUiActuelle;
      elCatalogue.innerHTML = `<p class='muted'>Recherche (${langueRecherche.toUpperCase()})...</p>`;

      let base;
      try {
        base = await catalogue.charger(langueRecherche);
        catalogue.remplirDatalist(base);
      } catch (erreur) {
        elCatalogue.innerHTML = `<p class='muted'>Catalogue indisponible : aucune copie sur cet appareil `
          + `et le téléchargement a échoué. Ouvrez « Base locale » pour le télécharger, `
          + `puis relancez la recherche.</p>`;
        return;
      }

      const { criteres, termesMots, aCritereLsf } = analyserRequeteOrdonnee(elTheme.value);
      const nat = elNature.value;
      const limite = Math.max(1, Math.min(200, parseInt(document.getElementById("input-limite").value, 10) || 30));

      elInspecteurTags.innerHTML = "";

      if (!criteres.length && nat === "all") {
        elCatalogue.innerHTML = `<p class='muted'>${(TRADUCTIONS_UI[langUiActuelle] || TRADUCTIONS_UI.fr).aidePropositions}</p>`;
        return;
      }

      const codeNum = Number(nat);
      const candidats = [];
      const idsAjoutes = new Set();
      const critereLsf = criteres.find(c => c.estLsf) || null;
      const premierCritereEstLsf = Boolean(criteres.length && criteres[0].estLsf);

      for (const p of base) {
        if (idsAjoutes.has(p._id)) continue;
        if (!Array.isArray(p.keywords) || !p.keywords.length) continue;

        if (aCritereLsf && !termesMots.length && !estPictoLsf(p)) continue;

        const kwNature = nat !== "all" ? p.keywords.find(k => k.type === codeNum && (k.keyword || "").trim()) : null;
        if (nat !== "all" && !kwNature) continue;

        let score = 0;
        let motCandidat = "";
        const raisons = [];
        const pictoLsf = estPictoLsf(p);

        if (critereLsf && pictoLsf) {
          score += critereLsf.poidsPosition * 2;
          raisons.push(`Priorité #${critereLsf.rang + 1} : LSF`);
        }

        if (!termesMots.length) {
          score += 10;
          if (nat !== "all") raisons.push(`Nature : ${elNature.options[elNature.selectedIndex].text}`);
        } else {
          let tousTermesOK = true;
          for (const crit of termesMots) {
            const resTerme = correspondTermeSurPicto(p, crit.raw);
            if (resTerme.score === 0) {
              tousTermesOK = false;
              break;
            }
            score += resTerme.score + crit.poidsPosition;
            if (!motCandidat && resTerme.motMatch) {
              motCandidat = resTerme.motMatch;
            }
            raisons.push(...resTerme.raisons.map(r => `#${crit.rang + 1} · ${r}`));
          }
          if (!tousTermesOK) continue;
        }

        const bruts = termesMots.map(c => c.raw);
        const libelleFinal = choisirLibelleActif(p, kwNature, motCandidat, bruts);

        idsAjoutes.add(p._id);
        candidats.push({
          id: p._id,
          motSource: libelleFinal,
          langueSource: langueRecherche,
          score,
          pictoLsf,
          raisons: [...new Set(raisons)],
          tousTags: [...new Set([...(p.tags || []), ...(p.categories || [])])]
        });
      }

      const premierTerme = termesMots.length ? termesMots[0] : null;
      const reglesEnrichissement = premierTerme ? ENRICHISSEMENT_REFERENTIEL[premierTerme.norm] : null;
      if (reglesEnrichissement && candidats.length < limite) {
        const indexLocalParId = new Map(base.map(p => [p._id, p]));

        for (const [langRef, termesRef] of Object.entries(reglesEnrichissement)) {
          if (langRef === langueRecherche || candidats.length >= limite) continue;
          const baseRef = await catalogue.charger(langRef);

          for (const pRef of baseRef) {
            if (idsAjoutes.has(pRef._id)) continue;
            const pLocal = indexLocalParId.get(pRef._id);
            if (!pLocal || !Array.isArray(pLocal.keywords) || !pLocal.keywords.length) continue;

            const kwNatureLocal = nat !== "all" ? pLocal.keywords.find(k => k.type === codeNum && (k.keyword || "").trim()) : null;
            if (nat !== "all" && !kwNatureLocal) continue;

            const matchRef = termesRef.some(tr =>
              (pRef.tags || []).some(t => normaliser(t).includes(tr)) ||
              (pRef.categories || []).some(c => normaliser(c).includes(tr)) ||
              (pRef.keywords || []).some(k => normaliser(k.keyword).includes(tr))
            );
            if (!matchRef) continue;

            const pictoLsf = estPictoLsf(pLocal);
            const bonusLsf = critereLsf && pictoLsf ? critereLsf.poidsPosition * 2 : 0;
            const motLocal = choisirLibelleActif(pLocal, kwNatureLocal, "", termesMots.map(c => c.raw));

            idsAjoutes.add(pRef._id);
            candidats.push({
              id: pRef._id,
              motSource: motLocal,
              langueSource: langueRecherche,
              score: 12 + premierTerme.poidsPosition + bonusLsf,
              pictoLsf,
              raisons: [`Enrichi via ${langRef.toUpperCase()} (${termesRef.join(", ")})`, ...((pLocal.tags || []).map(t => `Tag : ${t}`))],
              tousTags: [...new Set([...(pLocal.tags || []), ...(pLocal.categories || [])])]
            });
            if (candidats.length >= limite) break;
          }
        }
      }

      candidats.sort((a, b) => {
        if (premierCritereEstLsf && a.pictoLsf !== b.pictoLsf) {
          return a.pictoLsf ? -1 : 1;
        }
        return b.score - a.score;
      });

      propositions = candidats.slice(0, limite);
      document.getElementById("compteur-choix").textContent = propositions.length;
      rendreCatalogue();
    }

    function rendreCatalogue() {
      if (!propositions.length) {
        elCatalogue.innerHTML = "<p class='muted'>—</p>";
        return;
      }
      elCatalogue.innerHTML = propositions.map((item, idx) => {
        const sel = imagier.some(c => c.id === item.id);
        const safe = item.motSource.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const infobulle = (item.raisons.length ? item.raisons : item.tousTags)
          .join(" • ")
          .replace(/"/g, "&quot;");

        return `
          <div
            class="item-choix ${sel ? "selectionne" : ""}"
            title="${infobulle}"
            onmouseenter="window.aiInspecter(${idx})"
            onclick="window.aiBasculer(${item.id}, '${safe}', '${item.langueSource}')"
          >
            <img src="https://api.arasaac.org/v1/pictograms/${item.id}" alt="${item.motSource}" loading="lazy" />
            <div class="titre">${item.motSource}</div>
          </div>
        `;
      }).join("");
    }

    window.aiInspecter = function(idx) {
      const item = propositions[idx];
      if (!item || !elInspecteurTags) return;

      const tagsAffichables = (item.raisons.length ? item.raisons : item.tousTags).slice(0, 12);
      if (!tagsAffichables.length) {
        elInspecteurTags.textContent = `${item.motSource} : aucun tag ou catégorie renseigné sur cette fiche ARASAAC.`;
        return;
      }

      elInspecteurTags.innerHTML = `<strong>${item.motSource}</strong> : ` + tagsAffichables.map(label => {
        const terme = label.includes(" : ") ? label.split(" : ").slice(1).join(" : ") : label;
        const safeTerme = terme.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return `<button type="button" class="btn-tag-rapide" onclick="window.aiChercherTag('${safeTerme}')">${label}</button>`;
      }).join(" ");
    };

    window.aiChercherTag = function(terme) {
      const propre = terme.replace(/^(?:#\d+\s*·\s*)?/, "").replace(/\s*\(.*?\)\s*/g, "").split(",")[0].trim();
      elTheme.value = propre;
      changerOnglet("atelier");
      rechercher();
    };

    async function traduire(idPicto, langue) {
      const res = await fetch(`https://api.arasaac.org/v1/pictograms/${langue}/${idPicto}`);
      if (!res.ok) return "—";
      const data = await res.json();
      if (!Array.isArray(data.keywords) || !data.keywords.length) return "—";
      const codeNum = Number(elNature.value);
      if (codeNum) {
        const m = data.keywords.find(k => k.type === codeNum && (k.keyword || "").trim());
        if (m) return m.keyword.trim();
      }
      const premierValide = data.keywords.find(k => (k.keyword || "").trim());
      return premierValide ? premierValide.keyword.trim() : "—";
    }

    /* Libellé d'un pictogramme dans la langue des mots, quelle que soit la
       langue dans laquelle il a été trouvé. Ordre de préférence : catalogue
       déjà en mémoire (instantané et hors ligne), puis fiche ARASAAC (une
       petite requête), puis le libellé d'origine pour ne rien perdre. */
    async function libelleDansLangue(id, libelleActuel, langueActuelle) {
      const langue = langueActuelle || "fr";
      if (langue === langueLibelles) {
        return { libelle: libelleActuel, langue: langue };
      }

      const enMemoire = catalogue.libelle(id, langueLibelles, Number(elNature.value) || null);
      if (enMemoire) return { libelle: enMemoire, langue: langueLibelles };

      try {
        const viaApi = await traduire(id, langueLibelles);
        if (viaApi && viaApi !== "—") return { libelle: viaApi, langue: langueLibelles };
      } catch (erreur) {
        // réseau indisponible : on conserve le libellé d'origine
      }

      return { libelle: libelleActuel, langue: langue };
    }

    window.aiBasculer = async function(id, motSource, langueSource) {
      if (imagierFixe) return;
      const idx = imagier.findIndex(c => c.id === id);
      if (idx !== -1) imagier.splice(idx, 1);
      else {
        const source = await libelleDansLangue(id, motSource, langueSource || langUiActuelle);
        const motCible = elLangue.value === "none" ? "" : await traduire(id, elLangue.value);
        imagier.push({
          id,
          motSource: source.libelle,
          langueSource: source.langue,
          motCible,
          reveleSource: false, reveleCible: false
        });
      }
      rendreCatalogue();
      rendreImagier();
    };

    window.aiDeplacer = function(i, delta) {
      if (imagierFixe) return;
      const cible = i + delta;
      if (cible < 0 || cible >= imagier.length) return;
      const [item] = imagier.splice(i, 1);
      imagier.splice(cible, 0, item);
      rendreImagier();
    };

    window.aiSupprimer = function(i) {
      if (imagierFixe) return;
      imagier.splice(i, 1);
      rendreCatalogue();
      rendreImagier();
    };

    window.aiReveler = function(i, champ) {
      if (!modeEntrainement || !imagier[i]) return;
      if (clicTactileBloque) return;
      if (champ === "source") {
        imagier[i].reveleSource = !imagier[i].reveleSource;
      } else {
        imagier[i].reveleCible = !imagier[i].reveleCible;
      }
      rendreImagier();
    };

    window.aiDragStart = function(e, i) {
      if (imagierFixe) {
        e.preventDefault();
        return;
      }
      indexDragSource = i;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i));
      e.currentTarget.classList.add("dragging");
    };

    window.aiDragOver = function(e) {
      if (imagierFixe) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      e.currentTarget.classList.add("drag-over");
    };

    window.aiDragLeave = function(e) {
      e.currentTarget.classList.remove("drag-over");
    };

    window.aiDrop = function(e, cibleIndex) {
      e.preventDefault();
      e.currentTarget.classList.remove("drag-over");
      if (imagierFixe) return;

      const sourceRaw = e.dataTransfer.getData("text/plain");
      const sourceIndex = indexDragSource !== null ? indexDragSource : parseInt(sourceRaw, 10);
      indexDragSource = null;

      if (isNaN(sourceIndex) || sourceIndex === cibleIndex || sourceIndex < 0 || cibleIndex < 0 || sourceIndex >= imagier.length || cibleIndex >= imagier.length) {
        return;
      }

      const [item] = imagier.splice(sourceIndex, 1);
      imagier.splice(cibleIndex, 0, item);
      rendreImagier();
    };

    window.aiDragEnd = function() {
      indexDragSource = null;
      document.querySelectorAll(".carte.dragging, .carte.drag-over").forEach(el => {
        el.classList.remove("dragging", "drag-over");
      });
    };

    /* ---------------------------------------------------------------
       RÉORGANISATION TACTILE
       Le glisser-déposer HTML5 ne fonctionne pas au doigt. On ajoute un
       déplacement par poignée, réservé au tactile : la poignée est le seul
       élément qui bloque le défilement du navigateur, ce qui laisse la
       carte elle-même utilisable pour faire défiler la page.
    --------------------------------------------------------------- */

    const glisserTactile = { actif: false, source: -1, cible: -1 };
    let clicTactileBloque = false;

    function carteSousLeDoigt(x, y) {
      if (typeof document.elementFromPoint !== "function") return null;
      const element = document.elementFromPoint(x, y);
      const carte = element && element.closest ? element.closest(".carte") : null;
      if (!carte) return null;
      const index = Number(carte.dataset.index);
      return Number.isInteger(index) ? index : null;
    }

    function nettoyerGlisserTactile() {
      elGrille.querySelectorAll(".tactile-glisse, .cible-glisse").forEach(carte => {
        carte.classList.remove("tactile-glisse", "cible-glisse");
      });
    }

    elGrille.addEventListener("pointerdown", (evenement) => {
      if (evenement.pointerType === "mouse") return; // la souris garde le glisser HTML5
      if (imagierFixe) return;

      const poignee = evenement.target.closest ? evenement.target.closest(".poignee") : null;
      if (!poignee) return;

      const carte = poignee.closest(".carte");
      const index = carte ? Number(carte.dataset.index) : NaN;
      if (!Number.isInteger(index) || index < 0) return;

      evenement.preventDefault();
      glisserTactile.actif = true;
      glisserTactile.source = index;
      glisserTactile.cible = index;
      carte.classList.add("tactile-glisse");

      if (typeof poignee.setPointerCapture === "function") {
        try { poignee.setPointerCapture(evenement.pointerId); } catch (erreur) { /* ignoré */ }
      }
    });

    elGrille.addEventListener("pointermove", (evenement) => {
      if (!glisserTactile.actif) return;
      evenement.preventDefault();

      const cible = carteSousLeDoigt(evenement.clientX, evenement.clientY);
      if (cible === null || cible === glisserTactile.cible) return;

      nettoyerGlisserTactile();
      glisserTactile.cible = cible;

      const carteCible = elGrille.querySelector('.carte[data-index="' + cible + '"]');
      if (carteCible) carteCible.classList.add("cible-glisse");
      const carteSource = elGrille.querySelector('.carte[data-index="' + glisserTactile.source + '"]');
      if (carteSource) carteSource.classList.add("tactile-glisse");
    });

    function terminerGlisserTactile() {
      if (!glisserTactile.actif) return;

      const source = glisserTactile.source;
      const cible = glisserTactile.cible;

      glisserTactile.actif = false;
      glisserTactile.source = -1;
      glisserTactile.cible = -1;
      nettoyerGlisserTactile();

      /* Le relâchement peut produire un clic ; il ne doit pas révéler un mot
         masqué par inadvertance. */
      clicTactileBloque = true;
      setTimeout(() => { clicTactileBloque = false; }, 300);

      if (cible === source || cible < 0 || source < 0
          || source >= imagier.length || cible >= imagier.length) {
        return;
      }

      const [item] = imagier.splice(source, 1);
      imagier.splice(cible, 0, item);
      rendreImagier();
    }

    elGrille.addEventListener("pointerup", terminerGlisserTactile);
    elGrille.addEventListener("pointercancel", terminerGlisserTactile);


    function rendreImagier() {
      sauvegarderAutosave();
      const lang = elLangue.value;
      const langueUnique = lang === "none";
      const portee = (langueUnique && masquagePortee === "cible") ? "source" : masquagePortee;
      const dir = ["ar", "he"].includes(lang) ? "rtl" : "ltr";
      const t = TRADUCTIONS_UI[langUiActuelle] || TRADUCTIONS_UI.fr;
      document.getElementById("compteur-imagier").textContent = imagier.length;

      elPanelImagier.classList.toggle("imagier-fixe", imagierFixe);
      elPanelImagier.classList.toggle("mode-entrainement", modeEntrainement);
      document.getElementById("badge-fixe").style.display = imagierFixe ? "inline-block" : "none";
      document.getElementById("badge-train").style.display = modeEntrainement ? "inline-block" : "none";

      /* Le bouton d'harmonisation n'apparaît que si des cartes ne sont pas
         encore dans la langue des mots — typiquement celles ajoutées lors
         d'une recherche menée dans une autre langue. */
      const aHarmoniser = imagier.filter(c => (c.langueSource || "fr") !== langueLibelles).length;
      const boutonHarmoniser = document.getElementById("btn-harmoniser-mots");
      if (boutonHarmoniser) {
        boutonHarmoniser.style.display = aHarmoniser ? "inline-block" : "none";
        boutonHarmoniser.textContent = t.harmoniserMots + (aHarmoniser ? " (" + aHarmoniser + ")" : "");
      }

      if (!imagier.length) {
        elGrille.innerHTML = `<p class='muted'>${t.imagierVide}</p>`;
        return;
      }

      elGrille.innerHTML = imagier.map((c, i) => {
        const masquerSource = modeEntrainement && !c.reveleSource && (portee === "deux" || portee === "source");
        const masquerCible = modeEntrainement && !c.reveleCible && (portee === "deux" || portee === "cible");
        const langSrc = c.langueSource || "fr";
        const safeSrc = (c.motSource || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const safeCible = (c.motCible || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        return `
          <div
            class="carte"
            data-index="${i}"
            draggable="${imagierFixe ? "false" : "true"}"
            ondragstart="window.aiDragStart(event, ${i})"
            ondragover="window.aiDragOver(event)"
            ondragleave="window.aiDragLeave(event)"
            ondrop="window.aiDrop(event, ${i})"
            ondragend="window.aiDragEnd(event)"
          >
            <div class="ordre-bar">
              <span class="poignee" title="Déplacer la carte">⠿</span>
              <button type="button" class="btn-mini" onclick="window.aiDeplacer(${i}, -1)" ${i === 0 ? "disabled" : ""}>←</button>
              <small>#${i + 1}</small>
              <button type="button" class="btn-mini" onclick="window.aiDeplacer(${i}, 1)" ${i === imagier.length - 1 ? "disabled" : ""}>→</button>
              <button type="button" class="btn-mini suppr" onclick="window.aiSupprimer(${i})">×</button>
            </div>
            <img src="https://api.arasaac.org/v1/pictograms/${c.id}" data-picto-id="${c.id}" alt="${c.motSource}" />
            <div class="mot-source-label ${masquerSource ? "masquee" : ""}" onclick="window.aiReveler(${i}, 'source')"><span class="valeur">${c.motSource}</span></div>
            ${langueUnique ? "" : `<div class="mot-cible ${masquerCible ? "masquee" : ""}" dir="${dir}" onclick="window.aiReveler(${i}, 'cible')"><span class="valeur">${c.motCible}</span></div>`}
            <div class="audio-bar">
              <button type="button" class="btn-audio" onclick="window.aiLire('${safeSrc}', '${langSrc}', this)">🔊 ${langSrc.toUpperCase()}</button>
              ${langueUnique ? "" : `<button type="button" class="btn-audio" onclick="window.aiLire('${safeCible}', '${lang}', this)">🔊 ${lang.toUpperCase()}</button>`}
            </div>
          </div>
        `;
      }).join("");

      hydrateImagesInGrid();
    }

    /* ---------------------------------------------------------------
       SAUVEGARDE AUTOMATIQUE ET REPRISE DE LA PLANCHE
       La planche en cours est conservée dans le navigateur : fermer
       l'onglet, recharger la page ou redémarrer la tablette ne fait
       plus perdre le travail. Les fichiers .JSON restent la sauvegarde
       « longue durée », partageable et archivable.
    --------------------------------------------------------------- */

    function viderAutosave() {
      try {
        window.localStorage.removeItem(CLE_AUTOSAVE);
      } catch (erreur) {
        // stockage indisponible : on n'interrompt pas l'usage de l'outil
      }
    }

    function sauvegarderAutosave(immediat) {
      if (!sauvegardeActive) return;

      const ecrire = () => {
        try {
          window.localStorage.setItem(CLE_AUTOSAVE, JSON.stringify({
            v: 1,
            quand: new Date().toISOString(),
            nom: elNomImagier.value.trim(),
            langueCible: elLangue.value,
            langueUi: langUiActuelle,
            fixe: imagierFixe,
            entrainement: modeEntrainement,
            masquage: masquagePortee,
            langueLibelles: langueLibelles,
            cartes: imagier.map(carte => ({
              id: carte.id,
              motSource: carte.motSource,
              langueSource: carte.langueSource,
              motCible: carte.motCible
            }))
          }));
        } catch (erreur) {
          // quota dépassé ou mode privé : la planche reste utilisable,
          // seule la reprise automatique est perdue.
        }
      };

      if (minuteurAutosave) clearTimeout(minuteurAutosave);
      if (immediat) {
        ecrire();
        return;
      }
      minuteurAutosave = setTimeout(ecrire, 300);
    }

    function lireAutosave() {
      try {
        const brut = window.localStorage.getItem(CLE_AUTOSAVE);
        if (!brut) return null;
        const donnees = JSON.parse(brut);
        if (!donnees || donnees.v !== 1 || !Array.isArray(donnees.cartes)) return null;
        return donnees;
      } catch (erreur) {
        return null;
      }
    }

    function restaurerAutosave() {
      const donnees = lireAutosave();
      if (!donnees || !donnees.cartes.length) return false;

      const cartes = donnees.cartes
        .filter(carte => carte && carte.id)
        .map(carte => ({
          id: carte.id,
          motSource: carte.motSource || "",
          langueSource: carte.langueSource || "fr",
          motCible: carte.motCible || "—",
          reveleSource: false, reveleCible: false
        }));

      if (!cartes.length) return false;

      imagier = cartes;
      elNomImagier.value = donnees.nom || "";

      if (donnees.langueCible) {
        elLangue.value = donnees.langueCible;
        // Si la valeur n'existe plus dans la liste, le navigateur la vide :
        // on retombe alors sur la première langue disponible.
        if (elLangue.value !== donnees.langueCible) {
          elLangue.selectedIndex = 0;
        }
      }
      if (donnees.langueUi && TRADUCTIONS_UI[donnees.langueUi]) {
        langUiActuelle = donnees.langueUi;
      }

      imagierFixe = Boolean(donnees.fixe);
      modeEntrainement = Boolean(donnees.entrainement);
      if (donnees.masquage === "source" || donnees.masquage === "cible" || donnees.masquage === "deux") {
        masquagePortee = donnees.masquage;
      }
      if (donnees.langueLibelles) {
        langueLibelles = donnees.langueLibelles;
        document.getElementById("select-langue-mots").value = langueLibelles;
      }

      appliquerVerrouillage();
      afficherBanniereReprise(donnees.nom, imagier.length);
      return true;
    }

    function afficherBanniereReprise(nom, nombre) {
      if (!elBanniereReprise) return;

      // Une seule annonce par session : au rechargement suivant, la planche
      // revient sans message, pour ne pas encombrer l'écran de travail.
      try {
        if (window.sessionStorage.getItem(CLE_REPRISE_VUE) === "1") return;
        window.sessionStorage.setItem(CLE_REPRISE_VUE, "1");
      } catch (erreur) {
        // sessionStorage indisponible : on affiche simplement la bannière
      }

      const t = TRADUCTIONS_UI[langUiActuelle] || TRADUCTIONS_UI.fr;
      const texte = document.getElementById("ui-banniere-reprise-texte");
      const boutonNouvelle = document.getElementById("btn-reprise-neuve");

      const nomAffiche = (nom || "").trim();
      texte.innerHTML = "<strong>" + t.banniereReprise + "</strong> : "
        + (nomAffiche ? "« " + echapperHtml(nomAffiche) + " » — " : "")
        + nombre + " " + t.cartesLabel + ".";

      boutonNouvelle.textContent = t.repriseNouvelle;
      elBanniereReprise.style.display = "flex";
    }

    function echapperHtml(texte) {
      return String(texte)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function appliquerVerrouillage() {
      document.getElementById("btn-tout-ajouter").disabled = imagierFixe;
      document.getElementById("btn-vider").disabled = imagierFixe;
    }

    document.getElementById("btn-reprise-fermer").addEventListener("click", () => {
      elBanniereReprise.style.display = "none";
    });

    document.getElementById("btn-reprise-neuve").addEventListener("click", () => {
      imagier = [];
      propositions = [];
      imagierFixe = false;
      modeEntrainement = false;
      elNomImagier.value = "";
      viderAutosave();
      appliquerVerrouillage();
      elBanniereReprise.style.display = "none";
      rendreCatalogue();
      appliquerTraductionUi(langUiActuelle);
    });

    elNomImagier.addEventListener("input", () => sauvegarderAutosave());

    window.addEventListener("pagehide", () => sauvegarderAutosave(true));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sauvegarderAutosave(true);
    });

    document.getElementById("btn-chercher").addEventListener("click", rechercher);
    elTheme.addEventListener("keydown", e => { if (e.key === "Enter") rechercher(); });

    elLangue.addEventListener("change", async () => {
      const langueUnique = elLangue.value === "none";
      for (const c of imagier) {
        c.motCible = langueUnique ? "" : await traduire(c.id, elLangue.value);
        c.reveleSource = false;
        c.reveleCible = false;
      }
      rendreImagier();
    });

    document.getElementById("select-masquage").addEventListener("change", (evenement) => {
      masquagePortee = evenement.target.value;
      sauvegarderAutosave();
      rendreImagier();
    });

    document.getElementById("select-langue-mots").addEventListener("change", (evenement) => {
      langueLibelles = evenement.target.value;
      document.getElementById("etat-harmonisation").textContent = "";
      sauvegarderAutosave();
      rendreImagier();
    });

    /* Réécrit les mots de la planche dans la langue choisie. Sert notamment
       quand des pictogrammes ont été trouvés lors d'une recherche en langue
       étrangère : ils gardent leur identifiant mais prennent le mot français. */
    document.getElementById("btn-harmoniser-mots").addEventListener("click", async (evenement) => {
      const bouton = evenement.currentTarget;
      const t = TRADUCTIONS_UI[langUiActuelle] || TRADUCTIONS_UI.fr;
      const zoneEtat = document.getElementById("etat-harmonisation");

      bouton.disabled = true;
      zoneEtat.textContent = "…";

      let misAJour = 0;
      let indisponibles = 0;
      const aTraiter = imagier.filter(c => (c.langueSource || "fr") !== langueLibelles).length;
      let traitees = 0;

      for (const carte of imagier) {
        if ((carte.langueSource || "fr") === langueLibelles) continue;
        traitees++;
        zoneEtat.textContent = traitees + " / " + aTraiter;
        const source = await libelleDansLangue(carte.id, carte.motSource, carte.langueSource);
        if (source.langue === langueLibelles) {
          if (source.libelle !== carte.motSource) misAJour++;
          carte.motSource = source.libelle;
          carte.langueSource = langueLibelles;
        } else {
          indisponibles++;
        }
      }

      zoneEtat.textContent = misAJour + " " + t.motsMisAJour
        + (indisponibles ? " · " + indisponibles + " " + t.motsIndisponibles : "");

      bouton.disabled = false;
      rendreCatalogue();
      rendreImagier();
    });

    document.getElementById("btn-entrainement").addEventListener("click", () => {
      modeEntrainement = !modeEntrainement;
      imagier.forEach(c => { c.reveleSource = false; c.reveleCible = false; });
      appliquerTraductionUi(langUiActuelle);
    });

    document.getElementById("btn-fixer").addEventListener("click", () => {
      if (!imagierFixe && !imagier.length) return;
      imagierFixe = !imagierFixe;
      appliquerVerrouillage();
      appliquerTraductionUi(langUiActuelle);
    });

    document.getElementById("btn-tout-ajouter").addEventListener("click", async () => {
      if (imagierFixe) return;
      for (const item of propositions) {
        if (!imagier.some(c => c.id === item.id)) {
          const source = await libelleDansLangue(item.id, item.motSource, item.langueSource || langUiActuelle);
          imagier.push({
            id: item.id,
            motSource: source.libelle,
            langueSource: source.langue,
            motCible: elLangue.value === "none" ? "" : await traduire(item.id, elLangue.value),
            reveleSource: false, reveleCible: false
          });
        }
      }
      rendreCatalogue();
      rendreImagier();
    });

    document.getElementById("btn-vider").addEventListener("click", () => {
      if (imagierFixe) return;
      imagier = [];
      rendreCatalogue();
      rendreImagier();
    });

    document.getElementById("btn-imprimer").addEventListener("click", () => window.print());

    document.getElementById("btn-save-ordi").addEventListener("click", () => {
      if (!imagier.length) return;
      const nom = document.getElementById("nom-imagier").value.trim() || "mon-imagier";
      const data = {
        version: 1,
        nom,
        langueCible: elLangue.value,
        langueLibelles: langueLibelles,
        fixe: imagierFixe,
        cartes: imagier.map(({ id, motSource, langueSource, motCible }) => ({ id, motSource, langueSource, motCible }))
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${normaliser(nom).replace(/[^a-z0-9]+/g, "-") || "imagier"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("input-load-ordi").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (parsed.nom) document.getElementById("nom-imagier").value = parsed.nom;
          if (parsed.langueCible) elLangue.value = parsed.langueCible;
          if (parsed.langueLibelles) {
            langueLibelles = parsed.langueLibelles;
            document.getElementById("select-langue-mots").value = langueLibelles;
          }
          imagierFixe = Boolean(parsed.fixe);
          appliquerVerrouillage();
          imagier = (parsed.cartes || []).map(c => ({
            ...c,
            motSource: c.motSource || c.motFr || "",
            langueSource: c.langueSource || "fr",
            reveleSource: false, reveleCible: false
          }));
          rendreCatalogue();
          appliquerTraductionUi(langUiActuelle);
        } catch {
          alert("Fichier .JSON non valide.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    /* Démarrage : on reprend la planche laissée ouverte lors de la dernière
       utilisation, puis on applique la langue d'interface mémorisée. */
    restaurerAutosave();
    sauvegardeActive = true;
    appliquerTraductionUi(TRADUCTIONS_UI[langUiActuelle] ? langUiActuelle : "fr");

    /* Installation en application (Windows, Android, Chromebook).
       Le service worker exige http(s) : ouvert en fichier local, l'outil
       fonctionne normalement, simplement sans installation ni cache hors ligne. */
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {
          // non bloquant : l'outil reste pleinement utilisable sans service worker
        });
      });
    }
})();
