/* ==========================================================================
   Données de Pics2Mots
   Traductions de l'interface, thésaurus d'enrichissement.
   Aucune logique ici : ce fichier ne contient que des données.
   ========================================================================== */
(function () {
  window.Atelier = window.Atelier || {};

    const TRADUCTIONS_UI = {
      fr: {
        titre: "Pics2Mots",
        sousTitre: "De l'image aux mots, des mots à l'image",
        langueUi: "Interface :",
        tabAtelier: "Atelier",
        tabEmploi: "Mode d'emploi",
        propositions: "1. Propositions",
        aidePropositions: "Lancez une recherche ci-dessous pour afficher des propositions.",
        placeholderTheme: "Ex: numération ; lsf ou lsf ; numération",
        astuceRecherche: "Le <strong>1er critère</strong> fixe la priorité d'affichage (ex. : <code>numération ; lsf</code> ou <code>lsf ; numération</code>).",
        natAll: "Toutes natures",
        nat3: "Verbes (infinitif)",
        nat2: "Noms communs",
        nat4: "Adjectifs",
        qte: "Quantité :",
        chercher: "Rechercher",
        toutAjouter: "Tout ajouter",
        langueCible: "Langue de l'imagier :",
        entrainementOff: "Mode entraînement : OFF",
        entrainementOn: "Mode entraînement : ON",
        fixer: "Fixer l'imagier",
        deverrouiller: "Déverrouiller l'imagier",
        imprimer: "Imprimer / PDF",
        vider: "Vider",
        placeholderNom: "Nom de l'imagier",
        saveOrdi: "Enregistrer sur l'ordi (.JSON)",
        ouvrirOrdi: "Ouvrir un imagier (.JSON)",
        titreImagier: "2. Mon imagier",
        badgeFixe: "Fixé",
        badgeTrain: "Entraînement",
        imagierVide: "Aucune carte dans l'imagier.",
        guideTitre: "Mode d'emploi de Pics2Mots",
        guideIntro: "Retrouvez ici comment composer une planche, exploiter le moteur de recherche et enregistrer vos imagiers.",
        banniereReprise: "Planche restaurée",
        repriseNouvelle: "Nouvelle planche",
        cartesLabel: "cartes",
        audioOption: "Voix naturelle hors ligne",
        audioMedium: "Voix de qualité (60 Mo)",
        audioLow: "Voix légère pour tablette (27 Mo)",
        preparerAudio: "Préparer l'audio de la planche",
        audioArreter: "Arrêter",
        audioChargement: "Chargement de la voix…",
        audioGenere: "son enregistré",
        audioRepli: "Voix naturelle indisponible : voix du navigateur utilisée",
        audioPret: "Audio prêt",
        langueAucune: "Langue unique — pas de traduction",
        baseLocaleTitre: "Base locale — rechercher sans réseau",
        baseLocaleAide: "Chaque catalogue est téléchargé une seule fois, puis conservé sur l'appareil. Les recherches suivantes ne sollicitent plus le site d'ARASAAC et fonctionnent hors connexion.",
        masquer: "Masquer :",
        masqDeux: "le mot et la traduction",
        masqSource: "le mot (langue de travail)",
        masqCible: "la traduction",
        langueMots: "Langue des mots :",
        harmoniserMots: "Harmoniser les mots",
        motsMisAJour: "mot(s) mis à jour",
        motsIndisponibles: "sans équivalent dans cette langue",
        guideBlocs: [
          {
            titre: "1. Rechercher et enrichir une planche",
            points: [
              "Saisissez un mot ou un thème dans la langue de l'interface (par ex. <code>cuisiner</code>, <code>numération</code>, <code>maison</code>).",
              "Filtrez éventuellement par nature grammaticale (verbes, noms communs, adjectifs) et choisissez la quantité souhaitée.",
              "Survolez une proposition pour inspecter ses tags et catégories, ou cliquez dessus pour lancer une recherche directe sur un tag.",
              "Pour certains thèmes fréquents, l'outil complète automatiquement la liste via les fiches liées si les résultats locaux sont limités.",
              "Chaque catalogue de langue est conservé sur l'appareil après la première recherche : les suivantes fonctionnent sans réseau. Le bloc <strong>Base locale</strong> permet de télécharger, actualiser ou supprimer ces catalogues."
            ]
          },
          {
            titre: "2. Subtilités des recherches multiples",
            points: [
              "Séparez plusieurs critères par un point-virgule <code>;</code> ou une virgule <code>,</code>.",
              "<strong>L'ordre compte :</strong> le premier critère a le poids le plus fort dans le classement (ex. : <code>numération ; lsf</code> privilégie la numération ; <code>lsf ; numération</code> met en avant les cartes liées à la langue des signes/gestes).",
              "Le critère <code>lsf</code> seul filtre les pictogrammes liés à la langue des signes/gestes ; combiné à un mot, il valorise les correspondances associées sans vider la liste quand un chiffre n'est pas tagué <code>lsf</code>."
            ]
          },
          {
            titre: "3. Organiser, s'entraîner et imprimer",
            points: [
              "Ajoutez ou retirez des cartes d'un clic dans <strong>Propositions</strong>, ou utilisez <strong>Tout ajouter</strong>.",
              "Réorganisez les cartes de votre imagier par <strong>glisser-déposer</strong> ou avec les flèches <code>←</code> / <code>→</code>.",
              "Choisissez la langue cible pour afficher la traduction et écouter la prononciation audio (<code>🔊</code>).",
              "<strong>Langue des mots</strong> fixe la langue des libellés, indépendamment de la langue d'interface : si vous cherchez en espagnol un thème absent du catalogue français, les pictogrammes ajoutés prennent le mot français. Le bouton <strong>Harmoniser les mots</strong> apparaît quand des cartes ne sont pas encore dans cette langue.",
              "Activez le <strong>Mode entraînement</strong> pour flouter le mot à deviner : choisissez avec <strong>Masquer</strong> s'il s'agit du mot de la langue de travail, de la traduction, ou des deux. Un clic sur un mot flouté le révèle, indépendamment de l'autre. <strong>Fixer l'imagier</strong> évite les modifications accidentelles pendant l'exercice.",
              "Cochez <strong>Voix naturelle hors ligne</strong> pour remplacer la voix du navigateur par une voix plus naturelle, calculée sur l'appareil. Le premier son télécharge le modèle (une fois), puis <strong>Préparer l'audio de la planche</strong> enregistre tous les mots : les écoutes suivantes sont immédiates et fonctionnent sans réseau.",
              "Utilisez <strong>Imprimer / PDF</strong> pour obtenir une planche propre sans les boutons de contrôle."
            ]
          },
          {
            titre: "4. Sauvegarde et réutilisation",
            points: [
              "Donnez un nom à votre planche et cliquez sur <strong>Enregistrer sur l'ordi (.JSON)</strong> pour conserver votre travail.",
              "Rechargez n'importe quel fichier <code>.json</code> via <strong>Ouvrir un imagier (.JSON)</strong> pour reprendre ou adapter une planche existante.",
              "Les pictogrammes proviennent d'<strong>ARASAAC</strong> (auteur : Sergio Palao, licence <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      en: {
        titre: "Pics2Mots",
        sousTitre: "From image to word, from word to image",
        langueUi: "Interface:",
        tabAtelier: "Workshop",
        tabEmploi: "User guide",
        propositions: "1. Suggestions",
        aidePropositions: "Search below to display suggestions.",
        placeholderTheme: "E.g. numbers ; lsf or lsf ; numbers",
        astuceRecherche: "The <strong>1st criterion</strong> sets display priority (e.g. <code>numbers ; lsf</code> or <code>lsf ; numbers</code>).",
        natAll: "All word types",
        nat3: "Verbs (infinitive)",
        nat2: "Nouns",
        nat4: "Adjectives",
        qte: "Count:",
        chercher: "Search",
        toutAjouter: "Add all",
        langueCible: "Board language:",
        entrainementOff: "Practice mode: OFF",
        entrainementOn: "Practice mode: ON",
        fixer: "Lock board",
        deverrouiller: "Unlock board",
        imprimer: "Print / PDF",
        vider: "Clear",
        placeholderNom: "Board name",
        saveOrdi: "Save to computer (.JSON)",
        ouvrirOrdi: "Open board (.JSON)",
        titreImagier: "2. My picture board",
        badgeFixe: "Locked",
        badgeTrain: "Practice",
        imagierVide: "No cards in the board yet.",
        guideTitre: "Pics2Mots user guide",
        guideIntro: "Learn how to build a board, use multi-criteria search, and save or print your boards.",
        banniereReprise: "Board restored",
        repriseNouvelle: "New board",
        cartesLabel: "cards",
        audioOption: "Natural voice, offline",
        audioMedium: "High-quality voice (60 MB)",
        audioLow: "Light voice for tablets (27 MB)",
        preparerAudio: "Prepare board audio",
        audioArreter: "Stop",
        audioChargement: "Loading voice…",
        audioGenere: "sound saved",
        audioRepli: "Natural voice unavailable: using the browser voice",
        audioPret: "Audio ready",
        langueAucune: "Single language — no translation",
        baseLocaleTitre: "Local database — search offline",
        baseLocaleAide: "Each catalogue is downloaded once and kept on the device. Further searches no longer reach ARASAAC and work without a connection.",
        masquer: "Hide:",
        masqDeux: "word and translation",
        masqSource: "the word (working language)",
        masqCible: "the translation",
        langueMots: "Word language:",
        harmoniserMots: "Harmonise words",
        motsMisAJour: "word(s) updated",
        motsIndisponibles: "no equivalent in this language",
        guideBlocs: [
          {
            titre: "1. Search and enrich a board",
            points: [
              "Type a word or theme in the interface language (for example <code>cooking</code>, <code>numbers</code>, <code>house</code>).",
              "Optionally filter by word type (verbs, nouns, adjectives) and choose how many suggestions you want.",
              "Hover over a suggestion to inspect its tags and categories, or click it to search directly on a tag.",
              "For some common themes, the tool completes the list automatically from linked records when local results are limited.",
              "Each language catalogue is kept on the device after the first search: later searches work offline. The <strong>Local database</strong> block lets you download, refresh or delete these catalogues."
            ]
          },
          {
            titre: "2. Multi-criteria search in detail",
            points: [
              "Separate several criteria with a semicolon <code>;</code> or a comma <code>,</code>.",
              "<strong>Order matters:</strong> the first criterion carries the most weight (e.g. <code>numbers ; lsf</code> favours numbers; <code>lsf ; numbers</code> puts sign-language records first).",
              "Used alone, <code>lsf</code> filters pictograms linked to sign language; combined with a word it boosts related matches without emptying the list when a figure is not tagged <code>lsf</code>."
            ]
          },
          {
            titre: "3. Organise, practise and print",
            points: [
              "Add or remove cards with a click in <strong>Suggestions</strong>, or use <strong>Add all</strong>.",
              "Reorder cards by <strong>drag and drop</strong> or with the <code>←</code> / <code>→</code> arrows.",
              "Choose the target language to display the translation and hear it (<code>🔊</code>).",
              "<strong>Word language</strong> sets the language of the labels, independently of the interface: search in Spanish for a theme missing from the French catalogue and the added pictograms take the French word. The <strong>Harmonise words</strong> button appears when cards are not yet in that language.",
              "Turn on <strong>Practice mode</strong> to blur the word to guess: use <strong>Hide</strong> to choose the word, the translation, or both. Click a blurred word to reveal it, independently of the other. <strong>Lock board</strong> prevents accidental changes during the exercise.",
              "Tick <strong>Natural voice, offline</strong> to replace the browser voice with a more natural one computed on the device. The first sound downloads the model (once), then <strong>Prepare board audio</strong> saves every word: later playback is instant and works offline.",
              "Use <strong>Print / PDF</strong> for a clean board without the controls."
            ]
          },
          {
            titre: "4. Saving and reuse",
            points: [
              "Give your board a name and click <strong>Save to computer (.JSON)</strong> to keep your work.",
              "Reload any <code>.json</code> file with <strong>Open board (.JSON)</strong> to resume or adapt an existing board.",
              "Pictograms come from <strong>ARASAAC</strong> (author: Sergio Palao, licence <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      es: {
        titre: "Pics2Mots",
        sousTitre: "De la imagen a la palabra, de la palabra a la imagen",
        langueUi: "Interfaz:",
        tabAtelier: "Taller",
        tabEmploi: "Manual de uso",
        propositions: "1. Sugerencias",
        aidePropositions: "Busca abajo para ver sugerencias.",
        placeholderTheme: "Ej: números ; lsf o lsf ; números",
        astuceRecherche: "El <strong>1.er criterio</strong> fija la prioridad (ej.: <code>números ; lsf</code> o <code>lsf ; números</code>).",
        natAll: "Todas las categorías",
        nat3: "Verbos (infinitivo)",
        nat2: "Sustantivos",
        nat4: "Adjetivos",
        qte: "Cantidad:",
        chercher: "Buscar",
        toutAjouter: "Añadir todo",
        langueCible: "Idioma del tablero:",
        entrainementOff: "Modo práctica: OFF",
        entrainementOn: "Modo práctica: ON",
        fixer: "Fijar tablero",
        deverrouiller: "Desbloquear tablero",
        imprimer: "Imprimir / PDF",
        vider: "Vaciar",
        placeholderNom: "Nombre del tablero",
        saveOrdi: "Guardar en PC (.JSON)",
        ouvrirOrdi: "Abrir tablero (.JSON)",
        titreImagier: "2. Mi tablero",
        badgeFixe: "Fijado",
        badgeTrain: "Práctica",
        imagierVide: "Aún no hay tarjetas en el tablero.",
        guideTitre: "Manual de uso de Pics2Mots",
        guideIntro: "Descubre cómo crear tableros, usar búsquedas combinadas y guardar o imprimir tu trabajo.",
        banniereReprise: "Tablero restaurado",
        repriseNouvelle: "Tablero nuevo",
        cartesLabel: "tarjetas",
        audioOption: "Voz natural sin conexión",
        audioMedium: "Voz de calidad (60 MB)",
        audioLow: "Voz ligera para tableta (27 MB)",
        preparerAudio: "Preparar el audio del tablero",
        audioArreter: "Detener",
        audioChargement: "Cargando la voz…",
        audioGenere: "sonido guardado",
        audioRepli: "Voz natural no disponible: se usa la voz del navegador",
        audioPret: "Audio listo",
        langueAucune: "Idioma único — sin traducción",
        baseLocaleTitre: "Base local — buscar sin conexión",
        baseLocaleAide: "Cada catálogo se descarga una sola vez y se conserva en el dispositivo. Las búsquedas siguientes ya no solicitan ARASAAC y funcionan sin conexión.",
        masquer: "Ocultar:",
        masqDeux: "la palabra y la traducción",
        masqSource: "la palabra (lengua de trabajo)",
        masqCible: "la traducción",
        langueMots: "Idioma de las palabras:",
        harmoniserMots: "Armonizar las palabras",
        motsMisAJour: "palabra(s) actualizada(s)",
        motsIndisponibles: "sin equivalente en este idioma",
        guideBlocs: [
          {
            titre: "1. Buscar y enriquecer un tablero",
            points: [
              "Escriba una palabra o un tema en el idioma de la interfaz (por ejemplo <code>cocinar</code>, <code>números</code>, <code>casa</code>).",
              "Filtre opcionalmente por categoría gramatical (verbos, sustantivos, adjetivos) y elija la cantidad deseada.",
              "Pase el cursor sobre una propuesta para ver sus etiquetas y categorías, o haga clic en ella para buscar directamente por etiqueta.",
              "Para algunos temas frecuentes, la herramienta completa la lista automáticamente con las fichas vinculadas si los resultados locales son escasos.",
              "Cada catálogo de idioma se conserva en el dispositivo tras la primera búsqueda: las siguientes funcionan sin conexión. El bloque <strong>Base local</strong> permite descargar, actualizar o eliminar estos catálogos."
            ]
          },
          {
            titre: "2. Matices de las búsquedas múltiples",
            points: [
              "Separe varios criterios con un punto y coma <code>;</code> o una coma <code>,</code>.",
              "<strong>El orden importa:</strong> el primer criterio tiene el mayor peso en la clasificación (ej.: <code>números ; lsf</code> prioriza los números; <code>lsf ; números</code> destaca las fichas de lengua de signos).",
              "El criterio <code>lsf</code> solo filtra los pictogramas de lengua de signos o gestos; combinado con una palabra refuerza las coincidencias sin vaciar la lista cuando una cifra no está etiquetada <code>lsf</code>."
            ]
          },
          {
            titre: "3. Organizar, practicar e imprimir",
            points: [
              "Añada o quite tarjetas con un clic en <strong>Sugerencias</strong>, o use <strong>Añadir todo</strong>.",
              "Reordene las tarjetas mediante <strong>arrastrar y soltar</strong> o con las flechas <code>←</code> / <code>→</code>.",
              "Elija el idioma del tablero para mostrar la traducción y escuchar la pronunciación (<code>🔊</code>).",
              "<strong>Idioma de las palabras</strong> fija el idioma de las etiquetas, independientemente de la interfaz: si busca en español un tema que falta en el catálogo francés, los pictogramas añadidos toman la palabra francesa. El botón <strong>Armonizar las palabras</strong> aparece cuando algunas tarjetas aún no están en ese idioma.",
              "Active el <strong>Modo práctica</strong> para difuminar la palabra que hay que adivinar: con <strong>Ocultar</strong> elija la palabra, la traducción o ambas. Un clic sobre una palabra difuminada la revela, independientemente de la otra. <strong>Fijar tablero</strong> evita cambios accidentales durante el ejercicio.",
              "Marque <strong>Voz natural sin conexión</strong> para sustituir la voz del navegador por una más natural calculada en el dispositivo. El primer sonido descarga el modelo (una sola vez); después, <strong>Preparar el audio del tablero</strong> guarda todas las palabras: las escuchas siguientes son inmediatas y funcionan sin conexión.",
              "Use <strong>Imprimir / PDF</strong> para obtener un tablero limpio sin los botones de control."
            ]
          },
          {
            titre: "4. Guardado y reutilización",
            points: [
              "Dé un nombre a su tablero y pulse <strong>Guardar en PC (.JSON)</strong> para conservar su trabajo.",
              "Vuelva a cargar cualquier archivo <code>.json</code> con <strong>Abrir tablero (.JSON)</strong> para retomar o adaptar un tablero existente.",
              "Los pictogramas proceden de <strong>ARASAAC</strong> (autor: Sergio Palao, licencia <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      de: {
        titre: "Pics2Mots",
        sousTitre: "Vom Bild zum Wort, vom Wort zum Bild",
        langueUi: "Sprache:",
        tabAtelier: "Werkstatt",
        tabEmploi: "Anleitung",
        propositions: "1. Vorschläge",
        aidePropositions: "Starten Sie unten eine Suche, um Vorschläge anzuzeigen.",
        placeholderTheme: "z. B. Zahlen ; lsf oder lsf ; Zahlen",
        astuceRecherche: "Das <strong>erste Kriterium</strong> bestimmt die Anzeigepriorität (z. B. <code>Zahlen ; lsf</code> oder <code>lsf ; Zahlen</code>).",
        natAll: "Alle Wortarten",
        nat3: "Verben (Infinitiv)",
        nat2: "Substantive",
        nat4: "Adjektive",
        qte: "Anzahl:",
        chercher: "Suchen",
        toutAjouter: "Alle hinzufügen",
        langueCible: "Sprache der Bildkarte:",
        entrainementOff: "Übungsmodus: AUS",
        entrainementOn: "Übungsmodus: AN",
        fixer: "Bildkarte sperren",
        deverrouiller: "Bildkarte entsperren",
        imprimer: "Drucken / PDF",
        vider: "Leeren",
        placeholderNom: "Name der Bildkarte",
        saveOrdi: "Auf dem Computer speichern (.JSON)",
        ouvrirOrdi: "Bildkarte öffnen (.JSON)",
        titreImagier: "2. Meine Bildkarte",
        badgeFixe: "Gesperrt",
        badgeTrain: "Übung",
        imagierVide: "Noch keine Karten in der Bildkarte.",
        guideTitre: "Anleitung zu Pics2Mots",
        guideIntro: "Hier erfahren Sie, wie Sie eine Karte zusammenstellen, die Suche nutzen und Ihre Bildkarten speichern.",
        banniereReprise: "Karte wiederhergestellt",
        repriseNouvelle: "Neue Karte",
        cartesLabel: "Karten",
        audioOption: "Natürliche Stimme offline",
        audioMedium: "Qualitätsstimme (60 MB)",
        audioLow: "Leichte Stimme für Tablets (27 MB)",
        preparerAudio: "Audio der Karte vorbereiten",
        audioArreter: "Anhalten",
        audioChargement: "Stimme wird geladen…",
        audioGenere: "Ton gespeichert",
        audioRepli: "Natürliche Stimme nicht verfügbar: Browser-Stimme wird verwendet",
        audioPret: "Audio bereit",
        langueAucune: "Eine Sprache — keine Übersetzung",
        baseLocaleTitre: "Lokale Datenbank — Suche ohne Netz",
        baseLocaleAide: "Jeder Katalog wird einmal heruntergeladen und auf dem Gerät gespeichert. Weitere Suchen fragen ARASAAC nicht mehr ab und funktionieren offline.",
        masquer: "Ausblenden:",
        masqDeux: "Wort und Übersetzung",
        masqSource: "das Wort (Arbeitssprache)",
        masqCible: "die Übersetzung",
        langueMots: "Sprache der Wörter:",
        harmoniserMots: "Wörter angleichen",
        motsMisAJour: "Wort(e) aktualisiert",
        motsIndisponibles: "keine Entsprechung in dieser Sprache",
        guideBlocs: [
          {
            titre: "1. Eine Bildkarte suchen und ergänzen",
            points: [
              "Geben Sie ein Wort oder ein Thema in der Sprache der Oberfläche ein (zum Beispiel <code>kochen</code>, <code>Zahlen</code>, <code>Haus</code>).",
              "Filtern Sie bei Bedarf nach Wortart (Verben, Substantive, Adjektive) und wählen Sie die gewünschte Anzahl.",
              "Fahren Sie über einen Vorschlag, um seine Schlagwörter und Kategorien zu sehen, oder klicken Sie darauf, um direkt nach einem Schlagwort zu suchen.",
              "Bei einigen häufigen Themen ergänzt das Werkzeug die Liste automatisch aus verknüpften Einträgen, wenn die lokalen Ergebnisse knapp sind.",
              "Jeder Sprachkatalog wird nach der ersten Suche auf dem Gerät gespeichert: weitere Suchen funktionieren ohne Netz. Im Block <strong>Lokale Datenbank</strong> können Sie diese Kataloge herunterladen, aktualisieren oder löschen."
            ]
          },
          {
            titre: "2. Feinheiten der Mehrfachsuche",
            points: [
              "Trennen Sie mehrere Kriterien durch ein Semikolon <code>;</code> oder ein Komma <code>,</code>.",
              "<strong>Die Reihenfolge zählt:</strong> das erste Kriterium hat das größte Gewicht (z. B. <code>Zahlen ; lsf</code> bevorzugt Zahlen; <code>lsf ; Zahlen</code> stellt Gebärdensprach-Einträge voran).",
              "Allein verwendet filtert <code>lsf</code> Piktogramme der Gebärdensprache; mit einem Wort kombiniert verstärkt es passende Treffer, ohne die Liste zu leeren, wenn eine Zahl nicht mit <code>lsf</code> verschlagwortet ist."
            ]
          },
          {
            titre: "3. Ordnen, üben und drucken",
            points: [
              "Fügen Sie Karten mit einem Klick unter <strong>Vorschläge</strong> hinzu oder entfernen Sie sie, oder nutzen Sie <strong>Alle hinzufügen</strong>.",
              "Ordnen Sie die Karten per <strong>Ziehen und Ablegen</strong> oder mit den Pfeilen <code>←</code> / <code>→</code>.",
              "Wählen Sie die Sprache der Bildkarte, um die Übersetzung anzuzeigen und die Aussprache zu hören (<code>🔊</code>).",
              "<strong>Sprache der Wörter</strong> legt die Sprache der Beschriftungen fest, unabhängig von der Oberfläche: Suchen Sie auf Spanisch ein Thema, das im französischen Katalog fehlt, übernehmen die hinzugefügten Piktogramme das französische Wort. Die Schaltfläche <strong>Wörter angleichen</strong> erscheint, wenn Karten noch nicht in dieser Sprache sind.",
              "Aktivieren Sie den <strong>Übungsmodus</strong>, um das gesuchte Wort zu verwischen: Wählen Sie mit <strong>Ausblenden</strong> das Wort, die Übersetzung oder beides. Ein Klick auf ein verwischtes Wort deckt es auf, unabhängig vom anderen. <strong>Bildkarte sperren</strong> verhindert versehentliche Änderungen während der Übung.",
              "Aktivieren Sie <strong>Natürliche Stimme offline</strong>, um die Browser-Stimme durch eine natürlichere, auf dem Gerät berechnete Stimme zu ersetzen. Der erste Ton lädt das Modell (einmalig); danach speichert <strong>Audio der Karte vorbereiten</strong> alle Wörter: weitere Wiedergaben sind sofort und funktionieren ohne Netz.",
              "Mit <strong>Drucken / PDF</strong> erhalten Sie eine saubere Bildkarte ohne Bedienelemente."
            ]
          },
          {
            titre: "4. Speichern und wiederverwenden",
            points: [
              "Geben Sie Ihrer Bildkarte einen Namen und klicken Sie auf <strong>Auf dem Computer speichern (.JSON)</strong>.",
              "Laden Sie eine beliebige <code>.json</code>-Datei über <strong>Bildkarte öffnen (.JSON)</strong>, um eine vorhandene Karte fortzusetzen oder anzupassen.",
              "Die Piktogramme stammen von <strong>ARASAAC</strong> (Autor: Sergio Palao, Lizenz <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      it: {
        titre: "Pics2Mots",
        sousTitre: "Dall'immagine alla parola, dalla parola all'immagine",
        langueUi: "Interfaccia:",
        tabAtelier: "Laboratorio",
        tabEmploi: "Istruzioni",
        propositions: "1. Proposte",
        aidePropositions: "Avvia una ricerca qui sotto per visualizzare le proposte.",
        placeholderTheme: "Es: numeri ; lsf oppure lsf ; numeri",
        astuceRecherche: "Il <strong>primo criterio</strong> determina la priorità di visualizzazione (es.: <code>numeri ; lsf</code> o <code>lsf ; numeri</code>).",
        natAll: "Tutte le categorie",
        nat3: "Verbi (infinito)",
        nat2: "Nomi comuni",
        nat4: "Aggettivi",
        qte: "Quantità:",
        chercher: "Cerca",
        toutAjouter: "Aggiungi tutto",
        langueCible: "Lingua della tabella:",
        entrainementOff: "Modalità esercizio: OFF",
        entrainementOn: "Modalità esercizio: ON",
        fixer: "Blocca la tabella",
        deverrouiller: "Sblocca la tabella",
        imprimer: "Stampa / PDF",
        vider: "Svuota",
        placeholderNom: "Nome della tabella",
        saveOrdi: "Salva sul computer (.JSON)",
        ouvrirOrdi: "Apri una tabella (.JSON)",
        titreImagier: "2. La mia tabella",
        badgeFixe: "Bloccata",
        badgeTrain: "Esercizio",
        imagierVide: "Nessuna scheda nella tabella.",
        guideTitre: "Istruzioni di Pics2Mots",
        guideIntro: "Qui trovi come comporre una tabella, usare il motore di ricerca e salvare le tue tabelle.",
        banniereReprise: "Tabella ripristinata",
        repriseNouvelle: "Nuova tabella",
        cartesLabel: "schede",
        audioOption: "Voce naturale offline",
        audioMedium: "Voce di qualità (60 MB)",
        audioLow: "Voce leggera per tablet (27 MB)",
        preparerAudio: "Prepara l'audio della tabella",
        audioArreter: "Interrompi",
        audioChargement: "Caricamento della voce…",
        audioGenere: "suono salvato",
        audioRepli: "Voce naturale non disponibile: si usa la voce del browser",
        audioPret: "Audio pronto",
        langueAucune: "Una sola lingua — nessuna traduzione",
        baseLocaleTitre: "Archivio locale — cercare senza rete",
        baseLocaleAide: "Ogni catalogo viene scaricato una sola volta e conservato sul dispositivo. Le ricerche successive non interrogano più ARASAAC e funzionano offline.",
        masquer: "Nascondi:",
        masqDeux: "la parola e la traduzione",
        masqSource: "la parola (lingua di lavoro)",
        masqCible: "la traduzione",
        langueMots: "Lingua delle parole:",
        harmoniserMots: "Allinea le parole",
        motsMisAJour: "parola/e aggiornata/e",
        motsIndisponibles: "nessun equivalente in questa lingua",
        guideBlocs: [
          {
            titre: "1. Cercare e arricchire una tabella",
            points: [
              "Digiti una parola o un tema nella lingua dell'interfaccia (per esempio <code>cucinare</code>, <code>numeri</code>, <code>casa</code>).",
              "Filtri facoltativamente per categoria grammaticale (verbi, nomi comuni, aggettivi) e scelga la quantità desiderata.",
              "Passi il cursore su una proposta per vedere le sue etichette e categorie, oppure clicchi per avviare una ricerca diretta su un'etichetta.",
              "Per alcuni temi frequenti lo strumento completa automaticamente l'elenco con le schede collegate, se i risultati locali sono scarsi.",
              "Ogni catalogo di lingua viene conservato sul dispositivo dopo la prima ricerca: le successive funzionano senza rete. Il blocco <strong>Archivio locale</strong> permette di scaricare, aggiornare o eliminare questi cataloghi."
            ]
          },
          {
            titre: "2. Dettagli delle ricerche multiple",
            points: [
              "Separi più criteri con un punto e virgola <code>;</code> o una virgola <code>,</code>.",
              "<strong>L'ordine conta:</strong> il primo criterio ha il peso maggiore nella classificazione (es.: <code>numeri ; lsf</code> privilegia i numeri; <code>lsf ; numeri</code> mette avanti le schede della lingua dei segni).",
              "Da solo, il criterio <code>lsf</code> filtra i pittogrammi della lingua dei segni o dei gesti; combinato con una parola rafforza le corrispondenze senza svuotare l'elenco quando un numero non è etichettato <code>lsf</code>."
            ]
          },
          {
            titre: "3. Organizzare, esercitarsi e stampare",
            points: [
              "Aggiunga o tolga schede con un clic in <strong>Proposte</strong>, oppure usi <strong>Aggiungi tutto</strong>.",
              "Riordini le schede con il <strong>trascinamento</strong> o con le frecce <code>←</code> / <code>→</code>.",
              "Scelga la lingua della tabella per mostrare la traduzione e ascoltarne la pronuncia (<code>🔊</code>).",
              "<strong>Lingua delle parole</strong> imposta la lingua delle etichette, indipendentemente dall'interfaccia: se cerca in spagnolo un tema assente dal catalogo francese, i pittogrammi aggiunti prendono la parola francese. Il pulsante <strong>Allinea le parole</strong> compare quando alcune schede non sono ancora in quella lingua.",
              "Attivi la <strong>Modalità esercizio</strong> per sfocare la parola da indovinare: con <strong>Nascondi</strong> scelga la parola, la traduzione o entrambe. Un clic su una parola sfocata la rivela, indipendentemente dall'altra. <strong>Blocca la tabella</strong> evita modifiche accidentali durante l'esercizio.",
              "Selezioni <strong>Voce naturale offline</strong> per sostituire la voce del browser con una più naturale calcolata sul dispositivo. Il primo suono scarica il modello (una sola volta); poi <strong>Prepara l'audio della tabella</strong> salva tutte le parole: gli ascolti successivi sono immediati e funzionano senza rete.",
              "Usi <strong>Stampa / PDF</strong> per ottenere una tabella pulita senza i pulsanti di controllo."
            ]
          },
          {
            titre: "4. Salvataggio e riutilizzo",
            points: [
              "Dia un nome alla tabella e clicchi su <strong>Salva sul computer (.JSON)</strong> per conservare il lavoro.",
              "Ricarichi qualsiasi file <code>.json</code> con <strong>Apri una tabella (.JSON)</strong> per riprendere o adattare una tabella esistente.",
              "I pittogrammi provengono da <strong>ARASAAC</strong> (autore: Sergio Palao, licenza <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      pt: {
        titre: "Pics2Mots",
        sousTitre: "Da imagem à palavra, da palavra à imagem",
        langueUi: "Idioma:",
        tabAtelier: "Oficina",
        tabEmploi: "Instruções",
        propositions: "1. Propostas",
        aidePropositions: "Inicie uma pesquisa abaixo para ver propostas.",
        placeholderTheme: "Ex.: números ; lsf ou lsf ; números",
        astuceRecherche: "O <strong>1.º critério</strong> define a prioridade de apresentação (ex.: <code>números ; lsf</code> ou <code>lsf ; números</code>).",
        natAll: "Todas as classes",
        nat3: "Verbos (infinitivo)",
        nat2: "Nomes comuns",
        nat4: "Adjetivos",
        qte: "Quantidade:",
        chercher: "Pesquisar",
        toutAjouter: "Adicionar tudo",
        langueCible: "Idioma da prancha:",
        entrainementOff: "Modo treino: OFF",
        entrainementOn: "Modo treino: ON",
        fixer: "Fixar a prancha",
        deverrouiller: "Desbloquear a prancha",
        imprimer: "Imprimir / PDF",
        vider: "Esvaziar",
        placeholderNom: "Nome da prancha",
        saveOrdi: "Guardar no computador (.JSON)",
        ouvrirOrdi: "Abrir uma prancha (.JSON)",
        titreImagier: "2. A minha prancha",
        badgeFixe: "Fixada",
        badgeTrain: "Treino",
        imagierVide: "Ainda não há cartões na prancha.",
        guideTitre: "Instruções de Pics2Mots",
        guideIntro: "Saiba como compor uma prancha, usar o motor de pesquisa e guardar as suas pranchas.",
        banniereReprise: "Prancha restaurada",
        repriseNouvelle: "Nova prancha",
        cartesLabel: "cartões",
        audioOption: "Voz natural sem ligação",
        audioMedium: "Voz de qualidade (60 MB)",
        audioLow: "Voz leve para tablet (27 MB)",
        preparerAudio: "Preparar o áudio da prancha",
        audioArreter: "Parar",
        audioChargement: "A carregar a voz…",
        audioGenere: "som guardado",
        audioRepli: "Voz natural indisponível: é usada a voz do navegador",
        audioPret: "Áudio pronto",
        langueAucune: "Idioma único — sem tradução",
        baseLocaleTitre: "Base local — pesquisar sem rede",
        baseLocaleAide: "Cada catálogo é descarregado uma única vez e guardado no dispositivo. As pesquisas seguintes já não contactam a ARASAAC e funcionam sem ligação.",
        masquer: "Ocultar:",
        masqDeux: "a palavra e a tradução",
        masqSource: "a palavra (idioma de trabalho)",
        masqCible: "a tradução",
        langueMots: "Idioma das palavras:",
        harmoniserMots: "Harmonizar as palavras",
        motsMisAJour: "palavra(s) atualizada(s)",
        motsIndisponibles: "sem equivalente neste idioma",
        guideBlocs: [
          {
            titre: "1. Pesquisar e enriquecer uma prancha",
            points: [
              "Escreva uma palavra ou um tema no idioma da interface (por exemplo <code>cozinhar</code>, <code>números</code>, <code>casa</code>).",
              "Filtre opcionalmente por classe gramatical (verbos, nomes comuns, adjetivos) e escolha a quantidade desejada.",
              "Passe o cursor sobre uma proposta para ver as etiquetas e categorias, ou clique nela para pesquisar diretamente por etiqueta.",
              "Para alguns temas frequentes, a ferramenta completa a lista automaticamente com as fichas associadas quando os resultados locais são escassos.",
              "Cada catálogo de idioma fica guardado no dispositivo após a primeira pesquisa: as seguintes funcionam sem rede. O bloco <strong>Base local</strong> permite descarregar, atualizar ou eliminar esses catálogos."
            ]
          },
          {
            titre: "2. Detalhes das pesquisas múltiplas",
            points: [
              "Separe vários critérios com um ponto e vírgula <code>;</code> ou uma vírgula <code>,</code>.",
              "<strong>A ordem conta:</strong> o primeiro critério tem o maior peso na classificação (ex.: <code>números ; lsf</code> privilegia os números; <code>lsf ; números</code> destaca as fichas de língua gestual).",
              "Sozinho, o critério <code>lsf</code> filtra os pictogramas de língua gestual; combinado com uma palavra reforça as correspondências sem esvaziar a lista quando um número não está etiquetado <code>lsf</code>."
            ]
          },
          {
            titre: "3. Organizar, treinar e imprimir",
            points: [
              "Adicione ou retire cartões com um clique em <strong>Propostas</strong>, ou use <strong>Adicionar tudo</strong>.",
              "Reordene os cartões por <strong>arrastar e largar</strong> ou com as setas <code>←</code> / <code>→</code>.",
              "Escolha o idioma da prancha para mostrar a tradução e ouvir a pronúncia (<code>🔊</code>).",
              "<strong>Idioma das palavras</strong> define o idioma das etiquetas, independentemente da interface: se pesquisar em espanhol um tema ausente do catálogo francês, os pictogramas adicionados recebem a palavra francesa. O botão <strong>Harmonizar as palavras</strong> aparece quando alguns cartões ainda não estão nesse idioma.",
              "Ative o <strong>Modo treino</strong> para desfocar a palavra a adivinhar: com <strong>Ocultar</strong> escolha a palavra, a tradução ou ambas. Um clique numa palavra desfocada revela-a, independentemente da outra. <strong>Fixar a prancha</strong> evita alterações acidentais durante o exercício.",
              "Marque <strong>Voz natural sem ligação</strong> para substituir a voz do navegador por uma mais natural calculada no dispositivo. O primeiro som descarrega o modelo (uma vez); depois <strong>Preparar o áudio da prancha</strong> guarda todas as palavras: as audições seguintes são imediatas e funcionam sem rede.",
              "Use <strong>Imprimir / PDF</strong> para obter uma prancha limpa sem os botões de controlo."
            ]
          },
          {
            titre: "4. Guardar e reutilizar",
            points: [
              "Dê um nome à prancha e clique em <strong>Guardar no computador (.JSON)</strong> para conservar o trabalho.",
              "Recarregue qualquer ficheiro <code>.json</code> com <strong>Abrir uma prancha (.JSON)</strong> para retomar ou adaptar uma prancha existente.",
              "Os pictogramas provêm da <strong>ARASAAC</strong> (autor: Sergio Palao, licença <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      ar: {
        titre: "Pics2Mots",
        sousTitre: "من الصورة إلى الكلمة، ومن الكلمة إلى الصورة",
        langueUi: "الواجهة:",
        tabAtelier: "الورشة",
        tabEmploi: "دليل الاستخدام",
        propositions: "1. المقترحات",
        aidePropositions: "ابدأ البحث أدناه لعرض المقترحات.",
        placeholderTheme: "مثال: أرقام ؛ lsf أو lsf ؛ أرقام",
        astuceRecherche: "المعيار <strong>الأول</strong> يحدّد أولوية العرض (مثال: <code>أرقام ؛ lsf</code> أو <code>lsf ؛ أرقام</code>).",
        natAll: "كل الأنواع",
        nat3: "أفعال (المصدر)",
        nat2: "أسماء",
        nat4: "صفات",
        qte: "العدد:",
        chercher: "بحث",
        toutAjouter: "إضافة الكل",
        langueCible: "لغة اللوحة:",
        entrainementOff: "وضع التدريب: متوقف",
        entrainementOn: "وضع التدريب: مفعّل",
        fixer: "تثبيت اللوحة",
        deverrouiller: "إلغاء تثبيت اللوحة",
        imprimer: "طباعة / PDF",
        vider: "إفراغ",
        placeholderNom: "اسم اللوحة",
        saveOrdi: "حفظ على الحاسوب (.JSON)",
        ouvrirOrdi: "فتح لوحة (.JSON)",
        titreImagier: "2. لوحتي",
        badgeFixe: "مثبّتة",
        badgeTrain: "تدريب",
        imagierVide: "لا توجد بطاقات في اللوحة.",
        guideTitre: "دليل استخدام Pics2Mots",
        guideIntro: "تجد هنا كيفية إنشاء لوحة واستخدام محرك البحث وحفظ لوحاتك.",
        banniereReprise: "تمت استعادة اللوحة",
        repriseNouvelle: "لوحة جديدة",
        cartesLabel: "بطاقة",
        audioOption: "صوت طبيعي دون اتصال",
        audioMedium: "صوت عالي الجودة (60 ميغابايت)",
        audioLow: "صوت خفيف للأجهزة اللوحية (27 ميغابايت)",
        preparerAudio: "تحضير صوت اللوحة",
        audioArreter: "إيقاف",
        audioChargement: "جارٍ تحميل الصوت…",
        audioGenere: "تم حفظ الصوت",
        audioRepli: "الصوت الطبيعي غير متاح: يُستخدم صوت المتصفح",
        audioPret: "الصوت جاهز",
        langueAucune: "لغة واحدة — بدون ترجمة",
        baseLocaleTitre: "قاعدة محلية — البحث دون شبكة",
        baseLocaleAide: "يُحمَّل كل دليل مرة واحدة ثم يُحفظ على الجهاز. عمليات البحث التالية لا تتصل بـ ARASAAC وتعمل دون اتصال.",
        masquer: "إخفاء:",
        masqDeux: "الكلمة والترجمة",
        masqSource: "الكلمة (لغة العمل)",
        masqCible: "الترجمة",
        langueMots: "لغة الكلمات:",
        harmoniserMots: "توحيد الكلمات",
        motsMisAJour: "كلمة/كلمات محدَّثة",
        motsIndisponibles: "لا مقابل لها في هذه اللغة",
        guideBlocs: [
          {
            titre: "1. البحث في لوحة وإثراؤها",
            points: [
              "اكتب كلمة أو موضوعًا بلغة الواجهة (مثل <code>طبخ</code>، <code>أرقام</code>، <code>منزل</code>).",
              "يمكنك التصفية حسب نوع الكلمة (أفعال، أسماء، صفات) واختيار العدد المطلوب.",
              "مرّر المؤشر على اقتراح لعرض وسومه وفئاته، أو انقر عليه لبدء بحث مباشر بوسم.",
              "في بعض الموضوعات الشائعة تكمل الأداة القائمة تلقائيًا من البطاقات المرتبطة عندما تكون النتائج المحلية قليلة.",
              "يُحفظ كل دليل لغة على الجهاز بعد أول بحث، وتعمل عمليات البحث التالية دون شبكة. ويتيح قسم <strong>قاعدة محلية</strong> تنزيل هذه الأدلة أو تحديثها أو حذفها."
            ]
          },
          {
            titre: "2. تفاصيل البحث المتعدد",
            points: [
              "افصل بين المعايير بفاصلة منقوطة <code>;</code> أو بفاصلة <code>,</code>.",
              "<strong>الترتيب مهم:</strong> للمعيار الأول الوزن الأكبر في الترتيب (مثال: <code>أرقام ؛ lsf</code> يرجّح الأرقام، و<code>lsf ؛ أرقام</code> يقدّم بطاقات لغة الإشارة).",
              "المعيار <code>lsf</code> وحده يرشّح رموز لغة الإشارة أو الإيماءات؛ وإذا اقترن بكلمة عزّز المطابقات دون إفراغ القائمة عندما لا يكون الرقم موسومًا بـ <code>lsf</code>."
            ]
          },
          {
            titre: "3. التنظيم والتدريب والطباعة",
            points: [
              "أضف البطاقات أو أزلها بنقرة في <strong>المقترحات</strong>، أو استخدم <strong>إضافة الكل</strong>.",
              "أعد ترتيب البطاقات بالسحب والإفلات أو بالسهمين <code>←</code> / <code>→</code>.",
              "اختر لغة اللوحة لعرض الترجمة وسماع النطق (<code>🔊</code>).",
              "<strong>لغة الكلمات</strong> تحدد لغة البطاقات بمعزل عن لغة الواجهة: إذا بحثت بالإسبانية عن موضوع غير موجود في الدليل الفرنسي أخذت الرموز المضافة الكلمة الفرنسية. ويظهر زر <strong>توحيد الكلمات</strong> عندما لا تكون بعض البطاقات بهذه اللغة بعد.",
              "فعّل <strong>وضع التدريب</strong> لطمس الكلمة المطلوب تخمينها: اختر بـ <strong>إخفاء</strong> الكلمة أو الترجمة أو كليهما. والنقر على كلمة مطموسة يكشفها دون الأخرى. أما <strong>تثبيت اللوحة</strong> فيمنع التعديل غير المقصود أثناء التمرين.",
              "حدّد <strong>صوت طبيعي دون اتصال</strong> لاستبدال صوت المتصفح بصوت أكثر طبيعية يُحسب على الجهاز. الصوت الأول ينزّل النموذج مرة واحدة، ثم يحفظ <strong>تحضير صوت اللوحة</strong> جميع الكلمات: الاستماع التالي فوري ويعمل دون شبكة.",
              "استخدم <strong>طباعة / PDF</strong> للحصول على لوحة نظيفة دون أزرار التحكم."
            ]
          },
          {
            titre: "4. الحفظ وإعادة الاستخدام",
            points: [
              "أعطِ لوحتك اسمًا وانقر على <strong>حفظ على الحاسوب (.JSON)</strong> للحفاظ على عملك.",
              "أعد تحميل أي ملف <code>.json</code> عبر <strong>فتح لوحة (.JSON)</strong> لاستئناف لوحة موجودة أو تعديلها.",
              "الرموز مصدرها <strong>ARASAAC</strong> (المؤلف: Sergio Palao، الرخصة <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      },
      uk: {
        titre: "Pics2Mots",
        sousTitre: "Від зображення до слова, від слова до зображення",
        langueUi: "Інтерфейс:",
        tabAtelier: "Майстерня",
        tabEmploi: "Інструкція",
        propositions: "1. Пропозиції",
        aidePropositions: "Почніть пошук нижче, щоб побачити пропозиції.",
        placeholderTheme: "Напр.: числа ; lsf або lsf ; числа",
        astuceRecherche: "<strong>Перший критерій</strong> визначає пріоритет показу (напр.: <code>числа ; lsf</code> або <code>lsf ; числа</code>).",
        natAll: "Усі частини мови",
        nat3: "Дієслова (інфінітив)",
        nat2: "Іменники",
        nat4: "Прикметники",
        qte: "Кількість:",
        chercher: "Шукати",
        toutAjouter: "Додати все",
        langueCible: "Мова картки:",
        entrainementOff: "Режим тренування: ВИМК",
        entrainementOn: "Режим тренування: УВІМК",
        fixer: "Зафіксувати картку",
        deverrouiller: "Розблокувати картку",
        imprimer: "Друк / PDF",
        vider: "Очистити",
        placeholderNom: "Назва картки",
        saveOrdi: "Зберегти на комп'ютері (.JSON)",
        ouvrirOrdi: "Відкрити картку (.JSON)",
        titreImagier: "2. Моя картка",
        badgeFixe: "Зафіксовано",
        badgeTrain: "Тренування",
        imagierVide: "Ще немає жодної картки.",
        guideTitre: "Інструкція до Pics2Mots",
        guideIntro: "Тут описано, як скласти картку, скористатися пошуком і зберегти свої роботи.",
        banniereReprise: "Картку відновлено",
        repriseNouvelle: "Нова картка",
        cartesLabel: "карток",
        audioOption: "Природний голос без мережі",
        audioMedium: "Якісний голос (60 МБ)",
        audioLow: "Легкий голос для планшетів (27 МБ)",
        preparerAudio: "Підготувати звук картки",
        audioArreter: "Зупинити",
        audioChargement: "Завантаження голосу…",
        audioGenere: "звук збережено",
        audioRepli: "Природний голос недоступний: використовується голос браузера",
        audioPret: "Звук готовий",
        langueAucune: "Одна мова — без перекладу",
        baseLocaleTitre: "Локальна база — пошук без мережі",
        baseLocaleAide: "Кожен каталог завантажується один раз і зберігається на пристрої. Наступні пошуки не звертаються до ARASAAC і працюють без підключення.",
        masquer: "Приховати:",
        masqDeux: "слово й переклад",
        masqSource: "слово (робоча мова)",
        masqCible: "переклад",
        langueMots: "Мова слів:",
        harmoniserMots: "Узгодити слова",
        motsMisAJour: "слово(а) оновлено",
        motsIndisponibles: "немає відповідника цією мовою",
        guideBlocs: [
          {
            titre: "1. Пошук і наповнення картки",
            points: [
              "Введіть слово або тему мовою інтерфейсу (наприклад <code>готувати</code>, <code>числа</code>, <code>дім</code>).",
              "За бажанням відфільтруйте за частиною мови (дієслова, іменники, прикметники) і виберіть потрібну кількість.",
              "Наведіть курсор на пропозицію, щоб побачити її теги й категорії, або натисніть на неї, щоб шукати безпосередньо за тегом.",
              "Для деяких частих тем інструмент автоматично доповнює список пов'язаними картками, якщо місцевих результатів мало.",
              "Кожен мовний каталог зберігається на пристрої після першого пошуку: наступні пошуки працюють без мережі. Блок <strong>Локальна база</strong> дозволяє завантажувати, оновлювати або видаляти ці каталоги."
            ]
          },
          {
            titre: "2. Особливості складених запитів",
            points: [
              "Розділяйте кілька критеріїв крапкою з комою <code>;</code> або комою <code>,</code>.",
              "<strong>Порядок має значення:</strong> перший критерій має найбільшу вагу в рейтингу (напр.: <code>числа ; lsf</code> надає перевагу числам; <code>lsf ; числа</code> виводить наперед картки жестової мови).",
              "Критерій <code>lsf</code> окремо фільтрує піктограми жестової мови; у поєднанні зі словом він підсилює відповідники, не спорожнюючи список, коли число не має тегу <code>lsf</code>."
            ]
          },
          {
            titre: "3. Упорядкування, тренування, друк",
            points: [
              "Додавайте або видаляйте картки одним кліком у <strong>Пропозиціях</strong> чи скористайтеся <strong>Додати все</strong>.",
              "Змінюйте порядок карток перетягуванням або стрілками <code>←</code> / <code>→</code>.",
              "Виберіть мову картки, щоб показати переклад і почути вимову (<code>🔊</code>).",
              "<strong>Мова слів</strong> задає мову підписів незалежно від інтерфейсу: якщо ви шукаєте іспанською тему, якої немає у французькому каталозі, додані піктограми отримають французьке слово. Кнопка <strong>Узгодити слова</strong> з'являється, коли частина карток ще не цією мовою.",
              "Увімкніть <strong>Режим тренування</strong>, щоб розмити слово для відгадування: за допомогою <strong>Приховати</strong> виберіть слово, переклад або обидва. Клік по розмитому слову відкриває його незалежно від іншого. <strong>Зафіксувати картку</strong> запобігає випадковим змінам під час вправи.",
              "Позначте <strong>Природний голос без мережі</strong>, щоб замінити голос браузера природнішим, обчисленим на пристрої. Перший звук завантажує модель (одноразово), далі <strong>Підготувати звук картки</strong> зберігає всі слова: наступне відтворення миттєве й працює без мережі.",
              "Скористайтеся <strong>Друк / PDF</strong>, щоб отримати чисту картку без кнопок керування."
            ]
          },
          {
            titre: "4. Збереження та повторне використання",
            points: [
              "Дайте картці назву й натисніть <strong>Зберегти на комп'ютері (.JSON)</strong>, щоб зберегти роботу.",
              "Завантажте будь-який файл <code>.json</code> через <strong>Відкрити картку (.JSON)</strong>, щоб продовжити або змінити наявну картку.",
              "Піктограми походять з <strong>ARASAAC</strong> (автор: Sergio Palao, ліцензія <strong>CC BY-NC-SA</strong>)."
            ]
          }
        ]
      }
    };

    const ENRICHISSEMENT_REFERENTIEL = {
      cuisiner: { en: ["cook", "cookery", "kitchen"], es: ["cocinar", "cocina"] },
      cuisine: { en: ["kitchen", "cookery", "cook"], es: ["cocina", "cocinar"] },
      manger: { en: ["eat", "food", "meal"], es: ["comer", "comida"] },
      boire: { en: ["drink", "beverage"], es: ["beber", "bebida"] },
      ecole: { en: ["school", "classroom", "study"], es: ["escuela", "colegio", "clase"] },
      maison: { en: ["house", "home"], es: ["casa", "hogar"] },
      metier: { en: ["job", "profession", "occupation"], es: ["profesion", "oficio", "trabajo"] },
      metiers: { en: ["job", "profession", "occupation"], es: ["profesion", "oficio", "trabajo"] },
      fleur: { en: ["flower"], es: ["flor"] },
      fleurs: { en: ["flower"], es: ["flor"] },
      fruit: { en: ["fruit"], es: ["fruta"] },
      fruits: { en: ["fruit"], es: ["fruta"] }
    };

  window.Atelier.donnees = {
    TRADUCTIONS_UI: TRADUCTIONS_UI,
    ENRICHISSEMENT_REFERENTIEL: ENRICHISSEMENT_REFERENTIEL
  };
})();
