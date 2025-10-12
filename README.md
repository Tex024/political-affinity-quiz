# 🗳️ Quiz Struttura e Logica

Questo documento descrive la struttura, l'interfaccia e la logica dei dati del quiz.

---

## Sezione 1: Modalità di Risposta e Interfaccia Utente

Il quiz è composto da una serie di affermazioni tematiche. L'utente è chiamato a esprimere il proprio **grado di accordo o disaccordo** scegliendo una delle cinque opzioni disponibili.

### Scala di Valutazione

| Emozione | Descrizione              | Punteggio (Score) |
| :------- | :----------------------- | :---------------- |
| **😡**   | Totalmente in disaccordo | **0**             |
| **🙁**   | In disaccordo            | **1**             |
| **😐**   | Neutrale                 | **2**             |
| **🙂**   | D'accordo                | **3**             |
| **🤩**   | Totalmente d'accordo     | **4**             |

### Opzione "Non Interessato"

L'opzione ***"Non Interessato"*** è disponibile per saltare le domande non rilevanti o non di interesse per l'utente. La selezione di questa opzione **non influisce** in alcun modo sul calcolo dei risultati finali.

---

## 💻 Sezione 2: Struttura Dati e Logica (Backend)

Questa sezione descrive l'organizzazione dei file e la logica di posizionamento dei partiti.

### 2.1 Organizzazione dei Topic

Tutti i dati del quiz sono organizzati per **topic** (argomenti).

* **Cartella `topics/`**: Contiene tutti i file JSON individuali di ogni argomento.
* **Indice dei Topic (`topics.json`)**: Un file JSON che elenca i tutti gli argomenti/quiz disponibili.

```json
{
    "topics":
    [
        {
            "name": "nucleare",
            "description": "quiz sul nucleare",
            "active": true,
            "partiti": {
                "Lega": "descrizione della positione",
                "FdI": "descrizione della positione",
                "FI": "descrizione della positione",
                "Italia Viva": "descrizione della positione",
                "Azione": "descrizione della positione",
                "PD": "descrizione della positione",
                "M5S": "descrizione della positione",
                "VeS": "descrizione della positione"
            }
        },
        {
            "name": "generale",
            "description": "quiz generale",
            "active": true,
            "partiti": {
                "Lega": "descrizione della positione",
                "FdI": "descrizione della positione",
                "FI": "descrizione della positione",
                "Italia Viva": "descrizione della positione",
                "Azione": "descrizione della positione",
                "PD": "descrizione della positione",
                "M5S": "descrizione della positione",
                "VeS": "descrizione della positione"
            }
        }
    ]
}
```

### 2.2 Struttura del File Topic

Ciascun file topic (es. nucleare.json) contiene un array di domande (domande) relative a quell'argomento.

Schema di un Topic File:

```json
{
    "domande": [
        {
            "domanda": "Domanda 1",
            "id": 1,
            "descrizione": "Descrizione dettagliata della domanda 1",
            "spiegazione": {
                "daccordo": "spiegazione dell'essere daccordo",
                "neutrale": "spiegazione dell'essere neutrale",
                "disaccordo": "spiegazione dell'essere in disaccordo"
            },
            "partiti": {
                "Lega": [2, 0],
                "FdI": [3, 1],
                "FI": [0, 2],
                ...
            }
        }
        // ... altre domande
    ]
}
```

| Campo           | Tipo    | Descrizione                                                                                             |
| :-------------- | :------ | :------------------------------------------------------------------------------------------------------ |
| **domanda**     | Stringa | L'affermazione principale presentata all'utente.                                                        |
| **id**          | Intero  | Un identificatore univoco per la domanda.                                                               |
| **descrizione** | Stringa | Contesto aggiuntivo o dettaglio della domanda.                                                          |
| **spiegazione** | Oggetto | Dettagli sui vari punti di vista (Accordo, Neutrale, Disaccordo).                                       |
| **partiti**     | Tupla   | **Definizione cruciale:** Le posizioni ufficiali dei partiti sull'affermazione sottoforma di gaussiane. |

### 2.3 Logica Gaussiana delle Posizioni dei Partiti

Per ogni partito, la posizione ufficiale su una determinata affermazione è rappresentata mediante una *gaussiana discreta* definita sui cinque punti della scala: `x = [0, 1, 2, 3, 4]`.

#### Parametri

* `mean` (μ): valore reale nell'intervallo [0, 4] che rappresenta la posizione centrale del partito (0 = totalmente in disaccordo, 4 = totalmente d'accordo).
* `std` (σ): deviazione standard (> 0) che indica quanto la posizione è "diffusa" attorno alla media. Se `std = 0`, la posizione è puntuale (dirac) e assume tutta la massa nel punto più vicino a `mean`.

#### Passo matematico (valutazione della gaussiana)

1. Si valuta la funzione di densità gaussiana (pdf) sui punti discreti x = 0,1,2,3,4 con la formula:

   $$ g(x) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right) $$


2. Si costruisce il vettore continuo `g = [g(0), g(1), g(2), g(3), g(4)]`.

3. **Rescaling**: si normalizza `g` in modo che il massimo valore diventi 1. Si ottiene il vettore `r` con:

   $$
   r(x) = \frac{g(x)}{\max_{k\in{0..4}} g(k)}
   $$

   Questo assicura che il punto più probabile della gaussiana corrisponda a peso 1.

4. **Precisione**: ogni valore di `r` viene **troncato** (non arrotondato) alla prima cifra decimale (precisione = 0.1). Il troncamento si ottiene con l'operazione:

   $$ t(x) = \left\lfloor r(x) \times 10 \right\rfloor / 10 
   $$

   dove `floor` è la funzione parte intera. Questo significa che 0.69 -> 0.6, 0.10 -> 0.1, 0.05 -> 0.0.

5. Il vettore finale assegnato al partito per quella domanda è `t = [t(0), t(1), t(2), t(3), t(4)]`.


Esempi:

```
[μ=0,σ=0]   -> t=[1.0, 0.0, 0.0, 0.0, 0.0]
[μ=0,σ=0.5] -> t=[1.0, 0.1, 0.0, 0.0, 0.0]
[μ=0,σ=0.6] -> t=[1.0, 0.2, 0.0, 0.0, 0.0]
[μ=0,σ=0.7] -> t=[1.0, 0.3, 0.0, 0.0, 0.0]
[μ=0,σ=0.8] -> t=[1.0, 0.4, 0.0, 0.0, 0.0]
[μ=0,σ=0.9] -> t=[1.0, 0.5, 0.0, 0.0, 0.0]
[μ=0,σ=1]   -> t=[1.0, 0.6, 0.1, 0.0, 0.0]
[μ=0,σ=1.1] -> t=[1.0, 0.7, 0.2, 0.0, 0.0]
[μ=0,σ=1.2] -> t=[1.0, 0.7, 0.3, 0.1, 0.0]
[μ=0,σ=1.3] -> t=[1.0, 0.8, 0.4, 0.1, 0.0]
[μ=0,σ=1.4] -> t=[1.0, 0.8, 0.5, 0.2, 0.0]
[μ=0,σ=1.5] -> t=[1.0, 0.9, 0.5, 0.3, 0.1]
[μ=0,σ=1.6] -> t=[1.0, 0.9, 0.6, 0.3, 0.1]
[μ=0,σ=1.7] -> t=[1.0, 0.9, 0.6, 0.4, 0.1]
[μ=0,σ=1.8] -> t=[1.0, 0.9, 0.7, 0.4, 0.1]
[μ=0,σ=1.9] -> t=[1.0, 0.9, 0.7, 0.5, 0.1]
[μ=0,σ=2]   -> t=[1.0, 0.9, 0.6, 0.3, 0.1]

```