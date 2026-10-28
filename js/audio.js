/* =============================================================================
   RADA · audio.js — il motore sonoro

   Usa la Web Audio API direttamente, non p5.sound: il cuore di Rada è uno
   SCHEDULER A LOOKAHEAD che prenota le gocce sul clock del motore audio, con
   precisione al campione. I timer di JavaScript sono troppo imprecisi per
   frasi che devono restare in fase per ore; p5.sound è pensato per gesti
   immediati, non per pianificazione temporale rigorosa. Qui la precisione
   è il punto, quindi si parla con l'API nativa.

   Catena: [gocce] + [tenute → bus dei tessuti] → filtro passa-basso →
           (diretto + riverbero) → uscita
============================================================================= */

let ctx = null, master, wetGain, dryGain, filt, tessutiBus;
let running = false;                 // il motore sta suonando?

/* Le due classi si accendono e si spengono da sole, ciascuna col pulsante del
   proprio riquadro. Il motore gira finché almeno una delle due è accesa:
   spente entrambe, dopo la dissolvenza il clock si ferma e non si consuma
   nulla. La barra spaziatrice resta il comando globale — accende o spegne
   tutte e due insieme — perché una scorciatoia da tastiera che agisse su
   metà dello strumento sarebbe più sorprendente che utile.               */
let gocceOn = false, tessutiOn = false;

/* Storia delle gocce suonate di recente, per la fascia temporale condivisa
   del disegno: gli ultimi TIMELINE_SEC secondi di tutte e quattro le frasi
   sulla stessa riga del tempo. Scritta qui perché è lo scheduler a sapere
   con esattezza quando una goccia suona davvero; il disegno la legge soltanto,
   come già fa con L.cycles per la lancetta.                                */
const TIMELINE_SEC = 30;
/* Non si chiama `history`: una const globale con quel nome OSCURA
   window.history per ogni script caricato dopo, e il giorno in cui servisse
   toccare la cronologia nella pagina principale il guasto sarebbe muto.   */
const dropHistory = [];

/* Qui stava `toneHistory`, la memoria dei tessuti suonati di recente: la
   fascia ne disegnava dei segmenti che scorrevano. Da quando le guide dei
   tessuti mostrano l'AVANZAMENTO di ciò che suona adesso, e non più la
   storia di ciò che è stato suonato, quella memoria non la leggeva più
   nessuno — e una coda che lo scheduler alimenta a ogni giro senza che
   nessuno la consulti è codice morto, non un costo trascurabile.

   Il disegno prende ora la tenuta corrente da `L.plan`, che è il piano vero. */

/* --- la storia della deriva ------------------------------------------------
   Seconda memoria, per la corsia lunga della fascia: il baricentro
   campionato quattro volte al secondo sugli ultimi tre minuti, più i tempi dei passi
   di quinta. Stesso principio di `dropHistory` — lo scheduler scrive, il
   disegno legge — e la
   stessa ragione di stare qui: è lo scheduler a girare sempre, anche quando
   i fotogrammi si fermano perché la pagina non si vede.

   Il baricentro sta in un ANELLO preallocato, non in una coda: i campioni
   sono quelli, per tutta la sessione, e una coda con push e shift a regime
   sposterebbe l'intero array a ogni campione. Si memorizza anche il tempo di
   ciascun campione, perché i giri dello scheduler non sono equidistanti — a
   schermo bloccato passano anche dodici secondi — e il disegno deve sapere
   dove i buchi sono veri.                                                  */
/* TRE MINUTI, e il passo di campionamento dipende da quelli. Erano quindici,
   con un campione ogni due secondi: le colonne della striscia erano larghe
   nove pixel e ciascuna copriva un quarto di minuto. Adesso la striscia ha
   colonne da due pixel, cioè una ogni mezzo secondo scarso, e un campione
   ogni due secondi ne lascerebbe vuote tre su quattro — una pettinata, non
   una striscia.
   IL PASSO VA TENUTO SOTTO LA DURATA DI UNA COLONNA, che è
   `finestra / (larghezza in pixel / 2)`: nel caso peggiore — la fascia più
   larga, 846 px a schermo stretto — sono 0,43 s, e un quarto di secondo ci
   sta sotto con margine. Chi allarga la finestra senza toccare il passo
   ritrova il pettine.
   Il cartello sopra la corsia lo scrive i18n.js: cambiando qui, cambiare
   anche `CANVAS.fLunga`.                                                  */
const DERIVA_FINESTRA = 180;
const DERIVA_PASSO    = 0.25;                       // secondi fra due campioni
const DERIVA_N        = DERIVA_FINESTRA / DERIVA_PASSO;
const derivaStoria = {
  t: new Float32Array(DERIVA_N),
  c: new Float32Array(DERIVA_N),                    // baricentro, in −1..1
  testa: 0,                                         // prossima posizione di scrittura
  pieni: 0,                                         // quanti campioni esistono davvero
};
let ultimoCampione = -99;

/* I passi di quinta sono rari — uno ogni due minuti e mezzo — quindi qui una
   coda va benissimo. `ultimiPassi` ricorda l'ultimo passiQuinta visto: è così
   che lo scheduler si accorge che deriva.js ha fatto un passo.

   Ogni voce porta il tempo E LA TONALITÀ che quel passo ha aperto, perché la
   striscia della fascia ne scrive il nome. Ricostruirla all'indietro sarebbe
   possibile — la parola sturmiana è deterministica — ma vorrebbe dire
   rifare in `disegno.js` un conto che è di `deriva.js`, e l'indice lo dà già
   `tonalita()`: qui si registra, non si ricalcola.                        */
const quinteHistory = [];
let ultimiPassi = 0;

/* Alzata quando la deriva ha appena fatto un passo di quinta, e abbassata da
   chi la consuma dopo `prenota`. Non si rinnova il materiale qui dentro: la
   registrazione della storia gira PRIMA della prenotazione, e rigenerare lì
   vorrebbe dire riscrivere il piano mentre `bookedUntil` è ancora quello del
   giro scorso.                                                            */
let quintaScattata = false;

function registraDeriva(now) {
  if (now - ultimoCampione >= DERIVA_PASSO) {
    ultimoCampione = now;
    derivaStoria.t[derivaStoria.testa] = now;
    derivaStoria.c[derivaStoria.testa] = derivaCentro();
    derivaStoria.testa = (derivaStoria.testa + 1) % DERIVA_N;
    if (derivaStoria.pieni < DERIVA_N) derivaStoria.pieni++;
  }
  if (passiQuinta !== ultimiPassi) {
    ultimiPassi = passiQuinta;
    quinteHistory.push({ t: now, ton: tonalita() });
    quintaScattata = true;
  }
  while (quinteHistory.length && quinteHistory[0].t < now - DERIVA_FINESTRA)
    quinteHistory.shift();
}

/* --- come il sistema deve considerare questo suono ------------------------
   Di suo, un AudioContext è "suono d'ambiente": iOS lo zittisce con
   l'interruttore laterale e lo sospende appena si blocca lo schermo, perché
   lo tratta come l'effetto sonoro di una pagina qualsiasi.

   `playback` dichiara l'opposto — questo è un lettore, il suono è il
   contenuto — ed è la categoria che WebKit riserva alla riproduzione lunga.
   Due conseguenze, ed entrambe sono volute: Rada suona anche con
   l'interruttore del silenzioso inserito, e chiede al sistema di continuare
   a schermo bloccato.

   L'API esiste solo su WebKit; altrove il ramo non fa nulla.             */
function dichiaraSessioneDiRiproduzione() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
  } catch (e) {}
}

/* Il pannello di controllo del sistema — schermata di blocco, centro di
   controllo — mostra ciò che sta suonando e offre play e pausa. Dichiararsi
   qui non è solo una cortesia: è il modo in cui il sistema riconosce una
   sessione musicale come tale, e quindi degna di restare viva.            */
function dichiaraMediaSession() {
  const ms = navigator.mediaSession;
  if (!ms) return;
  try {
    if (typeof MediaMetadata === "function")
      ms.metadata = new MediaMetadata({ title: "Rada", artist: T("media.artist") });
    ms.setActionHandler("play",  () => { if (!running) togglePower(); });
    ms.setActionHandler("pause", () => { if (running)  togglePower(); });
    ms.setActionHandler("stop",  () => { if (running)  togglePower(); });
  } catch (e) {}
}

function statoMediaSession() {
  try {
    if (navigator.mediaSession) navigator.mediaSession.playbackState = running ? "playing" : "paused";
  } catch (e) {}
}

/* --- costruzione del grafo ----------------------------------------------- */
function buildAudio() {
  dichiaraSessioneDiRiproduzione();
  /* `latencyHint: "playback"` chiede al browser il buffer PIÙ LUNGO che
     ritiene ragionevole, invece di quello più corto.

     Di suo un AudioContext nasce per strumenti suonati dal vivo, dove ogni
     millisecondo di ritardo si sente sotto le dita: buffer minuscoli, e se la
     CPU non consegna in tempo il buffer resta vuoto — è quel raschio. Rada
     però non risponde a nessun gesto in tempo reale: le gocce sono prenotate
     secondi in anticipo sul clock del motore audio, quindi un ritardo
     d'uscita più lungo non si percepisce affatto. In cambio il thread audio
     ha molto più margine per consegnare in tempo, che è esattamente ciò che
     manca su un telefono modesto.

     Nessun costo e nessun effetto udibile: solo più respiro.             */
  const Costruttore = window.AudioContext || window.webkitAudioContext;
  try { ctx = new Costruttore({ latencyHint: "playback" }); }
  catch (e) { ctx = new Costruttore(); }

  master = ctx.createGain();
  master.gain.value = 0;

  const riverbero = buildRiverbero();
  wetGain = ctx.createGain(); wetGain.gain.value = 0.6;
  dryGain = ctx.createGain(); dryGain.gain.value = 0.6;

  filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 4000;
  filt.Q.value = 0.6;

  /* I tessuti hanno un bus proprio prima del filtro, e serve a una cosa sola:
     tenere la SEZIONE a livello costante invece che ogni singola tenuta.
     Vedi `normalizzaTessuti`.                                             */
  tessutiBus = ctx.createGain();
  tessutiBus.gain.value = livelloTessuti();
  tessutiBus.connect(filt);

  filt.connect(dryGain); dryGain.connect(master);
  filt.connect(riverbero.ingresso);
  riverbero.uscita.connect(wetGain); wetGain.connect(master);
  master.connect(ctx.destination);

  restartCycles();
  setInterval(schedule, 25);
  dichiaraMediaSession();
}

/* --- IL RIVERBERO ----------------------------------------------------------
   Prima era una convoluzione: rumore con decadimento, lungo secondi. Suona
   benissimo e costa moltissimo — il costo cresce con la coda, e va pagato a
   ogni istante anche nel silenzio, perché il convolutore macina comunque.
   Con una coda di 2,6 secondi sono quasi 250.000 campioni per canale, sempre.
   È il costo FISSO della catena: la ragione per cui su Android il suono
   degradava allo stesso modo col mood più fitto e con quello più rarefatto.

   Qui c'è invece una rete di ritardi in retroazione, alla Schroeder: quattro
   filtri a pettine smorzati in parallelo, poi due catene passa-tutto che ne
   diffondono l'uscita. Ogni nodo costa lo stesso a ogni campione, qualunque
   sia la lunghezza della coda — e la coda diventa gratis, tanto che non serve
   più accorciarla sul telefono.

   I quattro ritardi sono 31, 37, 41 e 43 millisecondi: numeri primi, quindi
   coprimi a due a due. È la stessa regola che tiene sfasate le quattro frasi,
   e serve alla stessa cosa — se due ritardi condividessero un divisore le
   loro ripetizioni coinciderebbero, e la coda suonerebbe metallica invece che
   diffusa.

   I passa-tutto non colorano il timbro, rimescolano solo le fasi: è ciò che
   trasforma quattro echi distinti in una nube continua. Sinistra e destra ne
   hanno di lunghezze diverse, ed è da lì che nasce l'ampiezza stereo che
   prima veniva dal rumore scorrelato dei due canali dell'impulso.        */
const RIV_T60 = 3.6;                       // secondi perché la coda cali di 60 dB
const RIV_SMORZAMENTO = 2800;              // Hz: la coda si scurisce mentre svanisce

/* Quattro pettini in comune, poi due catene di passa-tutto — una per canale —
   con ritardi diversi. Tutti e otto i numeri sono primi, quindi coprimi a due
   a due: la stessa regola che tiene sfasate le quattro frasi, e per la stessa
   ragione. Se due ritardi condividessero un divisore le loro ripetizioni
   coinciderebbero, e la coda suonerebbe metallica invece che diffusa.

   I pettini stanno in comune, e non divisi fra i canali, per una ragione
   misurata: dividendoli, i due lati uscivano con sei decibel di scarto —
   un anello più corto ripete più spesso e rende più energia. Partendo dalla
   stessa somma il bilanciamento è garantito per costruzione, e la larghezza
   stereo la danno i passa-tutto, che spostano le fasi senza toccare i livelli. */
const RIV_PETTINI = [31, 37, 41, 43];      // ms, primi fra loro
const RIV_PASSATUTTO = [[7, 11], [5, 13]]; // ms, una coppia per canale

function buildRiverbero() {
  /* L'ingresso è forzato a un canale solo: la rete lavora in mono e la stereo
     rinasce dai passa-tutto. Lasciarla stereo raddoppierebbe il lavoro per
     un'informazione che il riverbero dissolve comunque.                   */
  const ingresso = ctx.createGain();
  ingresso.channelCount = 1;
  ingresso.channelCountMode = "explicit";

  const somma = ctx.createGain();
  somma.gain.value = 1 / RIV_PETTINI.length;

  for (const ms of RIV_PETTINI) {
    const ritardo = ctx.createDelay(0.1);
    ritardo.delayTime.value = ms / 1000;

    const smorza = ctx.createBiquadFilter();   // le alte svaniscono prima
    smorza.type = "lowpass";
    smorza.frequency.value = RIV_SMORZAMENTO;
    smorza.Q.value = Math.SQRT1_2;

    /* Guadagno dell'anello dal T60 voluto — g = 10^(−3·ritardo/T60) — diviso
       per il picco REALE del filtro che sta nell'anello.

       Quella divisione è la condizione di stabilità, e non è teoria. Il
       passa-basso di Web Audio non si comporta come dice il manuale: la sua
       risposta arriva a 1,22 anche a Q basso, dove un Butterworth non
       dovrebbe superare l'unità. Moltiplicato per lo 0,94 dell'anello il giro
       sale a 1,15, e la rete invece di spegnersi cresce — misurato prima di
       accorgersene: la coda saliva a +600 dB in venti secondi. Il picco non
       si indovina, si chiede al filtro.                                   */
    const anello = ctx.createGain();
    anello.gain.value = Math.pow(10, -3 * (ms / 1000) / RIV_T60) / piccoDi(smorza);

    ingresso.connect(ritardo);
    ritardo.connect(smorza); smorza.connect(anello); anello.connect(ritardo);
    ritardo.connect(somma);
  }

  const unione = ctx.createChannelMerger(2);
  RIV_PASSATUTTO.forEach((coppia, canale) => {
    let nodo = somma;
    for (const ms of coppia) nodo = passatutto(nodo, ms, 0.5);
    nodo.connect(unione, 0, canale);
  });

  /* Un filo di continua, inudibile, iniettato negli anelli.

     Quando la coda svanisce, i valori che circolano nei ritardi scendono
     sotto il minimo dei numeri in virgola mobile normalizzati e diventano
     "denormali": su molti processori l'aritmetica su quei valori costa
     decine di volte tanto, e il costo compare proprio quando il riverbero
     dovrebbe essere silenzioso. Aggiungendo 10⁻¹⁵ i valori nell'anello non
     scendono mai sotto il normale. A −300 dB non lo sente nessuno.

     Chrome di suo azzera i denormali, quindi su molti dispositivi questo non
     serve; costa un nodo e toglie di mezzo il dubbio.                    */
  if (typeof ctx.createConstantSource === "function") {
    const semino = ctx.createConstantSource();
    semino.offset.value = 1e-15;
    semino.connect(ingresso);
    semino.start();
  }

  return { ingresso, uscita: unione };
}

/* Il guadagno massimo di un filtro, misurato sulla sua risposta reale.
   Mai sotto l'unità: serve a dividere, e dividere per meno di uno alzerebbe
   il guadagno dell'anello invece di abbassarlo.                           */
function piccoDi(filtro) {
  /* Il ripiego non è 1, ed è importante che non lo sia: con 1 il guadagno
     dell'anello non verrebbe ridotto affatto, il giro tornerebbe sopra
     l'unità e la rete divergerebbe. Se la misura non riesce si preferisce
     una coda un po' più corta a un riverbero che esplode.                */
  const PRUDENTE = 1.3;
  try {
    const N = 512, nyq = ctx.sampleRate / 2;
    const hz = new Float32Array(N), mag = new Float32Array(N), fase = new Float32Array(N);
    for (let i = 0; i < N; i++) hz[i] = 20 * Math.pow(nyq / 20, i / (N - 1));
    filtro.getFrequencyResponse(hz, mag, fase);
    let max = 0;
    for (let i = 0; i < N; i++) if (mag[i] > max) max = mag[i];
    return (isFinite(max) && max >= 1) ? max : PRUDENTE;
  } catch (e) { return PRUDENTE; }
}

/* Passa-tutto di Schroeder, nella forma canonica:

       v[n] = x[n] + g·v[n−M]
       y[n] = v[n−M] − g·v[n]

   La reazione in avanti parte da v, cioè dall'INGRESSO del ritardo, non da x.
   Prendendola da x — come faceva la prima stesura — il coefficiente sul
   termine ritardato diventa (1+g²) invece di 1, e il filtro smette di essere
   passa-tutto: colora il timbro e sbilancia i livelli. Sembra una sfumatura,
   e invece è la differenza fra diffondere e alterare.                     */
function passatutto(sorgente, ms, g) {
  const v       = ctx.createGain();               // il nodo di somma: x + g·v ritardato
  const ritardo = ctx.createDelay(0.1);
  ritardo.delayTime.value = ms / 1000;
  const anello  = ctx.createGain(); anello.gain.value  =  g;
  const diretto = ctx.createGain(); diretto.gain.value = -g;
  const uscita  = ctx.createGain();

  sorgente.connect(v);
  ritardo.connect(anello); anello.connect(v);     // anello: v riceve g·v(ritardato)
  v.connect(ritardo);
  ritardo.connect(uscita);                        // + v(ritardato)
  v.connect(diretto); diretto.connect(uscita);    // − g·v
  return uscita;
}

/* Ripartenza dei cicli.
   La zona attiva di ogni frase comincia in un punto qualsiasi della
   circonferenza, quindi la sua prima goccia potrebbe cadere molto avanti nel
   giro: all'apertura si resterebbe in silenzio per parecchi secondi. Qui ogni
   ciclo viene quindi posizionato all'indietro, in modo che la prima goccia
   arrivi entro un attimo — con ingressi comunque sfalsati, perché le quattro
   frasi non attacchino all'unisono.                                        */
function restartCycles() {
  if (!ctx) return;
  const now = ctx.currentTime;
  bookedUntil = 0;                // i vecchi cicli non esistono più

  loops.forEach((L, i) => avvia(L, now, 0.2 + i * 0.28 + Math.random() * 0.25));
  /* Le tenute entrano più tardi e più distanziate: sono uno sfondo, e uno
     sfondo che attacca insieme al primo piano non è uno sfondo.          */
  droni.forEach((L, i) => avvia(L, now, 1.5 + i * 1.1 + Math.random() * 0.8));

  /* Il primo ricambio è sfalsato di una frazione casuale del proprio tempo:
     partendo tutti da zero le otto linee si rinnoverebbero per la prima volta
     quasi insieme, e il ricambio si presenterebbe proprio nel momento in cui
     si sta ancora capendo che cosa si sta ascoltando.                     */
  sfalsaRicambio(loops, SPECIE_GOCCE,  now);
  sfalsaRicambio(droni, SPECIE_TENUTE, now);
}

function sfalsaRicambio(lista, sp, now) {
  lista.forEach((L, i) => { L.prossimoRicambio = now + sp.tempi[i] * (0.3 + Math.random() * 0.7); });
}

function avvia(L, now, entrata) {
  const firstPh = L.plan.length ? L.plan[0].ph : 0;
  L.cycleStart = now + entrata - firstPh * L.period;
  L.idx = 0;
  L.cycles = [{ start: L.cycleStart, period: L.period }];
}

/* --- quando la pagina non si vede -----------------------------------------
   In secondo piano il browser porta i timer da 25 ms a circa un secondo. Il
   thread audio invece non viene MAI rallentato: una goccia già prenotata
   suona con precisione al campione anche se il thread principale è congelato.

   Quindi la cura non è correre di più, è prenotare più avanti. Con la
   finestra a 150 ms e il timer a un secondo restano 850 ms scoperti a ogni
   giro, e le gocce in ritardo di oltre un quarto di secondo vengono scartate
   qui sotto: una simulazione dello scheduler ne ha misurate il 61% perse.
   Con tre secondi di margine non se ne perde nessuna.

   In primo piano la finestra torna stretta, perché è ciò che rende immediati
   i cursori: quel che è già prenotato non si può più cambiare.            */
const LOOKAHEAD_VISIBILE = 0.15, LOOKAHEAD_NASCOSTA = 3.0, LOOKAHEAD_MAX = 12.0;

/* Quando lo scheduler è passato l'ultima volta, sul clock audio. Serve a
   misurare quanto il sistema sta davvero strozzando i timer: tre secondi di
   margine bastano contro il rallentamento a un secondo di una scheda in
   secondo piano, ma non contro uno schermo bloccato, dove il thread può
   restare fermo molto più a lungo. La finestra si adatta al ritardo
   osservato invece di indovinarlo — e nel caso normale non cambia nulla,
   perché il ritardo è piccolo.                                            */
let ultimoGiro = 0;

document.addEventListener("visibilitychange", () => {
  LOOKAHEAD = document.hidden ? LOOKAHEAD_NASCOSTA : LOOKAHEAD_VISIBILE;
  if (!document.hidden) schedule();   // recupera subito, senza aspettare il timer
});

/* --- SCHEDULER ------------------------------------------------------------
   Ogni 25 ms guarda avanti quanto dice LOOKAHEAD e prenota gli eventi sul
   clock audio.                                                             */
function schedule() {
  if (!ctx || !running) return;
  const now = ctx.currentTime;

  /* A pagina nascosta la finestra insegue il ritardo vero, con un margine di
     sicurezza. Reattiva e non profetica: il primo ritardo lungo si paga
     comunque, ma dal secondo in poi la finestra lo copre.                 */
  if (document.hidden) {
    const ritardo = now - ultimoGiro;
    LOOKAHEAD = clamp(ritardo * 2.5, LOOKAHEAD_NASCOSTA, LOOKAHEAD_MAX);
  }
  ultimoGiro = now;

  /* Il tempo lungo avanza qui, e non nel ciclo di fotogrammi, per una ragione
     precisa: a pagina nascosta i fotogrammi si fermano del tutto mentre lo
     scheduler continua a girare. Se la deriva vivesse nel disegno, mettere
     l'app in secondo piano la congelerebbe — e si tornerebbe dopo mezz'ora
     esattamente dove la si era lasciata, cioè al difetto di Rada.         */
  avanzaDeriva(now);
  registraDeriva(now);

  const horizon = now + LOOKAHEAD;
  /* Solo in avanti: al ritorno in primo piano la finestra si stringe, ma le
     gocce prenotate con quella larga restano prenotate. Assegnare qui il
     nuovo orizzonte cancellerebbe proprio la memoria che serve. Il valore è
     assoluto, quindi invecchia da sé: appena `now` lo supera, il massimo
     qui sotto torna a essere la finestra corrente.                        */
  if (horizon > bookedUntil) bookedUntil = horizon;

  while (dropHistory.length && dropHistory[0].t < now - TIMELINE_SEC) dropHistory.shift();

  /* I cicli avanzano comunque, anche a classe spenta: così riaccendendola
     riparte da dov'era invece che da capo — la stessa promessa che la pausa
     fa già per l'intero strumento.                                       */
  prenota(loops, buildPlan,      suonaGoccia, now, horizon, gocceOn);
  prenota(droni, buildPlanDrone, suonaTenuta, now, horizon, tessutiOn);

  /* Il ricambio viene DOPO la prenotazione, non prima: così gli eventi appena
     consegnati al motore audio sono già dentro `bookedUntil`, e l'orizzonte
     che il ricambio consulta è quello vero. Invertendo i due, una goccia
     prenotata in questo stesso giro potrebbe essere riscritta subito dopo.

     Si ricambia anche a classe spenta, come i cicli avanzano a classe spenta:
     riaccendendola si ritrova un materiale invecchiato quanto il tempo
     passato, non quello di prima messo in frigo.                          */
  ricambiaClasse(loops, SPECIE_GOCCE,  now);
  ricambiaClasse(droni, SPECIE_TENUTE, now);

  rinnovaSuQuinta(now);
  normalizzaTessuti(now);
}

/* --- IL LIVELLO DEI TESSUTI ------------------------------------------------
   I tessuti suonano a un volume PRESTABILITO, e quel volume è della sezione,
   non della singola tenuta: che ne sia aperta una o quattro, lo sfondo pesa
   uguale.

   Prima non era così. Ogni tenuta portava il proprio volume e il motore audio
   le sommava, quindi la sezione si alzava a ogni sovrapposizione: con
   l'Intreccio alto lo sfondo saliva sopra le gocce, e la stessa musica
   suonava a volumi diversi a seconda di quante tenute si accavallavano in
   quell'istante. Un fondale che va e viene non è un fondale.

   Ora il volume sta sul bus e ogni tenuta porta solo un PESO relativo. Il bus
   divide per la RADICE del numero di tenute aperte, non per il numero: due
   sinusoidi di frequenza diversa sono scorrelate, quindi si sommano in
   potenza e non in ampiezza — quattro tenute fanno il doppio dell'ampiezza
   efficace, non il quadruplo, e dividere per quattro le renderebbe molto più
   silenziose di una sola.

   IL CONTO NON È UN CONTEGGIO ma la somma degli inviluppi normalizzati: una
   tenuta a un decimo del suo affioramento pesa un decimo. Contare le teste
   farebbe abbassare il bus di tre decibel nell'istante in cui una nuova
   tenuta comincia ad aprirsi — cioè quando ancora non si sente — e quella che
   suonava già farebbe un tuffo udibile.

   IL PAVIMENTO A UNO è la parte che tiene in piedi l'identità dei tessuti.
   Sotto una tenuta-equivalente il bus non alza nulla: una tenuta sola che
   affiora resta una tenuta sola che affiora, con la sua salita lenta intatta.
   Senza quel pavimento la normalizzazione la spingerebbe subito a volume
   pieno, e «nulla attacca, tutto affiora» smetterebbe di essere vero.       */
function livelloTessuti() {
  return 0.15 * (effD.liv / 100);
}

/* Quanto pesa una tenuta adesso, da 0 a 1: la sua stessa forma d'inviluppo,
   ricalcolata qui invece che chiesta al motore audio — che una AudioParam non
   la sa rileggere.                                                         */
function pesoTenuta(ev, t) {
  if (!(t >= ev.flash && t < ev.fino)) return 0;
  const dentro = t - ev.flash, restano = ev.fino - t;
  if (dentro  < ev.apri)   return dentro / ev.apri;
  if (restano < ev.chiudi) return restano / ev.chiudi;
  return 1;
}

let ultimoBus = -1;

function normalizzaTessuti(now) {
  if (!tessutiBus) return;
  let somma = 0;
  for (const L of droni)
    for (const p of L.plan) somma += pesoTenuta(p.ev, now);

  /* Il bersaglio NON dipende da `tessutiOn`: spegnendo la classe le tenute
     già prenotate continuano a dissolversi da sé, e portare il bus a zero le
     taglierebbe di netto invece di lasciarle chiudere.                     */
  const g = livelloTessuti() / Math.sqrt(Math.max(somma, 1));
  /* Solo se il bersaglio si è davvero mosso. Lo scheduler gira quaranta volte
     al secondo e per lunghi tratti — pianoro di una tenuta sola, o silenzio —
     il valore è identico: erano quaranta eventi al secondo infilati nella
     lista di automazione del parametro per non cambiare niente. Un
     mezzo per mille è 0,04 dB, ben sotto il percepibile — e il parametro
     continua comunque a scorrere verso l'ultimo bersaglio con la sua
     costante di tempo, quindi rinfrescarlo più di rado lo rende semmai più
     liscio, non a scatti.                                                 */
  if (Math.abs(g - ultimoBus) < g * 0.005) return;
  ultimoBus = g;
  /* Una costante di tempo di un quarto di secondo: rapida rispetto a un
     affioramento che dura secondi, lenta abbastanza da non fare scalini. */
  tessutiBus.gain.setTargetAtTime(g, now, 0.25);
}

/* --- il rinnovo alla modulazione -------------------------------------------
   In modo «deriva», al passo di quinta le idee si rifanno da capo: nuova
   tonalità, nuovo materiale. È la scala grossa del rinnovo, e sta accanto a
   quella fine del ricambio — fra una modulazione e l'altra la frase evolve
   una goccia per volta, alla modulazione cambia tutta.

   `regenerate` azzera l'indice, e da solo non basta: gli eventi già prenotati
   suonerebbero comunque, e quelli del piano nuovo si aggiungerebbero nella
   stessa finestra. A pagina visibile sarebbero 150 ms di sovrapposizione, ma
   a schermo bloccato la finestra arriva a dodici secondi e si sentirebbe una
   raffica. `riposizionaIdx` sull'orizzonte sicuro è la stessa medicina che
   usano `rebuildPlans` e il ricambio.                                      */
function rinnovaSuQuinta(now) {
  if (!quintaScattata) return;
  quintaScattata = false;
  const horizon = orizzonteSicuro(now);
  if (MODI.gocce === "deriva")
    loops.forEach(L => { regenerate(L); riposizionaIdx(L, horizon); });
  if (MODI.tessuti === "deriva")
    droni.forEach(L => { regeneraTenute(L); riposizionaIdx(L, horizon); });
}

function ricambiaClasse(lista, sp, now) {
  /* In modo «ancora» il materiale non si tocca: è la promessa del modo. */
  if (MODI[sp.classe] !== "deriva") return;
  lista.forEach(L => {
    if (now < L.prossimoRicambio) return;
    /* Il ±15% non è cosmetico: senza, i tempi resterebbero esatti e due linee
       con periodi vicini finirebbero per ricambiarsi in coppia a lungo.   */
    if (ricambia(L, now, sp)) L.prossimoRicambio = now + sp.tempi[L.i] * (0.85 + Math.random() * 0.3);
  });
}

/* Il cuore dello scheduler, uguale per le gocce e per le tenute: le due classi
   differiscono per come si costruisce il piano e per come si suona un evento,
   non per come si prenota. Tenerlo in un posto solo evita che le due copie
   divergano — ed è già successo, in questo progetto, con altre due copie.  */
function prenota(lista, costruisciPiano, suona, now, horizon, attiva) {
  lista.forEach(L => {
    let guard = 0;
    while (guard++ < 300) {

      if (L.idx >= L.plan.length) {          // ciclo concluso → giro successivo
        L.cycleStart += L.period;
        L.period = L.target;                 // la nuova durata entra qui
        /* Lo scheduler corre avanti rispetto all'ascolto, quindi il disegno
           non può usare cycleStart/period: descrivono il ciclo in
           pianificazione, non quello udibile. La coda conserva
           l'informazione esatta per la lancetta.                          */
        L.cycles.push({ start: L.cycleStart, period: L.period });
        if (L.cycles.length > 8) L.cycles.shift();
        costruisciPiano(L);
        L.idx = 0;
        if (L.cycleStart > horizon) break;
        continue;
      }

      const p = L.plan[L.idx];
      const t = L.cycleStart + p.ph * L.period;
      if (t >= horizon) break;

      /* PERIODO REFRATTARIO: lo stesso evento non torna prima di mezzo giro.

         L'orizzonte da solo bastava a Rada, dove le fasi si ricalcolavano
         quasi mai: l'addensamento cambiava solo mentre l'utente trascinava un
         cursore. Qui la deriva lo muove di continuo, e `buildPlan` ricalcola
         le fasi con l'addensamento DI ADESSO. Ne seguono due guai, che la
         simulazione ha trovato in quest'ordine:

         — una goccia già emessa scivola oltre l'orizzonte, `riposizionaIdx`
           la ritrova e la riprenota (Δ ≈ 10 ms);
         — una goccia in fondo al giro scavalca la fine e rientra in testa a
           quello dopo, così suona due volte a cavallo del confine (Δ ≈ 6 ms).

         Nessuno dei due si sente come un raddoppio: si sentono come un colpo
         sporco. Contare i giri copriva solo il primo — il secondo cade
         onestamente in due giri diversi. Il tempo trascorso li copre
         entrambi, ed è una cosa sola da mantenere invece di due.

         `flash` è già il momento dell'ultima emissione, e lo scrivono
         entrambe le classi: non serve un campo nuovo. Il ricambio lo riporta
         a −99 quando sostituisce un evento, ed è giusto — quella è un'altra
         goccia, e ha diritto di suonare subito.                           */
      if (attiva && !L.muted && t >= now - 0.25 && t - p.ev.flash > L.period * 0.5) {
        /* Un evento lievemente in ritardo (scatto di frame) si suona subito
           invece di perderlo. Oltre il quarto di secondo è obsoleto — per
           esempio una scheda tornata in primo piano — e va scartato,
           altrimenti se ne scaricherebbero decine tutti insieme.          */
        suona(Math.max(t, now), p.ev, L);
      }
      L.idx++;
    }
  });
}

function suonaGoccia(at, ev, L) {
  playDrop(at, ev, L);
  ev.flash = at;
  dropHistory.push({ t: at, loop: L.i });
}

function suonaTenuta(at, ev, L) {
  const dur = playTone(at, ev, L);
  ev.flash = at;
  ev.fino  = at + dur;
}

/* --- VOCE: una goccia -----------------------------------------------------
   Sintesi FM morbida: portante + modulante a rapporto armonico basso, più un
   filo di parziale "campana" scordata dell'1% per un battimento lento.
   L'inviluppo ha attacco brevissimo e coda lunga.                          */
function playDrop(when, ev, L) {
  const spread = effG.spread / 100;   // registro già inclinato dalla deriva
  const warmth = effWarmth;                 // calore già inclinato dall'ora
  /* L'altezza la sceglie la deriva: il campo è fermo e intonato, a scorrere è
     il baricentro attorno a cui si pesca. Le due classi passano dallo stesso
     helper, così il registro non può divergere fra primo piano e sfondo.  */
  const freq = altezza(ev.rel, spread);

  const car = ctx.createOscillator();
  car.type = "sine"; car.frequency.value = freq;

  const mod = ctx.createOscillator();
  mod.type = "sine"; mod.frequency.value = freq * (warmth > 0.5 ? 2 : 3);
  const modGain = ctx.createGain();
  modGain.gain.value = freq * (0.6 - warmth * 0.45);
  mod.connect(modGain); modGain.connect(car.frequency);

  /* Il parziale "campana" si spegne da sé man mano che il calore sale: oltre
     una certa soglia il suo guadagno è sotto la soglia dell'udibile, e
     accendere un oscillatore per nulla costa quanto accenderne uno che si
     sente. Con i mood caldi è un terzo delle voci risparmiato.            */
  const parAmp = (1 - warmth) * 0.11;
  let par = null, parGain = null;
  if (parAmp > 0.004) {
    par = ctx.createOscillator();
    par.type = "sine"; par.frequency.value = freq * 2.01;
    parGain = ctx.createGain();
    parGain.gain.value = parAmp;
  }

  const env = ctx.createGain();
  env.gain.value = 0;
  const peak = 0.15 * ev.vel;
  const rel = 1.9 + warmth * 2.8;
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(peak, when + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0008, when + rel);

  const pan = ctx.createStereoPanner();
  pan.pan.value = clamp(L.pan + (Math.random() * 2 - 1) * 0.18, -1, 1);

  car.connect(env);
  if (par) { par.connect(parGain); parGain.connect(env); }
  env.connect(pan); pan.connect(filt);

  const stop = when + rel + 0.1;
  car.start(when); car.stop(stop);
  mod.start(when); mod.stop(stop);
  if (par) { par.start(when); par.stop(stop); }

  /* Sette nodi per goccia, e finché restano collegati il thread audio continua
     a percorrerli. Il rilascio automatico però dipende dalla raccolta della
     memoria, che è attività del thread PRINCIPALE — proprio quello che a
     schermo bloccato viene strozzato. Il risultato è che il grafo cresce più
     in fretta di quanto venga ripulito: prima frusciano i buffer, poi saltano,
     infine il suono crolla. Scollegare a mano rende il rilascio immediato e
     non più soggetto a quando il thread principale trova tempo.           */
  car.onended = () => {
    car.disconnect(); mod.disconnect(); modGain.disconnect();
    if (par) { par.disconnect(); parGain.disconnect(); }
    env.disconnect(); pan.disconnect();
  };
}

/* --- VOCE: una tenuta -------------------------------------------------------
   Due sinusoidi appena scordate fra loro. Il battimento che ne nasce — lento,
   qualche ciclo al secondo — è tutta la vita che serve a un suono che deve
   restare fermo a lungo: senza, una tenuta è un tono di prova.

   L'inviluppo è l'opposto di quello delle gocce: apertura lentissima, un
   lungo pianoro, chiusura altrettanto lenta. Nulla attacca, tutto affiora.

   Passa dalla stessa catena delle gocce — filtro e riverbero — quindi eredita
   la palette oraria e lo spazio senza nodi propri.                        */
function playTone(when, ev, L) {
  const spread = effD.spread / 100;
  /* L'altezza la sceglie la deriva: il campo è fermo e intonato, a scorrere è
     il baricentro attorno a cui si pesca. Le due classi passano dallo stesso
     helper, così il registro non può divergere fra primo piano e sfondo.  */
  const freq = altezza(ev.rel, spread);

  const dur = clamp(ev.dur * L.period, 2.5, 90);

  /* Lo scarto fra le due voci è ADDITIVO, non proporzionale: due sinusoidi
     distanti d hertz battono a d hertz, qualunque sia la loro altezza. Con
     uno scarto proporzionale — come era prima — i toni gravi avrebbero
     battuto molto più lenti degli acuti, e uno slider chiamato "battito" non
     avrebbe mantenuto la promessa.                                        */
  const a = ctx.createOscillator(); a.type = "sine"; a.frequency.value = freq;
  const b = ctx.createOscillator(); b.type = "sine"; b.frequency.value = freq + effD.battito;

  const env = ctx.createGain();
  env.gain.value = 0;
  /* Il picco della singola tenuta è ora un PESO RELATIVO, non un volume: dice
     solo quanto questa pesa rispetto alle sue sorelle. Il volume della
     sezione lo decide il bus, una volta per tutte.                        */
  const picco = ev.vel;

  /* Apertura e chiusura non possono sommarsi a più della durata, altrimenti
     la tenuta non raggiunge mai il suo livello.                           */
  let apri = effD.apri, chiudi = effD.chiudi;
  const eccesso = (apri + chiudi) / (dur * 0.9);
  if (eccesso > 1) { apri /= eccesso; chiudi /= eccesso; }

  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(picco, when + apri);
  env.gain.setValueAtTime(picco, when + dur - chiudi);
  env.gain.linearRampToValueAtTime(0, when + dur);

  /* L'affioramento e la dissolvenza EFFETTIVI, dopo l'eventuale correzione
     qui sopra: li rilegge `normalizzaTessuti` per sapere a che punto è
     ciascuna tenuta senza doverlo chiedere al motore audio.               */
  ev.apri = apri;
  ev.chiudi = chiudi;

  const pan = ctx.createStereoPanner();
  pan.pan.value = clamp(L.pan + (Math.random() * 2 - 1) * 0.12, -1, 1);

  a.connect(env); b.connect(env);
  env.connect(pan); pan.connect(tessutiBus);

  const stop = when + dur + 0.05;
  a.start(when); a.stop(stop);
  b.start(when); b.stop(stop);

  /* Come per le gocce: scollegare a mano, che il rilascio automatico dipende
     dal thread principale (vedi CLAUDE.md).                               */
  a.onended = () => { a.disconnect(); b.disconnect(); env.disconnect(); pan.disconnect(); };

  return dur;
}

/* --- modulazione lenta ----------------------------------------------------
   Chiamata a ogni fotogramma da `disegna`: smussa i parametri e applica la
   palette oraria. Gira anche a motore spento, così i cursori rispondono
   subito.                                                                  */
/* La smussatura è per FOTOGRAMMA, quindi dipende dalla cadenza: passando da
   sessanta a trenta al secondo servono passi doppi, o i cursori si
   muoverebbero alla metà della velocità di prima. Il conto è (1−a)² per il
   vecchio a: 1 − 0,94² = 0,1164.                                          */
const SMUSSO = 0.1164;

/* Gli ultimi bersagli mandati al motore audio. `setTargetAtTime` non è
   gratis — ogni chiamata inserisce un evento nella lista di automazione del
   parametro — e qui ne partivano tre a ogni fotogramma anche quando i valori
   non si muovevano di un millesimo, cioè quasi sempre. */
let ultimoTaglio = -1, ultimoWet = -1, ultimoDry = -1;

function tickParams() {
  for (const k in GT) G[k] += (GT[k] - G[k]) * SMUSSO;

  /* Prima i valori efficaci, poi tutto il resto: da qui in giù nessuno deve
     più guardare i cursori nudi. */
  effettiviGlobali();

  /* Se l'addensamento EFFICACE è cambiato — per mano dell'utente o per deriva —
     ricolloca le gocce senza risuonare quelle già emesse. La soglia di 0,3
     serve adesso anche a un secondo scopo: la deriva muove `head` di continuo
     e senza soglia si ricostruirebbero quattro piani a ogni fotogramma.    */
  if (Math.abs(effG.head - lastHead) > 0.3) {
    lastHead = effG.head;
    rebuildPlans(ctx ? ctx.currentTime : null);
  }

  const pal = currentPalette;
  effWarmth = clamp(G.warmth + pal.warmBias,  0, 100) / 100;
  effRev    = clamp(G.rev    + pal.spaceBias, 0, 100) / 100;

  /* e per l'altra classe, l'inclinazione della stagione */
  effettiviTessuti();

  if (!ctx) return;
  const openness = clamp(45 + pal.toneBias, 0, 100);
  const taglio = 600 * Math.pow(16, openness / 100);
  const wet = 0.32 + effRev * 0.55;
  const dry = 0.75 - effRev * 0.25;
  /* Le soglie sono sotto il percepibile — un hertz sul taglio, un millesimo
     sui due guadagni — quindi non si perde nessun movimento: si smette solo
     di ripetere al motore audio un bersaglio che ha già.                  */
  const now = ctx.currentTime;
  if (Math.abs(taglio - ultimoTaglio) > 1)    { ultimoTaglio = taglio; filt.frequency.setTargetAtTime(taglio, now, 0.5); }
  if (Math.abs(wet - ultimoWet) > 0.001)      { ultimoWet = wet;       wetGain.gain.setTargetAtTime(wet, now, 0.6); }
  if (Math.abs(dry - ultimoDry) > 0.001)      { ultimoDry = dry;       dryGain.gain.setTargetAtTime(dry, now, 0.6); }
}

/* --- avvio / pausa --------------------------------------------------------
   La pausa non azzera nulla: dopo una breve dissolvenza ferma il clock del
   motore audio. Fermandolo, tutti i tempi già prenotati restano coerenti, e
   alla ripresa il collage riparte esattamente da dov'era invece di
   ricominciare da capo. È ciò che la parola "pausa" promette.             */
let sospensione = null;

/* Porta il motore in accordo con le due classi. Nessuno decide qui COSA deve
   suonare: si limita a constatare se qualcosa deve.                       */
async function applicaStato() {
  const vuole = gocceOn || tessutiOn;
  if (vuole !== running) {
    if (vuole) {
      clearTimeout(sospensione);
      if (ctx.state === "suspended") { try { await ctx.resume(); } catch (e) {} }
      running = true;
      dichiaraSessioneDiRiproduzione();   // la categoria si riafferma alla ripresa
      master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    } else {
      running = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      clearTimeout(sospensione);
      sospensione = setTimeout(() => {
        if (!running && ctx.state === "running") ctx.suspend();
      }, 900);
    }
  }
  onPowerChange();
  statoMediaSession();
}

/* Il pulsante di un riquadro: governa la sua classe e nient'altro. */
async function toggleClasse(quale) {
  if (!ctx) buildAudio();
  if (quale === "gocce") gocceOn = !gocceOn; else tessutiOn = !tessutiOn;
  await applicaStato();
}

/* Il comando globale: barra spaziatrice, soglia d'ingresso, pannello di
   sistema. Se qualcosa sta suonando spegne tutto, altrimenti accende tutto. */
async function togglePower() {
  if (!ctx) buildAudio();
  const acceso = gocceOn || tessutiOn;
  gocceOn = tessutiOn = !acceso;
  await applicaStato();
}

/* tempo audio corrente, 0 se il motore non esiste ancora */
function audioNow() { return ctx ? ctx.currentTime : 0; }
