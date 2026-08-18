/* =============================================================================
   RADA2 · disegno.js — il reticolo e la fascia di deriva

   Sostituisce frasi.js e droni.js, e con loro l'idea che le otto linee siano
   otto quadranti. Qui sono OTTO ANELLI CONCENTRICI di un solo strumento: le
   quattro frasi all'interno, i quattro tessuti all'esterno, un centro solo.
   È la conseguenza visiva di ciò che il suono fa da sempre — otto periodi
   che si sfasano fra loro, non due gruppi da quattro — e rende finalmente
   visibile il collage, che accade FRA le linee e che otto isole non potevano
   mostrare.

   Sul bordo, il tempo lungo: dodici tacche per il circolo delle quinte con
   la posizione corrente marcata, e un arco pesante che rolla lentissimo con
   la tonica — un giro intero è un'ottava. Sotto, la fascia: gli ultimi
   trenta secondi di tutte le otto linee, e la corsia lunga dove la tonica
   sedimenta la sua traiettoria sull'ultima mezz'ora.

   IL CANVAS NON ASCOLTA NULLA. In Rada era una superficie di comando, con
   otto riquadri trasparenti a governare `touch-action` e un doppio binario
   di comandi nativi fuori campo per chi non usa il puntatore. Qui gli anelli
   concentrici sarebbero bersagli impossibili per un dito — e il doppio
   binario è diventato il binario: i comandi nativi sono visibili, nelle due
   colonne accanto al reticolo, e la tela è puro display. Con questo cade
   tutta la meccanica dei dialZone, e la pagina scorre da sé.

   Disegnato con l'API 2D nativa, proporzioni in frazioni del raggio, palette
   letta dalle variabili CSS: le regole di sempre. Il ciclo di fotogrammi è
   uno solo, e niente allocazioni dentro `disegna`.
============================================================================= */

/* --- geometria del reticolo, in frazioni del raggio esterno R ------------- */
const ANELLI_FRASI   = [0.30, 0.38, 0.46, 0.54];   // dall'interno
const ANELLI_TESSUTI = [0.66, 0.74, 0.82, 0.90];   // il vuoto fra 0,54 e 0,66
                                                   // separa le due classi
const R_QUINTE_IN  = 0.965, R_QUINTE_OUT = 1.0;    // le dodici tacche
const R_TONICA     = 1.055;                        // l'arco pesante, fuori da tutto
const TONICA_SPAN  = Math.PI / 3.2;                // ampiezza dell'arco
/* I due archi di misura stanno PIÙ FUORI del baricentro, e non è una
   preferenza: il baricentro rolla fino a 127 gradi dal nord, cioè entra nei
   quadranti bassi, e alla stessa quota gli passerebbe sopra proprio quando il
   pezzo è agli estremi. Un raggio diverso li tiene separati sempre.       */
const R_MISURA     = 1.13;
/* I due archi sono CENTRATI sulle diagonali — sud-est e sud-ovest — e da lì
   crescono nei due versi insieme. Al massimo coprono il proprio quadrante,
   meno due gradi per estremo: quello stacco tiene separati i due archi sul
   sud, dove altrimenti si toccherebbero a cursori pieni leggendosi come un
   segno solo spezzato in due colori, e li tiene staccati anche da est e da
   ovest, così restano due segni chiusi invece di due quarti di cerchio.  */
const MISURA_PIEDE = Math.PI / 90;                 // due gradi
const MISURA_MEZZA = Math.PI / 4 - MISURA_PIEDE;   // semi-apertura massima
const MISURA_SE    = Math.PI / 4;                  // il centro di sud-est
const MISURA_SO    = Math.PI * 3 / 4;              // e quello di sud-ovest
const LINK_WINDOW  = 0.18;   // scarto massimo, in secondi, fra due gocce "vicine"
/* Quanto dura un lampo, in secondi. Un solo numero per tutti gli attacchi —
   le gocce, il centro, l'anello dei tessuti — perché sono lo stesso segno
   detto in posti diversi, e tre valori diversi li farebbero sembrare tre
   fenomeni. Vale anche per i tessuti, il cui attacco è lento: il lampo non
   dice «quanto ci mette ad aprirsi», dice «se n'è appena aperto uno».     */
const LAMPO = 0.45;

let COL = {};                // palette letta dal CSS
let holder = null, cvEl = null, cv2d = null;

/* Strutture riusate a ogni fotogramma: niente allocazioni dentro `disegna`. */
const SIZE = { w: 0, h: 0, ret: 0, stripH: 0 };
const HOT_MAX = 96;
const hotPool = Array.from({ length: HOT_MAX }, () => ({ x: 0, y: 0, t: 0, loop: 0 }));
let hotCount = 0;

/* LA tenuta più recente fra tutt'e quattro le linee: una sola in tutta la
   pagina, non una per linea. È l'ultimo tessuto entrato, quello che si è
   appena aggiunto alla trama, e l'arancione dice esattamente quello.

   Il tetto dell'accento scende così da quattro archi a UNO. Con quattro —
   uno per linea — l'arancione arrivava al 58% della circonferenza degli
   anelli esterni; con uno resta il segno raro che il progetto vuole, e
   guadagna un significato più preciso: non «queste stanno suonando» ma
   «questa è appena entrata».

   Le linee SILENZIATE non concorrono, e non è un dettaglio: la più recente
   in assoluto potrebbe cadere su una linea muta, prendersi l'arancione e
   lasciare la pagina senza acceso mentre qualcosa suona davvero. Vale anche
   a classe spenta — se i tessuti sono in pausa non c'è nessuna più recente.

   La calcola `aggiornaCorrente` una volta per fotogramma, e la leggono in
   due: l'anello, per decidere quale arco è arancione, e la guida, per sapere
   di quale tenuta mostrare l'avanzamento in arancione. Devono parlare della
   stessa, o le due letture dello stesso suono mentirebbero.               */
let corrente = null;

/* Vero nei LAMPO secondi che seguono l'apertura di un tessuto qualsiasi. Lo
   legge il mirino: il punto al centro lampeggia per le gocce, l'anello che lo
   circonda per i tessuti. Due classi, due segni concentrici nello stesso
   punto — il cuore comune delle otto linee — e da lì si sente arrivare tutto
   senza guardare da nessun'altra parte.

   Si calcola qui e non nel disegno perché la scansione delle otto linee è già
   questa: farne una seconda per la stessa domanda sarebbe lavoro doppio a
   ogni fotogramma.                                                        */
let tessutoAppena = false;

function aggiornaCorrente(now) {
  corrente = null;
  tessutoAppena = false;
  if (!tessutiOn) return;
  for (const L of droni) {
    if (L.muted) continue;
    for (const p of L.plan) {
      const ev = p.ev;
      if (!(now >= ev.flash && now < ev.fino)) continue;
      if (now - ev.flash < LAMPO) tessutoAppena = true;
      if (!corrente || ev.flash > corrente.flash) corrente = ev;
    }
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const fontPila = () =>
  '"Helvetica Neue", -apple-system, system-ui, Roboto, Arial, ' +
  '"Hiragino Sans", "Yu Gothic", "Noto Sans CJK JP", sans-serif';

function setupTela() {
  holder = document.getElementById("canvas-holder");
  if (!holder) return;
  cvEl = document.createElement("canvas");
  holder.appendChild(cvEl);
  cv2d = cvEl.getContext("2d");
  readPalette();
}

function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = n => cs.getPropertyValue(n).trim();
  COL = {
    ink:   v("--ink"),
    ink2:  v("--ink-2"),
    dust:  v("--dust"),
    hair:  v("--hair"),
    amber: v("--amber"),
  };
}

/* Il reticolo è un quadrato largo quanto il contenitore concede, la fascia
   una striscia sotto, della stessa larghezza.                              */
function canvasSize() {
  const avail = holder ? holder.clientWidth : 320;
  SIZE.ret    = Math.min(avail, 560);
  SIZE.stripH = clamp(SIZE.ret * 0.34, 120, 190);
  SIZE.w      = SIZE.ret;
  SIZE.h      = SIZE.ret + SIZE.stripH;
  return SIZE;
}

/* ---------------------------------------------------------------------------
   IL CICLO. Un solo `requestAnimationFrame` per tutta la pagina, sessanta
   fotogrammi al secondo quando il motore gira e dodici quando è fermo. Le
   soglie stanno appena SOTTO il periodo voluto — 1/61 e 1/13, non 1/60 e
   1/12: i fotogrammi arrivano a passi discreti e una soglia esatta verrebbe
   mancata per frazioni di millisecondo, dimezzando il ritmo (misurato).    */
const PASSO_VIVO  = 1000 / 61;
const PASSO_FERMO = 1000 / 13;
let ultimoFotogramma = 0;

function ciclo(ms) {
  requestAnimationFrame(ciclo);
  if (ms - ultimoFotogramma < (running ? PASSO_VIVO : PASSO_FERMO)) return;
  ultimoFotogramma = ms;
  disegna();
}

function disegna() {
  tickParams();                 // smussa i parametri e applica le palette
  if (!cv2d) return;
  const s = canvasSize();

  /* Il rapporto fra pixel del dispositivo e pixel CSS: senza, su uno schermo
     ad alta densità il disegno esce sfocato.                               */
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (cvEl.width !== Math.round(s.w * dpr) || cvEl.height !== Math.round(s.h * dpr)) {
    cvEl.width  = Math.round(s.w * dpr);
    cvEl.height = Math.round(s.h * dpr);
    cvEl.style.width  = s.w + "px";
    cvEl.style.height = s.h + "px";
  }
  cv2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  cv2d.clearRect(0, 0, s.w, s.h);
  cv2d.textAlign = "center";
  cv2d.textBaseline = "middle";

  const now = audioNow();
  hotCount = 0;
  aggiornaCorrente(now);
  drawReticolo(s, now);
  drawFascia(s, now);
}

/* ---------------------------------------------------------------------------
   IL RETICOLO
--------------------------------------------------------------------------- */
function drawReticolo(s, now) {
  const g = cv2d;
  const cx = s.ret / 2, cy = s.ret / 2;
  const R = s.ret / 2 * 0.84;    // il margine ospita l'arco della tonica

  g.save();
  g.lineCap = "butt";

  /* La croce diagonale, sottilissima: il telaio su cui gli anelli poggiano.
     Parte da fuori il centro e si ferma sotto le tacche delle quinte, così
     non tocca né il mirino né il bordo.                                    */
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath();
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + k * Math.PI / 2;
    g.moveTo(cx + Math.cos(a) * R * 0.10, cy + Math.sin(a) * R * 0.10);
    g.lineTo(cx + Math.cos(a) * R * 0.94, cy + Math.sin(a) * R * 0.94);
  }
  g.stroke();

  /* Il circolo delle quinte: dodici tacche sul bordo, la corrente marcata.
     `quinta` cresce senza tetto — il modulo la riporta sul quadrante, i
     giri interi li racconta il contatore nella testata.                    */
  for (let k = 0; k < 12; k++) {
    const corrente = k === ((quinta % 12) + 12) % 12;
    const a = -Math.PI / 2 + k * Math.PI * 2 / 12;
    g.strokeStyle = corrente ? COL.amber : COL.hair;
    g.lineWidth = corrente ? 2 : 1;
    const r0 = (corrente ? R_QUINTE_IN - 0.015 : R_QUINTE_IN) * R;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0,               cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * R_QUINTE_OUT * R, cy + Math.sin(a) * R_QUINTE_OUT * R);
    g.stroke();
  }

  /* L'arco pesante del baricentro, fuori da tutto: rolla attorno al nord
     seguendo il punto attorno a cui le altezze vengono pescate — a destra il
     pezzo sta alto, a sinistra sta basso. È il segno più lento della pagina,
     la deriva resa visibile come un corpo che si sposta invece che come un
     numero che cambia.

     Prima qui c'era la tonica, che scivolava di ±350 centesimi. Da quando
     l'accordatura è fissa quello scarto è sempre zero, e il movimento
     continuo si è trasferito nel baricentro: l'arco ha cambiato significato
     senza cambiare aspetto.                                               */
  const aTon = -Math.PI / 2 + derivaCentro() * Math.PI * 0.55;
  g.strokeStyle = COL.ink;
  g.lineWidth = Math.max(2.5, R * 0.022);
  g.beginPath();
  g.arc(cx, cy, R_TONICA * R, aTon - TONICA_SPAN / 2, aTon + TONICA_SPAN / 2);
  g.stroke();

  /* I DUE ARCHI DI MISURA, ai piedi del reticolo.

     Non raccontano un evento ma una quantità: quanto è largo il ventaglio
     delle altezze da cui ciascuna classe pesca. Le gocce a sud-est in
     arancione, i tessuti a sud-ovest in inchiostro; tutti e due partono dal
     basso e crescono verso il proprio lato, così si specchiano attorno
     all'asse verticale come si specchiano le due colonne di comandi.

     Sotto ciascuno resta la guida tenue del quadrante intero: senza, a
     cursore quasi chiuso l'arco sparirebbe e non si saprebbe più dove
     guardare né quanto manca al massimo.

     Leggono il valore EFFICACE, non la posizione del cursore — `effG.spread`
     e `effD.spread` — perché è quello che sta davvero suonando: il cursore li
     muove, ma li muovono anche la deriva e la stagione, e mostrare il cursore
     nudo sarebbe mostrare una cosa che non si sente.                      */
  arcoMisura(g, cx, cy, R, effG.spread / 100, COL.amber, MISURA_SE, gocceOn);
  arcoMisura(g, cx, cy, R, effD.spread / 100, COL.ink,   MISURA_SO, tessutiOn);

  /* Gli otto anelli. Le frasi dentro, i tessuti fuori: le gocce sono tacche
     radiali, i tessuti archi — un istante attraversa l'anello, una durata lo
     percorre.                                                              */
  for (let i = 0; i < loops.length; i++)
    drawAnelloFrase(g, loops[i], cx, cy, ANELLI_FRASI[i] * R, R, now);
  for (let i = 0; i < droni.length; i++)
    drawAnelloTessuto(g, droni[i], cx, cy, ANELLI_TESSUTI[i] * R, R, now);

  drawLinks(g, now);

  /* IL MIRINO: due segni concentrici per le due classi, nel punto in cui le
     otto linee si incontrano. Il punto al centro si accende con qualunque
     goccia; l'anello che lo circonda si accende quando un tessuto si apre.
     Sono i due attacchi dello strumento, letti in un posto solo.

     L'anello lampeggia e non resta acceso: la tenuta accesa è già raccontata
     dal suo arco sull'anello esterno, e qui interessa l'istante in cui
     entra — che altrimenti non avrebbe nessun segno, perché un tessuto si
     apre troppo lentamente perché l'orecchio ne colga il momento.        */
  g.strokeStyle = tessutoAppena ? COL.amber : COL.hair;
  g.lineWidth = tessutoAppena ? 2 : 1;
  g.beginPath();
  g.arc(cx, cy, R * 0.045, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = hotCount ? COL.amber : COL.hair;
  g.beginPath();
  g.arc(cx, cy, hotCount ? R * 0.020 : R * 0.012, 0, Math.PI * 2);
  g.fill();

  g.restore();
}

/* Un arco di misura: la guida del quadrante e, sopra, la parte piena. Cresce
   simmetrico attorno a `centro`, che è la diagonale del proprio quadrante —
   così il segno si apre come una forbice invece di scorrere da un capo, e a
   metà corsa sta a metà quadrante invece che a un quarto.

   Il tratto è più sottile di quello del baricentro: sul bordo convivono tre
   archi, e uno solo può essere il più pesante. Quello resta il baricentro,
   che è l'unico a dire dove è arrivato il pezzo.                          */
function arcoMisura(g, cx, cy, R, quota, colore, centro, accesa) {
  const r = R_MISURA * R;

  g.save();
  /* A classe spenta impallidisce come i suoi anelli: il valore c'è ancora,
     ma non sta governando niente che si senta.                           */
  g.globalAlpha = accesa ? 1 : 0.3;

  g.strokeStyle = COL.hair;
  g.lineWidth = 1;
  g.beginPath();
  g.arc(cx, cy, r, centro - MISURA_MEZZA, centro + MISURA_MEZZA);
  g.stroke();

  const q = clamp(quota, 0, 1);
  if (q > 0.004) {
    const mezza = MISURA_MEZZA * q;
    g.strokeStyle = colore;
    g.lineWidth = Math.max(2, R * 0.016);
    g.beginPath();
    g.arc(cx, cy, r, centro - mezza, centro + mezza);
    g.stroke();
  }
  g.restore();
}

/* L'etichetta di un anello: il numerale della linea, dal lato della sua
   colonna di comandi — le frasi a ovest, i tessuti a est. È il legame visivo
   fra la riga che si tocca e l'anello che si guarda.                       */
function etichettaAnello(g, testo, cx, cy, r, lato) {
  g.fillStyle = COL.dust;
  g.font = "400 " + Math.max(7, r * 0.05).toFixed(1) + "px " + fontPila();
  g.fillText(testo, cx + lato * r, cy - 7);
}

function drawAnelloFrase(g, L, cx, cy, r, R, now) {
  g.save();
  g.globalAlpha = (L.muted || !gocceOn) ? 0.3 : 1;

  /* guida: il cerchio intero, tenue */
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();

  /* la zona attiva: l'arco dove le gocce si addensano. Dal PIANO, non dal
     cursore: `planHead` è l'addensamento con cui il piano è stato costruito,
     e quel che si vede coincide con quel che suona.                        */
  const a0 = -Math.PI / 2 + L.offset * Math.PI * 2;
  g.strokeStyle = COL.ink;
  g.lineWidth = 1.6;
  g.beginPath(); g.arc(cx, cy, r, a0, a0 + L.planHead * Math.PI * 2); g.stroke();

  /* le gocce: tacche radiali attraverso l'anello. La LUNGHEZZA segue il
     registro — corta grave, lunga acuta — ed è così che il profilo melodico
     dell'idea si legge senza una dimensione radiale da spendere.           */
  g.lineCap = "round";
  for (const p of L.plan) {
    const a = -Math.PI / 2 + p.ph * Math.PI * 2;
    const dt = now - p.ev.flash;
    const hot = dt >= 0 && dt < LAMPO;
    const mezza = lerp(0.014, 0.042, (p.ev.rel + 1) / 2) * R * (hot ? 1.35 : 1);
    const ux = Math.cos(a), uy = Math.sin(a);
    g.strokeStyle = hot ? COL.amber : COL.ink;
    g.lineWidth = hot ? 2.4 : 1.5;
    g.beginPath();
    g.moveTo(cx + ux * (r - mezza), cy + uy * (r - mezza));
    g.lineTo(cx + ux * (r + mezza), cy + uy * (r + mezza));
    g.stroke();
    if (hot && hotCount < HOT_MAX) {
      const o = hotPool[hotCount++];
      o.x = cx + ux * r; o.y = cy + uy * r; o.t = p.ev.flash; o.loop = L.i;
    }
  }
  g.lineCap = "butt";

  /* l'indicatore di fase: un punto che percorre l'anello. Legge dalla coda
     dei cicli udibili, mai da cycleStart — lo scheduler corre avanti.      */
  if (ctx && running && gocceOn && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -Math.PI / 2 + clamp((now - c.start) / c.period, 0, 1) * Math.PI * 2;
    g.fillStyle = COL.amber;
    g.beginPath();
    g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(2, R * 0.011), 0, Math.PI * 2);
    g.fill();
  }

  etichettaAnello(g, CANVAS.linea[L.i], cx, cy, r, -1);
  g.restore();
}

function drawAnelloTessuto(g, L, cx, cy, r, R, now) {
  g.save();
  const spento = L.muted || !tessutiOn;
  g.globalAlpha = spento ? 0.3 : 1;

  /* guida tenue, come per le frasi: qui non c'è zona attiva da distinguere —
     le tenute si distribuiscono su tutto il giro.                          */
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();

  /* gli archi: ognuno copre la porzione di giro in cui la tenuta è aperta.
     Tre stati. Una tenuta che suona è spessa il doppio per tutto il tempo in
     cui suona, ma l'arancione lo prende SOLO LA PIÙ RECENTE della linea: le
     altre ancora aperte restano inchiostro pieno.

     È la misura fra due esigenze. Tenere acceso tutto ciò che suona
     riempirebbe di accento i quattro anelli esterni — misurato al 71% della
     circonferenza con l'Intreccio appena sopra l'uno, e verso la saturazione
     alzandolo; lasciare un lampo di mezzo secondo, com'era prima, non diceva
     nulla su che cosa stia suonando adesso. Una per linea dice quante linee
     sono attive e quale suono è entrato per ultimo, e costa quattro archi.  */
  for (const p of L.plan) {
    const ev = p.ev;
    const suona = now >= ev.flash && now < ev.fino;
    const recente = ev === corrente;
    const a0 = -Math.PI / 2 + p.ph * Math.PI * 2;
    g.strokeStyle = recente ? COL.amber : suona ? COL.ink : COL.ink2;
    /* Tratto in pixel assoluti, non in frazioni del raggio: sul reticolo R è
       quattro volte quello dei vecchi quadranti, e la vecchia frazione
       trasformava gli archi in fasce nere che coprivano tutto. Doppio
       mentre suona: il colore dice QUALI stanno suonando, lo spessore lo
       ribadisce a chi non distingue bene i colori.                        */
    g.lineWidth = suona ? Math.max(3, R * 0.014) : 1;
    g.globalAlpha = (spento ? 0.3 : 1) * (suona ? 1 : 0.5);
    g.beginPath();
    g.arc(cx, cy, r, a0, a0 + clamp(ev.dur, 0.02, 1) * Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = spento ? 0.3 : 1;

  /* l'indicatore di fase, dalla coda dei cicli udibili */
  if (ctx && running && tessutiOn && !L.muted && L.cycles.length) {
    while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
      L.cycles.shift();
    const c = L.cycles[0];
    const a = -Math.PI / 2 + clamp((now - c.start) / c.period, 0, 1) * Math.PI * 2;
    g.fillStyle = COL.amber;
    g.beginPath();
    g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(2, R * 0.011), 0, Math.PI * 2);
    g.fill();
  }

  etichettaAnello(g, CANVAS.linea[L.i], cx, cy, r, +1);
  g.restore();
}

/* Legami effimeri: quando due gocce di frasi DIVERSE suonano quasi insieme,
   un filo le unisce e sfuma con loro. Sul reticolo unico il filo attraversa
   gli anelli — è il collage còlto sul fatto. Legge le posizioni raccolte in
   hotPool in questo stesso fotogramma: nessun nuovo array.                 */
function drawLinks(g, now) {
  g.save();
  g.lineCap = "round";
  g.strokeStyle = COL.amber;
  g.lineWidth = 1;
  for (let i = 0; i < hotCount; i++) {
    for (let j = i + 1; j < hotCount; j++) {
      const a = hotPool[i], b = hotPool[j];
      if (a.loop === b.loop) continue;
      const gap = Math.abs(a.t - b.t);
      if (gap > LINK_WINDOW) continue;
      const age = now - Math.max(a.t, b.t);
      const fade = clamp(1 - age / LAMPO, 0, 1) * clamp(1 - gap / LINK_WINDOW, 0, 1);
      if (fade <= 0) continue;
      g.globalAlpha = fade * 0.5;
      g.beginPath();
      g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
      g.stroke();
    }
  }
  g.restore();
}

/* ---------------------------------------------------------------------------
   LA FASCIA: due scale di tempo, una sopra l'altra, ognuna col suo cartello.

   Sopra, i TRENTA SECONDI: otto corsie — quattro di tacche per le gocce,
   quattro di segmenti per i tessuti. È il modo più diretto per vedere lo
   sfasamento reale fra le otto linee.

   Sotto, i TRENTA MINUTI: la traiettoria della tonica come poligonale che
   sedimenta, e i passi di quinta come croci. All'apertura è vuota e si
   riempie in mezz'ora: è la memoria della sessione che si accumula, e il
   disegno più lento della pagina.

   Tutto viene dalle memorie scritte dallo scheduler — dropHistory,
   derivaStoria, quinteHistory — e dal piano per le guide: il disegno non
   ricalcola nulla,
   mostra ciò che è stato davvero suonato.                                  */
function drawFascia(s, now) {
  const g = cv2d;
  const left = s.w * 0.03, right = s.w * 0.97;
  const top   = s.ret + s.stripH * 0.06;
  const hA    = s.stripH * 0.22;          // quattro corsie di gocce
  const laneH = hA / 4;
  const topR  = top + hA + s.stripH * 0.09;
  const hR    = s.stripH * 0.22;          // quattro guide di tessuti
  const railH = hR / 4;
  const topB  = topR + hR + s.stripH * 0.11;
  /* La corsia lunga è la più alta delle tre: deve contenere quattro livelli
     sopra l'asse e quattro sotto, e a puntini troppo vicini la colonnina si
     legge come un trattino invece che come un'altezza.                    */
  const hB    = s.stripH * 0.26;

  g.save();

  /* I cartelli: dicono quanto tempo la riga contiene. Le guide dei tessuti
     non ne hanno uno, e non è una dimenticanza — non contengono tempo, sono
     lo stato di adesso. Un cartello di durata lì sarebbe una bugia.       */
  g.fillStyle = COL.dust;
  g.font = "400 7px " + fontPila();
  g.textAlign = "left";
  g.fillText(CANVAS.fBreve, left, top - 6);
  g.fillText(CANVAS.fLunga, left, topB - 6);
  g.textAlign = "center";

  /* le barre che chiudono i due gruppi che scorrono: a destra è adesso, a
     sinistra il fondo della memoria. Le guide dei tessuti non scorrono,
     quindi non hanno estremi da dichiarare.                               */
  g.strokeStyle = COL.dust;
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(left,  top);   g.lineTo(left,  top + hA);
  g.moveTo(right, top);   g.lineTo(right, top + hA);
  g.moveTo(left,  topB);  g.lineTo(left,  topB + hB);
  g.moveTo(right, topB);  g.lineTo(right, topB + hB);
  g.stroke();

  /* guide continue per le sole corsie delle gocce: una tacca isolata
     galleggerebbe senza una riga che la sostenga.                         */
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const ly = top + (i + 0.5) * laneH;
    g.moveTo(left, ly); g.lineTo(right, ly);
  }
  g.stroke();

  /* Le due chiamate stanno PRIMA della guardia su `ctx`: hanno la loro, e
     disegnano comunque il telaio — le file di puntini spenti e l'asse della
     corsia lunga — così la fascia esiste anche prima di premere Avvia.   */
  disegnaGuideTessuti(g, left, right, topR, railH, now);
  disegnaCorsiaLunga(g, left, right, topB, hB, now);

  if (!ctx) { g.restore(); return; }

  /* le gocce: tacche verticali, il segno di un istante */
  const xDi = t => lerp(right, left, (now - t) / TIMELINE_SEC);
  for (const ev of dropHistory) {
    const age = now - ev.t;
    if (age < 0 || age > TIMELINE_SEC) continue;
    const x = xDi(ev.t);
    const ly = top + (ev.loop + 0.5) * laneH;
    const hot = age < LAMPO;
    const mezza = laneH * (hot ? 0.42 : 0.28);
    g.strokeStyle = hot ? COL.amber : COL.ink2;
    g.lineWidth = hot ? 1.6 : 1;
    g.beginPath();
    g.moveTo(x, ly - mezza); g.lineTo(x, ly + mezza);
    g.stroke();
  }

  g.restore();
}

/* ---------------------------------------------------------------------------
   LE QUATTRO GUIDE DEI TESSUTI

   Quattro file di puntini grigi, ferme: non scorrono e non ricordano niente.
   Non sono una storia, sono uno STATO — quanto sono avanzate le tenute che
   stanno suonando adesso su ciascuna linea, lette in puntini accesi.

   Prima qui c'erano segmenti che scorrevano da destra a sinistra come le
   gocce sopra, e leggevano la memoria `toneHistory`. Dicevano che cosa era
   stato suonato; queste dicono a che punto si è. Sono due domande diverse, e
   per un suono che dura mezzo minuto la seconda è quella che si fa davvero
   guardando.

   L'avanzamento è PROPORZIONALE alla durata della singola tenuta: la fila si
   riempie da sinistra e arriva in fondo quando la tenuta si chiude, che duri
   tre secondi o novanta. Non è l'unica lettura possibile — a puntino fisso
   per secondo si potrebbero confrontare le durate fra una linea e l'altra —
   ma con una corsa da 2,5 a 90 secondi quella fila traboccherebbe quasi
   sempre, e non si leggerebbe più nulla.

   La tenuta arancione è la stessa che sul reticolo ha l'arco arancione:
   `corrente`, calcolata una volta per fotogramma — e ce n'è UNA in tutta la
   pagina, non una per linea. Le altre che suonano restano inchiostro.

   I puntini si disegnano in DUE sole campiture, una per i grigi e una per gli
   accesi: un `fill` per cerchietto sarebbe un centinaio di campiture per
   fotogramma, e a sessanta al secondo si sente su un telefono. Il `moveTo`
   prima di ogni arco serve a non collegare i cerchietti fra loro.        */
const PASSO_PUNTI = 9;      // px fra un puntino e il successivo

function disegnaGuideTessuti(g, left, right, topR, railH, now) {
  const n = Math.max(8, Math.floor((right - left) / PASSO_PUNTI));
  const passo = (right - left) / (n - 1);
  const rSpento = 1.1, rAcceso = 2.2;

  /* prima tutti i puntini spenti, in una campitura sola */
  g.fillStyle = COL.hair;
  g.beginPath();
  for (let i = 0; i < droni.length; i++) {
    const y = topR + (i + 0.5) * railH;
    for (let k = 0; k < n; k++) {
      const x = left + k * passo;
      g.moveTo(x + rSpento, y);
      g.arc(x, y, rSpento, 0, Math.PI * 2);
    }
  }
  g.fill();

  if (!ctx) return;

  /* Poi le tenute che suonano, in DUE campiture e in quest'ordine: prima le
     altre in inchiostro, poi la più recente in arancione, che così vince dove
     si sovrappongono. È la stessa gerarchia degli archi sul reticolo, e sono
     gli stessi due colori: le due letture dicono la stessa cosa, e un terzo
     grigio qui le farebbe sembrare due informazioni diverse.

     La sovrapposizione non è un caso limite ma la norma con l'Intreccio sopra
     l'uno, e si legge: se la più recente è indietro rispetto a una più
     vecchia, la fila mostra prima l'arancione e poi l'inchiostro che prosegue
     — cioè quanto manca a chiudersi al tessuto che era già aperto.        */
  accendiTenute(g, COL.ink,   false, now, left, topR, railH, n, passo, rAcceso);
  accendiTenute(g, COL.amber, true,  now, left, topR, railH, n, passo, rAcceso);
}

/* Una passata sola sulle quattro linee. `soloRecente` sceglie di quale metà
   occuparsi: la tenuta corrente, o tutte le altre che stanno suonando.    */
function accendiTenute(g, colore, soloRecente, now, left, topR, railH, n, passo, raggio) {
  g.fillStyle = colore;
  g.beginPath();
  for (let i = 0; i < droni.length; i++) {
    /* Una linea silenziata non accende niente: il piano continua a girare, e
       mostrare l'avanzamento di un suono che non esce sarebbe una bugia.  */
    if (droni[i].muted || !tessutiOn) continue;
    const y = topR + (i + 0.5) * railH;
    for (const p of droni[i].plan) {
      const ev = p.ev;
      if ((ev === corrente) !== soloRecente) continue;
      if (!(now >= ev.flash && now < ev.fino)) continue;
      const durata = ev.fino - ev.flash;
      if (!(durata > 0)) continue;
      const accesi = Math.round(clamp((now - ev.flash) / durata, 0, 1) * n);
      for (let k = 0; k < accesi; k++) {
        const x = left + k * passo;
        g.moveTo(x + raggio, y);
        g.arc(x, y, raggio, 0, Math.PI * 2);
      }
    }
  }
  g.fill();
}

/* ---------------------------------------------------------------------------
   LA CORSIA DEI TRENTA MINUTI

   Un istogramma di puntini, non più una poligonale. Ogni colonnina è
   un'altezza: da zero a quattro puntini sopra l'asse se il baricentro sta
   alto, altrettanti sotto se sta basso. Quattro livelli e non di più perché
   sono quanti se ne contano a colpo d'occhio senza rileggere.

   La colonnina in cui cade un PASSO DI QUINTA è arancione, e prende il posto
   delle croci che c'erano prima: il cambio d'armonia non è più un segno
   estraneo appoggiato sopra al movimento, è una delle colonnine del movimento
   stesso — che è quello che è, visto che i due orologi girano indipendenti.
   Una colonnina arancione al livello zero disegnerebbe il nulla, quindi in
   quel caso si accende comunque un puntino sull'asse.

   LA GRIGLIA È FISSA, i dati ci scorrono dentro. Novecento campioni su
   settecento pixel sarebbero una colonnina ogni otto decimi di pixel, cioè
   una macchia: le colonnine stanno invece sullo stesso passo di nove pixel
   delle guide dei tessuti — una sessantina in tutto, una ogni mezzo minuto
   circa — e ciascuna prende il campione più recente che le compete. Una
   colonnina senza campioni non si disegna, ed è così che i buchi veri —
   schermo bloccato — restano buchi invece di essere colmati da un ponte.

   I tre vettori sono preallocati: nel fotogramma non si alloca.          */
const COLONNE_MAX = 256;
const colVal    = new Float32Array(COLONNE_MAX);
const colPieno  = new Uint8Array(COLONNE_MAX);
const colQuinta = new Uint8Array(COLONNE_MAX);
const LIVELLI = 4;

function disegnaCorsiaLunga(g, left, right, topB, hB, now) {
  const yB = topB + hB / 2;

  /* l'asse: lo zero da cui le colonnine salgono e scendono */
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath(); g.moveTo(left, yB); g.lineTo(right, yB); g.stroke();

  if (!ctx) return;

  const n = Math.min(COLONNE_MAX, Math.max(8, Math.floor((right - left) / PASSO_PUNTI)));
  const passo = (right - left) / (n - 1);
  const passoV = (hB / 2) / (LIVELLI + 0.5);
  const raggio = 1.4;

  for (let k = 0; k < n; k++) { colPieno[k] = 0; colQuinta[k] = 0; }

  /* in quale colonnina cade un istante: destra è adesso */
  const colonnaDi = t => Math.round((1 - (now - t) / DERIVA_FINESTRA) * (n - 1));

  const st = derivaStoria;
  for (let j = 0; j < st.pieni; j++) {
    const idx = (st.testa - st.pieni + j + DERIVA_N) % DERIVA_N;
    const k = colonnaDi(st.t[idx]);
    if (k < 0 || k >= n) continue;
    colVal[k] = st.c[idx];      // l'ultimo campione della colonnina vince
    colPieno[k] = 1;
  }
  for (const t of quinteHistory) {
    const k = colonnaDi(t);
    if (k >= 0 && k < n) colQuinta[k] = 1;
  }

  /* Due campiture sole, come per le guide: prima le colonnine ordinarie, poi
     quelle dei passi di quinta.                                           */
  colonnine(g, COL.ink2, false, n, left, passo, yB, passoV, raggio);
  colonnine(g, COL.amber, true,  n, left, passo, yB, passoV, raggio);
}

function colonnine(g, colore, quinte, n, left, passo, yB, passoV, raggio) {
  g.fillStyle = colore;
  g.beginPath();
  for (let k = 0; k < n; k++) {
    if (!colPieno[k]) continue;
    if (!!colQuinta[k] !== quinte) continue;
    const v = colVal[k];
    const alti = clamp(Math.round(Math.abs(v) * LIVELLI), 0, LIVELLI);
    const x = left + k * passo;
    const verso = v < 0 ? 1 : -1;         // il canvas cresce verso il basso
    if (alti === 0) {
      /* Al livello zero non c'è colonnina. Per un passo di quinta si accende
         comunque un puntino sull'asse, o il cambio d'armonia sparirebbe
         proprio quando il pezzo passa per il centro.                      */
      if (!quinte) continue;
      g.moveTo(x + raggio, yB);
      g.arc(x, yB, raggio, 0, Math.PI * 2);
      continue;
    }
    for (let j = 1; j <= alti; j++) {
      const y = yB + verso * j * passoV;
      g.moveTo(x + raggio, y);
      g.arc(x, y, raggio, 0, Math.PI * 2);
    }
  }
  g.fill();
}

/* Qui stava `trackedText`, la composizione lettera per lettera che dava alle
   etichette del canvas il tracking delle etichette minute. Le parole sono
   uscite dal canvas — restano numerali e unità, che non si spaziano — e con
   loro è uscita la funzione: il testo con la spaziatura ora è tutto HTML,
   dove il tracking lo fa il CSS.                                           */

/* Gli script stanno in fondo al documento: il contenitore esiste già. */
setupTela();
requestAnimationFrame(ciclo);
