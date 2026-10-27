/* =============================================================================
   RADA2 · disegno.js — il campo e la fascia di deriva

   Sostituisce frasi.js e droni.js, e con loro l'idea che le otto linee siano
   otto quadranti. Qui sono OTTO DISCHI in composizione libera dentro un campo
   solo: le quattro frasi piccole e in primo piano, i quattro tessuti grandi e
   dietro. Un disco è una QUANTITÀ — lo spicchio chiaro dice a che punto è il
   giro, il diametro quanto è lungo il periodo — mentre un anello era una
   traiettoria, e di quantità non ne dichiarava nessuna.

   I DISCHI SI TOCCANO, ed è lì che vive il collage: dove due che suonano si
   sovrappongono, l'area comune si scurisce. È la LENTE — una durata, che dice
   «queste due stanno suonando insieme» e resta finché resta vero. Sta in
   inchiostro e non in arancione, perché è uno stato e in questo progetto
   l'accento segna un evento.

   IL CAMPO È NUDO. Niente cornice attorno ai dischi: non c'è il cerchio
   esterno, non ci sono le dodici tacche del circolo delle quinte, l'arco del
   baricentro né i due archi di misura del registro. Sono spariti anche tre
   segni che il reticolo aveva: il MIRINO al centro, il FILO DELLA TENUTA che
   ci arrivava, e il filo che univa due gocce vicine (`drawLinks`).

   Niente di tutto questo è andato perso, e conviene sapere dove ritrovarlo —
   erano letture doppie, e sul campo erano quelle che facevano rumore:

     la tonalità e le modulazioni   nella riga sopra il campo
     il baricentro                  nel movimento della tavola, e in numero
                                    nella corsia dei quindici minuti
     il registro efficace           nei due numeri accanto a ogni cursore
     quale linea ha parlato         nel disco che si accende, che il mirino
                                    poteva solo dire che qualcuno l'aveva fatto
     due gocce insieme              nella lente, come area invece che linea

   Sotto il campo, la fascia: gli ultimi trenta secondi delle gocce, lo stato
   delle tenute in corso, e la corsia lunga dove il baricentro sedimenta la
   sua traiettoria sull'ultimo quarto d'ora.

   IL CANVAS NON ASCOLTA NULLA. In Rada era una superficie di comando, con
   otto riquadri trasparenti a governare `touch-action` e un doppio binario
   di comandi nativi fuori campo per chi non usa il puntatore. Qui i dischi
   sarebbero bersagli ambigui — si sovrappongono — e il doppio binario è
   diventato il binario: i comandi nativi sono visibili, nelle due colonne
   accanto al campo, e la tela è puro display. Con questo cade tutta la
   meccanica dei dialZone, e la pagina scorre da sé.

   Disegnato con l'API 2D nativa, proporzioni in frazioni del raggio, palette
   letta dalle variabili CSS: le regole di sempre. Il ciclo di fotogrammi è
   uno solo, e niente allocazioni dentro `disegna`.
============================================================================= */

/* --- LA COMPOSIZIONE -------------------------------------------------------
   Dove cade ciascun disco e quanto pesa. `x` e `y` sono frazioni della
   LARGHEZZA e dell'ALTEZZA del campo — posizioni assolute sulla tavola, non
   scarti da un centro: il campo è un rettangolo e non ha più un centro da cui
   misurare. Le prime quattro voci sono le frasi, le altre quattro i tessuti.

   È FISSA, e non si ricompone al cambio di mood: una tavola che si rimpasta a
   ogni preset smette di essere una tavola, e si perderebbe la cosa che questa
   disposizione dà in cambio — la memoria di dove sta ciascuna linea.

   Due condizioni, e vanno RIMISURATE a ogni ritocco perché tirano in
   direzioni opposte — allargare la tavola separa i dischi e spegne le lenti:

     CONTENIMENTO  nessun disco esce dal campo.
     INCONTRO      ogni frase incrocia almeno due tessuti, e i tessuti si
                   incrociano fra loro. Senza questo la lente non avrebbe mai
                   occasione di comparire, e il segno esisterebbe solo sulla
                   carta.

   I NUMERI SONO STATI CERCATI, non scelti. La prima stesura veniva da un
   mockup largo quasi mille pixel; portata qui, dove il campo è 560 × 347, i
   dischi smettevano di toccarsi — TRE coppie su 28, e la lente non si
   accendeva mai. Ingrandirli e basta li faceva uscire dal campo.

   La taratura ha provato ogni misura contro ogni contrazione su quattro
   formati di campo per sessantaquattro combinazioni di mood, cioè 256 casi
   per candidato, e ha tenuto la tavola PIÙ LARGA che reggesse tutte e due le
   condizioni ovunque: raggio 0,17 del lato corto, posizioni contratte del 30%
   verso il centro. Lì le coppie che si possono toccare stanno fra 14 e 19, e
   nessun disco esce in nessun caso. A 0,15 la tavola è più ariosa ma qualche
   frase resta isolata; a 0,19 i dischi cominciano a sbordare.

   Quelle che si toccano sono le coppie POSSIBILI: la lente si accende solo
   quando tutt'e due suonano davvero, cioè due o tre per volta.           */
const DISCO_BASE = 0.17;   // raggio di riferimento, in frazioni del lato corto
const POSTO = [
  { x: 0.339, y: 0.381, k: 0.80 },   // frase I
  { x: 0.472, y: 0.570, k: 0.95 },   // frase II
  { x: 0.619, y: 0.367, k: 0.72 },   // frase III
  { x: 0.724, y: 0.584, k: 0.88 },   // frase IV
  { x: 0.290, y: 0.598, k: 1.55 },   // tessuto I
  { x: 0.521, y: 0.339, k: 1.80 },   // tessuto II
  { x: 0.682, y: 0.640, k: 1.42 },   // tessuto III
  { x: 0.409, y: 0.724, k: 1.25 },   // tessuto IV
];

/* Quanto dura un lampo, in secondi. Un solo numero per le gocce e per i
   tessuti, perché sono lo stesso segno detto in posti diversi, e due valori
   li farebbero sembrare due fenomeni. Vale anche per i tessuti, il cui
   attacco è lento: il lampo non dice «quanto ci mette ad aprirsi», dice
   «se n'è appena aperto uno».                                             */
const LAMPO = 0.45;

let COL = {};                // palette letta dal CSS
let holder = null, cvEl = null, cv2d = null;

/* Strutture riusate a ogni fotogramma: niente allocazioni dentro `disegna`. */
const SIZE = { w: 0, h: 0, ret: 0, campo: 0, stripH: 0 };

/* Il numerale al centro di un disco non cresce oltre questo: è una sigla, non
   un titolo, e sul tessuto più largo arriverebbe al corpo di un'intestazione. */
const CORPO_SIGLA = 11;

/* Gli otto dischi come stanno in QUESTO fotogramma: centro, raggio, linea, e
   quanto la linea sta suonando (0..1). Preallocati, perché `disegna` non
   alloca — e la lente ha bisogno di rileggerli tutti dopo averli calcolati,
   quindi un vettore serve davvero invece di una variabile di giro.        */
const forme = Array.from({ length: 8 }, () => ({
  L: null, x: 0, y: 0, r: 0, viva: 0, fase: -1, spenta: false, appena: false,
}));

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
   due: il disco del tessuto, per decidere quale si accende, e la guida nella
   fascia, per sapere di quale tenuta mostrare l'avanzamento in arancione.
   Devono parlare della stessa, o le due letture dello stesso suono
   mentirebbero.                                                           */
let corrente = null;

function aggiornaCorrente(now) {
  corrente = null;
  if (!tessutiOn) return;
  for (let i = 0; i < droni.length; i++) {
    const L = droni[i];
    if (L.muted) continue;
    for (const p of L.plan) {
      const ev = p.ev;
      if (!(now >= ev.flash && now < ev.fino)) continue;
      if (!corrente || ev.flash > corrente.flash) corrente = ev;
    }
  }
}

/* A che punto è il giro UDIBILE di una linea, da 0 a 1, o −1 se non ne ha uno.
   Legge dalla coda `L.cycles` e mai da `cycleStart`, che descrive il ciclo in
   pianificazione e corre avanti fino a un terzo di giro.

   Sta in una funzione sola perché adesso la leggono in due — lo spicchio del
   disco e il punto di fase sul bordo — e due conti scritti a parte
   finirebbero per dire due cose diverse della stessa linea.               */
function faseUdibile(L, now, accesa) {
  if (!(ctx && running && accesa && !L.muted && L.cycles.length)) return -1;
  while (L.cycles.length > 1 && now >= L.cycles[0].start + L.cycles[0].period)
    L.cycles.shift();
  const c = L.cycles[0];
  return clamp((now - c.start) / c.period, 0, 1);
}

const lerp = (a, b, t) => a + (b - a) * t;
/* Una stringa sola, non una funzione che la ricompone a ogni chiamata: la
   leggono le etichette degli anelli, cioè otto volte per fotogramma.      */
const FONT_PILA =
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
    velo:  v("--velo"),
  };
}

/* Il campo è ORIZZONTALE, la fascia una striscia sotto della stessa
   larghezza. Il reticolo era quadrato perché un cerchio lo è; una
   composizione libera no, e in un quadrato lascerebbe vuoti gli angoli.

   Sul telefono il campo si alza — 0,82 invece di 0,62 — perché a schermo
   stretto una tavola bassa schiaccia gli otto dischi uno sull'altro: le
   sovrapposizioni diventano una macchia sola e la lente smette di dire
   quali due linee si sono incontrate.                                     */
function canvasSize() {
  const avail = holder ? holder.clientWidth : 320;
  SIZE.ret    = Math.min(avail, 560);
  SIZE.campo  = Math.min(SIZE.ret * (SIZE.ret < 420 ? 0.82 : 0.62), 520);
  SIZE.stripH = clamp(SIZE.ret * 0.34, 120, 190);
  SIZE.w      = SIZE.ret;
  SIZE.h      = SIZE.campo + SIZE.stripH;
  return SIZE;
}

/* ---------------------------------------------------------------------------
   IL CICLO. Un solo `requestAnimationFrame` per tutta la pagina, TRENTA
   fotogrammi al secondo quando il motore gira e dodici quando è fermo.

   Trenta e non sessanta, e il conto è questo: il codice del disegno costa un
   decimo di millisecondo, la PITTURA ne costa tredici volte tanto — misurato
   forzando la rasterizzazione, 1,29 ms contro 0,10 su una macchina veloce.
   Su un telefono modesto quel numero si moltiplica, e a sessanta al secondo
   arriva a occupare il fotogramma intero: la CPU resta satura, il thread
   audio non viene servito in tempo e i buffer saltano. Dimezzare i
   fotogrammi dimezza esattamente quella spesa.

   E non si perde niente, perché qui non c'è niente di veloce da guardare: il
   segno più rapido della pagina è il punto di fase sull'anello più interno,
   che percorre 63 pixel al secondo — due pixel per fotogramma a trenta. I
   lampi durano 0,45 s, cioè tredici fotogrammi. La fascia scorre 17 pixel al
   secondo. Sessanta al secondo servivano a nessuno.

   Le soglie stanno appena SOTTO il periodo voluto — 1/31 e 1/13, non 1/30 e
   1/12: i fotogrammi arrivano a passi discreti e una soglia esatta verrebbe
   mancata per frazioni di millisecondo, dimezzando il ritmo (misurato).    */
const PASSO_VIVO  = 1000 / 31;
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
  aggiornaCorrente(now);
  drawCampo(s, now);
  drawFascia(s, now);
}

/* ---------------------------------------------------------------------------
   IL CAMPO
--------------------------------------------------------------------------- */
function drawCampo(s, now) {
  const g = cv2d;
  const W = s.w, H = s.campo;

  g.save();
  g.lineCap = "butt";

  /* LA DERIVA SPOSTA L'INTERA TAVOLA, piano. Non c'è più un arco che la
     dichiari: il baricentro è diventato il movimento della composizione, e si
     legge perché tutto si sposta insieme invece che perché un segno glielo
     racconta. Lo scarto è piccolo apposta — due punti percentuali — perché
     deve restare sotto la soglia del notare, come tutto il tempo lungo di
     questo progetto. Chi cerca il numero lo trova nella corsia dei quindici
     minuti, che non ha smesso di disegnarlo.                               */
  /* Due canali diversi per i due assi: con uno solo la tavola scorrerebbe in
     diagonale avanti e indietro, cioè si leggerebbe come un'oscillazione —
     proprio la cosa che la deriva esiste per non essere. `deriva.spread` qui
     non è il ventaglio delle altezze: è solo l'altro canale, e nessun segno
     della pagina lo disegna più da quando gli archi di misura non ci sono. */
  const dx = derivaCentro() * W * 0.022;
  const dy = deriva.spread * H * 0.02;
  const base = Math.min(W, H) * DISCO_BASE;

  preparaForme(W, H, dx, dy, base, now);
  campitureTessuti(g);
  lenti(g);
  lampiGocce(g);
  contorni(g, now);

  g.restore();
}

/* Dove cade ciascun disco in questo fotogramma, e quanto la sua linea sta
   suonando. Si calcola una volta e lo rileggono tutte le passate — la lente
   in particolare ha bisogno di vedere gli altri sette dischi, cosa che una
   funzione che ne disegna uno per volta non potrebbe fare.

   Il raggio dipende dal periodo, ma con la RADICE e con un pavimento a 0,70:
   preso linearmente, un mood come «carillon» (4 e 25 secondi) farebbe un
   disco sei volte l'altro e la tavola si sbilancerebbe.                    */
function preparaForme(W, H, dx, dy, base, now) {
  for (let k = 0; k < 8; k++) {
    const frase = k < 4;
    const lista = frase ? loops : droni;
    const L = lista[frase ? k : k - 4];
    const P = POSTO[k];
    const f = forme[k];

    let maxp = 1;
    for (const x of lista) if (x.period > maxp) maxp = x.period;

    f.L = L;
    f.x = P.x * W + dx;
    f.y = P.y * H + dy;
    f.r = base * P.k * (0.70 + 0.30 * Math.sqrt(L.period / maxp));
    f.spenta = L.muted || !(frase ? gocceOn : tessutiOn);
    f.fase = faseUdibile(L, now, frase ? gocceOn : tessutiOn);

    /* Quanto questa linea sta suonando ADESSO, da 0 a 1.

       Per una GOCCIA è il lampo che svanisce in mezzo secondo. Per una
       TENUTA è il suo avanzamento, da 0 all'apertura a 1 alla chiusura: così
       la campitura cresce mentre il suono affiora, invece di comparire tutta
       insieme quando ancora non si sente.                                 */
    let viva = 0, appena = false;
    if (!f.spenta) {
      if (frase) {
        for (const p of L.plan) {
          const dt = now - p.ev.flash;
          if (dt >= 0 && dt < LAMPO) viva = Math.max(viva, 1 - dt / LAMPO);
        }
      } else {
        for (const p of L.plan) {
          const ev = p.ev;
          if (!(now >= ev.flash && now < ev.fino)) continue;
          const durata = ev.fino - ev.flash;
          if (durata > 0) viva = Math.max(viva, clamp((now - ev.flash) / durata, 0, 1));
          /* Arancione solo nei LAMPO secondi dall'apertura, e solo se è LA
             più recente della pagina: le due condizioni insieme garantiscono
             un accento alla volta, che è la regola del progetto.          */
          if (ev === corrente && now - ev.flash < LAMPO) appena = true;
        }
      }
    }
    f.viva = viva;
    f.appena = appena;
  }
}

/* Le campiture dei tessuti aperti: tenui, e sotto a tutto il resto. Sono
   quelle che danno alla lente qualcosa da scurire.                        */
function campitureTessuti(g) {
  for (let k = 4; k < 8; k++) {
    const f = forme[k];
    if (f.viva <= 0) continue;
    g.fillStyle = f.appena ? COL.amber : COL.ink2;
    g.globalAlpha = (f.appena ? 0.26 : 0.16) * f.viva;
    g.beginPath(); g.arc(f.x, f.y, f.r, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

/* LE LENTI. Dove due dischi che suonano si sovrappongono, l'area comune si
   scurisce: è il collage reso come area, e dice «queste due stanno suonando
   insieme» per tutto il tempo in cui è vero.

   In INCHIOSTRO e non in arancione, e la differenza è la regola dell'unico
   accento: la lente è uno stato, e l'arancione in questo progetto segna un
   evento.

   Ventotto coppie, ma si entra nel ritaglio solo quando tutt'e due le linee
   suonano davvero — in pratica due o tre volte per fotogramma. Il salvataggio
   del contesto costa, e per questo la guardia viene prima.               */
function lenti(g) {
  for (let i = 0; i < 8; i++) {
    const a = forme[i];
    if (a.viva <= 0.02) continue;
    for (let j = i + 1; j < 8; j++) {
      const b = forme[j];
      if (b.viva <= 0.02) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (dx * dx + dy * dy >= (a.r + b.r) * (a.r + b.r)) continue;
      g.save();
      g.beginPath(); g.arc(a.x, a.y, a.r, 0, Math.PI * 2); g.clip();
      g.fillStyle = COL.ink;
      g.globalAlpha = 0.30 * Math.min(a.viva, b.viva);
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }
  g.globalAlpha = 1;
}

/* Il lampo di una goccia accende il suo disco intero e si spegne in mezzo
   secondo. È il segno che sul reticolo stava al centro, nel mirino: lì diceva
   «una goccia è caduta», qui dice anche QUALE linea l'ha fatta cadere — ed è
   per questo che il mirino non serve più.                                 */
function lampiGocce(g) {
  for (let k = 0; k < 4; k++) {
    const f = forme[k];
    if (f.viva <= 0) continue;
    g.fillStyle = COL.amber;
    g.globalAlpha = f.viva;
    g.beginPath(); g.arc(f.x, f.y, f.r, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

/* L'ultima passata, disco per disco: lo spicchio del giro, il bordo, le
   tacche dell'idea, il punto di fase e il numerale.

   Qui NON si raggruppa per stile, e la ragione è cambiata rispetto al
   reticolo: là le tacche erano una cinquantina tutte uguali su otto anelli
   concentrici, e raggrupparle risparmiava quaranta tracciati. Qui ogni disco
   ha il suo centro, le sue tacche in un colore solo e il suo grado di
   trasparenza se è muto — raggruppare costerebbe una passata per linea
   invece che una per stile, cioè esattamente lo stesso numero.           */
function contorni(g, now) {
  for (let k = 0; k < 8; k++) {
    const f = forme[k], L = f.L;
    g.globalAlpha = f.spenta ? 0.3 : 1;

    /* lo spicchio: quanta parte del giro è passata */
    if (f.fase >= 0) {
      g.fillStyle = COL.velo;
      g.beginPath();
      g.moveTo(f.x, f.y);
      g.arc(f.x, f.y, f.r, -Math.PI / 2, -Math.PI / 2 + f.fase * Math.PI * 2);
      g.closePath(); g.fill();
    }

    g.strokeStyle = COL.hair;
    g.lineWidth = 1;
    g.beginPath(); g.arc(f.x, f.y, f.r, 0, Math.PI * 2); g.stroke();

    /* Le tacche dell'idea, dal bordo verso l'interno: dove cadranno gli
       eventi di questa linea, e la LUNGHEZZA è il registro — corta grave,
       lunga acuta. Vale per tutt'e due le classi: una tenuta ha un suo
       momento d'ingresso come una goccia, e qui dichiara quello.         */
    g.strokeStyle = COL.ink2;
    g.lineWidth = 1;
    g.beginPath();
    for (const p of L.plan) {
      const a = -Math.PI / 2 + p.ph * Math.PI * 2;
      const co = Math.cos(a), si = Math.sin(a);
      const lung = 3 + 5 * (p.ev.rel + 1) / 2;
      g.moveTo(f.x + co * f.r, f.y + si * f.r);
      g.lineTo(f.x + co * (f.r - lung), f.y + si * (f.r - lung));
    }
    g.stroke();

    /* il punto di fase, sul bordo */
    if (f.fase >= 0) {
      const af = -Math.PI / 2 + f.fase * Math.PI * 2;
      g.fillStyle = COL.amber;
      g.beginPath();
      g.arc(f.x + Math.cos(af) * f.r, f.y + Math.sin(af) * f.r, 2.4, 0, Math.PI * 2);
      g.fill();
    }

    /* Il numerale al CENTRO del disco, non fuori: è l'unico posto che resta
       suo qualunque cosa gli si sovrapponga, e lega la riga che si tocca al
       disco che si guarda.                                                */
    g.fillStyle = COL.dust;
    g.font = "400 " + Math.max(8, Math.min(CORPO_SIGLA, f.r * 0.22)).toFixed(1) +
             "px " + FONT_PILA;
    g.fillText(CANVAS.linea[L.i], f.x, f.y);
    g.globalAlpha = 1;
  }
}

/* ---------------------------------------------------------------------------
   LA FASCIA: tre letture, una sopra l'altra.

   In cima i TRENTA SECONDI: quattro corsie di tacche, una per frase. È il
   modo più diretto per vedere lo sfasamento reale fra le linee.

   In mezzo le quattro GUIDE DEI TESSUTI, ferme: a che punto sono le tenute
   che suonano adesso.

   In fondo il QUARTO D'ORA: l'istogramma del baricentro, con i passi di
   quinta in arancione. All'apertura è vuoto e si riempie in quindici minuti:
   è la memoria della sessione che si accumula, e il disegno più lento della
   pagina.

   Tutto viene dalle memorie scritte dallo scheduler — dropHistory,
   derivaStoria, quinteHistory — e dal piano per le guide: il disegno non
   ricalcola nulla, mostra ciò che è stato davvero suonato.                 */
function drawFascia(s, now) {
  const g = cv2d;
  const left = s.w * 0.03, right = s.w * 0.97;
  const top   = s.campo + s.stripH * 0.06;
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
  g.font = "400 7px " + FONT_PILA;
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

  /* le gocce: tacche verticali, il segno di un istante.

     Anche qui DUE campiture e non una per tacca, ed è il punto in cui pesava
     di più: la corsia tiene trenta secondi di gocce, che coi mood fitti sono
     una cinquantina di tracciati per fotogramma — da soli, più della metà di
     tutti i disegni della pagina.                                        */
  const xDi = t => lerp(right, left, (now - t) / TIMELINE_SEC);
  for (let acceso = 0; acceso < 2; acceso++) {
    g.strokeStyle = acceso ? COL.amber : COL.ink2;
    g.lineWidth   = acceso ? 1.6 : 1;
    g.beginPath();
    for (const ev of dropHistory) {
      const age = now - ev.t;
      if (age < 0 || age > TIMELINE_SEC) continue;
      if ((age < LAMPO) !== !!acceso) continue;
      const x = xDi(ev.t);
      const ly = top + (ev.loop + 0.5) * laneH;
      const mezza = laneH * (acceso ? 0.42 : 0.28);
      g.moveTo(x, ly - mezza); g.lineTo(x, ly + mezza);
    }
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

   La tenuta arancione è la stessa che sul campo ha l'arco arancione:
   `corrente`, calcolata una volta per fotogramma — e ce n'è UNA in tutta la
   pagina, non una per linea. Le altre che suonano restano inchiostro.

   I puntini si disegnano in DUE sole campiture, una per i grigi e una per gli
   accesi: un `fill` per cerchietto sarebbe un centinaio di campiture per
   fotogramma, e su un telefono si sente. Il `moveTo`
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
     si sovrappongono. È la stessa gerarchia degli archi sul campo, e sono
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
   LA CORSIA DEL QUARTO D'ORA

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

   LA GRIGLIA È FISSA, i dati ci scorrono dentro. Quattrocentocinquanta
   campioni su cinquecento pixel sarebbero quasi una colonnina per pixel,
   cioè una macchia: le colonnine stanno invece sullo stesso passo di nove
   pixel delle guide dei tessuti — una sessantina in tutto, una ogni quindici
   secondi circa — e ciascuna prende il campione più recente che le compete. Una
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
