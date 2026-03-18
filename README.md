## Medverkande

- Joel Sjövall, GitHub: `joelsjovall`
- Måns Oskarsson, GitHub: `mansoskarsson`
- Sigge von Eggers Patron, GitHub: `siggevep`
- Lukas Eriksson, GitHub: `Lukutv04`
- Pedram Basim, GitHub: `pedram-cyber`

# Gröna Duken

## Kortfattad projektbeskrivning

Gröna Duken är en fullstack-webbapplikation för en biograf. På hemsidan kan användaren se filmer som visas just nu, läsa mer om filmerna, välja visningstid och boka platser. Det finns även funktioner för inloggning, Mina sidor, kiosk och en AI-chat.

Projektet är byggt med React och TypeScript i frontend, .NET Minimal API i backend och MySQL som databas.

## Installation, inkl databashantering

För att projektet ska fungera lokalt behöver du ha följande installerat:

- Node.js
- npm
- .NET SDK
- MySQL

Börja med att ladda ner projektet och öppna det i en kodeditor, till exempel VS Code.

Installera sedan alla beroenden med:

bash
npm install

Kontrollera därefter att filen backend/db-config.json innehåller rätt databasuppgifter, och när databasen är rätt konfigurerad startar du projektet med: npm run dev:all

Detta startar både frontend och backend.
Projektet använder MySQL, och backend kopplar upp sig mot databasen vid uppstart. I konfigurationsfilen finns stöd för att skapa tabeller automatiskt om de inte redan finns och fylla databasen med startdata om tabellerna är tomma. Därför måste databasen vara igång och rätt anslutningsuppgifter finnas i backend/db-config.json.

Viktigt att veta
För att IMDb-betygen ska visas korrekt behövs en giltig OMDb API-nyckel. Den sätts i terminalen innan projektet startas med:
export OMDB_API_KEY="da4167d8"

AI-chatten kräver också korrekt konfiguration för att fungera. Den använder en access token som läses in från backend/db-config.json. Om denna token saknas eller är ogiltig kommer resten av hemsidan fortfarande att fungera, men AI-chatten kommer inte att kunna svara på användarens frågor.
Filen backend/db-config.json ska vara uppbyggd så här:
{
"host": "5.189.183.23",
"port": 4567,
"username": "h25malmo-grupp3",
"password": "XWLBR20607",
"database": "h25malmo-grupp3",
"createTablesIfNotExist": true,
"seedDataIfEmpty": true,
"aiAccessToken": "g4f9zjr+Xgh^"
}
Om någon av dessa uppgifter saknas eller är felaktiga kommer delar av projektet, som filmer, visningar, bokningar, inloggning, IMDb-betyg eller AI-chatten, inte att fungera som de ska.
