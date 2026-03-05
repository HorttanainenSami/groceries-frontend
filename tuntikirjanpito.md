## Frontend

| Päivämäärä | Käytetty aika | Mitä tein                                                                                                                                                                                          |
| :--------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 27.1.26    | 3h            | Readmen kirjoittaminen ja ohjeiden testaaminen                                                                                                                                                     |
| 25.1.26    | 0.5h          | Käyttämättömien socket crud toimintojen poisto                                                                                                                                                     |
| 17.1.26    | 2h            | Bugien korjaus synkronointi toiminnallisuudessa                                                                                                                                                    |
| 7.1.26     | 2h            | Bugien korjaus ja välimuistin päivitys kun lokaalisti luodut operaatiot ot synkronoitu serverille                                                                                                  |
| 2.1.26     | 3h            | SyncContextin luominen odottavien operaatioiden tallentamiseen ja synkronointiin kun yhteys saadaan luotua                                                                                         |
| 2.1.26     | 1h            | 30min cache first arkkitehtuuri taskeille                                                                                                                                                          |
| 1.1.26     | 3h            | Offline-first synkronointi: server-datan välimuistitus SQLite:en ja cache-first arkkitehtuuri listoille                                                                                            |
| 28.12.25   | 1h            | refactorointi                                                                                                                                                                                      |
| 26.12.25   | 3h            | Uudelleen järjestämisen toiminnallisuuden parantaminen ja tuotteen poistaminen listasta liuttamalla sitä sivulle                                                                                   |
| 18.12.25   | 3h            | backendin kanssa jaettujen tyypitysten käyttö. Toisen käyttäjän uudelleen järjestyksen päivitys näytölle broadcastin avulla jos sama lista on avattu missä muokkaus on tapahtunut                  |
| 6.12.25    | 1h            | eslinterin ja prettierin conffaus ja virheilmoitusten korjaaminen                                                                                                                                  |
| 6.12.25    | 3h            | Socketin käyttö myös relaation haussa, serverin tyyppien käyttöönotto                                                                                                                              |
| 25.11.25   | 1h            | tyypitysten korjausta                                                                                                                                                                              |
| 18.11.25   | 4h            | Lokaalin ruokalistan sisällön uudelleen järjestämisen mahdollisuus                                                                                                                                 |
| 12.11.25   | 2h            | socketin uudelleen yhdistäminen                                                                                                                                                                    |
| 5.6.25     | 1h            | Taskien hakeminen socketin avulla ja oikeellisen datan näyttäminen kun lista siirretään tietokantaan                                                                                               |
| 3.6.25     | 1h            | Listojen näkymän muokkaus. Nyt näkyy kenen kanssa lista on jaettuna                                                                                                                                |
| 27.5.25    | 3h            | Websocketin lisääminen task näkymään jotta listaa voidaan muokata reaaliajassa                                                                                                                     |
| 27.5.25    | 2h            | Task managerin refactorointi                                                                                                                                                                       |
| 23.5.25    | 2h            | Alert jonon luominen. Näyttää maksimissaan 2 ilmoitusta kerrallaan FIFO periaatteella. Näyttää myös ajan kuinka kauan ennen kuin poistuu näkyvistä.                                                |
| 22.5.25    | 2h            | lokaalin tietokannan yhdenmukaistaminen serverin tietokannan kanssa                                                                                                                                |
| 22.4.25    | 1h            | Korjaa Taskmanageria jotta serverille siirretty lista poistuu lokaalista muistista ja se päivitetään taskmanageriin                                                                                |
| 15.4.25    | 16h           | Task managerin luominen jolla hallitaan lokaaleja ja serveriltä tulleita listoja. Listan siirtäminen serverille ja sen jakaminen toisen käyttäjän kanssa. Serverillä olevan listan manipuoliminen. |
| 1.3.25     | 4h            | useToggleListin luominen, tokenin lisääminen api pyyntöihin, CheckboxWithText komponentin refaktorointi, listan jakaminen toisen käyttäjän kanssa toimintojen luominen                             |
| 27.2.25    | 1h            | Modalin refaktorointi                                                                                                                                                                              |
| 20.2.25    | 2h            | käyttäjän rekistöröinti sivusto, formi ja yhteys backendiin                                                                                                                                        |
| 18.2.25    | 10h           | sqliten käyttöönotto ja applikaation sisäisen tallennuksen siirtäminen siihen                                                                                                                      |
| 4.2.25     | 2h            | Alert komponentin, alert stackin ja contextin luominen                                                                                                                                             |
| 4.2.25     | 6h            | kirjautumis toiminnon luominen ja contextin hallinta                                                                                                                                               |
| 26.1.25    | 2h            | kirjautumis näkymän ja formin luominen                                                                                                                                                             |
| 19.1.25    | 1h            | mahdollisuus valita tehtäviä jotta niitä voidaan poistaa useampi kuin yksi kerrallaan                                                                                                              |
| 19.1.25    | 2h            | tiedon hallinta contextilla ja Asyncstoragen eriyttäminen hookkiin                                                                                                                                 |
| 18.1.25    | 3h            | listojen pysyväis tallennus ja muokkaus                                                                                                                                                            |
| 7.1.25     | 3h            | ohjelman alustus ja tehtävä listan luominen                                                                                                                                                        |
| 7.1.25     | 1h            | tehtävän muokkaus modal näkymän toiminta, modaalin avaamisen yhteydessä näppäimistö aukeaa ja ohjelmisto fokusoituu tekstikenttään                                                                 |
| Yht        | 97.5h         |                                                                                                                                                                                                    |

## Backend

| Päivämäärä | Käytetty aika | Mitä tein                                                                                                                     |
| :--------- | :------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| 27.1.26    | 1h            | Readmen testaus                                                                                                               |
| 26.1.26    | 3h            | Readmen kirjoittaminen                                                                                                        |
| 25.1.26    | 4h            | testien kirjoitus ja korjaus, käyttämättömän koodin poisto                                                                    |
| 17.1.26    | 2h            | bugien korjaus sync toiminnallisuudessa                                                                                       |
| 5.1.26     | 7h            | Synkronoinnin käsittelyn logiikka                                                                                             |
| 3.1.26     | 2h            | Tyypitysten ja zod validaation schemojen lisääminen clientin synkronointi datan jästenämiseen                                 |
| 18.12.25   | 1h            | task listan tuotteen uudelleen järjestyksen pysyväistallennus                                                                 |
| 14.12.25   | 3h            | tietokannan migraatio työkalun käyttöönotto, konffaus ja typescript moduuli onglemat                                          |
| 13.12.25   | 2h            | sokettien virheilmoituksen käsittely eriytetyssä virheenkäisttely moduulissa                                                  |
| 13.12.25   | 3h            | Virheilmoitusten kustomointi paremman virheilmoituksen saamiseksi                                                             |
| 6.12.25    | 1h            | tyypitysten yhdenmukaistaminen                                                                                                |
| 5.12.25    | 1h            | Eslintin ja prettierin conffaus. Lintteri virheilmoitusten korjaus                                                            |
| 4.12.25    | 4h            | korjattu null tarkastukset , parannettu transaction, päivitetty sockettien tyypitystä. relatioon jakamis toiminto socketille. |
| 2.12.25    | 8h            | socketin tyypitys ja toiminnallisuuksien erotteleminen omiin tiedostoihinsa. Toiminnallisuuksien lisäys socketille            |
| 25.11.25   | 1h            | refaktorointi                                                                                                                 |
| 25.11.25   | 2h            | tyypityksen korjaus yhdenmukaiseksi string datetimeksi                                                                        |
| 1.11.25    | 3h            | tyypitysten vieminen omaan kirjastoon                                                                                         |
| 5.6.25     | 1h            | Taskien hakeminen socketin avulla ja oikeellisen datan palauttaminen rajapintaan relaation tallettamisen yhteydessä           |
| 3.6.25     | 1h            | getRelations jakaa myös tiedon kenen kanssa lista on jaettu                                                                   |
| 15.5.25    | 6h            | Testien tekeminen ja eslintin conffaaminen                                                                                    |
| 11.5.25    | 4h            | Zod schemojen ja rajapinnan parantaminen                                                                                      |
| 26.4.25    | 5h            | Testien tekeminen                                                                                                             |
| 15.4.25    | 12h           | relations moduulin luominen ja CRUD endpointit. Listojen tallenntaminen postgressiin, listojen manipulointi postgressa.       |
| 6.4.25     | 3h            | Error luokkien luominen ja errorien try catching                                                                              |
| 27.2.25    | 1h 30min      | käyttäjien etsiminen tietokannasta apia käyttäen                                                                              |
| 21.1.25    | 3h            | Error handler ja tokenin vaatiminen                                                                                           |
| 21.1.25    | 2h            | pysyväistallennus                                                                                                             |
| 21.1.25    | 3h            | autentikaation luominen                                                                                                       |
| 21.1.25    | 3h            | routerien luominen                                                                                                            |
| 21.1.25    | 2h            | Projektin luominen ja conffaus                                                                                                |
| Yht.       | 94.5h         |                                                                                                                               |
