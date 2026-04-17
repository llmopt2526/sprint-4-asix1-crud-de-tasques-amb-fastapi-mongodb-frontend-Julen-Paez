import os  # # Permet accedir a variables d'entorn
from typing import Optional, List  # # Tipus per a anotacions

from fastapi import FastAPI, Body, HTTPException, status  # # Framework FastAPI i utilitats HTTP
from fastapi.responses import Response  # # Respostes HTTP personalitzades
from fastapi.middleware.cors import CORSMiddleware  # # Middleware per permetre connexions des del frontend

from pydantic import ConfigDict, BaseModel, Field  # # Models i validació de dades
from pydantic.functional_validators import BeforeValidator  # # Validacions personalitzades

from typing_extensions import Annotated  # # Tipus avançats
from bson import ObjectId  # # Tipus d'identificador de MongoDB
from pymongo import AsyncMongoClient  # # Client asíncron per MongoDB


# # Inicialització de l'API FastAPI
app = FastAPI(title="Gestor de Llibres API")


# # Configuració de CORS (permet connexió des del frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # # Permet totes les orígens (frontend)
    allow_methods=["*"],  # # Permet tots els mètodes HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # # Permet totes les capçaleres
)


# # Configuració de connexió a MongoDB
MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")  # # URL de la base de dades
client = AsyncMongoClient(MONGODB_URL)  # # Client asíncron MongoDB
db = client.biblioteca  # # Base de dades "biblioteca"
book_collection = db.get_collection("llibres")  # # Col·lecció de llibres


# # Tipus personalitzat per manejar ObjectId com string
PyObjectId = Annotated[str, BeforeValidator(str)]


# # Model de dades del llibre
class BookModel(BaseModel):
    # # Estructura del llibre i validacions
    id: Optional[PyObjectId] = Field(alias="_id", default=None)  # # ID de MongoDB

    titol: str = Field(...)  # # Títol obligatori
    autor: str = Field(...)  # # Autor obligatori

    estat: str = Field(..., pattern="^(pendent|llegit)$")  # # Estat només pot ser pendent o llegit
    valoracio: int = Field(..., ge=0, le=5)  # # Valoració entre 0 i 5
    categoria: str = Field(...)  # # Categoria obligatòria
    persona: str = Field(...)  # # Persona assignada obligatòria

    model_config = ConfigDict(
        populate_by_name=True,  # # Permet usar "_id" de MongoDB com "id"
        arbitrary_types_allowed=True,  # # Permet tipus especials com ObjectId
    )


# # Crear un llibre (CREATE)
@app.post("/books", response_model=BookModel, status_code=status.HTTP_201_CREATED)
async def create_book(book: BookModel = Body(...)):
    # # Inserta el llibre a MongoDB (excloent el camp id)
    new_book = await book_collection.insert_one(
        book.model_dump(by_alias=True, exclude={"id"})
    )

    # # Retorna el llibre creat buscant-lo per ID
    return await book_collection.find_one({"_id": new_book.inserted_id})


# # Llistar tots els llibres (READ)
@app.get("/books", response_model=List[BookModel])
async def list_books():
    # # Retorna fins a 1000 llibres de la col·lecció
    return await book_collection.find().to_list(1000)


# # Actualitzar un llibre (UPDATE)
@app.put("/books/{id}", response_model=BookModel)
async def update_book(id: str, book: BookModel = Body(...)):
    # # Cerca el llibre per ID i l'actualitza
    update_result = await book_collection.find_one_and_update(
        {"_id": ObjectId(id)},  # # Converteix string a ObjectId
        {"$set": book.model_dump(by_alias=True, exclude={"id"})},
        return_document=True,  # # Retorna el document actualitzat
    )

    # # Si existeix, el retorna
    if update_result is not None:
        return update_result

    # # Si no existeix, error 404
    raise HTTPException(status_code=404, detail=f"Llibre {id} no trobat")


# # Eliminar un llibre (DELETE)
@app.delete("/books/{id}")
async def delete_book(id: str):
    # # Elimina el llibre per ID
    delete_result = await book_collection.delete_one({"_id": ObjectId(id)})

    # # Si s'ha eliminat correctament
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    # # Si no existeix, error 404
    raise HTTPException(status_code=404, detail=f"Llibre {id} no trobat")