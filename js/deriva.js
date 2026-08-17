/* =============================================================================
   RADA2 · deriva.js — il tempo lungo

   Rada teneva quattro frasi sfasate con periodi interi coprimi: nessuna coppia
   condivide un divisore, quindi il collage non si ripete presto. Ma era una
   promessa sulla COMBINAZIONE, non sullo STATO. I parametri restavano fermi
   dove li avevi messi, la scala era una pentatonica fissa, e dopo un'ora lo
   strumento era esattamente dov'era all'inizio: imprevedibile e immobile.

   Qui la stessa idea sale di un piano. Lo stato del pezzo è un punto su un
   toro, e ogni dimensione gira alla propria velocità; le velocità però non
   stanno in rapporti coprimi ma in rapporti IRRAZIONALI — √2, √3, √5, √7, √11.
   Per il teorema di Kronecker un'orbita con frequenze razionalmente
   indipendenti è densa sul toro e non si chiude mai: lo stato non ripassa mai
   esattamente dov'è già stato. Coprimalità fra interi diventa indipendenza
   razionale fra reali; la promessa è la stessa, cresciuta di un ordine.

   La scelta delle radici non è decorativa. Le radici quadrate di interi
   distinti liberi da quadrati, prese insieme a 1, sono linearmente
   indipendenti sui razionali: è il fatto classico che rende il teorema
   applicabile. Sostituirle con numeri qualunque — 1,3 e 1,7 e 2,1 — perde
   l'indipendenza e riporta a un'orbita che prima o poi si richiude, cioè
   esattamente al difetto che questo file esiste per togliere.

   NON DIPENDE DA NULLA, ed è il primo file caricato dopo le traduzioni: la
   deriva è sotto al modello, non accanto. Le dipendenze scorrono
   deriva ← model ← audio ← disegno/ui.
============================================================================= */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* --- i canali della deriva -------------------------------------------------
   Sei velocità. Il giro più lento è di nove minuti, il più rapido di poco
   meno di tre: abbastanza lenti da non leggersi come un'oscillazione,
   abbastanza rapidi da spostare qualcosa nell'arco di un ascolto.

   Le fasi iniziali sono casuali, e per questo due sessioni non cominciano
   mai nello stesso punto del toro.                                        */
const DERIVA_LENTA = 540;
const RADICI = [1, Math.SQRT2, Math.sqrt(3), Math.sqrt(5), Math.sqrt(7), Math.sqrt(11)];
const FASI = RADICI.map(() => Math.random());

function canale(k, t) {
  return Math.sin(2 * Math.PI * (FASI[k] + t * RADICI[k] / DERIVA_LENTA));
}

/* Nessun parametro pende da un canale solo: tre canali sommati con pesi
   diversi danno una curva che l'orecchio non riconosce come periodica, mentre
   una sinusoide sola — per quanto lenta — si sente andare e tornare. I pesi
   sommano a uno, così il risultato resta in −1..1 e le ampiezze si leggono
   dove vengono applicate, non qui.                                        */
function misto(t, a, b, c) {
  return canale(a, t) * 0.55 + canale(b, t) * 0.30 + canale(c, t) * 0.15;
}

/* I valori correnti della deriva, in −1..1. Chi li usa decide di quanto
   pesano: qui non c'è nessuna unità, solo la forma del movimento.         */
const deriva = { tonica: 0, dens: 0, spread: 0, head: 0, corpo: 0 };

/* --- il campo armonico ----------------------------------------------------
   Due movimenti indipendenti, uno continuo e uno a scatti.

   La TONICA deriva senza fermarsi, entro poche centinaia di centesimi.
   Nessuna nota scivola — ognuna nasce e muore alla sua altezza — ma il campo
   da cui sono prese si sposta, e mezz'ora dopo non è dov'era. Non è accordata
   ad alcun riferimento esterno, e non deve esserlo: qui non suona nient'altro.

   La COLLEZIONE gira sul circolo delle quinte, un passo per volta. Fra una
   pentatonica e quella della sua quinta cambia UNA nota su cinque — {do re mi
   sol la} contro {sol la si re mi} — ed è il passo più piccolo che esista fra
   due collezioni consonanti. Per questo il cambio non ha un bordo che si
   senta: te ne accorgi dopo, come della luce che cambia in una stanza.

   Dodici passi chiuderebbero il giro. Ma la tonica intanto si è spostata di
   una quantità che non è frazione di nulla, e il secondo giro non è il primo.
   È qui che le due promesse si tengono a vicenda: da sola la collezione
   tornerebbe, da sola la tonica sarebbe un campo senza armonia.

   La pentatonica anemitonica resta la garanzia ereditata da Rada — nessun
   semitono, nessun tritono, nessuna combinazione sgradevole possibile.
   Cambiarla in una collezione che contenga semitoni è una decisione musicale
   grossa, non una regolazione.                                            */
const GRADI = [0, 2, 4, 7, 9];
const TONICA_BASE = 261.63;
const AMPIEZZA_TONICA = 350;   // centesimi, in ciascun verso
const PASSO_QUINTA = 150;      // secondi fra un passo e il successivo, in media

/* Il giro parte da un punto qualsiasi del circolo: due sessioni non aprono
   nella stessa tonalità. `quinta` è dove ci si trova, `passiQuinta` è quanta
   strada si è fatta da quando si ascolta — e sono due cose diverse, perché
   la prima è un punto su dodici e la seconda non ha un tetto. In interfaccia
   va la seconda: la prima non direbbe niente a nessuno, visto che il nome
   della tonalità qui non esiste.                                           */
let quinta = Math.floor(Math.random() * 12);
let passiQuinta = 0;
let prossimaQuinta = PASSO_QUINTA * (0.75 + Math.random() * 0.5);

/* Venti frequenze, quattro ottave per cinque gradi: stessa forma della SCALE
   di Rada, così `playDrop` e `playTone` continuano a indicizzarla come prima.
   La differenza è che il contenuto adesso si muove.

   Si riscrive IN POSTO. Il vettore è letto dal thread principale a ogni goccia
   prenotata, e riallocarlo due volte al secondo per la vita della sessione
   sarebbe spazzatura gratuita in un progetto che sta attento alle
   allocazioni.                                                            */
const SCALE = new Array(20);

function costruisciCampo() {
  const base = TONICA_BASE * Math.pow(2, deriva.tonica * AMPIEZZA_TONICA / 1200);
  const q = (quinta * 7) % 12;
  let n = 0;
  for (let oct = -2; oct <= 1; oct++)
    for (const g of GRADI)
      SCALE[n++] = base * Math.pow(2, (oct * 12 + (g + q) % 12) / 12);
  SCALE.sort((a, b) => a - b);
}

/* Quando il campo è stato ricostruito l'ultima volta, sul clock audio. */
let ultimoCampo = -99;

/* --- l'avanzamento --------------------------------------------------------
   Chiamata dallo scheduler, con il tempo del MOTORE AUDIO e non con quello di
   sistema. La differenza conta: `ctx.currentTime` si ferma quando il contesto
   è sospeso, quindi in pausa la deriva aspetta invece di correre di nascosto.
   È la stessa promessa che la pausa fa già per i cicli — si riprende da dov'era
   — estesa alla sola cosa che in Rada non aveva un "dov'era".              */
function avanzaDeriva(t) {
  /* Ogni parametro pesca da una terna diversa: se due parametri condividessero
     tutti e tre i canali si muoverebbero all'unisono, e la deriva si
     ridurrebbe a una manopola sola tirata da una mano invisibile.         */
  deriva.tonica = misto(t, 0, 3, 5);
  deriva.dens   = misto(t, 1, 4, 2);
  deriva.spread = misto(t, 2, 0, 4);
  deriva.head   = misto(t, 3, 1, 5);
  deriva.corpo  = misto(t, 4, 5, 0);

  if (t >= prossimaQuinta) {
    quinta++; passiQuinta++;
    prossimaQuinta = t + PASSO_QUINTA * (0.75 + Math.random() * 0.5);
    ultimoCampo = -99;                 // il salto di collezione non aspetta
  }

  /* Due volte al secondo bastano: in mezzo secondo la tonica si sposta di
     frazioni di centesimo, molto sotto la soglia a cui una nota nuova suoni
     diversa dalla precedente. Ricostruire a ogni giro dello scheduler
     significherebbe quaranta volte tanto per un risultato identico.       */
  if (t - ultimoCampo >= 0.5) { costruisciCampo(); ultimoCampo = t; }
}

/* Quanto la tonica si è spostata, in centesimi: lo legge la riga di stato.
   Il modello non sa dirlo a parole, come non sa dire "notturna": la frase la
   compone i18n.js.                                                        */
function derivaCents() { return deriva.tonica * AMPIEZZA_TONICA; }

/* Il campo esiste già prima del primo giro dello scheduler: `playDrop` non
   deve mai trovarsi davanti a un vettore di `undefined`.                  */
costruisciCampo();
