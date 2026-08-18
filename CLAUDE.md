# Rada2 — contesto di progetto

Strumento generativo nel browser, ramo divergente di
[Rada](https://github.com/valeriobelloni78/rada). Eredita il motore sonoro, la
grafica, la palette e le quattro lingue; cambia ciò che Rada faceva del tempo.

**Rada stava ferma.** Quattro frasi con periodi coprimi si ricombinavano senza
ripetersi, ma i parametri restavano dove li avevi messi, la scala era una
pentatonica costruita una volta sola, e dopo un'ora lo strumento era
esattamente dov'era all'inizio: imprevedibile e immobile. L'interfaccia lo
dichiarava — «si ripete ogni ≈ 4,7 ore» era la promessa di non avere una forma.

**Rada2 va da qualche parte.** Il pezzo ha un tempo proprio, molto più lento di
quello delle frasi: l'armonia modula, il registro si sposta, e il materiale
stesso si rinnova una goccia per volta. Non finisce e non culmina — non è un
brano con una fine — e il suo stato non ripassa mai dov'era.

**E si può suonarci sopra.** L'accordatura è fissa, le modulazioni sono
regolari e la tonalità corrente è dichiarata in interfaccia. È una scelta
recente e ha un prezzo, scritto qui sotto: prima la tonica scivolava, ed era
quello scivolamento a rendere il non-ritorno assoluto.

**Rispondi sempre in italiano.** Commenti nel codice, messaggi di commit e
testi dell'interfaccia sono in italiano.

## Regole da non violare

**L'ACCORDATURA È FISSA, e questo viene prima di tutto il resto.** Il campo
nasce sul do ricavato dal la 440 (`440 · 2^(−9/12)`, calcolato e non scritto a
mano: `261.63` vale tre centesimi di scarto) e ogni altezza è una potenza
esatta di due dodicesimi. **Rada2 va suonata sopra**, e questo è il vincolo che
lo permette. Chi reintroduce un fattore non intero nella costruzione del campo
rompe il patto — ed è già successo di proposito: fino al ramo precedente la
tonica scivolava di ±350 centesimi, ed era quello a garantire il non-ritorno.

**Con l'accordatura fissa il non-ritorno è più debole, e va detto.** Le altezze
possibili sono un insieme FINITO, e nessun cammino in un insieme finito evita
di ripassare: le dodici tonalità si rivedono tutte, molte volte. A non tornare
è lo STATO — baricentro, fasi, materiale — non l'altezza delle note. Chi scrive
i testi non deve promettere più di così.

**La deriva non deve poter tornare, e la garanzia è un teorema.** Lo stato del
pezzo è un punto su un toro: sei canali che girano a velocità in rapporto
`√2 : √3 : √5 : √7 : √11 : 1`. Le radici quadrate di interi distinti liberi da
quadrati, prese insieme a 1, sono linearmente indipendenti sui razionali, e per
il teorema di Kronecker un'orbita con frequenze razionalmente indipendenti è
densa sul toro e non si chiude mai. **Chi sostituisce quelle radici con numeri
qualunque — 1,3 e 1,7 e 2,1 — perde il teorema** e riporta lo strumento a
un'orbita che prima o poi si richiude, cioè al difetto che `deriva.js` esiste
per togliere. Sta tutto lì, e nessun altro file conosce quelle costanti.

**Nessun parametro pende da un canale solo.** Ogni valore derivato è la somma
pesata di tre canali (`misto`). Una sinusoide sola, per quanto lenta, si sente
andare e tornare; tre incommensurabili no. E due parametri non devono
condividere tutta la terna, altrimenti si muovono all'unisono e la deriva si
riduce a una manopola sola tirata da una mano invisibile.

**Il movimento continuo vive nel BARICENTRO, non nelle altezze.** `altezza(rel,
spread)` in `deriva.js` è l'unico punto in cui si sceglie una frequenza, e ci
passano entrambe le classi: il campo è fermo, a scorrere è il centro attorno a
cui si pesca. I numeri sono incastrati — venticinque note, centro a 12,
baricentro ±4, apertura ±8 — così `12 ± 4 ± 8` copre esattamente `0..24` e la
selezione non sbatte mai contro gli estremi. **Cambiando uno dei tre va
ricontrollata la somma**, o agli estremi le note si accatastano sulla stessa
altezza.

**Il passo di quinta è REGOLARE, e l'irregolarità sta nella direzione.** Ogni
150 secondi esatti, perché chi accompagna deve poter contare quanto manca; la
direzione — su o giù di una quinta — viene da una parola sturmiana su 1/φ, che
non è periodica. In un verso o nell'altro cambia comunque una nota su cinque,
quindi il passo resta inudibile come prima.

**I periodi restano coprimi a due a due, ma non sono più la promessa.** Se due
linee condividono un divisore tornano insieme presto e la trama collassa in un
motivo riconoscibile: la regola serve ancora, e vale per ogni serie in `MOODS`
e in `DRONI_MOODS`. Quello che è cambiato è il suo rango. In Rada il minimo
comune multiplo era *il* dato dello strumento, scritto grande in interfaccia;
qui è una regola igienica locale, e la riga che l'utente legge è la deriva.
Verificare comunque l'MCM prima di proporre nuove serie.

Le due classi sono otto linee, non due gruppi da quattro: i periodi dei tessuti
devono essere coprimi **anche con quelli delle gocce**, altrimenti le due
classi tornano insieme più di quanto non facciano le quattro frasi fra loro.

Non devono però essere numeri primi. La regola è stata «primi da 19 in su»
finché i tessuti sono rimasti lunghi; ora le serie usano anche composti — 8, 9,
15, 16, 25 — che con 7·11·13·17 non condividono nulla, e Lino parte da otto
secondi. **Il vincolo da verificare è il massimo comun divisore, non la
primalità.**

C'è un limite di ferro da conoscere prima di ritoccare le serie: le otto
configurazioni delle gocce, tutte insieme, usano i primi fino a 29. Un periodo
coprimo con *tutte* dev'essere quindi fatto solo di primi da 31 in su — cioè
non può essere breve. Sotto quella soglia la coprimalità si garantisce verso la
configurazione di partenza, non verso ogni combinazione: oggi le coppie di
preset che condividono un divisore sono 25 su 64 (erano 17 quando i tessuti
partivano da 19). È il prezzo dei tessuti brevi, ed è stato scelto sapendolo.

**Nessuna libreria, né per il suono né per il disegno.** L'audio usa la Web
Audio API direttamente: lo scheduler a lookahead prenota le note sul clock
del motore audio, preciso al campione, e p5.sound — pensato per gesti
immediati — sarebbe una regressione sulla parte più delicata del progetto.
Il disegno usa l'API 2D del browser: c'era p5, ed è stato tolto, perché di
quella libreria si usavano una ventina di nomi con un equivalente di una riga
l'uno, e in cambio arrivava una dipendenza da CDN che impediva alla pagina di
aprirsi senza rete. Non rimetterne una.

**La palette è definita una volta sola**, nelle variabili CSS di
`css/style.css`. Anche il canvas le legge (`readPalette` in `disegno.js`).
Non introdurre colori scritti direttamente nel JavaScript.

**La deriva NON è una terza influenza esterna.** L'ora e la stagione vengono da
fuori — un orologio, un calendario — e la regola qui sotto continua a valere per
loro. La deriva viene da dentro: è il pezzo che si sposta, non il mondo che lo
inclina. Per questo non ha un `id` da tradurre né una riga di stato propria, ma
un indicatore che conta quanta strada è stata fatta. Chi aggiunge una terza
influenza *esterna* rompe ancora la simmetria; chi confonde le due cose finisce
per chiedere il permesso dei sensori a un orologio interno.

**Il valore efficace ora è la regola, non l'eccezione.** In Rada solo calore e
spazio avevano un valore inclinato. Qui `effG.spread`, `effG.dens` ed
`effG.head` si muovono sempre, e **chi legge il cursore nudo legge una cosa che
non sta suonando**: `makeIdea` usa `effG.dens`, `buildPlan` usa `effG.head`,
`playDrop` usa `effG.spread`, `playTone` usa `effD.liv`. La lettura accanto a
ogni cursore mostra i due numeri appena differiscono, ed è così che lo strumento
resta onesto su chi comanda che cosa.

**Una influenza esterna per classe, e sono simmetriche.** L'ora del giorno
inclina le gocce (`timePalette`), la stagione inclina i tessuti
(`seasonPalette`): tre parametri ciascuna, un `id` che il modello non sa
tradurre, una riga di stato che dice quale è in vigore. La differenza è la
scala — un giorno contro un anno — ed è voluta: uno sfondo che cambia col mese
è uno sfondo che non si nota cambiare. Nessuna delle due chiede permessi o usa
sensori. **Chi ne aggiunge una terza rompe la simmetria: meglio non farlo.**

I valori efficaci vivono in `effWarmth`/`effRev` per le gocce e in `effD` per
i tessuti, e sono quelli che il suono deve leggere — `playTone` usa `effD`, mai
`D`. Dove cursore e valore efficace differiscono, la lettura mostra due numeri.

**Un solo colore.** Tutta l'interfaccia è in scala di grigi caldi su fondo
avorio; l'unico accento è l'arancione mattone `--amber`, usato con
parsimonia: la "d" del logo, il punto che pulsa, la lancetta, le gocce che
suonano. Non aggiungere altri colori senza chiederlo.

**Nessuna dipendenza da installare, nessun passaggio di compilazione.** Si
apre `index.html` e funziona — anche senza rete, da quando non c'è più il
`<script>` che scaricava p5 da un CDN. Non introdurre bundler, npm o framework.
Vale anche per le traduzioni: **niente file JSON caricati con `fetch`**, che
su `file://` il CORS blocca — l'app resterebbe senza testi al doppio clic.
Il dizionario è un oggetto JavaScript in `i18n.js`.

**Il modello non conosce le parole.** `MOODS` e `timePalette` espongono
`id` (`vespro`, `notturna`), mai etichette: i nomi visibili stanno in
`i18n.js`, uno per lingua. Prima le due cose coincidevano, e un mood non si
poteva rinominare senza rinominare il preset.

## Insidie già incontrate (non ripeterle)

**Lo scheduler corre avanti rispetto all'ascolto.** `cycleStart` e `period`
descrivono il ciclo *in pianificazione*, non quello *udibile*: lo scheduler
passa al giro successivo appena ha prenotato l'ultima goccia, cioè molto
prima che il giro finisca. Per il disegno esiste la coda `L.cycles`, che
conserva i cicli realmente in ascolto. **La lancetta deve leggere da lì.**
Usare `cycleStart` per disegnare produce un disallineamento fino a un terzo
di giro appena l'utente cambia una durata.

**Il disegno deve usare il piano, non i valori correnti.** Le gocce e la zona
attiva si disegnano da `L.plan` e `L.planHead`, non da `G.head`: il piano è
ciò che suonerà davvero. Ricalcolare le posizioni dai cursori fa divergere
ciò che si vede da ciò che si sente.

**La zona attiva può scavalcare la fine del ciclo.** Ogni frase ha un
`offset` casuale, quindi le fasi delle gocce rientrano dall'inizio e vanno
riordinate (lo fa `buildPlan`). In `rebuildPlans` il confronto avviene su
**tempi assoluti**, non su fasi: `cycleStart` può essere nel futuro, e
avvolgere la fase fa saltare gocce o interi cicli.

**Un evento non torna prima di mezzo giro, e questa guardia è nuova.** In Rada
l'orizzonte di prenotazione bastava, perché le fasi si ricalcolavano quasi mai:
l'addensamento cambiava solo mentre l'utente trascinava un cursore. Qui la
deriva lo muove di continuo e `buildPlan` ricalcola le fasi con l'addensamento
*di adesso*, da cui due guai che la simulazione ha trovato in quest'ordine: una
goccia già emessa scivola oltre l'orizzonte e `riposizionaIdx` la riprenota
(Δ ≈ 10 ms); una goccia in fondo al giro scavalca la fine, rientra in testa a
quello dopo e suona due volte a cavallo del confine (Δ ≈ 6 ms). Nessuno dei due
si sente come un raddoppio: si sentono come un colpo sporco. Contare i giri
copriva solo il primo — il secondo cade onestamente in due giri diversi. La
guardia buona è `t - ev.flash > L.period * 0.5` dentro `prenota`, e copre
entrambi con un meccanismo solo. **Non toglierla per "semplificare": è l'unica
cosa che rende sicuro ricostruire un piano mentre il pezzo suona.**

**Due modi per classe, e sono un interruttore sul MATERIALE.** `MODI` in
`model.js`: in «deriva» le idee si rinnovano su due scale — una goccia per
volta fra una modulazione e l'altra, e da capo a ogni passo di quinta; in
«ancora» non si toccano, e restano quelle che lo stato d'animo ha scelto. Tutto
il resto continua a muoversi in entrambi i modi: baricentro, armonia, fasi.
Le due classi sono indipendenti, e il modo di partenza è «deriva».

Il nome è il sostantivo marinaro, non l'avverbio — una rada è un ancoraggio
riparato, e qui si getta l'ancora dentro un pezzo che per il resto continua a
spostarsi. **Le traduzioni devono tenere quel senso** («ancre», «anchor»,
「錨」), non quello di «di nuovo».

**Rigenerare fuori dal ↻ vuole `riposizionaIdx`.** `regenerate` azzera
l'indice, e da solo non basta quando lo chiama lo scheduler: gli eventi già
prenotati suonano comunque e quelli del piano nuovo si aggiungono nella stessa
finestra. A pagina visibile sono 150 ms di sovrapposizione, a schermo bloccato
dodici secondi — una raffica. `rinnovaSuQuinta` in `audio.js` riposiziona
l'indice sull'orizzonte sicuro, come già fanno `rebuildPlans` e il ricambio.

**Il ricambio tocca solo eventi liberi.** `raccogliLibere` scarta ciò che cade
prima dell'orizzonte *e* ciò che sta ancora suonando (`!(ev.fino > now)`): la
seconda condizione esiste per i tessuti, che restano aperti anche mezzo minuto e
salterebbero di registro sotto l'orecchio. È scritta al negativo apposta —
le gocce `fino` non ce l'hanno, e per loro il confronto deve cadere su
`undefined` risultando "libera". Il ricambio va inoltre chiamato **dopo**
`prenota`, così `bookedUntil` è già aggiornato e l'orizzonte che consulta è
quello vero.

**Il modello si popola da sé.** In fondo a `model.js` c'è
`loops.forEach(regenerate)`. Senza quella riga le frasi nascono vuote e l'app
è muta all'apertura: è già successo dividendo il file in moduli.

**La finestra dello scheduler è una sola, e la usano in due.** `LOOKAHEAD`
vive in `model.js` perché `schedule` e `rebuildPlans` devono guardare
esattamente altrettanto avanti: se lo scheduler prenotasse a tre secondi e
`rebuildPlans` ne considerasse pianificati solo 0,15, una mossa
dell'addensamento riposizionerebbe gocce già prenotate e le sentiresti due
volte. Cambiando l'una, cambiare l'altra.

**Il canvas è puro display: NON ascolta nulla, e deve restare così.** In Rada
la tela era una superficie di comando, con otto riquadri trasparenti
(`.dialZone`) a governare `touch-action` — perché con i pointer event lo
scorrimento della pagina lo decide SOLO `touch-action`, e `preventDefault` su
`pointerdown` non lo ferma — più un doppione di comandi nativi fuori campo per
la tastiera. Il reticolo unico ha chiuso la questione: gli anelli concentrici
sarebbero bersagli impossibili per un dito, quindi **il doppione è diventato
l'interfaccia** — le otto righe di linea nelle colonne accanto al reticolo,
elementi HTML nativi, un binario solo per puntatore, tastiera e lettore di
schermo. Con questo sono spariti i dialZone, le regole di `touch-action` e la
sincronia bidirezionale canvas↔comandi. Chi rimette un ascoltatore sulla tela
si ricompra tutti e tre i problemi.

**Ogni goccia lascia sette nodi audio, e vanno scollegati a mano.**
`playDrop` costruisce tre oscillatori più guadagni e panner. Il rilascio
automatico dipende dalla raccolta della memoria, che è attività del thread
PRINCIPALE — proprio quello che a schermo bloccato viene strozzato. Il thread
audio intanto continua ad accumulare: il grafo cresce più in fretta di quanto
venga ripulito, la CPU audio sale, i buffer prima frusciano e poi saltano.
Misurato col mood più denso a pagina nascosta: senza `onended` i nodi vivi
salivano senza limite (189 → 273 → 371 in ventuno secondi), con `onended` si
assestano attorno al centinaio. **Chiunque aggiunga nodi per nota deve
scollegarli quando la nota finisce.**

**Il contesto audio nasce con `latencyHint: "playback"`.** Di suo un
AudioContext è tarato per strumenti suonati dal vivo: buffer da 256 campioni,
cioè 5,8 ms per consegnare senza mai mancare un colpo. Su un telefono modesto
non ce la fa, e ogni buffer mancato è un raschio. Rada non risponde a nessun
gesto in tempo reale — le gocce sono prenotate secondi prima — quindi il
ritardo d'uscita non si percepisce: con `playback` il buffer sale a 1024
campioni, quattro volte il margine. **Non rimetterlo com'era per "ridurre la
latenza": qui non serve a niente e costa il suono.**

**La rete del riverbero è in retroazione, quindi va trattata con rispetto.**
Due trappole già scattate: il passa-basso di Web Audio ha guadagno fino a
1,22 anche a Q basso — moltiplicato per il guadagno dell'anello porta il giro
sopra l'unità e la coda cresce invece di spegnersi (misurato: +600 dB in venti
secondi) — e per questo `piccoDi` misura il picco vero del filtro e ci divide,
con un ripiego prudente a 1,3 se la misura non riesce, **mai 1**. C'è poi un
filo di continua a 10⁻¹⁵ iniettato negli anelli: tiene i valori sopra la
soglia dei denormali, che su molti processori costano decine di volte tanto
proprio quando la coda sta svanendo.

**Attenzione alle allocazioni nei cicli a 60 fps.** Niente nuovi buffer o
array dentro `disegna`, che è il corpo del fotogramma. Vale anche per la
storia della deriva: il baricentro sta in un ANELLO preallocato (`derivaStoria`
in `audio.js`, novecento campioni per mezz'ora), non in una coda — una coda
a regime sposterebbe l'intero array a ogni campione, per sempre.

**Le soglie del ciclo stanno appena SOTTO il periodo voluto.** `PASSO_VIVO` è
1/61 di secondo e `PASSO_FERMO` 1/13, non 1/60 e 1/12: i fotogrammi arrivano
a passi discreti, e una soglia esatta verrebbe mancata per frazioni di
millisecondo saltando un giro su due — trenta al secondo invece di sessanta.
Misurato dopo la correzione: 12,0 fotogrammi al secondo a motore fermo.

**Le stringhe del canvas si preparano al cambio di lingua, non a ogni
fotogramma.** La cache `CANVAS` è costruita una volta da `buildCanvasCache`;
il disegno la legge e basta. Le parole vere sono uscite dalla tela col
reticolo — restano numerali e cartelli di scala (`30 s`, `30 min`) — ma la
regola vale soprattutto per i formattatori: costruire un `Intl.NumberFormat`
dentro il fotogramma costa più di tutto il resto del disegno. Ne esistono
tre, creati una volta per lingua.

**Il giapponese non ha maiuscolo.** La gerarchia delle etichette minute
poggia su MAIUSCOLO più tracking ampio, un dispositivo che in giapponese
semplicemente non esiste: le regole `:lang(ja)` in `style.css` la
ricostruiscono con corpo e 字間. (Il canvas non c'entra più: da quando le
parole sono uscite dalla tela, il tracking del testo è affare del solo CSS.)

**Nei tessuti lo scarto fra le due voci è ADDITIVO, non proporzionale.**
Due sinusoidi distanti d hertz battono a d hertz qualunque sia la loro
altezza; con uno scarto proporzionale i toni gravi batterebbero molto più
lenti degli acuti, e il cursore "Battito" non manterrebbe la promessa.

**L'Intreccio va riscalato, non solo ripianificato.** Le durate dei tessuti
vivono dentro l'idea, costruita una volta sola: muovendo il cursore, senza
riscalarle il nuovo valore si vedrebbe soltanto alla prossima rigenerazione.
`L.planSovr` ricorda con quale intreccio sono state calcolate — stesso ruolo
di `planHead` per le gocce — e `buildPlanDrone` le moltiplica per il rapporto.
Verificato su quattrocento rigenerazioni per valore: la somma media delle
durate coincide col cursore entro lo 0,4%.

**Ogni riquadro accende e spegne la propria classe.** `gocceOn` e `tessutiOn`
in `audio.js`: il motore gira finché almeno una è accesa, e spente entrambe il
clock si ferma davvero (`applicaStato`). I cicli però continuano ad avanzare
anche a classe spenta, così riaccendendola riparte da dov'era — la stessa
promessa che la pausa fa per l'intero strumento. La barra spaziatrice resta il
comando globale: una scorciatoia che agisse su metà strumento sorprenderebbe.

**Le due classi di eventi si prenotano con lo stesso codice.** `prenota` in
`audio.js` è generica: prende la lista, la funzione che ricostruisce il piano
e quella che suona un evento. Le gocce e le tenute differiscono per come
suonano, non per come vengono collocate nel tempo — e due copie dello
scheduler divergerebbero al primo ritocco.

**Il mirino ha due segni, uno per classe.** Il punto al centro lampeggia con
qualunque goccia, l'anello che lo circonda quando un tessuto si apre: sono i
due attacchi dello strumento letti nel punto in cui le otto linee si
incontrano. L'anello **lampeggia e non resta acceso** — la tenuta accesa è già
raccontata dal suo arco, e qui interessa l'istante d'ingresso, che altrimenti
non avrebbe segno perché un tessuto si apre troppo lentamente perché l'orecchio
ne colga il momento.

La durata del lampo è `LAMPO`, **una costante sola** per gocce, centro e
anello: sono lo stesso segno detto in posti diversi, e tre valori li farebbero
sembrare tre fenomeni.

**Le guide dei tessuti mostrano uno STATO, non una storia.** Le quattro corsie
delle gocce scorrono e ricordano trenta secondi; le quattro guide dei tessuti
sono ferme e dicono a che punto sono le tenute che suonano adesso, in
puntini accesi. Per un suono che dura mezzo minuto è la domanda che ci si fa davvero
guardando. L'avanzamento è **proporzionale** alla durata della singola tenuta —
la fila si riempie tutta, che duri tre secondi o novanta: a puntino fisso per
secondo si potrebbero confrontare le durate fra linee, ma con una corsa da 2,5
a 90 secondi la fila traboccherebbe quasi sempre. Le guide non hanno un
cartello di durata, e non è una svista: non contengono tempo.

**I puntini si disegnano in due sole campiture.** Un `fill` per cerchietto
sarebbe un centinaio di campiture per fotogramma, e a sessanta al secondo si
sente su un telefono: si accumulano tutti i grigi in un percorso e tutti gli
accesi in un altro, con un `moveTo` prima di ogni arco perché non si colleghino.

**La tela è UNA, e il ciclo di fotogrammi pure.** Le otto linee sono anelli
concentrici di un solo reticolo, disegnato da `disegno.js` su un solo canvas
dentro un solo `requestAnimationFrame`. In Rada le tele erano due perché due
riquadri con bordo proprio non potevano condividerne una; caduti i riquadri è
caduta la ragione, e `droni.js` è confluito qui. Due animazioni indipendenti
si sfaserebbero e su un telefono costerebbero il doppio: chi aggiunge una
superficie disegnata la fa disegnare da `disegna`, non da un secondo ciclo.

**UNA sola tenuta arancione in tutta la pagina: la più recente fra le otto
linee**, non una per linea. Le altre che suonano sono inchiostro pieno, le
tacenti filo tenue; lo spessore doppio invece vale per tutte quelle che suonano.

Il tetto dell'accento è passato per tre valori, e conviene sapere perché è
finito a uno. Accendere tutto ciò che suona portava l'arancione al 71% della
circonferenza degli anelli esterni con l'Intreccio appena sopra l'uno, e alla
saturazione alzandolo. Una per linea lo riportava al 58%: meglio, ma ancora
quattro accenti simultanei. Una sola scende al 13%, e soprattutto guadagna un
significato preciso — non «queste stanno suonando» ma **«questa è appena
entrata»**.

**Le linee silenziate non concorrono**, e non è un dettaglio: la più recente in
assoluto può cadere su una linea muta, prendersi l'arancione e lasciare la
pagina senza acceso mentre qualcosa suona davvero. Vale anche a classe spenta.

Il reticolo e la guida usano la STESSA gerarchia e gli STESSI due colori, e
leggono lo stesso `corrente` in `disegno.js`, calcolato una volta per
fotogramma. Chi ne cambia la definizione da una parte la cambi anche
dall'altra, e chi introduce un terzo grigio per una delle due fa sembrare due
informazioni diverse quello che è un solo stato.

Le gocce invece no: lampeggiano per meno di mezzo secondo e poi tornano
inchiostro. Lì la regola dell'accento raro vale intera.

## Convenzioni

**Il modello dipende solo dalla deriva.** `deriva.js` non conosce nessuno;
`model.js` conosce solo la deriva; nessuno dei due sa dell'audio o della
grafica. Le dipendenze scorrono in una direzione sola:
deriva ← model ← audio ← disegno/ui. Mantenere questa separazione.

**Le proporzioni del disegno sono frazioni del raggio**, mai pixel fissi:
il reticolo deve reggere a qualunque dimensione. Con un'eccezione imparata a
spese proprie: **gli spessori di tratto sono in pixel assoluti**, non in
frazioni del raggio — sul reticolo R è quattro volte quello dei vecchi
quadranti, e la frazione che là faceva un filo qui faceva una fascia nera.

**Tipografia**: una sola famiglia (grottesco di sistema), gerarchia data da
peso e spaziatura. Peso 200 per i display, 300 per il testo, 400 con
tracking ampio per le etichette minute. Sul canvas vivono solo numerali e
unità; ogni parola con tracking è HTML, e la spaziatura la fa il CSS.

**La lingua visiva è quella dei disegni tecnici**: niente scatole — le
sezioni le separano i fili — e niente angoli tondi né pillole; l'unico tondo
è quello dei segni del reticolo. I cursori sono scale graduate con l'indice
rettangolare, i mood etichette numerate (il numero lo mette un counter CSS:
è notazione, non lingua, e non passa dal dizionario).

**Le etichette dei comandi descrivono l'azione, non lo stato**
("Pausa", non "In ascolto"). Lo stato è raccontato dalla riga in alto e dal
punto che pulsa.

**I numeri che cambiano** usano cifre a larghezza fissa, altrimenti
tremolano a ogni aggiornamento.

## Verifica e pubblicazione

Non c'è una suite di test. Prima di ogni commit che tocchi il motore,
**verificare in locale** aprendo `index.html` e controllando che il suono
parta entro un secondo e che le lancette passino sulle gocce esattamente
quando suonano.

Per modifiche allo scheduler vale la pena scrivere una simulazione usa e
getta in Node, con i nodi audio sostituiti da stub, e controllare che ogni
goccia suoni una volta per ciclo, senza duplicati e con tempi crescenti.
È così che sono stati trovati i disallineamenti passati.

Ogni push su `main` ricostruisce il sito su GitHub Pages:
https://valeriobelloni78.github.io/rada2/ (da abilitare nelle impostazioni
del repo al primo push — l'automatismo è ereditato da Rada, non è ancora
stato verificato su rada2).

## Direzioni di lavoro

Le quattro direzioni visive di Rada sono state percorse dal reticolo e dalla
fascia: l'altezza si legge nella lunghezza delle tacche, il collage negli
anelli concentrici e nei legami effimeri, il tempo lungo nella corsia dei
trenta minuti dove il baricentro sedimenta. Restano aperte, in ordine di
interesse:

1. **Estendere le palette al visivo.** L'ora e la stagione oggi agiscono solo
   sul suono: alle 23 Rada2 suona cupa ma appare identica a mezzogiorno. Il
   reticolo unico rende l'idea più facile di prima — un'inclinazione sola,
   non otto.
2. **L'esportazione di un'immagine finale.** La corsia lunga già accumula la
   sessione; il passo successivo è poterla portare via — la traiettoria di
   un ascolto come congedo.
3. **La deriva più udibile che leggibile.** Le ampiezze in `effettiviGlobali`
   e il passo delle quinte sono tarati a tavolino: vanno ascoltati a lungo,
   e ritoccati a orecchio.

Tutto sta su **un unico canvas** proprio per rendere possibili gli effetti
che attraversano le linee: non separarlo.

## Limiti noti

**In secondo piano il browser rallenta i timer**, da 25 ms a circa un secondo.
Il thread audio però non viene mai rallentato: una goccia già prenotata suona
comunque con precisione al campione. Per questo lo scheduler allarga la
finestra di prenotazione a tre secondi quando la pagina non si vede — con la
finestra stretta si perdeva il 61% delle gocce, misurato in simulazione.

La finestra però si adatta: se i giri dello scheduler si diradano davvero —
schermo bloccato, non semplice secondo piano — insegue il ritardo osservato
fino a dodici secondi. Il tetto è un compromesso: più in alto si va, più
audio resta impegnato al ritorno, e i cursori sembrano non rispondere.

Su **iOS** il problema è doppio e va tenuto distinto. Il primo è che WebKit
considera un AudioContext "suono d'ambiente" e lo sospende a schermo bloccato:
per questo si dichiara `navigator.audioSession.type = "playback"`, che è la
categoria della riproduzione lunga (e che fa suonare Rada anche con
l'interruttore del silenzioso inserito — voluto). Il secondo è che lo
scheduler vive sul thread principale: se iOS lo congela del tutto, nessuna
finestra basta, e l'unica vera soluzione sarebbe spostare la prenotazione
dentro un AudioWorklet, cioè sul thread audio. **Da verificare su un iPhone
vero.**
