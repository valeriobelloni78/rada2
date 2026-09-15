/* =============================================================================
   RADA · ui.js — i controlli attorno al canvas

   Cursori, mood, lingua, avvio e riga di stato restano elementi HTML: sono
   comandi standard, e come tali funzionano meglio se il browser li conosce
   (accessibilità, tastiera, comportamento nativo). Il canvas è puro
   display: disegna il reticolo e la fascia, e non ascolta nulla.
============================================================================= */

const $ = id => document.getElementById(id);

/* --- valori accanto ai cursori ------------------------------------------- */
/* "Cursore → efficace" ogni volta che i due differiscono. In Rada capitava
   solo a calore e spazio, che l'ora inclina; qui capita quasi sempre e a
   quasi tutti, perché la deriva non sta mai ferma. È il modo in cui lo
   strumento resta onesto: il cursore dice dove l'hai messo, il secondo numero
   dice che cosa sta suonando davvero.                                      */
function due(cursore, efficace, suffisso) {
  const a = Math.round(cursore), b = Math.round(efficace);
  return (a === b) ? fmtInt(a) + suffisso : fmtInt(a) + "→" + fmtInt(b) + suffisso;
}

function readouts() {
  $("vSpread").textContent = due(G.spread, effG.spread, "%");
  $("vWarmth").textContent = due(G.warmth, effWarmth * 100, "%");
  $("vRev").textContent    = due(G.rev,    effRev * 100,    "%");
  $("vDens").textContent   = T("ctl.densValue", { n: due(G.dens, effG.dens, "") });
  $("vHead").textContent   = due(G.head, effG.head, "%");

  /* La deriva sta qui e non in `onRealignChange` perché non ha un "cambio" da
     ascoltare: si muove sempre, e va riletta come si rilegge un cursore.

     Due dati su due righe. Il conteggio dice quanta strada, la nota dice
     dove si è adesso, e la seconda è l'unica cosa che l'interfaccia dichiari
     in termini musicali espliciti: ci sta perché Rada2 va suonata sopra, e a
     chi accompagna un conteggio di passi non basta. Prima al suo posto
     c'erano i centesimi di scarto della tonica, che con l'accordatura fissa
     sono sempre zero.

     L'etichetta è invariabile, quindi qui non serve il plurale: era la sola
     ragione per cui il dizionario teneva due chiavi. La nota non passa dal
     dizionario perché non è una frase — è un nome, e i nomi delle dodici
     tonalità sono già una tavola per lingua.                             */
  $("quinte").textContent = T("quinte", { q: fmtInt(passiQuinta) });
  $("nota").textContent   = tonalitaName(tonalita());
}
setInterval(readouts, 120);

/* --- indicatore di riallineamento ----------------------------------------
   Le unità e il separatore decimale cambiano con la lingua: "4,7 ore" in
   italiano, "4.7 hours" in inglese, "約4.7時間で一巡" in giapponese. Se ne
   occupa Intl, non un replace cablato. La frase serve alle due classi, quindi
   si compone in un posto solo.                                             */
function fraseRiallineamento(l) {
  const sep = T("unit.sep");
  let t;
  if (l < 3600)       t = fmtInt(Math.round(l / 60)) + sep + T("unit.min");
  else if (l < 86400) t = fmtOne(l / 3600)           + sep + T("unit.hours");
  else                t = fmtOne(l / 86400)          + sep + T("unit.days");
  return T("realign", { t });
}

function onRealignChange() {
  $("realign").textContent = fraseRiallineamento(realignSeconds());
  syncLinee();         // i mood riscrivono le durate: le righe devono seguirli
}

/* --- le due righe di stato ------------------------------------------------
   Stessa frase per tutt'e due, con una sola variabile a cambiare: `when` è
   l'ora sopra le gocce e il giorno sopra i tessuti. Erano due coppie di voci
   nel dizionario finché la prima contava anche le frasi attive; tolto quel
   conteggio le due frasi coincidono, e tenerle separate avrebbe soltanto
   raddoppiato il lavoro di chi traduce.                                    */
function scriviRiga(idRiga, idTesto, viva, when, palette) {
  const st = $(idRiga), txt = $(idTesto);
  st.classList.toggle("live", viva);
  if (viva) { txt.textContent = T("status.playing", { when, palette }); return; }
  // "in attesa" solo alla prima apertura; dopo un ascolto è una pausa
  const state = ctx ? T("status.paused") : T("status.idle");
  txt.textContent = T("status.stopped", { state, when, palette });
}

function refreshStatus() {
  const d = new Date(), h = d.getHours();
  currentPalette = timePalette(h);
  const hh = String(h).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0");
  scriviRiga("status", "statusText", running, hh + ":" + mm, paletteName(currentPalette.id));
}

/* La riga della stagione, sopra i comandi dei tessuti: stessa forma di
   quella delle frasi, altra scala del tempo — là l'ora, qui il mese.

   Il punto pulsa quando suonano i TESSUTI, non l'intero strumento: è la riga
   di questa classe, e deve dire di questa classe. Chi mette in pausa i
   tessuti e lascia le gocce vede la riga delle frasi viva e questa spenta. */
function refreshStagione() {
  const d = new Date();
  currentSeason = seasonPalette(d.getMonth());
  scriviRiga("statusStagione", "statusStagioneText",
             running && tessutiOn, fmtGiorno(d), seasonName(currentSeason.id));
}

function refreshTutteLeRighe() { refreshStatus(); refreshStagione(); }
setInterval(refreshTutteLeRighe, 15000);

/* Chiamata da audio.js quando il motore si accende o si spegne: i segni di
   avvio e le due righe di stato devono seguirlo.                           */
function onPowerChange() {
  syncModi();
  refreshTutteLeRighe();
}

/* --- cursori -------------------------------------------------------------- */
PARAMS.forEach(k => {
  $(k).addEventListener("input", e => { GT[k] = +e.target.value; });
});

/* --- mood: preset sonori + durate delle frasi + nuove idee -----------------
   Il bottone porta l'id del preset; l'etichetta arriva dal dizionario e viene
   riscritta a ogni cambio di lingua senza ricostruire i bottoni, così la
   selezione corrente non si perde.                                         */
const moodsEl = $("moods");
Object.keys(MOODS).forEach((id, i) => {
  const b = document.createElement("button");
  b.className = "mood" + (i === 0 ? " sel" : "");
  b.dataset.mood = id;
  b.textContent = moodName(id);
  b.onclick = () => {
    document.querySelectorAll("#moods .mood").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    const m = MOODS[id];
    PARAMS.forEach(k => { GT[k] = m[k]; G[k] = m[k]; $(k).value = m[k]; });
    loops.forEach((L, k) => { L.target = L.period = m.periods[k]; L.idx = 0; });
    restartCycles();
    loops.forEach(regenerate);
    onRealignChange();
  };
  moodsEl.appendChild(b);
});

/* --- il modo del materiale, per classe --------------------------------------
   Un interruttore solo che mostra lo STATO, non due bottoni fra cui scegliere:
   quadro arancione e «deriva» quando le idee si rinnovano, quadro d'inchiostro
   e «ancora» quando restano ferme. È la stessa grammatica del quadratino di
   ogni linea — il segno dice come stanno le cose, e premerlo le cambia — e per
   questo qui l'etichetta nomina lo stato invece dell'azione.

   Il nome della classe sta dentro il bottone ma fuori campo: da solo «DERIVA»
   non direbbe deriva di che cosa, e chi ascolta la pagina sentirebbe due
   bottoni identici. Il nome accessibile lo compone il browser mettendo in fila
   i due pezzi — «Materiale delle frasi, deriva» — invece di comporlo il
   dizionario, che di frasi intere ne vuole una per voce.                   */
function costruisciSegno(box, classeCss, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "segno " + classeCss;

  const quadro = document.createElement("span");
  quadro.className = "segnoQuadro";
  quadro.setAttribute("aria-hidden", "true");

  const dove = document.createElement("span");   // il nome, fuori campo
  dove.className = "segnoDove";

  const nome = document.createElement("span");   // la parola visibile
  nome.className = "segnoNome";

  b.append(quadro, dove, nome);
  b.onclick = onClick;
  box.appendChild(b);
  return { b, dove, nome };
}

/* Due coppie di comandi, una per classe: a sinistra il modo del materiale, a
   destra l'avvio. Hanno la stessa grafica perché hanno la stessa grammatica —
   un quadro che mostra lo stato e una parola che lo nomina — e stanno agli
   estremi opposti della riga perché governano cose opposte: che cosa suona e
   se suona.                                                                */
const COPPIE = ["gocce", "tessuti"].map((classe, i) => {
  const box = $(i === 0 ? "modiFrasi" : "modiTessuti");
  const chiaveNome = i === 0 ? "modo.frasi" : "modo.tessuti";
  return {
    classe, chiaveNome,
    modo:  costruisciSegno(box, "segnoModo",  () => {
      MODI[classe] = MODI[classe] === "deriva" ? "ancora" : "deriva";
      syncModi();
    }),
    power: costruisciSegno(box, "segnoPower", () => toggleClasse(classe)),
  };
});

/* Una funzione sola tiene allineati i quattro bottoni. Il nome della classe
   sta dentro ciascuno ma fuori campo, e finisce con uno spazio: il nome
   accessibile è la fila dei testi dei figli, e senza si sentirebbe
   «Materiale delle frasiDeriva».                                          */
function syncModi() {
  for (const c of COPPIE) {
    const id = MODI[c.classe], ancorato = id === "ancora";
    c.modo.dove.textContent = T(c.chiaveNome) + " ";
    c.modo.nome.textContent = T("modo." + id);
    c.modo.b.classList.toggle("spento", ancorato);
    /* Premuto = ancorato: è il gesto che ferma il materiale, e lo stato a
       riposo dello strumento è quello che deriva.                        */
    c.modo.b.setAttribute("aria-pressed", ancorato ? "true" : "false");
    c.modo.b.title = T("modo." + id + "Aria");

    /* Il quadro dell'avvio è arancione mentre la classe suona, e allora la
       parola dice «Pausa»: l'etichetta nomina l'AZIONE, come vuole la regola
       del progetto, e il quadro nomina lo stato. Le due cose non si
       contraddicono — dicono due cose diverse nello stesso segno.        */
    const suona = c.classe === "gocce" ? gocceOn : tessutiOn;
    c.power.dove.textContent = T(c.chiaveNome === "modo.frasi" ? "power.frasi" : "power.tessuti") + " ";
    c.power.nome.textContent = suona ? T("power.pause") : T("power.play");
    c.power.b.classList.toggle("spento", !suona);
    c.power.b.setAttribute("aria-pressed", suona ? "true" : "false");
  }
}

/* --- i cinque cursori dei tessuti -------------------------------------------
   A differenza di quelli delle frasi, questi non hanno bisogno di smussatura:
   un tessuto riceve il suo inviluppo nell'istante in cui viene prenotato, e
   da lì non cambia più. Le modifiche valgono per i tessuti successivi — che è
   inevitabile, e onesto: un suono lungo non si può ritoccare mentre dura.

   I valori sono in unità vere, quindi ciascuno ha la sua lettura. Numero e
   unità stanno separati perché quando la stagione inclina un valore se ne
   mostrano due, e l'unità va detta una volta sola: "3,0→3,5 s", come i
   cursori del calore e dello spazio dicono "70→60%".                     */
const LETTURA_D = {
  /* "oct" e "Hz" restano in alfabeto latino in tutte le lingue, e una sigla
     latina attaccata a una cifra si legge male: quelle vogliono lo spazio
     anche in giapponese. I secondi no, perché lì l'unità è 秒, un kanji che
     si attacca al numero come vuole la sua tipografia — e infatti è
     `unit.sep` a saperlo.                                                */
  spread:  { n: v => fmtOne(v / 100 * 4), u: () => " " + T("unit.oct") },
  apri:    { n: v => fmtOne(v),           u: () => T("unit.sep") + T("unit.s") },
  chiudi:  { n: v => fmtOne(v),           u: () => T("unit.sep") + T("unit.s") },
  sovr:    { n: v => fmtTwo(v),           u: () => "" },   // numero puro: quante sovrapposte
  battito: { n: v => fmtTwo(v),           u: () => " " + T("unit.hz") },
};

function letturaTessuti() {
  effettiviTessuti();
  DPARAMS.forEach(k => {
    const L = LETTURA_D[k];
    const scelto = L.n(D[k]);
    /* L'Intreccio non è fra i valori che la stagione inclina, e infatti non
       compare in effD: lì la lettura resta una sola.                      */
    const eff = (k in effD) ? L.n(effD[k]) : scelto;
    $("v_" + k).textContent = (eff === scelto ? scelto : scelto + "→" + eff) + L.u();
  });
}

DPARAMS.forEach(k => {
  $("d_" + k).addEventListener("input", e => {
    D[k] = +e.target.value;
    letturaTessuti();
    /* Intreccio e densità decidono insieme quanto dura ogni tessuto: mosso
       quello, il piano va ricostruito, altrimenti la nuova misura si vedrebbe
       solo al giro dopo.                                                  */
    if (k === "sovr") droni.forEach(buildPlanDrone);
  });
});

/* --- mood dei tessuti -------------------------------------------------------
   Il preset porta anche i due parametri senza cursore — quanti tessuti per
   giro e quanto stanno sotto alle gocce — perché sono il carattere del mood,
   non una manopola.                                                       */
const droniMoodsEl = $("droniMoods");
Object.keys(DRONI_MOODS).forEach((id, i) => {
  const b = document.createElement("button");
  b.className = "mood" + (i === 0 ? " sel" : "");
  b.dataset.droneMood = id;
  b.textContent = droneMoodName(id);
  b.onclick = () => {
    document.querySelectorAll("#droniMoods .mood").forEach(x => x.classList.remove("sel"));
    b.classList.add("sel");
    const m = DRONI_MOODS[id];
    DPARAMS.forEach(k => { D[k] = m[k]; $("d_" + k).value = m[k]; });
    D.dens = m.dens; D.liv = m.liv;
    droni.forEach((L, k) => { L.target = L.period = m.periods[k]; L.idx = 0; });
    restartCycles();
    droni.forEach(regeneraTenute);
    letturaTessuti();
    onDroniChange();
  };
  droniMoodsEl.appendChild(b);
});

/* Il riallineamento della seconda classe, con le stesse unità della prima. */
function onDroniChange() {
  $("realignDroni").textContent = fraseRiallineamento(realignDroni());
  refreshTutteLeRighe();
  syncLinee();
}

/* --- le otto righe di linea -------------------------------------------------
   In Rada questi comandi esistevano due volte: i gesti sul canvas per chi
   guarda, e un doppione nativo fuori campo per chi naviga con la tastiera o
   con un lettore di schermo. Il reticolo unico ha chiuso la questione nel
   modo giusto: gli anelli concentrici sarebbero bersagli impossibili per un
   dito, quindi il doppione È DIVENTATO l'interfaccia. Otto righe visibili,
   nelle due colonne accanto al reticolo — sigla, scala della durata, valore,
   quadratino di stato, ↻ — e un solo binario per tutti.

   Le due classi si costruiscono con lo stesso codice, come i due scheduler:
   cambiano gli estremi della durata, le parole e la funzione che rigenera —
   non il modo in cui i comandi stanno insieme.

   Il quadratino dice lo stato (pieno suona, vuoto tace) e l'aria-label dice
   l'azione, come vuole la regola delle etichette: per un comando-icona con
   aria-pressed è la convenzione giusta, e le parole restano nel dizionario. */
const ROMAN = ["I", "II", "III", "IV"];

function costruisciLinee(boxId, linee, min, max, chiavi, cambiata, rigenera) {
  const box = $(boxId), els = [];
  linee.forEach((L, i) => {
    const row = document.createElement("div");
    row.className = "linea";

    const sig = document.createElement("span");
    sig.className = "lineaSigla";
    sig.textContent = ROMAN[i];

    const dur = document.createElement("input");
    dur.type = "range"; dur.className = "lineaDur";
    dur.min = min; dur.max = max; dur.step = 0.5;
    dur.value = L.target;
    dur.addEventListener("input", e => {
      L.target = +e.target.value;
      cambiata();
    });

    const val = document.createElement("span");
    val.className = "lineaVal";

    const mute = document.createElement("button");
    mute.type = "button"; mute.className = "lineaMute";
    mute.addEventListener("click", () => { L.muted = !L.muted; cambiata(); refreshTutteLeRighe(); });

    const regen = document.createElement("button");
    regen.type = "button"; regen.className = "lineaRegen";
    regen.textContent = "↻";
    regen.addEventListener("click", () => rigenera(L));

    row.append(sig, dur, val, mute, regen);
    box.appendChild(row);
    els.push({ dur, val, mute, regen, L });
  });
  return { els, chiavi };
}

const LINEE = [
  costruisciLinee("lineeFrasi", loops, PERIOD_MIN, PERIOD_MAX,
    { dur: "a11y.duration", mute: "a11y.mute", unmute: "a11y.unmute", regen: "a11y.regen" },
    () => onRealignChange(), regenerate),
  costruisciLinee("lineeTessuti", droni, DRONE_MIN, DRONE_MAX,
    { dur: "a11y.dDuration", mute: "a11y.dMute", unmute: "a11y.dUnmute", regen: "a11y.dRegen" },
    () => onDroniChange(), regeneraTenute),
];

/* Riallinea parole e valori: le prime cambiano con la lingua, i secondi con
   i mood, che riscrivono le durate di tutte le linee in un colpo.          */
function syncLinee() {
  for (const gruppo of LINEE) {
    const k = gruppo.chiavi;
    gruppo.els.forEach((e, i) => {
      const n = ROMAN[i], L = e.L;
      e.dur.value = L.target;
      e.dur.setAttribute("aria-label", T(k.dur, { n }));
      e.dur.setAttribute("aria-valuetext", fmtOne(L.target) + " " + T("canvas.seconds"));
      e.val.textContent = fmtOne(L.target) + T("unit.sep") + T("unit.s");
      e.mute.classList.toggle("muta", L.muted);
      e.mute.setAttribute("aria-label", T(L.muted ? k.unmute : k.mute, { n }));
      e.mute.setAttribute("aria-pressed", L.muted ? "true" : "false");
      e.regen.setAttribute("aria-label", T(k.regen, { n }));
    });
  }
}

/* --- lingua ---------------------------------------------------------------
   Le quattro sigle le costruisce i18n.js, che le fa identiche qui e nella
   guida. La lingua di partenza la decide il browser (vedi detectLang); da qui
   in poi comanda la scelta dell'utente, che resta memorizzata.             */
buildLangSwitch($("langs"));

/* Chiamata da setLang (i18n.js) dopo che il documento è già stato tradotto:
   qui si aggiorna solo ciò che il dizionario non raggiunge da solo, cioè il
   testo costruito a runtime.                                               */
function onLanguageChange() {
  document.querySelectorAll("#moods .mood").forEach(b => {
    b.textContent = moodName(b.dataset.mood);
  });
  document.querySelectorAll("#droniMoods .mood").forEach(b => {
    b.textContent = droneMoodName(b.dataset.droneMood);
  });
  onPowerChange();        // i quattro segni e le due righe di stato
  onRealignChange();      // e con loro le otto righe di linea
  onDroniChange();
  readouts();
  letturaTessuti();       // le unità cambiano con la lingua: "s" diventa "秒"
}

/* --- avvio ----------------------------------------------------------------
   Ogni classe ha il suo segno di avvio; la barra spaziatrice resta il comando
   globale, e accende o spegne le due insieme.                              */
addEventListener("keydown", e => {
  if (e.code === "Space" && !/^(INPUT|BUTTON|TEXTAREA)$/.test(e.target.tagName)) {
    e.preventDefault();
    togglePower();
  }
});

/* --- soglia d'ingresso ----------------------------------------------------
   I browser vietano l'audio prima di un gesto esplicito dell'utente: la
   schermata d'ingresso trasforma quel vincolo in un momento di presentazione.
--------------------------------------------------------------------------- */
$("gate").addEventListener("click", async () => {
  $("gate").classList.add("off");
  /* `inert` e non solo la dissolvenza: la transizione CSS non gira se la
     scheda passa in secondo piano proprio in questo istante, e il bottone
     resterebbe raggiungibile col Tab pur essendo invisibile.              */
  $("gate").inert = true;
  document.querySelector(".stage").inert = false;   // la pagina torna navigabile
  /* Il fuoco va spostato solo se si è entrati da tastiera: chi ha usato il
     mouse non se lo aspetta, e l'anello di messa a fuoco sarebbe rumore in
     un'interfaccia costruita sul poco. Chi invece è entrato col tasto Invio
     resterebbe altrimenti con il fuoco su un elemento appena disattivato.  */
  if (ingressoDaTastiera) COPPIE[0].power.b.focus();
  await togglePower();
});
/* Il bottone è dentro la soglia: il clic risale da solo. Qui si intercetta
   solo la tastiera, perché Invio e spazio su un <button> non generano un
   clic sull'antenato in tutti i browser.                                   */
let ingressoDaTastiera = false;
$("enter").addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    ingressoDaTastiera = true;
    $("gate").click();
  }
});

applyI18n();
onRealignChange();
onDroniChange();          // aggiorna anche le due righe di stato
DPARAMS.forEach(k => { $("d_" + k).value = D[k]; });
letturaTessuti();
readouts();
syncModi();

/* Finché il cancello è chiuso, tutto ciò che sta dietro è fuori gioco: senza
   questo il Tab uscirebbe dalla soglia e andrebbe a dare fuoco a comandi che
   nessuno può vedere. `inert` fa esattamente questo, ed è ignorato senza
   danni dai browser che non lo conoscono.                                 */
document.querySelector(".stage").inert = true;
$("enter").focus();

/* Qui stava la rete per il caso in cui p5 non arrivasse dal CDN: un avviso al
   posto del canvas e un battito di riserva per tenere vivi i cursori. Tolta
   la libreria, non c'è più niente che possa non arrivare — il disegno è
   codice di questo repository come il resto.                               */
