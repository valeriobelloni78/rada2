# Rada2

**Un pezzo che non finisce, non culmina, e su cui si può suonare.**

Rada2 è uno strumento generativo che vive nel browser, ramo divergente di
[Rada](https://github.com/valeriobelloni78/rada). Non riproduce un brano
registrato: costruisce il suono in tempo reale — e, a differenza di Rada,
va da qualche parte. L'armonia modula, il materiale si rinnova una goccia per
volta, e dopo un'ora lo strumento non è dov'era.

**L'accordatura è fissa e la tonalità è dichiarata**, così ci si può prendere
uno strumento e accompagnarlo.

→ **[Ascolta Rada2](https://valeriobelloni78.github.io/rada2/)** · [Guida](https://valeriobelloni78.github.io/rada2/guida.html)

---

## L'idea

Otto linee sonore — quattro frasi di gocce, quattro tessuti tenuti — girano
ciascuna col proprio periodo, e i periodi sono **coprimi a due a due**: nessuna
coppia condivide un divisore, quindi le linee si incontrano ogni volta in una
combinazione diversa. È l'eredità di Rada, e il debito verso il *Music for
Airports* di Brian Eno resta dichiarato.

Ma in Rada quello era tutto: la combinazione non si ripeteva, e intanto lo
strumento restava immobile — stessa scala, stessi parametri, stesse quattro
frasi per ore. Rada2 aggiunge il **tempo lungo**, molto più lento di quello
delle frasi, e su di esso tre movimenti:

- **L'armonia modula.** Il campo delle altezze si sposta sul circolo delle
  quinte ogni due minuti e mezzo esatti — regolari, così chi accompagna può
  contare quanto manca. Fra una collezione e la successiva cambia **una nota su
  cinque**, il passo più piccolo che esista fra due collezioni consonanti: non
  ha un bordo udibile, te ne accorgi dopo. A non essere prevedibile è la
  direzione, su o giù di una quinta, presa da una successione costruita sulla
  sezione aurea che non è periodica: il giro circola lentamente invece di
  marciare, e passa e ripassa per le tonalità vicine come una modulazione vera.
- **Il materiale si rinnova.** Ogni frase cambia una goccia per volta, a tempi
  incommensurabili fra le otto linee: momento per momento la frase è ancora
  quella, qualche minuto dopo non ne è rimasta nessuna — e non c'è stato un
  istante in cui si potesse indicare il cambio.
- **I parametri respirano.** Registro, densità e addensamento pendono da sei
  canali che girano a velocità in rapporto √2 : √3 : √5 : √7 : √11 : 1 —
  razionalmente indipendenti, quindi per il teorema di Kronecker l'orbita è
  densa e non si chiude mai. La coprimalità fra interi, salita di un piano.
  Fra questi c'è il **baricentro**: le altezze restano ferme e intonate, a
  scorrere con continuità è il punto attorno a cui vengono pescate. Si sente
  come una musica che sale e scende senza che si possa indicare il momento, ed
  è lì che vive tutto il movimento continuo che prima stava nell'accordatura.

L'interfaccia dichiara tre cose in due righe: la riga grigia dice quando le
**fasi** tornano nella stessa combinazione, la riga arancione dice quanta
strada il pezzo ha fatto — quanti passi di quinta — e **in che tonalità sei
adesso**, che è ciò che serve per suonarci sopra.

Una nota onesta sul non-ritorno: con l'accordatura fissa le altezze possibili
sono un insieme finito, e le dodici tonalità si rivedono tutte, molte volte. A
non tornare è lo *stato* — baricentro, fasi, materiale — non l'altezza delle
note. È un non-ritorno più debole di quello che si avrebbe lasciando scivolare
l'accordatura, ed è il prezzo scelto della suonabilità.

## Come si usa

Il reticolo al centro è puro display: tutti i comandi sono elementi HTML
nativi, e funzionano identici con il puntatore, con il dito, con il tasto Tab
e con un lettore di schermo.

| Comando | Effetto |
|---|---|
| Scala graduata di una riga | cambia la durata di quella linea (entra al giro successivo) |
| Quadratino di una riga | silenzia o riattiva quella linea (pieno suona, vuoto tace) |
| ↻ di una riga | genera una nuova idea musicale per quella linea |
| Barra spaziatrice | avvia e ferma tutto; ogni classe ha anche il suo pulsante |

I cinque cursori delle frasi e i cinque dei tessuti governano il suono
d'insieme. Quasi tutti mostrano **due numeri** quando serve: il primo è dove
hai messo il cursore, il secondo è ciò che sta davvero suonando — perché tre
influenze inclinano i valori senza toccare i cursori: l'ora del giorno (sulle
gocce), la stagione (sui tessuti) e la deriva (su entrambe, da dentro).

Gli otto **mood** per classe sono preset completi — timbro *e* configurazione
temporale — e rigenerano le idee.

## Che cosa si vede

- **Otto anelli concentrici**: le frasi dentro, i tessuti fuori. Le gocce sono
  tacche radiali — la lunghezza è il registro, e il profilo melodico di ogni
  idea si legge a colpo d'occhio; i tessuti sono archi che durano. Otto punti
  arancioni percorrono gli anelli: sono le fasi udibili, lette dai cicli reali
  dello scheduler.
- **Sul bordo, il tempo lungo**: dodici tacche per il circolo delle quinte con
  la posizione corrente marcata, e un arco pesante che rolla col baricentro —
  a destra il pezzo sta alto, a sinistra basso. È il segno più lento della
  pagina.
- **La fascia, tre letture**: gli ultimi 30 secondi delle quattro frasi, una
  tacca per goccia — lo sfasamento reale, visto; quattro file ferme di puntini
  per i tessuti, dove i puntini accesi dicono quanto è avanzata ogni tenuta in
  corso — arancione soltanto la più recente fra tutte, cioè l'ultima entrata
  nella trama, inchiostro le altre; e gli
  ultimi 30 minuti della deriva come istogramma di puntini — ogni colonnina
  un'altezza del baricentro, da zero a quattro sopra o sotto l'asse, e
  arancione quella in cui cade un passo di quinta.
  Le prime scorrono e ricordano, le guide stanno ferme e dicono adesso.
- Quando due gocce di frasi diverse suonano quasi insieme, un filo sottile le
  unisce per un istante attraverso gli anelli: è il collage còlto sul fatto.

**L'interfaccia parla quattro lingue** — italiano, francese, inglese e
giapponese — e sceglie da sé quella del browser alla prima apertura. Si cambia
dalle sigle in alto, anche mentre suona; si può imporre con `?lang=ja`.

## Come funziona, tecnicamente

Nessuna dipendenza da installare, nessun passaggio di compilazione: si apre
`index.html` e funziona, anche senza rete.

```
index.html          lo strumento: struttura e collegamenti
guida.html          la pagina di documentazione
css/style.css       palette, tipografia, impaginazione
css/guida.css       impaginazione della sola guida
js/i18n.js          le quattro lingue. Non dipende da nulla
js/guida-i18n.js    le parole della guida, sempre nelle quattro lingue
js/deriva.js        il tempo lungo: i sei canali e il campo armonico. Non dipende da nulla
js/model.js         lo stato: frasi, idee, piani, ricambio
js/audio.js         Web Audio API: sintesi, scheduler e memorie per il disegno
js/disegno.js       il reticolo e la fascia, su un solo canvas
js/ui.js            righe di linea, cursori, mood, lingua, righe di stato
testi-guida.md      tavolo di lavoro dei testi italiani della guida
```

**Il suono usa la Web Audio API direttamente.** Il cuore è uno *scheduler a
lookahead*: ogni 25 ms prenota le note sul clock del motore audio, preciso al
singolo campione. La finestra è adattiva — 150 ms quando la pagina si vede,
tre secondi in secondo piano, fino a dodici a schermo bloccato. La deriva
avanza dentro lo scheduler, sul tempo del motore audio: in pausa il pezzo
aspetta, non corre di nascosto.

**Il tempo lungo sta tutto in `js/deriva.js`.** Le velocità dei canali sono
radici quadrate di interi liberi da quadrati: con 1 sono linearmente
indipendenti sui razionali, ed è questo — non una speranza — a garantire che
l'orbita non si richiuda. Sostituirle con numeri qualunque perde il teorema.

**L'accordatura è ancorata al la 440**, con il do di riferimento calcolato
(`440 · 2^(−9/12)`) e non scritto a mano: il `261,63` che si legge ovunque è
arrotondato, e quei due decimali valgono tre centesimi di semitono. Verificato
numericamente su 864.000 altezze: scarto massimo dal temperamento equabile,
zero.

**La grafica usa l'API 2D del browser, su un solo canvas** che non ascolta
nulla: l'interazione passa dagli elementi nativi, e la pagina scorre da sé.
La palette è definita una volta sola, nelle variabili CSS di `style.css`:
anche il canvas la legge.

## Modificarlo

Il punto d'ingresso più interessante è `js/deriva.js`: ampiezze, velocità e
passo delle quinte sono lì, in un file corto che non dipende da nulla. Per le
configurazioni temporali guarda `MOODS` in `js/model.js` — e ricordati la
regola dei periodi coprimi. Le chiavi sono identificatori: i nomi visibili
stanno in `js/i18n.js`, uno per lingua.

## Limiti noti

- In secondo piano il browser rallenta i timer, ma il thread audio no: lo
  scheduler se ne accorge e prenota più avanti — tre secondi, fino a dodici a
  schermo bloccato.
- Su iOS Rada2 si dichiara al sistema come riproduzione musicale, così da
  restare viva a schermo bloccato; ne consegue che suona anche con
  l'interruttore del silenzioso inserito. Se il sistema congela del tutto la
  pagina non c'è finestra che tenga: servirebbe un AudioWorklet.

## Licenza

Codice rilasciato sotto licenza **MIT** — vedi [LICENSE](LICENSE). Non c'è
codice di terzi: nessuna libreria, nessuna licenza da rispettare oltre a
questa.

---

## In English

**Rada2** is a generative sound instrument in the browser — a diverging branch
of [Rada](https://github.com/valeriobelloni78/rada). Eight lines (four phrases
of drops, four sustained weaves) loop at pairwise-coprime periods, so they
never meet the same way twice. That much is inherited; what's new is that the
piece **goes somewhere** — and that **you can play along with it**. The
harmonic field modulates around the circle of fifths every 2½ minutes exactly,
one common-tone step at a time, the direction taken from a non-periodic
golden-ratio sequence; each phrase renews itself one drop at a time; and
register, density and clustering breathe on six channels whose rates are
√2 : √3 : √5 : √7 : √11 : 1 — rationally independent, so by Kronecker's theorem
the orbit never closes. Tuning is fixed and anchored to A440 (verified to zero
cents of deviation) and the current key is displayed, so an instrument can
follow. An hour in, the piece is somewhere else.

The display is a single reticle: eight concentric rings (tick length = pitch,
arcs = held tones, amber dots = audible phase), the circle of fifths and a
heavy centre-of-gravity arc on the rim, and a strip below — the last 30
seconds of the four phrases, four still rails of dots showing how far each
sounding weave has got, and the last 30 minutes of the drift as a dot
histogram (amber where a step of a fifth lands). All controls are
native HTML (the canvas listens to nothing), so pointer, touch, keyboard and
screen readers share one path. Four languages, switchable live, `?lang=ja` to
force one.

Audio is direct Web Audio API with a sample-accurate lookahead scheduler; the
drift advances on the audio clock, so pausing pauses the piece. No build step,
no libraries — open `index.html` and it runs, even offline. MIT licensed.
