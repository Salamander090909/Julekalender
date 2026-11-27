# Julekalender

## Prosjektbeskrivelse
    Julekalenderen er en nettside som gjør det mulig for elever på Bleiker VGS å svare på jule spørsmål hver dag, for å være med i trekningen for premier. Alle brukere registrerer seg med afk eposten deres før de svarer. Dette gjør at en admin kan trekke en tilfeldig vinner ut av alle brukerene.

## Funksjonalitet
    Brukerene kan registere seg med en mail, svare på dagens luke spørsmål eller gå til tidlige luker for å se hvem som vant.
    De som er administratorer på nettsiden kan gå inn til en egen side for å ha oversikt. Der kan man se alle brukere som er registrert i databasen, se alle svarene fra alle lukene, og de kan sortere etter flere ting. De kan sortere svarene etter både luke nummer og søkeord som de velger selv. Der kan de huke av om svaret er riktig, og trekke en vinner.

## Teknologier
    Her er en oversikt over alle teknologier jeg har brukt i prosjekte:

### Applikasjon
- **Node.js**: kjører serveren
- **Express**: rammeverk for ruter og forespørsler
- **EJS**: brukes for å sette opp alle sidene
- **HTML og CSS**: oppsett og design

### Database
- **MongoDB**: lagrer all informasjon, som luker, brukere og besvarelser
- **mongomodeler.com**: brukt til å skissere databasen

### Drift og utrulling
- **Ubuntu Server 24.04.3**: Linux serveren nettsiden kjører på
- **Proxmox**: programmet jeg brukte for å lage VM'en
- **pm2**: kjører applikasjonen fra Linux serveren
- **.env / .env.example**: variabler som ikke skal bli pushet til github
- **SSH-nøkler**: for å ha tilgang til serveren uten passord

### Versjonskontroll og planlegging
- **Git og GitHub**: kildekode og historikk
- **GitHub Projects**: planlegging og oppfølging av oppgaver

### Andre biblioteker
- **Embed im**: Java Script for snøen på skjermen

## Installasjon
    Før du starter å klone prosjekte må du sjekke om du har dette installert:
- **Git**
- **Node**
- **Npm**

Sjekk Git ved å skrive 
```bash
git --version
```
Sjekk Node og Npm ved å skrive 
```bash
node --version
npm --version
```
Vis du fikk en feilmelding, må du laste de ned på deres offesielle nettsider, vis den skrev noe ut kan du gå vidre.

Først kloner du prosjekte i den mappen du vil ha den i. Da kan du skrive inn denne linjen i terminal.
```bash
git clone https://github.com/Salamander090909/Julekalender.git
```
Etter det går du inn i mappen "Julekalender" og skriver
```bash
npm install
```
Dette er for å installere alle de relevante tingene slik at prosjekte funker. Du kan se hva som blir installert ved å gå inn i "package.json" filen.

## Konfigurasjon
Vis du går inn i .env.example mappen finner du tre variabler som er tomme. Der skal det stå
```bash
PORT=
MONGODB_URI=
SECRET_JWT=
```
"PORT" er for hvilken port på pcen du skal kjøre nettsiden på, der kan du for eksepel velge 4000.

"MONGODB_URI" er der du skal lime inn din connection string som du finner i Mongo DB, den starter som regel med "mongodb://localhost".

"SECRET_JWT" skriver du en lang tilfeldig kombinasjon av tall og bokstaver som ingen skal klare å gjette. Dette er det som validerer om alle cookiesene er til din nettside.

Når du er ferdig fjerner du .example fra navnet slik at filen heter ".env"

## Legge inn luker i databasen
Lukene ligger i filen "luker.json" og må legges inn i databasen før nettsiden viser noe. Dette gjør du med seed-scriptet. Pass på at ".env" er ferdig utfylt og at MongoDB kjører, og skriv så:
```bash
node seed.js
```
Hvis alt gikk bra står det "Importerte 24 luker" i terminalen. Du trenger bare gjøre dette en gang. Hvis det allerede finnes luker i databasen, avbryter scriptet uten å endre noe, så det er trygt å kjøre det flere ganger.

## Database
I databasen er det disse tre tingene som blir lagret
- **Luker**
- **Besvarelser**
- **Users**

I lukene lagres alle spørsmål, riktig svar og hva slags type spørsmål luken inneholder. Det lagres også klasse som sier hvor høy eller bred den skal være når luken vises på hjemmesiden. Lukens nummer er kanskje det viktigste som lagres og det går gjennom flere ganger i koden.

Besvarelsen brukes mest for å sette svaret til brukeren sammen med deres user id, dette gjør vi for å finne ut av hvem som svarte hva, og hvem som blir trekket til vinner.

Users er igjen noe av det som for hele nettsiden til å fungere. Den gir alle brukere som registrerer seg en unik id og et username utifra hva mailen deres er. Når en bruker blir registrert for den som default elev som rolle, dette er for at den ikke skal ha tilgang til alle admin funksjonene. For at noen skal få denne tilgangen så trenger brukeren å få bytte "role" til admin, og dette er det kun eieren av databasen som kan gjøre.

## Oppstart
For å starte nettside lokalt på pcen din så bruker vi Nodemon som vi installerte når vi skrev "npm install". Kommandoen er:
```bash
nodemon app.js
```

## Utrulling

### Hvordan delene henger sammen

Brukeren åpner nettsiden i nettleseren. Forespørselen går til Node.js/Express-applikasjonen på serveren. Applikasjonen henter og lagrer data i MongoDB, lager siden med EJS og sender den tilbake til brukeren. pm2 sørger for at applikasjonen alltid kjører.

### Serveren

| Egenskap | Verdi |
|---|---|
| Plattform | Proxmox sette opp en vm |
| Operativsystem | Ubuntu Server 24.04.3 |
| CPU | 5 kjerner |
| Minne | ca. 4,3 GiB RAM |
| Disk | 32 GB |
| IP-adresse | DIN-IP |
| Åpne porter | 22 (SSH), 80/443 (web) |

**Begrunnelse for spesifikasjonene:** 
Dette er nok til en så liten webaplikasjon

### Brukere og roller

| Bruker | Gruppe | Rolle | Tilgang |
|---|---|---|---|
| DINBRUKER | sudo | Utvikler og administrator | SSH med nøkkel |

**Begrunnelse:** 
Serveren trenger minst en bruker som kan administrere den, i dette tilfelle trenger vi bare en. Vis du har tenkt til å legge til flere brukere er dette også mulig, så lenge man er forsiktig med hvem som får sudo retigheter.

### Steg for steg

**1. Oppdater serveren**
```bash
sudo apt update && sudo apt upgrade -y
```

**2. Installer Node.js, npm og Git**
```bash
KOMMANDOENE DU BRUKTE
```

**3. Installer og start MongoDB**
```bash
KOMMANDOENE DU BRUKTE
sudo systemctl enable --now mongod
```

**4. Opprett brukere og legg inn SSH-nøkler**
Legg den offentlige nøkkelen til deg selv og hver lærer i `~/.ssh/authorized_keys` for riktig bruker.

**5. Hent prosjektet**
```bash
cd /var/www
sudo git clone https://github.com/Salamander090909/Julekalender.git
cd Julekalender
```

**6. Sett eier og rettigheter**
```bash
sudo chown -R APPBRUKER:www-data /var/www/Julekalender
sudo chmod -R 750 /var/www/Julekalender
```

**7. Lag .env**
```bash
cp .env.example .env
nano .env
```
Fyll inn verdiene (se Konfigurasjon). `.env` skal ikke ligge i GitHub.

**8. Installer avhengigheter**
```bash
npm install --omit=dev
```

**9. Start med pm2**
```bash
pm2 start app.js --name Julekalender
pm2 save
pm2 startup
```
Siste kommando gjør at applikasjonen starter automatisk når serveren starter på nytt.

**10. Sjekk at det fungerer**
Åpne `http://DIN-IP` i nettleseren, og kjør `pm2 status` for å se at applikasjonen kjører.

### Oppdatere løsningen

```bash
cd /var/www/Julekalender
git pull
npm install --omit=dev
pm2 restart Julekalender
```

### Nyttige kommandoer

| Kommando | Hva den gjør |
|---|---|
| `pm2 status` | Viser om appen kjører |
| `pm2 logs Julekalender` | Viser feilmeldinger og logger |
| `pm2 restart Julekalender` | Starter appen på nytt |
| `sudo systemctl status mongod` | Sjekker om databasen kjører |

## Brukerveiledning

### Bruker
Når du først kommer inn på nettsiden kan du først se rundt på det fine designe, så går du inn på dagens luke. Da vil du komme frem til registrering, siden du ikke er registrert enda. Etter du har registrert deg med en gyldig epost kan du gå tilbake inn i luken og svare på spørsmålet. Vis du svarer riktig vil du automatisk være med i trekningen av en premie, vis du vinner for du vite dette dagen etterpå.

### Admin
Vis du er admin må du gå til registrering siden og logge inn med eposten du er tildelt. Vis du skriver riktig vil du deretter komme inn i admin siden der hvor du kan administrere hvem som har svart korekt, se hvor mange som har svart og hvem som er logget inn.

## Feilsøking
Først sjekk i terminal hva det står, der kan det være mye nyttig informasjon. Vis det er at appen ikke starter så kan det ofte være noe med en variabel i .env eller noe med database dataen du har satt opp. Vis du forsatt har problemer er AI et veldig godt hjelpemiddel for å finne slike problemer, eller kontakt:
```bash
sander@ikkekontaktmeg.no
```

## Videre utvikling
Dette er et gøy prosjekt som alle kan jobbe vidre på. Her er noen forslag til funksjoner som kunne vært fint å tatt med.

- **poeng system**
Vis brukeren for riktig for du poeng, dette samles opp og kan vises på slutten av måneden, som et leaderboard.

- **venner**
Brukere kan legge til vennene sine og konkurere mot dem

- **se svaret**
Etter at brukeren har svart på spørsmålet, kan hen se om svaret er riktig

- **klasser**
Når brukeren skal registrere seg legger de til klassen de går i. Dette kan skappe mye morro blant klassene på skolen.