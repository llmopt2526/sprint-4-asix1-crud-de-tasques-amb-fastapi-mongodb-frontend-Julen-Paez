import os
from typing import Optional, List
from fastapi import FastAPI, Body, HTTPException, status
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ConfigDict, BaseModel, Field
from pydantic.functional_validators import BeforeValidator
from typing_extensions import Annotated
from bson import ObjectId
from pymongo import AsyncMongoClient

# # Inicialització de l'API amb FastAPI
app = FastAPI(title="Gestor de Llibres API")

# # Configuració de CORS per permetre la connexió amb el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Configuració de la connexió a MongoDB mitjançant variables d'entorn
# # L'import 'os' permet llegir la URL configurada al sistema (per a Atlas o Local)
MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncMongoClient(MONGODB_URL)
db = client.biblioteca
book_collection = db.get_collection("llibres")

# # Tipus personalitzat per gestionar els ObjectIDs de MongoDB com a Strings
PyObjectId = Annotated[str, BeforeValidator(str)]

class BookModel(BaseModel):
    # # Mapeig de l'ID de MongoDB (_id) al camp 'id' de l'aplicació
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    titol: str = Field(...)
    autor: str = Field(...)
    # # Validació: l'estat ha de ser 'pendent' o 'llegit'
    estat: str = Field(..., pattern="^(pendent|llegit)$")
    # # Validació: la valoració ha d'estar entre 0 i 5
    valoracio: int = Field(..., ge=0, le=5)
    categoria: str = Field(...)
    persona: str = Field(...)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

# # ENDPOINT POST: Crea un nou llibre a la base de dades
@app.post("/books", response_model=BookModel, status_code=status.HTTP_201_CREATED)
async def create_book(book: BookModel = Body(...)):
    new_book = await book_collection.insert_one(book.model_dump(by_alias=True, exclude={"id"}))
    return await book_collection.find_one({"_id": new_book.inserted_id})

# # ENDPOINT GET: Retorna el llistat complet de llibres
@app.get("/books", response_model=List[BookModel])
async def list_books():
    return await book_collection.find().to_list(1000)

# # ENDPOINT PUT: Actualitza un llibre existent mitjançant el seu ID
@app.put("/books/{id}", response_model=BookModel)
async def update_book(id: str, book: BookModel = Body(...)):
    update_result = await book_collection.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": book.model_dump(by_alias=True, exclude={"id"})},
        return_document=True,
    )
    if update_result is not None:
        return update_result
    raise HTTPException(status_code=404, detail=f"Llibre {id} no trobat")

# # ENDPOINT DELETE: Elimina un llibre de la base de dades
@app.delete("/books/{id}")
async def delete_book(id: str):
    delete_result = await book_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    raise HTTPException(status_code=404, detail=f"Llibre {id} no trobat")