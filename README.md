# Minimal API + React Fullstack

Ett fullstack-projekt-exempel för att lära sig .NET Minimal API med React. Använd gärna detta som utgångspunkt för ert projektarbete, men ta bort produkttabell ur databasen och "börja om" med egna komponenter ocxh stajling i frontend-kod.

## Teknikstack

**Frontend:** Vite + React + TypeScript + Bootstrap + Sass
**Backend:** .NET 10 Minimal API + DynData
**Databas:** MySQL

## Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│              Vite + React + TypeScript                      │
│                 Bootstrap + Sass                            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP (REST API)
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                              │
│                   .NET 10 Minimal API                       │
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────────┐  │
│  │      App.cs         │    │     db-config.json         │  │
│  │  ─────────────────  │    │  ────────────────────────  │  │
│  │  debugOn            │    │  host                      │  │
│  │  detailedAclDebug   │    │  port                      │  │
│  │  aclOn              │    │  username                  │  │
│  │  isSpa              │    │  password                  │  │
│  │  port               │    │  database                  │  │
│  │  serverName         │    │  createTablesIfNotExist    │  │
│  │  frontendPath       │    │  seedDataIfEmpty           │  │
│  │  sessionLifeTimeHours│   └────────────────────────────┘  │
│  └─────────────────────┘                                    │
│                                                             │
│  DynData: Dynamisk C# (Obj, Arr, JSON, Log)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ MySqlConnector
┌─────────────────────▼───────────────────────────────────────┐
│                        MySQL                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ sessions │ │   acl    │ │  users   │ │ products │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Kom igång

1. Kopiera databas-konfigurationen och fyll i värden från läraren:
```bash
cp backend/db-config.template.json backend/db-config.json
```

2. Redigera `backend/db-config.json` med rätt uppgifter (host, port, username, password, database)

3. Installera och starta:
```bash
npm install
npm run dev
```

## Konfiguration

### App-inställningar (`backend/src/App.cs`)
- `aclOn` - Slå på/av ACL-systemet
- `debugOn` - Aktivera debug-loggning
- `sessionLifeTimeHours` - Sessionens livslängd

### Databas-inställningar (`backend/db-config.json`)
- `createTablesIfNotExist` - Skapa tabeller automatiskt vid uppstart
- `seedDataIfEmpty` - Fyll tabeller med exempeldata om de är tomma

## DynData

* Backend använder [DynData](https://www.nuget.org/packages/Dyndata) för att göra C# mer dynamiskt.
* Se `README-DYNDATA.md` för dokumentation.

---

# Om REST-api:t

#### Fem standardroutes per tabell
Självklart har vi det grundläggande för alla REST-API:er täckt. För vilken tabell som helst, ersätt tabellnamn nedan med ett tabellnamn och id med ett specifikt id:
* POST /api/tabellnamn - med en request body i JSON-format - skapa en ny rad i tabellen och få tillbaka insert-id:t.
* GET /api/tabellnamn - hämta alla rader från tabellen som en JSON-array med objekt.
* GET /api/tabellnamn/id - hämta raden från tabellen med ett specifikt id som ett JSON-objekt. (Obs: Du måste namnge dina id-kolumner i dina tabeller bara "id", inte "elefantId" etc).
* PUT /api/tabellnamn/id - ändra en eller flera egenskaper för en befintlig rad. Skicka en request body i JSON-format som endast innehåller de fält/kolumner du vill ändra.
* DELETE /api/tabellnamn/id - ta bort en specifik rad i tabellen.

#### Mer än bara standardroutes
* Du kan använda (upp till) fyra olika query-parametrar för GET-förfrågan utan id för att göra mycket mer, och hitta det du letar efter direkt:
* where = villkor, för att filtrera returnerade poster
* orderby = fält1,[fält2... etc] för att sortera returnerade poster. För fallande sortering, sätt ett "-" före fältnamnet
* limit = antalPoster, för att begränsa antalet poster
* offset = antalPoster, för att hoppa över ett antal poster i början.

Ett exempel:
* /api/users?where=firstName=Thomas_AND_lastName!=Irons&orderby=email&limit=2&offset=1
* Obs: Omge inte strängar med citattecken, som du kan se i exemplet ovan gör vi inte det.

##### För närvarande stödda operatorer för where
*  !=, >=, <=, =, >, <, _AND_, _OR_, _LIKE_  (att skriva de tre sista med understreck är valfritt men förbättrar läsbarheten)
*  Parenteser stöds för närvarande inte.

##### Söka i JSON-fält med _CONTAINS_
För kolumner med JSON-datatyp (t.ex. `categories` i products-tabellen) kan du använda `_CONTAINS_` för att söka efter värden i JSON-arrayer:

```
/api/products?where=categories_CONTAINS_Vegetables
```

Detta returnerar alla produkter där `categories`-arrayen innehåller "Vegetables".

Du kan kombinera med andra operatorer:
```
/api/products?where=categories_CONTAINS_Vegetables_AND_price$>2
```

**Obs:** `_CONTAINS_` fungerar endast på JSON-fält. Om du försöker använda det på ett vanligt fält får du ett felmeddelande som visar vilka fält som stöder `_CONTAINS_`.

### SQL-injektioner? Är vi säkra mot dem?
* Allt som vi kan flytta till parametrar i prepared statements är parametrar i prepared statements. Debuggern visar SQL:en som genereras för en specifik route, inklusive parametrarna!
* Användarinput som måste vara del av huvudfrågan (och inte kan parametriseras) - som data för ORDER BY, LIMIT etc. saneras med ganska restriktiva regex:er.
* Vi bör alltså vara säkra mot SQL-injektioner.

### Om ACL:en är på måste du lägga till regler i acl-tabellen!
* Du vitlistar routes baserat på userRoles.
* Om du sätter match till false negeras route-matchningen. Se kommentarer i ACL-tabellen.
* Alla regler markerade "allow" (vitlistning) körs före regler markerade "disallow" (svartlistning).
* Så du använder bara svartlistning för att strama åt din tidigare vitlistning. Se kommentarer i ACL-tabellen.
* ACL:en är inte bara för REST-API:et utan för alla routes (dvs. frontend/statiska filer också).
* ACL-regler läses om var 60:e sekund, alternativt kan du starta om servern för att observera ändringar direkt.

### Cookies och session
* Alla användare (även besökare) får en cookie bunden till en session lagrad i DB-tabellen sessions,
  så snart de besöker en sida.
* Varje gång du gör en förfrågan uppdateras ändrad tid för sessionen i databasen.
* Om en session inte har ändrats på 2 timmar tas den bort.
* Dock överlever cookies en webbläsarsession (så länge webbläsaren är öppen).
* Detta betyder: En ny session kan skapas från en "gammal" cookie, vilket inte är ett problem.

### Login-routes
De enda api-routes som inte styrs av vilka tabeller och vyer du har i din databas är login-routes.

#### POST /api/login: Logga in
* Request body ska vara i JSON-format och innehålla en befintlig email och lösenord.

#### GET /api/login: Kolla om någon är inloggad och hämta användaruppgifter.
* Kolla om någon är inloggad och hämta användaruppgifter.

#### DELETE /api/login: Logga ut
*  Logga ut!

### Men hur registrerar jag en ny användare? POST /api/users
* Request body ska vara i JSON-format och innehålla en icke-existerande email, ett lösenord, ett firstName och ett lastName.

### Lösenord
* Lösenord är BCryptade (med styrka 13) och tas bort från REST-api-svar också.
* Det finns inga begränsningar för hur komplexa de måste vara just nu - men jag funderar på att lägga till en kontroll för minsta lösenordsentropi och/eller kräva en minimilängd och att de är en blandning av små och stora bokstäver, siffror och minst ett annat tecken.
