# anketa_sinteza_govora
Spletna anketa implementrinana s pomočjo next.js, FastAPI in PostgreSQL

### Struktura podatkovne baze
![anketa_sinteza_govora](https://github.com/user-attachments/assets/82d837e6-f5a1-4d28-884f-d8eebc943ad0)

#### Navodila za zagon
Kreiraj .env file po šabloni example.env. V .env datoteki je na mestu SECRET_KEY potrebno generirati naključno skrivnost.

*Aplikacijo poženemo z naslenjim ukazom znotraj terminala iz korena projekta*
```bash
docker-compose up --build -d
```

Ko so vse storitve postavljene lahko delovanje endpointov preverimo s poganjanjem testne skripte. Testno skripto je potrebno zagnati znotraj direktorija `backend/`. (Potrebno je imeti naložene package v poetry venv).

*Uporabi sledeč ukaz*
```bash
python poetry run python app/scripts/test_endponts.py
```

### Design ankete
Link designa v Figmi: https://www.figma.com/design/GXY6HblgG72iNTrPYw0r06/Anketa-Sinteza-Govora?node-id=4-4&t=e4fFSaGGLwIwju4x-0
