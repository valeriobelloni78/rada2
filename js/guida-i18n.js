/* =============================================================================
   RADA · guida-i18n.js — le parole della guida, nelle quattro lingue

   Sta separato da i18n.js per una ragione di misura: là ci sono le etichette
   minute dell'interfaccia, qui la prosa lunga della documentazione. Tenerle
   insieme avrebbe reso illeggibile il file che serve a ogni schermata.

   Si carica solo da guida.html, DOPO i18n.js, di cui usa il macchinario:
   il dizionario si limita ad aggiungersi a quello dell'interfaccia. Le voci
   che esistono già — i nomi dei cursori, quelli dei mood — non si riscrivono:
   arrivano da lì, così le due pagine non possono divergere.
============================================================================= */

const GUIDA = {

  it: {
    "g.title":        "Rada · Guida",
    "meta.description": "Come funziona Rada2 e come si usa: otto linee con periodi coprimi, una deriva lenta, e un'accordatura fissa su cui si può suonare.",
    "g.back":         "Ascolta Rada",

    "g.open1": "Ra<em class=\"amb\">d</em>a è uno spazio sonoro nel quale si può indugiare nei propri ricordi mentre si guarda fuori dalla finestra. In questo spazio puoi prenderti cura della tua attenzione, i tessuti sonori producono delle sensazioni tattili e le gocce che ascolti cadono in un tempo dilatato nel quale puoi chiederti “come mi sento?”. L'ascolto è un'attività da coltivare, è un territorio che ha le sue poetiche e i suoi campi di forza. Ra<em class=\"amb\">d</em>a è un'insenatura tranquilla lungo la costa di un oceano di rumore. Tra le gocce troverai dei silenzi che parlano; ascoltali.",

    "g.concept.t": "Il concetto",
    "g.concept1": "Ra<em class=\"amb\">d</em>a sviluppa il suono mentre lo ascolti.",
    "g.concept2": "Frasi composte da gocce e tessuti sonori fatti di lunghi respiri girano ciascuno col proprio periodo. Ogni fase sonora concentra le sue note in un arco, poi tace fino al giro successivo. Quei silenzi fuori fase fanno in modo che i quattro archi si incontrino ogni volta in una combinazione diversa. Sotto le quattro frasi ne girano altre quattro, coi propri periodi: suoni tenuti, che si aprono e si dissolvono lentamente. Queste linee di suoni e le loro sovrapposizioni compongono un ambiente sonoro sempre differente.",
    "g.concept3": "Questa è l'idea alla base di “Music for Airports” di <em class=\"amb\">Brian Eno</em> e questo progetto è un tributo al suo lavoro.",

    "g.flow.t":     "Lo scorrere dei tempi",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 ore",
    "g.flow1": "Perché la combinazione resti imprevedibile, i periodi devono essere <i>coprimi</i> a due a due: presi a coppie, non devono avere alcun divisore in comune.",
    "g.flow2": "Se due frasi durassero ad esempio sei e nove secondi condividerebbero il tre come divisore, e tornerebbero a coincidere ogni diciotto secondi. L'orecchio sentirebbe subito questa ripetizione e il collage collasserebbe in un motivo riconoscibile. Con sette, undici, tredici e diciassette — primi fra loro — la combinazione completa si ripete solo dopo 17.017 secondi, quasi cinque ore.",

    "g.der.t":     "La deriva",
    "g.der.badge": "√2 · √3 · √5 · √7 · √11",
    "g.der1": "La deriva armonica: il campo delle altezze delle note che vengono scelte si sposta sul circolo delle <em class=\"amb\">quinte</em> ogni due minuti e mezzo esatti, e fra una collezione e la successiva cambia una nota su cinque — uno slittamento lieve per l'orecchio, un passaggio tenue fra due collezioni consonanti.",
    "g.der2": "Questo rende il passaggio impercettibile: te ne accorgi dopo, come della luce che cambia in una stanza. I tempi del ricambio, come le velocità della deriva, stanno in rapporti <i>irrazionali</i>: è la stessa idea dei periodi coprimi, salita di un piano, e garantisce che il pezzo non ripassi mai esattamente dove è già stato.",
    "g.der3": "La riga arancione sopra il reticolo dice quanti passaggi di quinta sono stati fatti e, soprattutto, <em>in che tonalità sei adesso</em>. In pausa la deriva aspetta — alla ripresa il pezzo riparte da dov'era.",
    "g.der4": "Il baricentro è invece il movimento continuo: le altezze restano ferme, a scorrere piano è il punto attorno a cui vengono pescate. È quello che senti come una musica che sale e scende senza che si possa indicare il momento. Lo rappresenta l'arco esterno in alto, che oscilla fra destra e sinistra; la stessa oscillazione si legge anche nei quindici minuti che scorrono sulla linea orizzontale più in basso.",


    "g.ret.t": "Il reticolo",
    "g.ret1": "Le otto linee sono anelli concentrici di un solo strumento: le frasi all'interno, i tessuti all'esterno, un centro solo. Le gocce sono tacche che attraversano l'anello, e la loro <em>lunghezza è il registro</em> — corta grave, lunga acuta: il profilo melodico di ogni idea si legge a colpo d'occhio. I tessuti sono archi, perché durano; un punto <em class=\"amb\">arancione</em> percorre ogni anello, ed è la fase che stai ascoltando.",
    "g.ret2": "Sul bordo sono indicate le dodici tacche del circolo delle quinte, con la posizione corrente marcata in arancione, e un arco pesante che rolla lentissimo con il baricentro — a destra il pezzo sta alto, a sinistra basso. È il segno più lento della pagina.",
    "g.ret.centro": "Al centro, dove le otto linee si incontrano, ci sono due segni concentrici: il punto lampeggia a ogni goccia, l'anello che lo circonda quando un tessuto si apre. Sono i due attacchi dello strumento, e da lì si sente arrivare tutto senza guardare altrove.",
    "g.ret.misure": "Ai piedi del reticolo due archi dicono quanto è largo il ventaglio delle altezze di ciascuna classe: le gocce a destra in <em class=\"amb\">arancione</em>, i tessuti a sinistra in nero. Si aprono come forbici attorno alla diagonale del proprio quadrante, allargandosi nei due versi insieme quando muovi il cursore dell'ampiezza — o quando lo muovono per te la deriva e la stagione.",
    "g.ret3": "Il reticolo si guarda e basta: tutti i comandi stanno nelle due colonne di righe accanto, dallo stesso lato delle loro etichette dentro il disegno.",

    "g.lbl.gestures": "I comandi di linea",
    "g.gest1.k": "La scala della durata",
    "g.gest1": "Ogni linea ha la sua riga accanto al reticolo, e la scala ne cambia la durata: fra 3 e 30 secondi per le frasi, fra 7 e 60 per i tessuti. La nuova durata entra in vigore al giro successivo, mai a metà di uno in corso.",
    "g.gest2.k": "Il quadratino",
    "g.gest2": "Silenzia quella linea, o la riattiva: pieno suona, vuoto tace. L'anello impallidisce ma continua a girare in silenzio: quando la riaccendi è già dove sarebbe stata, non riparte da capo.",
    "g.gest3.k": "↻",
    "g.gest3": "Genera una nuova idea musicale per quella linea soltanto: altre note, altro numero di eventi, altra posizione sull'anello.",
    "g.gest4.k": "Barra spaziatrice",
    "g.gest4": "Avvia e ferma tutto. Ogni classe ha però anche il suo segno, a destra sotto le proprie scale di durata, che governa solo la propria metà: quadro arancione e «Pausa» mentre suona, quadro nero e «Avvia» quando tace. Alla ripresa il collage riparte esattamente da dov'era — e anche la deriva.",

    "g.lbl.faders": "I cinque cursori per le frasi",
    "g.f1": "Modifica quanto si allarga il ventaglio delle altezze. A zero tutte le gocce cadono sulla stessa nota centrale; al massimo l'idea si distende sulle quattro ottave della scala.",
    "g.f2": "Da vetroso a <em class=\"amb\">morbido</em>. Più calore significa meno armoniche acute e una coda più lunga: il decadimento passa da poco meno di due secondi a quasi cinque.",
    "g.f3": "Modifica quanta parte del suono passa per il riverbero. Al massimo le gocce restano sospese a lungo dopo aver smesso di suonare.",
    "g.f4": "Modifica il numero <em>massimo</em> di gocce che una nuova idea può contenere. Ogni rigenerazione pesca fra una goccia e questo limite.",
    "g.f5": "Modifica quanta parte del giro è occupata dalle note. Al 30% le gocce stanno nel primo terzo e tutto il resto è silenzio; al massimo si distribuiscono quasi su tutto il giro, e lo sfasamento si fa meno percepibile.",

    "g.modo.t":  "Il modo del materiale",
    "g.modo1":   "Sotto le scale di durata di ogni classe ci sono due segni gemelli, agli estremi della riga: a destra l'avvio, a sinistra la modalità.",
    "g.modo2":   "In <em class=\"amb\">deriva</em>, col quadro arancione, le idee si rinnovano: una goccia per volta fra una modulazione e l'altra, e da capo a ogni cambio di tonalità.",
    "g.modo3":   "In <em>ancora</em>, col quadro nero, le idee restano quelle dello stato d'animo selezionato, e non si muovono più. Tutto il resto continua: il baricentro sale e scende, la tonalità cambia, le fasi si sfasano.",
    "g.lbl.moods": "Gli otto stati d'animo per le frasi",
    "g.moods.intro": "Ogni stato d'animo è una configurazione completa: timbro <em>e</em> configurazione temporale. Cambiarlo rigenera anche le quattro idee. Il tempo indicato è quello di riallineamento.",
    "g.m.sereno":     "L'<em class=\"amb\">equilibrio</em> di partenza: registro medio, coda ampia, poche gocce ben distanziate.",
    "g.m.pioggia":    "Periodi brevi e densità alta: le quattro frasi si incrociano di continuo.",
    "g.m.vespro":     "Periodi lunghi, timbro caldissimo, pochissime note. Il più rarefatto.",
    "g.m.carillon":   "Registro largo e timbro chiaro, con gocce sparse su tutte le ottave.",
    "g.m.arcipelago": "Isole di suono molto distanti fra loro: massimo tre gocce per idea, riverbero esteso, zone attive molto strette.",
    "g.m.collina":    "<em class=\"amb\">Caldo</em> e raccolto, con una zona attiva ampia che dà un andamento ondulato e continuo.",
    "g.m.finestra":   "Timbro netto e freddo, coda corta: il più asciutto e definito degli otto.",
    "g.m.nuvola":     "Densità massima, riverbero quasi al limite e timbro vetroso: tante gocce dure dentro una coda che ne diluisce i contorni.",
    "g.mt.sereno": "4,7 ore",  "g.mt.pioggia": "58 minuti", "g.mt.vespro": "2,5 giorni", "g.mt.carillon": "4,3 ore",
    "g.mt.arcipelago": "1,3 giorni", "g.mt.collina": "14,8 ore", "g.mt.finestra": "20,1 ore", "g.mt.nuvola": "8,7 ore",

    "g.hour.t": "L'ora del giorno e la stagione dell'anno",
    "g.hour1": "Ra<em class=\"amb\">d</em>a legge l'orologio del sistema e inclina di conseguenza il registro, il calore e lo spazio: alle 23 suona più cupa e riverberata che a mezzogiorno.",
    "g.hour2": "Le palette sono sei: <em>alba</em>, <em>mattino</em>, <em>pomeriggio</em>, <em>tramonto</em>, <em>sera</em> e <em>notturna</em>. La riga di stato della classe dice sempre quale è in vigore.",
    "g.hour3": "Ai tessuti parla invece la stagione: l'autunno raccoglie appena il registro e allunga il respiro; l'inverno lo raccoglie molto di più e lo rallenta ancora; la primavera lo riapre e ravviva il battito; l'estate lo allarga più di tutte e lo fa battere più in fretta.",

    "g.strip.t": "La fascia temporale",
    "g.strip1": "Sotto il reticolo ci sono tre letture. La prima contiene gli ultimi trenta secondi delle quattro frasi, una tacca per goccia: è il modo più diretto per vedere lo sfasamento reale.",
    "g.strip1b": "La seconda non scorre affatto: quattro file ferme di puntini, una per tessuto. I puntini <em class=\"amb\">accesi</em> dicono quanto è avanzata ogni tenuta in corso. L'arancione tocca a una sola in tutta la pagina — l'ultima entrata fra tutt'e quattro le linee — e le altre restano nere, come sugli anelli. Le corsie delle gocce ricordano.",
    "g.strip2": "Puoi guardarla come uno <em class=\"amb\">spartito</em> in movimento, o un sovrapporsi di strati sonori che scorrono con viscosità differenti.",
    "g.strip3": "La terza contiene gli ultimi quindici minuti, ed è un istogramma: ogni colonnina è un'altezza del baricentro, da zero a quattro puntini sopra l'asse se il pezzo sta alto, altrettanti sotto se sta basso. Una colonnina ogni quindici secondi circa. Quella in cui cade un passaggio di quinta è <em class=\"amb\">arancione</em>.",

    "g.name.t": "Il nome",
    "g.name1": "Una <em>rada</em> è il tratto di mare riparato dove le navi sostano al riparo dai venti e dalle onde.",
    "g.sync.t": "Un dettaglio sulla sincronia",
    "g.name.note": "Un dettaglio che si nota solo guardando: quando due gocce di frasi diverse suonano a meno di due decimi di secondo l'una dall'altra, un sottile filo <em class=\"amb\">rosso</em> le unisce per un istante, attraverso gli anelli.",

    "g.foot.code": "Il codice su GitHub",
    "g.tes.t": "I tessuti",
    "g.tes1": "Sotto le quattro frasi ce ne sono altre quattro, e non fanno la stessa cosa. Le gocce accadono: un attacco, una coda, e la nota è già passata. I tessuti invece durano — si aprono lentamente, restano aperti anche mezzo minuto, si dissolvono. Sovrapponendosi fra loro e alle gocce formano le tessiture.",
    "g.tes2": "Anche qui i periodi sono coprimi a due a due, e lo sono anche con quelli delle frasi.",
    "g.tes3": "Ogni classe ha il suo pulsante: si possono lasciare i tessuti e mettere in pausa le frasi, o il contrario. La barra spaziatrice invece vale per entrambe.",
    "g.lbl.tfaders": "I cinque cursori dei tessuti",
    "g.tf1": "Quanto si allarga il ventaglio delle altezze, misurato in ottave. A zero tutti i tessuti cadono sulla stessa nota; al massimo si distendono su quattro ottave.",
    "g.tf2": "I secondi che un tessuto impiega a emergere. Nulla attacca, tutto <em class=\"amb\">affiora</em>.",
    "g.tf3": "I secondi che impiega a sparire. Insieme all'affioramento decide quanta parte del tessuto è movimento e quanta è stasi.",
    "g.tf4": "Quanti tessuti restano aperti insieme, in media, su ciascuna linea. Sotto uno restano dei silenzi; sopra due la trama non si interrompe mai.",
    "g.tf5": "Ogni tessuto è fatto di due <em class=\"amb\">sinusoidi</em> appena scordate, e la loro differenza in hertz è la pulsazione che si sente: a mezzo hertz il suono si gonfia e si sgonfia una volta ogni due secondi, a due hertz trema.",
    "g.lbl.tmoods": "Gli otto tessuti",
    "g.tmoods.intro": "Come per le frasi, ogni stato d'animo è una configurazione completa.",
    "g.tm.velo": "L'<em class=\"amb\">equilibrio</em> di partenza: registro medio, sovrapposizione appena sopra l'uno.",
    "g.tm.fondale": "Uno strato solo per giro, lunghissimo e grave. Il più immobile degli otto.",
    "g.tm.lino": "Tre per giro molto sovrapposti: la trama non si interrompe mai.",
    "g.tm.respiro": "Registro largo e sovrapposizione sotto l'uno: fra un tessuto e l'altro resta del silenzio.",
    "g.tm.bruma": "Il più acuto e il più tenue, quasi tre ottave di estensione.",
    "g.tm.tenda": "Meno di un'ottava, tutta in basso, e il livello più alto degli otto.",
    "g.tm.seta": "Battito quasi doppio degli altri e affioramento rapido: il più inquieto.",
    "g.tm.vela": "Un tessuto solo per giro, che può durare fino a cinquanta secondi.",
    "g.tmt.velo": "1,3 giorni",
    "g.tmt.fondale": "23,4 giorni",
    "g.tmt.lino": "14,6 ore",
    "g.tmt.respiro": "13,6 giorni",
    "g.tmt.bruma": "26,8 giorni",
    "g.tmt.tenda": "11,1 giorni",
    "g.tmt.seta": "14,5 ore",
    "g.tmt.vela": "36,6 giorni",
    "g.credits": "Ra<em class=\"amb\">d</em>a è un progetto ideato e sviluppato da Valerio Belloni",
  },

  fr: {
    "g.title":        "Rada · Guide",
    "meta.description": "Comment fonctionne Rada2 et comment s'en servir~: huit lignes aux périodes premières entre elles, une dérive lente, et un accord fixe sur lequel on peut jouer.",
    "g.back":         "Écouter Rada",

    "g.open1": "Ra<em class=\"amb\">d</em>a est un espace sonore où l'on peut s'attarder dans ses souvenirs en regardant par la fenêtre. Dans cet espace tu peux prendre soin de ton attention~: les tissus sonores produisent des sensations tactiles et les gouttes que tu écoutes tombent dans un temps dilaté où tu peux te demander «~comment est-ce que je me sens~?~». L'écoute est une pratique à cultiver, un territoire qui a ses poétiques et ses champs de force. Ra<em class=\"amb\">d</em>a est une crique tranquille sur la côte d'un océan de bruit. Entre les gouttes tu trouveras des silences qui parlent~; écoute-les.",

    "g.concept.t": "Le concept",
    "g.concept1": "Ra<em class=\"amb\">d</em>a développe le son pendant que tu l'écoutes.",
    "g.concept2": "Des phrases faites de gouttes et des tissus sonores faits de longues respirations tournent chacun avec sa propre période. Chaque phase sonore concentre ses notes dans un arc, puis se tait jusqu'au tour suivant. Ces silences déphasés font que les quatre arcs se rencontrent chaque fois dans une combinaison différente. Sous les quatre phrases en tournent quatre autres, avec leurs propres périodes~: des sons tenus, qui s'ouvrent et se dissolvent lentement. Ces lignes de sons et leurs superpositions composent un environnement sonore toujours différent.",
    "g.concept3": "C'est l'idée à la base de «~Music for Airports~» de <em class=\"amb\">Brian Eno</em>, et ce projet est un hommage à son travail.",

    "g.flow.t":     "L'écoulement des temps",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4,7 heures",
    "g.flow1": "Pour que la combinaison reste imprévisible, les périodes doivent être <i>premières entre elles</i> deux à deux~: prises par paires, elles ne doivent avoir aucun diviseur commun.",
    "g.flow2": "Si deux phrases duraient par exemple six et neuf secondes, elles partageraient le trois comme diviseur et reviendraient à coïncider toutes les dix-huit secondes. L'oreille entendrait aussitôt cette répétition et le collage s'effondrerait en un motif reconnaissable. Avec sept, onze, treize et dix-sept — premiers entre eux — la combinaison complète ne se répète qu'après 17 017 secondes, presque cinq heures.",

    "g.der.t":     "La dérive",
    "g.der.badge": "√2 · √3 · √5 · √7 · √11",
    "g.der1": "La dérive harmonique~: le champ des hauteurs où les notes sont puisées se déplace sur le cycle des <em class=\"amb\">quintes</em> toutes les deux minutes et demie exactement, et d'une collection à la suivante une seule note sur cinq change — un glissement léger pour l'oreille, un passage ténu entre deux collections consonantes.",
    "g.der2": "C'est ce qui rend le passage imperceptible~: on s'en aperçoit après coup, comme de la lumière qui change dans une pièce. Les temps du renouvellement, comme les vitesses de la dérive, sont dans des rapports <i>irrationnels</i>~: c'est la même idée que les périodes premières entre elles, montée d'un étage, et elle garantit que la pièce ne repasse jamais exactement là où elle est déjà passée.",
    "g.der3": "La ligne orange au-dessus du réticule dit combien de passages de quinte ont eu lieu et, surtout, <em>dans quelle tonalité tu te trouves</em>. En pause la dérive attend — à la reprise la pièce repart d'où elle était.",
    "g.der4": "Le barycentre est en revanche le mouvement continu~: les hauteurs restent fixes, ce qui glisse lentement c'est le point autour duquel on les puise. C'est ce que tu entends comme une musique qui monte et descend sans qu'on puisse en désigner l'instant. C'est l'arc extérieur, en haut, qui le représente en oscillant de droite à gauche~; la même oscillation se lit aussi dans les quinze minutes qui défilent sur la ligne horizontale, tout en bas.",


    "g.ret.t": "Le réticule",
    "g.ret1": "Les huit lignes sont les anneaux concentriques d'un seul instrument~: les phrases à l'intérieur, les tissus à l'extérieur, un seul centre. Les gouttes sont des encoches qui traversent l'anneau, et leur <em>longueur est le registre</em> — courte grave, longue aiguë~: le profil mélodique de chaque idée se lit d'un coup d'œil. Les tissus sont des arcs, parce qu'ils durent~; un point <em class=\"amb\">orange</em> parcourt chaque anneau, et c'est la phase que tu écoutes.",
    "g.ret2": "Sur le bord sont marquées les douze encoches du cycle des quintes, la position courante signalée en orange, et un arc épais qui roule très lentement avec le barycentre — à droite la pièce est haute, à gauche basse. C'est le signe le plus lent de la page.",
    "g.ret.centro": "Au centre, là où les huit lignes se rencontrent, il y a deux signes concentriques~: le point clignote à chaque goutte, l'anneau qui l'entoure quand un tissu s'ouvre. Ce sont les deux attaques de l'instrument, et de là on entend tout arriver sans regarder ailleurs.",
    "g.ret.misure": "Au pied du réticule, deux arcs disent la largeur de l'éventail des hauteurs de chaque classe~: les gouttes à droite en <em class=\"amb\">orange</em>, les tissus à gauche en noir. Ils s'ouvrent comme des ciseaux autour de la diagonale de leur quadrant, s'élargissant des deux côtés à la fois quand tu bouges le curseur de l'étendue — ou quand la dérive et la saison le bougent pour toi.",
    "g.ret3": "Le réticule se regarde, rien de plus~: toutes les commandes sont dans les deux colonnes de rangées à côté, du même côté que leurs étiquettes dans le dessin.",

    "g.lbl.gestures": "Les commandes de ligne",
    "g.gest1.k": "L'échelle de la durée",
    "g.gest1": "Chaque ligne a sa rangée à côté du réticule, et l'échelle en change la durée~: entre 3 et 30 secondes pour les phrases, entre 7 et 60 pour les tissus. La nouvelle durée prend effet au tour suivant, jamais au milieu d'un tour en cours.",
    "g.gest2.k": "Le petit carré",
    "g.gest2": "Met cette ligne en silence, ou la réveille~: plein elle sonne, vide elle se tait. L'anneau pâlit mais continue de tourner en silence~: quand tu la rallumes, elle est déjà là où elle serait arrivée, elle ne repart pas du début.",
    "g.gest3.k": "↻",
    "g.gest3": "Engendre une nouvelle idée musicale pour cette ligne seulement~: d'autres notes, un autre nombre d'événements, une autre position sur l'anneau.",
    "g.gest4.k": "Barre d'espace",
    "g.gest4": "Lance et arrête tout. Chaque classe a pourtant aussi son signe, à droite sous ses propres échelles de durée, qui ne gouverne que sa moitié~: carré orange et «~Pause~» tant qu'elle sonne, carré noir et «~Lancer~» quand elle se tait. À la reprise, le collage repart exactement d'où il était — et la dérive aussi.",

    "g.lbl.faders": "Les cinq curseurs des phrases",
    "g.f1": "Modifie l'ouverture de l'éventail des hauteurs. À zéro toutes les gouttes tombent sur la même note centrale~; au maximum l'idée s'étend sur les quatre octaves de la gamme.",
    "g.f2": "Du vitreux au <em class=\"amb\">moelleux</em>. Plus de chaleur signifie moins d'harmoniques aiguës et une traîne plus longue~: la décroissance passe d'un peu moins de deux secondes à presque cinq.",
    "g.f3": "Modifie la part du son qui passe par la réverbération. Au maximum les gouttes restent longtemps suspendues après avoir cessé de sonner.",
    "g.f4": "Modifie le nombre <em>maximal</em> de gouttes qu'une nouvelle idée peut contenir. Chaque régénération tire entre une goutte et cette limite.",
    "g.f5": "Modifie la part du tour occupée par les notes. À 30~% les gouttes tiennent dans le premier tiers et tout le reste est silence~; au maximum elles se répartissent sur presque tout le tour, et le déphasage devient moins perceptible.",

    "g.modo.t":  "Le mode de la matière",
    "g.modo1":   "Sous les échelles de durée de chaque classe il y a deux signes jumeaux, aux extrémités de la ligne~: à droite le lancement, à gauche le mode.",
    "g.modo2":   "En <em class=\"amb\">dérive</em>, le carré orange, les idées se renouvellent~: une goutte à la fois entre deux modulations, et entièrement à chaque changement de tonalité.",
    "g.modo3":   "En <em>ancre</em>, le carré noir, les idées restent celles de l'humeur sélectionnée et ne bougent plus. Tout le reste continue~: le barycentre monte et descend, la tonalité change, les phases se déphasent.",
    "g.lbl.moods": "Les huit humeurs des phrases",
    "g.moods.intro": "Chaque humeur est une configuration complète~: le timbre <em>et</em> la disposition temporelle. En changer régénère aussi les quatre idées. Le temps indiqué est celui du réalignement.",
    "g.m.sereno":     "L'<em class=\"amb\">équilibre</em> de départ~: registre moyen, traîne ample, peu de gouttes bien espacées.",
    "g.m.pioggia":    "Périodes courtes et densité élevée~: les quatre phrases se croisent sans cesse.",
    "g.m.vespro":     "Périodes longues, timbre très chaud, très peu de notes. Le plus raréfié.",
    "g.m.carillon":   "Registre large et timbre clair, avec des gouttes dispersées sur toutes les octaves.",
    "g.m.arcipelago": "Des îles de son très éloignées les unes des autres~: trois gouttes au maximum par idée, réverbération étendue, zones actives très étroites.",
    "g.m.collina":    "<em class=\"amb\">Chaud</em> et recueilli, avec une zone active ample qui donne une allure ondulée et continue.",
    "g.m.finestra":   "Timbre net et froid, traîne courte~: le plus sec et le plus défini des huit.",
    "g.m.nuvola":     "Densité maximale, réverbération presque à la limite et timbre vitreux~: beaucoup de gouttes dures dans une traîne qui en dilue les contours.",
    "g.mt.sereno": "4,7 heures", "g.mt.pioggia": "58 minutes", "g.mt.vespro": "2,5 jours", "g.mt.carillon": "4,3 heures",
    "g.mt.arcipelago": "1,3 jours", "g.mt.collina": "14,8 heures", "g.mt.finestra": "20,1 heures", "g.mt.nuvola": "8,7 heures",

    "g.hour.t": "L'heure du jour et la saison de l'année",
    "g.hour1": "Ra<em class=\"amb\">d</em>a lit l'horloge du système et incline en conséquence le registre, la chaleur et l'espace~: à 23~h elle sonne plus sombre et plus réverbérée qu'à midi.",
    "g.hour2": "Les palettes sont six~: <em>aube</em>, <em>matin</em>, <em>après-midi</em>, <em>crépuscule</em>, <em>soir</em> et <em>nuit</em>. La ligne d'état de la classe indique toujours celle qui est en vigueur.",
    "g.hour3": "Aux tissus parle la saison~: l'automne resserre à peine le registre et allonge la respiration~; l'hiver le resserre bien davantage et la ralentit encore~; le printemps le rouvre et ravive le battement~; l'été l'élargit plus que toutes et le fait battre plus vite.",

    "g.strip.t": "La bande temporelle",
    "g.strip1": "Sous le réticule il y a trois lectures. La première contient les trente dernières secondes des quatre phrases, une encoche par goutte~: c'est la façon la plus directe de voir le déphasage réel.",
    "g.strip1b": "La deuxième ne défile pas du tout~: quatre rangées immobiles de points, une par tissu. Les points <em class=\"amb\">allumés</em> disent où en est chaque tenue en cours. L'orange ne revient qu'à une seule dans toute la page — la dernière entrée parmi les quatre lignes — et les autres restent noires, comme sur les anneaux. Les couloirs des gouttes, eux, se souviennent.",
    "g.strip2": "Tu peux la regarder comme une <em class=\"amb\">partition</em> en mouvement, ou comme des couches sonores qui s'écoulent avec des viscosités différentes.",
    "g.strip3": "La troisième contient les quinze dernières minutes, et c'est un histogramme~: chaque colonne est une hauteur du barycentre, de zéro à quatre points au-dessus de l'axe si la pièce est haute, autant en dessous si elle est basse. Une colonne toutes les quinze secondes environ. Celle où tombe un passage de quinte est <em class=\"amb\">orange</em>.",

    "g.name.t": "Le nom",
    "g.name1": "Une <em>rade</em> est cette portion de mer abritée où les navires mouillent, à l'abri des vents et des vagues.",
    "g.sync.t": "Un détail sur la synchronie",
    "g.name.note": "Un détail qu'on ne remarque qu'en regardant~: quand deux gouttes de phrases différentes sonnent à moins de deux dixièmes de seconde l'une de l'autre, un fin fil <em class=\"amb\">rouge</em> les relie un instant, à travers les anneaux.",

    "g.foot.code": "Le code sur GitHub",
    "g.tes.t": "Les tissus",
    "g.tes1": "Sous les quatre phrases il y en a quatre autres, et elles ne font pas la même chose. Les gouttes arrivent~: une attaque, une traîne, et la note est déjà passée. Les tissus durent — ils s'ouvrent lentement, restent ouverts jusqu'à une demi-minute, se dissolvent. En se superposant entre eux et aux gouttes ils forment les textures.",
    "g.tes2": "Ici aussi les périodes sont premières entre elles deux à deux, et elles le sont aussi avec celles des phrases.",
    "g.tes3": "Chaque classe a son bouton~: on peut laisser les tissus et mettre les phrases en pause, ou l'inverse. La barre d'espace, elle, vaut pour les deux.",
    "g.lbl.tfaders": "Les cinq curseurs des tissus",
    "g.tf1": "L'ouverture de l'éventail des hauteurs, mesurée en octaves. À zéro tous les tissus tombent sur la même note~; au maximum ils s'étendent sur quatre octaves.",
    "g.tf2": "Les secondes qu'un tissu met à émerger. Rien n'attaque, tout <em class=\"amb\">affleure</em>.",
    "g.tf3": "Les secondes qu'il met à disparaître. Avec l'émergence, décide quelle part du tissu est mouvement et quelle part est immobilité.",
    "g.tf4": "Combien de tissus restent ouverts en même temps, en moyenne, sur chaque ligne. En dessous de un il reste des silences~; au-dessus de deux la trame ne s'interrompt jamais.",
    "g.tf5": "Chaque tissu est fait de deux <em class=\"amb\">sinusoïdes</em> à peine désaccordées, et leur écart en hertz est la pulsation que l'on entend~: à un demi-hertz le son enfle et retombe une fois toutes les deux secondes, à deux hertz il tremble.",
    "g.lbl.tmoods": "Les huit tissus",
    "g.tmoods.intro": "Comme pour les phrases, chaque humeur est une configuration complète.",
    "g.tm.velo": "L'<em class=\"amb\">équilibre</em> de départ~: registre moyen, superposition à peine au-dessus de un.",
    "g.tm.fondale": "Une seule couche par tour, très longue et grave. La plus immobile des huit.",
    "g.tm.lino": "Trois par tour très superposés~: la trame ne s'interrompt jamais.",
    "g.tm.respiro": "Registre large et superposition sous un~: entre un tissu et l'autre il reste du silence.",
    "g.tm.bruma": "Le plus aigu et le plus ténu, près de trois octaves d'étendue.",
    "g.tm.tenda": "Moins d'une octave, tout en bas, et le niveau le plus haut des huit.",
    "g.tm.seta": "Battement presque double des autres et émergence rapide~: le plus inquiet.",
    "g.tm.vela": "Un seul tissu par tour, qui peut durer jusqu'à cinquante secondes.",
    "g.tmt.velo": "1,3 jours",
    "g.tmt.fondale": "23,4 jours",
    "g.tmt.lino": "14,6 heures",
    "g.tmt.respiro": "13,6 jours",
    "g.tmt.bruma": "26,8 jours",
    "g.tmt.tenda": "11,1 jours",
    "g.tmt.seta": "14,5 heures",
    "g.tmt.vela": "36,6 jours",
    "g.credits": "Ra<em class=\"amb\">d</em>a est un projet conçu et développé par Valerio Belloni",
  },

  en: {
    "g.title":        "Rada · Guide",
    "meta.description": "How Rada2 works and how to use it: eight lines with coprime periods, a slow drift, and fixed tuning you can play along with.",
    "g.back":         "Listen to Rada",

    "g.open1": "Ra<em class=\"amb\">d</em>a is a sound space where you can linger among your own memories while looking out of the window. In this space you can take care of your attention: the sonic weaves produce tactile sensations and the drops you hear fall through a dilated time in which you can ask yourself, “how do I feel?”. Listening is a practice to be cultivated, a territory with its own poetics and its own force fields. Ra<em class=\"amb\">d</em>a is a quiet cove on the shore of an ocean of noise. Between the drops you will find silences that speak; listen to them.",

    "g.concept.t": "The concept",
    "g.concept1": "Ra<em class=\"amb\">d</em>a unfolds the sound while you listen to it.",
    "g.concept2": "Phrases made of drops, and sonic weaves made of long breaths, each turn with their own period. Each phase of sound gathers its notes into an arc, then falls silent until the next turn. Those out-of-phase silences make the four arcs meet in a different combination every time. Below the four phrases four more turn, with periods of their own: sustained tones, which open and dissolve slowly. These lines of sound, and the way they overlap, compose a sonic environment that is never the same.",
    "g.concept3": "This is the idea behind <em class=\"amb\">Brian Eno</em>'s “Music for Airports”, and this project is a tribute to his work.",

    "g.flow.t":     "The flow of times",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7 hours",
    "g.flow1": "For the combination to stay unpredictable, the periods must be pairwise <i>coprime</i>: taken two at a time, they must share no common divisor.",
    "g.flow2": "If two phrases lasted, say, six and nine seconds, they would share three as a divisor and would coincide again every eighteen seconds. The ear would catch that repetition at once and the collage would collapse into a recognisable pattern. With seven, eleven, thirteen and seventeen — coprime — the full combination returns only after 17,017 seconds, almost five hours.",

    "g.der.t":     "The drift",
    "g.der.badge": "√2 · √3 · √5 · √7 · √11",
    "g.der1": "The harmonic drift: the field of pitches the notes are drawn from moves around the circle of <em class=\"amb\">fifths</em> every two and a half minutes exactly, and from one collection to the next a single note in five changes — a slight slippage for the ear, a faint passage between two consonant collections.",
    "g.der2": "That is what makes the passage imperceptible: you notice it afterwards, like light changing in a room. The times of the renewal, like the speeds of the drift, stand in <i>irrational</i> ratios: the same idea as the coprime periods, raised one storey, and it guarantees that the piece never passes again exactly where it has already been.",
    "g.der3": "The amber line above the reticle says how many steps of a fifth have been taken and, above all, <em>what key you are in now</em>. Paused, the drift waits — on resuming, the piece picks up where it was.",
    "g.der4": "The centre of gravity is the continuous movement instead: the pitches stay put, what slides slowly is the point they are drawn around. It is what you hear as music rising and falling with no moment you could point to. The outer arc at the top stands for it, swinging between right and left; the same swing can be read in the fifteen minutes scrolling along the horizontal line at the foot of the page.",


    "g.ret.t": "The reticle",
    "g.ret1": "The eight lines are concentric rings of a single instrument: the phrases inside, the weaves outside, one centre. Drops are notches across the ring, and their <em>length is the register</em> — short low, long high: the melodic profile of each idea can be read at a glance. Weaves are arcs, because they last; an <em class=\"amb\">amber</em> dot travels each ring, and it is the phase you are listening to.",
    "g.ret2": "Along the rim are the twelve notches of the circle of fifths, the current position marked in amber, and a heavy arc rolling very slowly with the centre of gravity — to the right the piece sits high, to the left low. It is the slowest sign on the page.",
    "g.ret.centro": "At the centre, where the eight lines meet, there are two concentric marks: the dot blinks with every drop, the ring around it whenever a weave opens. They are the instrument's two attacks, and from there you feel everything arrive without looking anywhere else.",
    "g.ret.misure": "At the foot of the reticle two arcs say how wide each class's spread of pitches is: the drops to the right in <em class=\"amb\">amber</em>, the weaves to the left in black. They open like scissors around the diagonal of their own quadrant, widening both ways at once when you move the spread fader — or when the drift and the season move it for you.",
    "g.ret3": "The reticle is for looking only: every control lives in the two columns of rows beside it, on the same side as its labels inside the drawing.",

    "g.lbl.gestures": "The line controls",
    "g.gest1.k": "The length scale",
    "g.gest1": "Each line has its row beside the reticle, and the scale changes its length: between 3 and 30 seconds for the phrases, between 7 and 60 for the weaves. The new length takes effect on the next turn, never in the middle of one already running.",
    "g.gest2.k": "The little square",
    "g.gest2": "Mutes that line, or brings it back: filled it sounds, empty it is silent. The ring fades but keeps turning in silence: when you switch it on again it is already where it would have been, it does not start over.",
    "g.gest3.k": "↻",
    "g.gest3": "Generates a new musical idea for that line alone: other notes, another number of events, another position on the ring.",
    "g.gest4.k": "Spacebar",
    "g.gest4": "Starts and stops everything. Each class also has its own sign, to the right under its own length scales, governing only its half: an amber square and «Pause» while it sounds, a black square and «Play» when it is silent. On resuming, the collage picks up exactly where it was — and so does the drift.",

    "g.lbl.faders": "The five phrase faders",
    "g.f1": "Changes how wide the fan of pitches opens. At zero every drop falls on the same central note; at maximum the idea spreads across the four octaves of the scale.",
    "g.f2": "From glassy to <em class=\"amb\">soft</em>. More warmth means fewer high harmonics and a longer tail: the decay goes from just under two seconds to almost five.",
    "g.f3": "Changes how much of the sound goes through the reverb. At maximum the drops stay suspended long after they have stopped sounding.",
    "g.f4": "Changes the <em>largest</em> number of drops a new idea may hold. Each regeneration draws somewhere between one drop and that limit.",
    "g.f5": "Changes how much of the turn the notes occupy. At 30% the drops sit in the first third and all the rest is silence; at maximum they spread across almost the whole turn, and the drift becomes harder to hear.",

    "g.modo.t":  "The material mode",
    "g.modo1":   "Under each class's length scales there are two twin signs, at either end of the row: on the right the start, on the left the mode.",
    "g.modo2":   "In <em class=\"amb\">drift</em>, with the square amber, the ideas renew: one drop at a time between modulations, and wholly at every change of key.",
    "g.modo3":   "In <em>anchor</em>, with the square black, the ideas stay as the selected mood set them and move no further. Everything else carries on: the centre of gravity rises and falls, the key changes, the phases drift apart.",
    "g.lbl.moods": "The eight phrase moods",
    "g.moods.intro": "Each mood is a complete configuration: timbre <em>and</em> temporal layout. Changing it also regenerates the four ideas. The time given is the realignment time.",
    "g.m.sereno":     "The starting <em class=\"amb\">balance</em>: middle register, ample tail, few well-spaced drops.",
    "g.m.pioggia":    "Short periods and high density: the four phrases cross one another constantly.",
    "g.m.vespro":     "Long periods, a very warm timbre, very few notes. The most rarefied of them.",
    "g.m.carillon":   "A wide register and a bright timbre, with drops scattered across every octave.",
    "g.m.arcipelago": "Islands of sound far apart from one another: at most three drops per idea, extended reverb, very narrow active zones.",
    "g.m.collina":    "<em class=\"amb\">Warm</em> and gathered, with a wide active zone that gives a rolling, continuous motion.",
    "g.m.finestra":   "A clean, cold timbre with a short tail: the driest and most defined of the eight.",
    "g.m.nuvola":     "Maximum density, reverb near its limit and a glassy timbre: many hard drops inside a tail that dissolves their edges.",
    "g.mt.sereno": "4.7 hours", "g.mt.pioggia": "58 minutes", "g.mt.vespro": "2.5 days", "g.mt.carillon": "4.3 hours",
    "g.mt.arcipelago": "1.3 days", "g.mt.collina": "14.8 hours", "g.mt.finestra": "20.1 hours", "g.mt.nuvola": "8.7 hours",

    "g.hour.t": "The hour of the day, the season of the year",
    "g.hour1": "Ra<em class=\"amb\">d</em>a reads the system clock and tilts register, warmth and space accordingly: at eleven at night it sounds darker and more reverberant than at noon.",
    "g.hour2": "There are six palettes: <em>dawn</em>, <em>morning</em>, <em>afternoon</em>, <em>dusk</em>, <em>evening</em> and <em>night</em>. The class's status line always says which one is in force.",
    "g.hour3": "The weaves listen to the season instead: autumn draws the register in a little and lengthens the breathing; winter draws it in much further and slows it more; spring opens it again and revives the beating; summer widens it most of all and makes it beat fastest.",

    "g.strip.t": "The time strip",
    "g.strip1": "Below the reticle there are three readings. The first holds the last thirty seconds of the four phrases, one notch per drop: it is the most direct way to see the real phase shift.",
    "g.strip1b": "The second does not scroll at all: four still rows of dots, one per weave. The <em class=\"amb\">lit</em> dots say how far each sounding weave has got. Only one on the whole page is amber — the last to enter across all four lines — and the others stay black, exactly as on the rings. The drop lanes, by contrast, remember.",
    "g.strip2": "You can read it as a <em class=\"amb\">score</em> in motion, or as layers of sound sliding over one another at different viscosities.",
    "g.strip3": "The third holds the last fifteen minutes, and it is a histogram: each little column is a height of the centre of gravity, from zero to four dots above the axis if the piece sits high, as many below if it sits low. One column roughly every fifteen seconds. The one a step of a fifth falls into is <em class=\"amb\">amber</em>.",

    "g.name.t": "The name",
    "g.name1": "A <em>roadstead</em> — <em>rada</em> in Italian — is the sheltered stretch of sea where ships lie at anchor, out of the wind and the waves.",
    "g.sync.t": "A detail about synchrony",
    "g.name.note": "A detail you only catch by watching: when two drops from different phrases sound less than two tenths of a second apart, a thin <em class=\"amb\">red</em> thread joins them for a moment, across the rings.",

    "g.foot.code": "The code on GitHub",
    "g.tes.t": "The weaves",
    "g.tes1": "Below the four phrases there are four more, and they do something else. Drops happen: an attack, a tail, and the note is already gone. Weaves last — they open slowly, stay open for as long as half a minute, dissolve. Layering over one another and over the drops they build the textures.",
    "g.tes2": "Here too the periods are pairwise coprime, and coprime with the phrases' periods as well.",
    "g.tes3": "Each class has its own button: you can leave the weaves running and pause the phrases, or the other way round. The spacebar governs both.",
    "g.lbl.tfaders": "The five weave faders",
    "g.tf1": "How wide the fan of pitches opens, measured in octaves. At zero every weave falls on the same note; at maximum they spread across four octaves.",
    "g.tf2": "The seconds a weave takes to emerge. Nothing attacks, everything <em class=\"amb\">surfaces</em>.",
    "g.tf3": "The seconds it takes to vanish. Together with the surfacing it decides how much of a weave is motion and how much is stillness.",
    "g.tf4": "How many weaves stay open at once, on average, on each line. Below one, silences remain; above two the fabric never breaks.",
    "g.tf5": "Each weave is two barely detuned <em class=\"amb\">sine waves</em>, and their distance in hertz is the pulsation you hear: at half a hertz the sound swells and falls once every two seconds, at two hertz it trembles.",
    "g.lbl.tmoods": "The eight weaves",
    "g.tmoods.intro": "As with the phrases, each mood is a complete configuration.",
    "g.tm.velo": "The starting <em class=\"amb\">balance</em>: middle register, overlap just above one.",
    "g.tm.fondale": "A single layer per turn, very long and low. The stillest of the eight.",
    "g.tm.lino": "Three per turn, heavily overlapped: the fabric never breaks.",
    "g.tm.respiro": "A wide register and overlap below one: between one weave and the next, some silence remains.",
    "g.tm.bruma": "The highest and the faintest, nearly three octaves of spread.",
    "g.tm.tenda": "Less than an octave, all of it low, and the highest level of the eight.",
    "g.tm.seta": "Beating almost twice as fast as the others and a quick surfacing: the most restless.",
    "g.tm.vela": "A single weave per turn, which can last up to fifty seconds.",
    "g.tmt.velo": "1.3 days",
    "g.tmt.fondale": "23.4 days",
    "g.tmt.lino": "14.6 hours",
    "g.tmt.respiro": "13.6 days",
    "g.tmt.bruma": "26.8 days",
    "g.tmt.tenda": "11.1 days",
    "g.tmt.seta": "14.5 hours",
    "g.tmt.vela": "36.6 days",
    "g.credits": "Ra<em class=\"amb\">d</em>a is a project conceived and developed by Valerio Belloni",
  },

  ja: {
    "g.title":        "Rada · 手引き",
    "meta.description": "Rada2の仕組みと使い方。互いに素な周期を持つ八つの線、ゆっくりとした漂流、そして上で弾ける固定された調律。",
    "g.back":         "Radaを聴く",

    "g.open1": "Ra<em class=\"amb\">d</em>aは、窓の外を眺めながら自分の記憶のなかに佇んでいられる音の空間です。この空間では、自分の注意を手入れすることができます。織りの響きは触れるような感覚を生み、聞こえてくる滴は引き伸ばされた時間のなかに落ちて、そのあいだに「いま自分はどう感じているだろう」と問いかけることができます。聴くことは育てていく営みであり、それ自体の詩学と力の場を持つひとつの土地です。Ra<em class=\"amb\">d</em>aは、騒音の大洋の岸辺にある、静かな入り江です。滴と滴のあいだに、語る沈黙が見つかります。それに耳を澄ませてください。",

    "g.concept.t": "発想",
    "g.concept1": "Ra<em class=\"amb\">d</em>aは、聴いているあいだに音を組み立てていきます。",
    "g.concept2": "滴でできたフレーズと、長い呼吸でできた響きの織り——そのどれもが、それぞれの周期で回ります。どの音の相も音符をひとつの弧のなかに集め、次の周回まで沈黙します。位相のずれたこれらの沈黙によって、四つの弧は毎回ちがう組み合わせで出会います。四つのフレーズの下では、さらに四つがそれぞれの周期で回っています。ゆっくりと開いてゆっくりと消えていく持続音です。これらの音の線と、その重なりあいが、いつも異なる音の環境をかたちづくります。",
    "g.concept3": "これは<em class=\"amb\">ブライアン・イーノ</em>の「Music for Airports」の根底にある考えであり、この作品はその仕事への賛辞です。",

    "g.flow.t":     "時の流れ",
    "g.flow.badge": "7 · 11 · 13 · 17 → 4.7時間",
    "g.flow1": "組み合わせが予測できないままであるためには、周期がふたつずつ<i>互いに素</i>である必要があります。どの二つを取っても、共通の約数を持たないということです。",
    "g.flow2": "たとえば二つのフレーズが六秒と九秒だったとすると、三という約数を共有し、十八秒ごとにふたたび重なります。耳はその反復をすぐに聞き取り、コラージュは見覚えのある型へと崩れてしまいます。七、十一、十三、十七であれば——互いに素なので——完全な組み合わせが戻ってくるのは17,017秒後、ほぼ五時間後です。",

    "g.der.t":     "漂流",
    "g.der.badge": "√2 · √3 · √5 · √7 · √11",
    "g.der1": "和声の漂流。音を選び取る音高の場が、<em class=\"amb\">五度</em>圏の上をきっかり二分半ごとに移り、ひとつの集合から次の集合へ変わる音は五つのうち一つだけ——耳にとってはわずかな滑り、協和する二つの集合のあいだの淡い移り変わりです。",
    "g.der2": "だからこの移り変わりは知覚されません。部屋の光が変わるときのように、あとになって気づくのです。入れ替わりの時間も、漂流の速度も、たがいに<i>無理数</i>の比になっています。互いに素な周期と同じ考えを一階ぶん上げたもので、曲がすでに通った場所をふたたび正確になぞることはない、と保証してくれます。",
    "g.der3": "レティクルの上の橙の行は、五度の移動を何回してきたか、そして何より<em>いまどの調にいるか</em>を告げます。一時停止のあいだ漂流は待っています——再開すれば、曲は止まった場所から続きます。",
    "g.der4": "いっぽう重心は連続した運動です。音高は動かず、ゆっくり滑るのはそれを汲みとる中心のほうです。どの瞬間とも指させないまま音楽が昇り降りするように聞こえるのがこれです。それを表すのが上部の外側の弧で、左右に揺れています。同じ揺れは、いちばん下の横線を流れる十五分のなかにも読み取れます。",


    "g.ret.t": "レティクル",
    "g.ret1": "八つの線は、ひとつの楽器の同心円の輪です。内側にフレーズ、外側に織り、中心はひとつ。滴は輪を横切る刻みで、その<em>長さが音域</em>です——短ければ低く、長ければ高い。それぞれの楽想の旋律の輪郭が、ひと目で読み取れます。織りは弧です。続くものだからです。そして<em class=\"amb\">オレンジ</em>の点がそれぞれの輪をめぐります。いま聴いている位相です。",
    "g.ret2": "縁には五度圏の十二の刻みが記され、現在の位置が橙で示されます。そして重い弧が重心とともにきわめてゆっくりと転がります——右にあれば曲は高く、左にあれば低い。ページでいちばん遅いしるしです。",
    "g.ret.centro": "中心、八つの線が出会うところには、同心の二つのしるしがあります。点は滴のたびに瞬き、それを囲む輪は織りが開くときに灯ります。この楽器の二つの打ち出しであり、ほかを見ずともすべてがそこに届きます。",
    "g.ret.misure": "レティクルの足もとでは、二つの弧がそれぞれのクラスの音高の広がりを告げます。右が滴で<em class=\"amb\">橙</em>、左が織りで黒。それぞれの象限の対角線を中心に、鋏のように両側へ同時に開きます。広がりのスライダーを動かすと——あるいは漂流と季節が代わりに動かすと——開き具合が変わります。",
    "g.ret3": "レティクルは見るためだけのものです。すべての操作はその脇の二列の行に置かれています——描画のなかの番号と同じ側に。",

    "g.lbl.gestures": "線の操作",
    "g.gest1.k": "長さの目盛り",
    "g.gest1": "それぞれの線にはレティクルの脇に行があり、その目盛りが長さを変えます。フレーズは3秒から30秒、織りは7秒から60秒。新しい長さが効くのは次の周回からで、進行中の周回の途中で変わることはありません。",
    "g.gest2.k": "小さな四角",
    "g.gest2": "その線を消音し、もう一度で戻します。塗りつぶしは鳴っている印、空白は沈黙の印。輪は淡くなりますが、沈黙のまま回り続けます。ふたたび鳴らすとき、それは本来あったはずの位置にすでにあり、最初からやり直すことはありません。",
    "g.gest3.k": "↻",
    "g.gest3": "その線だけに新しい楽想を生みます。ちがう音、ちがう数の出来事、輪の上のちがう位置。",
    "g.gest4.k": "スペースキー",
    "g.gest4": "すべての再生と停止。ただしどちらのクラスにも、自分の長さの目盛りの下の右側にそれぞれのしるしがあり、そちらは自分の半分だけを受け持ちます。鳴っているあいだは橙の四角と「一時停止」、黙っているときは黒の四角と「再生」。再開したときコラージュはちょうど止まった場所から続きます——漂流もまた。",

    "g.lbl.faders": "フレーズの五つのスライダー",
    "g.f1": "音の高さの広がりを変えます。ゼロではすべての滴が同じ中央の音に落ち、最大では楽想が音階の四オクターヴに広がります。",
    "g.f2": "硝子質から<em class=\"amb\">柔らかさ</em>へ。温かみが増すほど高い倍音は減り、余韻は長くなります。減衰は二秒弱から五秒近くまで変わります。",
    "g.f3": "音のどれだけが残響を通るかを変えます。最大では、滴は鳴りやんだあとも長く宙に留まります。",
    "g.f4": "新しい楽想が持ちうる滴の<em>最大</em>数を変えます。生成のたびに、一滴からこの上限までのあいだが選ばれます。",
    "g.f5": "周回のうち音符が占める割合を変えます。30%では滴は最初の三分の一に収まり、残りはすべて沈黙です。最大ではほぼ周回全体に散らばり、位相のずれは感じ取りにくくなります。",

    "g.modo.t":  "素材のモード",
    "g.modo1":   "それぞれのクラスの長さの目盛りの下には、行の両端に双子のしるしがあります。右が再生、左がモードです。",
    "g.modo2":   "<em class=\"amb\">漂流</em>では——四角は橙——楽想は作り直されます。転調と転調のあいだは一滴ずつ、調が変わるたびにまるごと。",
    "g.modo3":   "<em>錨</em>では——四角は黒——楽想は選んだ気分のままにとどまり、それ以上動きません。ほかはすべて続きます——重心は昇り降りし、調は変わり、位相はずれていきます。",
    "g.lbl.moods": "フレーズの八つの気分",
    "g.moods.intro": "どの気分も完全な設定です。音色<em>と</em>時間の配置の両方を含みます。切り替えると四つの楽想も作り直されます。示されている時間は、ふたたび同じ組み合わせに戻るまでの長さです。",
    "g.m.sereno":     "出発点の<em class=\"amb\">均衡</em>。中庸の音域、ゆたかな余韻、間をおいた少ない滴。",
    "g.m.pioggia":    "短い周期と高い密度。四つのフレーズが絶えず交差します。",
    "g.m.vespro":     "長い周期、きわめて温かい音色、ごくわずかな音。もっとも希薄。",
    "g.m.carillon":   "広い音域と明るい音色。滴はすべてのオクターヴに散らばります。",
    "g.m.arcipelago": "遠く離れあった音の島々。楽想ごとに滴は最大三つ、残響は長く、活動域はごく狭い。",
    "g.m.collina":    "<em class=\"amb\">温かく</em>、内へ向かう。広い活動域が、うねるような連続した動きを与えます。",
    "g.m.finestra":   "くっきりと冷たい音色、短い余韻。八つのなかでもっとも乾いて、輪郭のはっきりしたもの。",
    "g.m.nuvola":     "最大の密度、限界近くの残響、硝子質の音色。硬い滴が数多く、その輪郭を溶かしていく余韻のなかにあります。",
    "g.mt.sereno": "4.7時間", "g.mt.pioggia": "58分", "g.mt.vespro": "2.5日", "g.mt.carillon": "4.3時間",
    "g.mt.arcipelago": "1.3日", "g.mt.collina": "14.8時間", "g.mt.finestra": "20.1時間", "g.mt.nuvola": "8.7時間",

    "g.hour.t": "時刻と季節",
    "g.hour1": "Ra<em class=\"amb\">d</em>aはシステムの時計を読み、それに応じて音域と温かみと空間を傾けます。夜の二十三時には、正午よりも暗く、残響の深い響きになります。",
    "g.hour2": "パレットは六つあります。<em>暁</em>、<em>朝</em>、<em>昼下がり</em>、<em>夕暮れ</em>、<em>宵</em>、<em>夜半</em>。いま効いているものは、そのクラスの状態表示がつねに示しています。",
    "g.hour3": "織りに語りかけるのは季節です。秋は音域をわずかに狭め、呼吸を長くします。冬はさらに狭め、いっそうゆるめます。春はふたたび開き、うなりを活気づけます。夏はもっとも広く開き、もっとも速く打たせます。",

    "g.strip.t": "時間の帯",
    "g.strip1": "レティクルの下には三つの読み方があります。最初の帯は四つのフレーズの直近三十秒で、刻みのひとつひとつが滴です。実際の位相のずれを見る、いちばん直接的な方法です。",
    "g.strip1b": "二つめはまったく流れません。動かない四列の点、織りごとに一列です。<em class=\"amb\">灯った</em>点が、鳴っているそれぞれの織りがどこまで進んだかを告げます。橙になるのはページ全体でひとつだけ——四つの線をとおして最後に入ってきたもの——で、ほかは黒のままです。輪の上とまったく同じです。滴の帯のほうは、憶えています。",
    "g.strip2": "動く<em class=\"amb\">楽譜</em>として眺めることもできますし、それぞれ異なる粘りで流れる音の層の重なりとして見ることもできます。",
    "g.strip3": "三つめは直近十五分で、これは柱状のグラフです。ひとつひとつの小さな柱が重心の高さで、曲が高いところにあれば軸の上に、低ければ下に、〇から四つの点が並びます。柱はおよそ十五秒にひとつ。五度の移動が落ちた柱は<em class=\"amb\">橙</em>です。",

    "g.name.t": "名前",
    "g.name1": "イタリア語の<em>rada</em>とは、風と波を避けて船が停泊する、囲われた海の一帯のことです。",
    "g.sync.t": "同時性についての細部",
    "g.name.note": "見ていなければ気づかない細部があります。異なるフレーズの滴どうしが五分の一秒に満たない差で鳴るとき、細い<em class=\"amb\">赤い</em>糸が、輪をまたいで一瞬だけ両者を結びます。",

    "g.foot.code": "GitHubのコード",
    "g.tes.t": "織り",
    "g.tes1": "四つのフレーズの下に、もう四つあります。役割はちがいます。滴は出来事です——立ち上がり、余韻、そして音はもう過ぎています。織りは持続します。ゆっくりと開き、半分ほどの時間そのまま留まり、やがて消えていきます。互いに、そして滴に重なりあってテクスチュアを織りなします。",
    "g.tes2": "ここでも周期は二つずつ互いに素で、フレーズの周期とも互いに素です。",
    "g.tes3": "どちらのクラスにもボタンがあります。織りを鳴らしたままフレーズだけを止めることも、その逆もできます。スペースキーは両方にかかります。",
    "g.lbl.tfaders": "織りの五つのスライダー",
    "g.tf1": "音の高さの広がりを、オクターヴで表したもの。ゼロではすべての織りが同じ音に落ち、最大では四オクターヴに広がります。",
    "g.tf2": "織りが立ち上がるまでの秒数。何も打ちつけず、すべてが<em class=\"amb\">浮かび上がります</em>。",
    "g.tf3": "消えるまでの秒数。立ち上がりとあわせて、織りのどれだけが動きで、どれだけが静止かを決めます。",
    "g.tf4": "それぞれの線の上で、平均していくつの織りが同時に開いているか。一を下回ると沈黙が残り、二を超えると織り目は途切れません。",
    "g.tf5": "どの織りもわずかに調子のずれた二つの<em class=\"amb\">正弦波</em>でできていて、その差のヘルツがそのまま聞こえるうなりになります。〇・五ヘルツなら二秒に一度ふくらんではしぼみ、二ヘルツなら細かく震えます。",
    "g.lbl.tmoods": "八つの織り",
    "g.tmoods.intro": "フレーズと同じく、どの気分も完全な設定です。",
    "g.tm.velo": "出発点の<em class=\"amb\">均衡</em>。中庸の音域、重なりは一をわずかに超える程度。",
    "g.tm.fondale": "一周にひと層だけ、きわめて長く低い。八つのなかでもっとも動かない。",
    "g.tm.lino": "一周に三つ、深く重なりあう。織り目は途切れません。",
    "g.tm.respiro": "広い音域と、一を下回る重なり。織りと織りのあいだに、いくらかの沈黙が残ります。",
    "g.tm.bruma": "もっとも高く、もっとも淡い。広がりは三オクターヴ近く。",
    "g.tm.tenda": "一オクターヴに満たず、すべて低域に。八つのなかで最も高い音量。",
    "g.tm.seta": "うなりは他のほぼ倍、立ち上がりも速い。もっとも落ち着かない。",
    "g.tm.vela": "一周にひとつだけ。五十秒に及ぶこともあります。",
    "g.tmt.velo": "1.3日",
    "g.tmt.fondale": "23.4日",
    "g.tmt.lino": "14.6時間",
    "g.tmt.respiro": "13.6日",
    "g.tmt.bruma": "26.8日",
    "g.tmt.tenda": "11.1日",
    "g.tmt.seta": "14.5時間",
    "g.tmt.vela": "36.6日",
    "g.credits": "Ra<em class=\"amb\">d</em>aはValerio Belloniが構想し制作しています。",
  },

};

/* Nel francese la tilde segna lo spazio unificatore stretto, quello che la
   tipografia francese vuole prima di : ; ? ! e dentro le virgolette a
   caporale. Scritto così il testo resta leggibile nel sorgente; se lo si
   incollasse direttamente, sarebbe uno spazio invisibile e indistinguibile
   da quello normale.                                                       */
for (const k in GUIDA.fr) GUIDA.fr[k] = GUIDA.fr[k].split("~").join(NNBSP);

/* Il dizionario della guida si aggiunge a quello dell'interfaccia: da qui in
   poi T() trova le une e le altre senza distinzione.

   Object.assign sovrascrive in silenzio: una chiave scelta per sbaglio uguale
   a una dell'interfaccia cambierebbe le parole dei comandi senza che nessuno
   se ne accorga. L'unica sovrapposizione voluta è la descrizione per le
   anteprime, che qui deve parlare della guida e non dello strumento.      */
const SOVRASCRIVIBILI = new Set(["meta.description"]);
for (const l of LANGS) {
  for (const k in GUIDA[l])
    if (k in STRINGS[l] && !SOVRASCRIVIBILI.has(k))
      console.warn("guida-i18n: la chiave « " + k + " » esisteva già in " + l);
  Object.assign(STRINGS[l], GUIDA[l]);
}

/* I nomi dei mood NON stanno qui: arrivano dal dizionario dell'interfaccia,
   così i bottoni e la guida non possono raccontare due nomi diversi.       */
function fillMoodNames() {
  document.querySelectorAll("[data-mood]").forEach(el => {
    el.textContent = moodName(el.dataset.mood);
  });
  document.querySelectorAll("[data-drone-mood]").forEach(el => {
    el.textContent = droneMoodName(el.dataset.droneMood);
  });
}

/* Chiamata da setLang dopo che il documento è stato ritradotto. */
function onLanguageChange() { fillMoodNames(); }

/* --- da dove si è arrivati ------------------------------------------------
   Due situazioni molto diverse portano su questa pagina.

   Chi arriva DALLO STRUMENTO ha già Rada aperta e in ascolto nella scheda
   accanto: offrirgli "Ascolta Rada" gli farebbe aprire una seconda copia,
   muta e ferma al cancello, mentre la prima continua a suonare. Il richiamo
   sparisce.

   Chi arriva DA FUORI — un link condiviso, un segnalibro, una ricerca — non
   ha nessuno strumento aperto, e senza quel richiamo resterebbe in un vicolo
   cieco. Lì il richiamo serve, ed è l'unica porta d'ingresso.

   Le due situazioni si distinguono con un contrassegno nell'indirizzo, messo
   dal collegamento nell'interfaccia. Il referente sarebbe stato più elegante,
   ma dipende da impostazioni di riservatezza che possono azzerarlo: questo
   invece è deterministico. Nel dubbio i richiami restano — il comportamento
   sicuro è non lasciare nessuno in un vicolo cieco. E il logo rimanda allo
   strumento in entrambi i casi, per chi una seconda sessione la vuole.

   Il contrassegno viene poi tolto dall'indirizzo, così un link copiato dalla
   barra resta pulito e condivisibile. Le altre voci — ?lang= — sopravvivono. */
function vieneDalloStrumento() {
  try {
    const p = new URLSearchParams(location.search);
    if (p.get("da") !== "strumento") return false;
    p.delete("da");
    const q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
    return true;
  } catch (e) { return false; }
}

if (vieneDalloStrumento()) {
  /* via i due richiami e i separatori che li accompagnano, altrimenti
     resterebbero appesi nel vuoto come trattini senza nulla a fianco */
  document.querySelectorAll('[data-i18n="g.back"]').forEach(el => el.remove());
  document.querySelectorAll(".langSep, .docFoot .sep").forEach(el => el.remove());
}

buildLangSwitch(document.getElementById("langs"));
applyI18n();
fillMoodNames();
