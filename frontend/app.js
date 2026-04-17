// # Definició de la URL base per a les peticions a l'API del backend
const API_URL = "http://127.0.0.1:8000/books";

// # Variable global per emmagatzemar l'ID del llibre que s'està editant actualment
let currentEditId = null;

// # Escoltador d'esdeveniments que s'executa quan el document HTML s'ha carregat completament
document.addEventListener("DOMContentLoaded", () => {
    // # Cridem a la funció per obtenir i mostrar els llibres inicials
    fetchBooks();
});

// # Funció asíncrona per obtenir el llistat de llibres des del servidor
async function fetchBooks() {
    try {
        // # Fem una petició GET a l'API
        const response = await fetch(API_URL);
        // # Convertim la resposta a format JSON
        const books = await response.json();
        // # Cridem a la funció de renderitzat per dibuixar-los a la pantalla
        renderBooks(books);
    } catch (error) {
        // # Captura d'errors en cas que el servidor no respongui
        console.error("Error en carregar llibres:", error);
    }
}

// # Funció principal per crear o actualitzar un llibre
async function saveBook() {
    // # Recollida de dades dels inputs de l'HTML i eliminació d'espais buits als costats
    const titol = document.getElementById("titol").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const estat = document.getElementById("estat").value;
    const valoracio = document.getElementById("valoracio").value;
    const categoria = document.getElementById("categoria").value.trim();
    const persona = document.getElementById("persona").value.trim();

    // # Validació de seguretat al frontend: no permetem enviar camps de text buits
    if (!titol || !autor || !categoria || !persona) {
        alert("Tots els camps son obligatoris per a poder desar el llibre.");
        return; // # Atura l'execució si falta alguna dada
    }

    // # Preparació de l'objecte JSON segons l'estructura que espera el backend
    const bookData = {
        titol,
        autor,
        estat,
        valoracio: parseInt(valoracio), // # Ens assegurem que la valoració sigui un número sencer
        categoria,
        persona
    };

    try {
        let response;
        // # Si tenim un ID emmagatzemat, vol dir que estem en mode Edició (PUT)
        if (currentEditId) {
            // # Enviem la petició PUT a l'ID específic
            response = await fetch(`${API_URL}/${currentEditId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData)
            });
            // # Reset de l'ID d'edició i restauració del text del botó
            currentEditId = null;
            document.getElementById("submit-btn").innerText = "Afegir Llibre";
        } else {
            // # Si no hi ha ID, estem creant un llibre nou (POST)
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData)
            });
        }

        // # Si la resposta és correcta, netegem el formulari i recarreguem la llista
        if (response.ok) {
            clearForm();
            fetchBooks();
        }
    } catch (error) {
        console.error("Error en desar el llibre:", error);
    }
}

// # Funció per eliminar un llibre mitjançant el seu ID de MongoDB
async function deleteBook(id) {
    // # Demanem confirmació a l'usuari abans d'esborrar res
    if (confirm("Vols eliminar aquest llibre?")) {
        try {
            // # Enviem la petició DELETE al servidor
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            // # Si s'esborra correctament, refresquem la llista
            if (response.ok) fetchBooks();
        } catch (error) {
            console.error("Error en eliminar:", error);
        }
    }
}

// # Funció per carregar les dades d'un llibre al formulari per a ser editades
function editBook(id, titol, autor, estat, valoracio, categoria, persona) {
    // # Omplim els camps del formulari amb la informació actual del llibre
    document.getElementById("titol").value = titol;
    document.getElementById("autor").value = autor;
    document.getElementById("estat").value = estat;
    document.getElementById("valoracio").value = valoracio;
    document.getElementById("categoria").value = categoria;
    document.getElementById("persona").value = persona;

    // # Guardem l'ID per saber quin llibre s'està modificant al fer el següent 'save'
    currentEditId = id;
    // # Canviem el text del botó per indicar a l'usuari que està editant
    document.getElementById("submit-btn").innerText = "Actualitzar Llibre";
    // # Pugem el scroll fins a dalt perquè l'usuari vegi el formulari
    window.scrollTo(0, 0);
}

// # Funció per deixar el formulari en blanc
function clearForm() {
    document.getElementById("titol").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("valoracio").value = "0";
    document.getElementById("categoria").value = "";
    document.getElementById("persona").value = "";
}

// # Funció per dibuixar les targetes de llibres dins del contenidor HTML
function renderBooks(books) {
    const list = document.getElementById("book-list");
    // # Netegem el llistat actual per no duplicar la informació
    list.innerHTML = "";

    // # Recorrem l'array de llibres rebut del servidor
    books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";
        // # Creem l'estructura de la targeta amb les dades i els botons d'acció
        div.innerHTML = `
            <div>
                <strong>${book.titol}</strong> - ${book.autor} <br>
                <small>Estat: ${book.estat} | Categoria: ${book.categoria} | Per: ${book.persona}</small> <br>
                <span>Valoracio: ${book.valoracio} / 5</span>
            </div>
            <div class="actions">
                <button class="button" onclick="editBook('${book._id}', '${book.titol}', '${book.autor}', '${book.estat}', ${book.valoracio}, '${book.categoria}', '${book.persona}')">Editar</button>
                <button class="button button-danger" onclick="deleteBook('${book._id}')">Eliminar</button>
            </div>
        `;
        // # Afegim la targeta al contenidor principal del DOM
        list.appendChild(div);
    });
}