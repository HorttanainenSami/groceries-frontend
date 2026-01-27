# Ostoslista Frontend

Ohjelmisto totetutettu Fullstack open kurssin projektityönä.

Ostoslista mobiiliapplikaatio

## Motivaatio

Vaimon kanssa ostoslistojen säätäminen turhautti kun välillä ostoslista tulee joko:

- viestinä
- paperillisena
- paperillisena ja viestinä perästä lisäyksistä
- Whatsapissa ostokset ripoteltuna viestien sekaan
- Whatsapissa kuva paperillisesta ostoslistasta
- Whatsapissa kuva paperillisesta ostoslistasta + viestinä lisäyksiä

Tämän johdosta kotona tuli useammin kuin muutaman kerran "Ainiin se unohtu" -tilanteita.

Päätin luoda projektina ostoslistan jota voidaan käyttää lokaalisti ja jakaa tarpeentullen toisen käyttäjän kanssa.
Myös reaaliaikainen muokkaaminen tuli projektin aikana tarpeelliseksi. Mielenkiinnosta halusin toteuttaa myös offline first sync toiminnallisuuden.

## Toiminnallisuudet

- Lokaali pysyväistallennus
- Serverin pysyväistallennus Nodejs + Postgres
- Käyttäjän autentikointi (JWT tokenilla)
- offline first sync
- Jaettavat ostoslistat reaaliaikaisella päivityksellä (Socket.io)
- Käyttäjän syötteen validointi (Zod)
- TypeScript
- Jaetut tyypitykset [@groceries/shared_types](https://github.com/HorttanainenSami/groceries-shared-types)

## Projektiin käytetty aika

| Käytetty aika |                                                                                                                      |
| :------------ | -------------------------------------------------------------------------------------------------------------------: |
| 97.5 h        |      [Frontendin työaikakirjaus](https://github.com/HorttanainenSami/groceries-frontend/blob/master/aikataulutus.md) |
| 94.5 h        | [Backendin työaikakirjaus](https://github.com/HorttanainenSami/groceries-backend/blob/master/ty%C3%B6tuntikuvaus.md) |
| 192 h         |                                                                                                             Yhteensä |

## Esivaatimukset

Käynnistäminen

- expo go [v53 sdk](https://expo.dev/go?sdkVersion=53&platform=android&device=true)
- npm
- Node.js (v18+)

Testaus

- Maestro CLI
- [Backend](https://github.com/HorttanainenSami/groceries-backend) käynnissä

## Stack

- React native
- Expo
- Socket.io
- JWT token
- Expo-sqlite
- Axios
- Typescript
- Zod

## Synkronointi

<img src="https://github.com/HorttanainenSami/groceries-backend/blob/master/images/sync-work-flow.png?raw=true" alt="Alt Text" width="400" height="600">

## Konfliktien hallinta

Käyttäjä tekee muutoksia tuote_1:seen käyttäjä_2:n kanssa jaettuun ostoslistaan.
Käyttäjä on offline tilassa joten muutokset tallentuu vain käyttäjän laitteeseen.

<img src="https://github.com/HorttanainenSami/groceries-backend/blob/master/images/user_makes_changes_offline.png?raw=true" alt="Alt Text" width="400" height="250">

Tämän jälkeen Käyttäjä_2 tekee muutoksia myös tuote_1:seen. Käyttäjä_2 on verkossa joten serveri päivittyy

<img src="https://github.com/HorttanainenSami/groceries-backend/blob/master/images/colloborator_makes_changes_to_server.png?raw=true" alt="Alt Text" width="400" height="600">

Käyttäjä pääsee taas verkkoon, joten muutokset synkronoituu serverille. Aiheutuu konflikti.

<img src="https://github.com/HorttanainenSami/groceries-backend/blob/master/images/user_syncs_to_backend_LLW_conflict.png?raw=true" alt="Alt Text" width="400" height="700">

Serveri käyttää LLW periaatetta konfliktien hallintaan. Eli konfliktitilanteessa viimeiseksi muokattu (last_modified) voittaa.
Yllä mainitussa tilanteessa Käyttäjän muutos perutaan ja serveri palauttaa pilveen tallennetun uudemman tuotteen käyttäjälle joka korvaa laitteella olevan tuotteen.

## Konfliktien reunatapaukset

Listassa rajatapaukset mitkä tuottavat onnistuneen tilanteen kun muokattava kohde on poistettu

|         | Lista poistettu | Tuote poistettu |
| :------ | :-------------: | :-------------: |
| Create  |                 |                 |
| Edit    |                 |                 |
| Delete  |                 |       ✅        |
| Toggle  |                 |                 |
| Reorder |                 |                 |

## Alustus

---

1. Luo .env.dev tiedosto

```
EXPO_PUBLIC_DB_NAME=todo
```

2. lataa riippuvuudet projektille `npm i`

3. `npm start` avaa projektin

## Testaus

Frontendissä on E2E testit [Maestrolla](https://maestro.dev/). Maestro tukee pilvessä suoritettavia rinnakkain suoritettavia testejä mutta ne maksavat joten käytössä on lokaalisti suoritettavat E2E testaukset Maestro CLI:illä.

### Testauksen vaatimukset

**Maestro CLI:**

- Asenna: `curl -Ls "https://get.maestro.mobile.dev" | bash`

**Fyysinen Android-laite:**

- USB-yhteys tietokoneeseen
- Kehittäjäasetukset päällä (Settings → About → Build number 7x)
- USB-vianmääritys päällä (Developer options → USB debugging)
- ADB tunnistaa laitteen (`adb devices`)

**Emulaattori:**

- Android Studio asennettuna
- Vähintään yksi AVD luotu (Android Studio → Device Manager)
- Emulaattori käynnissä ennen testejä

### Backendin käynnistäminen

1. Pidä huoli että Docker on käynnissä
2. Käynnistä testitietokanta Dockerissa `npm run test-sql` -komennolla

### Testauksien käynnistys

`npm run test:E2E`

## Linkkejä

- [Työtuntikuvaus](https://github.com/HorttanainenSami/groceries-frontend/blob/master/aikataulutus.md)
- [Backend](https://github.com/HorttanainenSami/groceries-backend)
- [@groceries/shared_types](https://github.com/HorttanainenSami/groceries-shared-types)
