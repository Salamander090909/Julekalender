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