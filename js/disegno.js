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
const LINK_WINDOW  = 0.18;   // scarto massimo, in secondi, fra due gocce "vicine"

let COL = {};                // palette letta dal CSS
let holder = null, cvEl = null, cv2d = null;

/* Strutture riusate a ogni fotogramma: niente allocazioni dentro `disegna`. */
const SIZE = { w: 0, h: 0, ret: 0, stripH: 0 };
const HOT_MAX = 96;
const hotPool = Array.from({ length: HOT_MAX }, () => ({ x: 0, y: 0, t: 0, loop: 0 }));
let hotCount = 0;

/* La tenuta che sta suonando ADESSO su ciascuna linea, e se ce n'è più d'una
   la più recente. La calcola `aggiornaCorrenti` una volta per fotogramma, e
   la leggono in due: l'anello, per decidere quale arco è arancione, e la
   fascia, per sapere di quale tenuta mostrare l'avanzamento. Devono parlare
   della stessa: l'arco acceso sul reticolo e i puntini accesi sulla guida
   sono due letture dello stesso suono, e se divergessero mentirebbero.

   Preallocato: quattro caselle riscritte a ogni giro, nessun array nuovo.  */
const correnti = droni.map(() => null);

function aggiornaCorrenti(now) {
  for (let i = 0; i < droni.length; i++) {
    const L = droni[i];
    let vinci = null;
    for (const p of L.plan) {
      const ev = p.ev;
      if (now >= ev.flash && now < ev.fino && (!vinci || ev.flash > vinci.flash)) vinci = ev;
    }
    correnti[i] = vinci;
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
  aggiornaCorrenti(now);
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

  /* Gli otto anelli. Le frasi dentro, i tessuti fuori: le gocce sono tacche
     radiali, i tessuti archi — un istante attraversa l'anello, una durata lo
     percorre.                                                              */
  for (let i = 0; i < loops.length; i++)
    drawAnelloFrase(g, loops[i], cx, cy, ANELLI_FRASI[i] * R, R, now);
  for (let i = 0; i < droni.length; i++)
    drawAnelloTessuto(g, droni[i], cx, cy, ANELLI_TESSUTI[i] * R, R, now);

  drawLinks(g, now);

  /* Il mirino: un cerchio minimo e il punto centrale, che si accende con
     qualunque goccia — il cuore comune delle otto linee.                   */
  g.strokeStyle = COL.hair;
  g.lineWidth = 1;
  g.beginPath();
  g.arc(cx, cy, R * 0.045, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = hotCount ? COL.amber : COL.hair;
  g.beginPath();
  g.arc(cx, cy, hotCount ? R * 0.020 : R * 0.012, 0, Math.PI * 2);
  g.fill();

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
    const hot = dt >= 0 && dt < 0.45;
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
    const recente = ev === correnti[L.i];
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
      const fade = clamp(1 - age / 0.45, 0, 1) * clamp(1 - gap / LINK_WINDOW, 0, 1);
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
  const top   = s.ret + s.stripH * 0.07;
  const hA    = s.stripH * 0.25;          // quattro corsie di gocce
  const laneH = hA / 4;
  const topR  = top + hA + s.stripH * 0.10;
  const hR    = s.stripH * 0.25;          // quattro guide di tessuti
  const railH = hR / 4;
  const topB  = topR + hR + s.stripH * 0.12;
  const hB    = s.stripH * 0.16;          // la corsia dei trenta minuti

  g.save();

  /* I cartelli: dicono quanto tempo la riga contiene. Le guide dei tessuti
     non ne hanno uno, e non è una dimenticanza — non contengono tempo, sono
     lo stato di adesso. Un cartello di durata lì sarebbe una bugia.       */
  g.fillStyle = COL.dust;
  g.font = "400 7px " + fontPila();
  g.textAlign = "left";
  g.fillText(CANVAS.f30s,   left, top - 6);
  g.fillText(CANVAS.f30min, left, topB - 6);
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

  disegnaGuideTessuti(g, left, right, topR, railH, now);

  if (!ctx) { g.restore(); return; }

  /* le gocce: tacche verticali, il segno di un istante */
  const xDi = t => lerp(right, left, (now - t) / TIMELINE_SEC);
  for (const ev of dropHistory) {
    const age = now - ev.t;
    if (age < 0 || age > TIMELINE_SEC) continue;
    const x = xDi(ev.t);
    const ly = top + (ev.loop + 0.5) * laneH;
    const hot = age < 0.45;
    const mezza = laneH * (hot ? 0.42 : 0.28);
    g.strokeStyle = hot ? COL.amber : COL.ink2;
    g.lineWidth = hot ? 1.6 : 1;
    g.beginPath();
    g.moveTo(x, ly - mezza); g.lineTo(x, ly + mezza);
    g.stroke();
  }

  /* la corsia lunga: il baricentro sedimenta la sua traiettoria. L'anello si
     percorre dal campione più vecchio al più recente; un buco più largo di
     qualche passo — schermo bloccato — spezza la linea invece di mentire
     con un ponte dritto.                                                   */
  const yB = topB + hB / 2;
  const xLungo = t => lerp(right, left, (now - t) / DERIVA_FINESTRA);
  g.strokeStyle = COL.hair;
  g.lineWidth = 0.75;
  g.beginPath(); g.moveTo(left, yB); g.lineTo(right, yB); g.stroke();

  g.strokeStyle = COL.ink2;
  g.lineWidth = 1;
  g.beginPath();
  let inLinea = false, tPrec = 0;
  const st = derivaStoria;
  for (let k = 0; k < st.pieni; k++) {
    const idx = (st.testa - st.pieni + k + DERIVA_N) % DERIVA_N;
    const t = st.t[idx];
    if (t < now - DERIVA_FINESTRA) continue;
    const x = xLungo(t);
    const y = yB - st.c[idx] * hB * 0.46;
    if (!inLinea || t - tPrec > DERIVA_PASSO * 4) { g.moveTo(x, y); inLinea = true; }
    else g.lineTo(x, y);
    tPrec = t;
  }
  g.stroke();

  /* i passi di quinta: croci sulla corsia, il segno di un evento discreto
     dentro un movimento continuo                                           */
  g.strokeStyle = COL.ink;
  g.lineWidth = 1;
  g.beginPath();
  for (const t of quinteHistory) {
    if (t < now - DERIVA_FINESTRA) continue;
    const x = xLungo(t);
    g.moveTo(x - 3, yB); g.lineTo(x + 3, yB);
    g.moveTo(x, yB - 3); g.lineTo(x, yB + 3);
  }
  g.stroke();

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

   La tenuta è la stessa che sul reticolo ha l'arco arancione: `correnti`,
   calcolata una volta per fotogramma.

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
      if ((ev === correnti[i]) !== soloRecente) continue;
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

/* Qui stava `trackedText`, la composizione lettera per lettera che dava alle
   etichette del canvas il tracking delle etichette minute. Le parole sono
   uscite dal canvas — restano numerali e unità, che non si spaziano — e con
   loro è uscita la funzione: il testo con la spaziatura ora è tutto HTML,
   dove il tracking lo fa il CSS.                                           */

/* Gli script stanno in fondo al documento: il contenitore esiste già. */
setupTela();
requestAnimationFrame(ciclo);
