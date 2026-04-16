# Sprint 4: Gestor de Llibres (Windows Edition)
**Autor:** Julen Paez Paredes  
**Tecnologies:** FastAPI, MongoDB Atlas, Skeleton CSS

Aquest projecte consisteix en una aplicació completa (Full Stack) per a la gestió d'una biblioteca personal, utilitzant una arquitectura de microserveis amb un backend asíncron i una base de dades al núvol.

---

## Estructura del Projecte

**ESTRUCTURA DE FITXERS USADA**

├── Video-prova-frontend.mp4   # Demostració del funcionament
├── backend/
│   ├── app.py                 # Lògica del servidor FastAPI
│   └── requirements.txt       # Dependències del projecte
├── frontend/
│   ├── index.html             # Interfície d'usuari
│   ├── style.css              # Estils personalitzats
│   └── app.js                 # Lògica de consum de l'API (Fetch)
├── tests/
│   └── Sprint_4.postman_collection.json  # Tests d'API per a Postman
└── venv/                      # Entorn virtual de Python

---

Aquesta es la Estructura de fitxers que tendirem que tindre per poder funciar tot correctament
Per si algun cas no va el entorn virtual (espero que funcione simplement ejecuta les seguents comandes)
python -m venv venv
.\venv\Scripts\Activate

Aquestes comandes el que faran es crear el entorn virtual e instalar les dependencies


---

ja una vegada aixo instalarem a la terminal les llibreries necesaries

*pip install fastapi "uvicorn[standard]" pymongo pydantic email-validator typing-extensions*

Una vegada fet aixo fariem una conexio amb el mongodb fent la seguent comanda a la terminal (aquesta es la meva pero tendries que feru amb les teves credencials)

*$env:MONGODB_URL="mongodb+srv://julenpaez_db_user:uVSjgZ96NIhpUPr6@julen.6gqzsnb.mongodb.net/?appName=Julen"*

Una vegada fet aixo llanzariem el servidor entrant a la carpeta backend i ficant la seguent comanda

*cd backend*

*uvicorn app:app --reload*

---

**FRONTEND**

Una vegada fet aixo obrirem el archiu .html que podem trobar a la carpeta del frontend i se nos obrira una pestanya al nostre navegado
En aquesta pagina fa un GET automatic cada vegada que entrem pero primera vegada y cuan fem un POST,PUT o DELETE

---
**TEST POSTMAN**

Fet aixo pots fet varies porves y veuras que esta conectat al Mongodb i s'haura de fer 
Despres podras trobar un archiu .json per si voldries fer proves usant Postman, aquestos archius inclouen per fer un GET, POST, PUT i un DELETE

---