// # URL de l'API
const API_URL = "http://127.0.0.1:8000/books";
let currentEditId = null;

// # Carrega inicial de dades
document.addEventListener("DOMContentLoaded", () => {
    fetchBooks();
});

async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        console.error("Error en carregar llibres:", error);
    }
}

async function saveBook() {
    // # Captura de valors i eliminacio d'espais en blanc
    const titol = document.getElementById("titol").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const estat = document.getElementById("estat").value;
    const valoracio = document.getElementById("valoracio").value;
    const categoria = document.getElementById("categoria").value.trim();
    const persona = document.getElementById("persona").value.trim();

    // # Validacio de camps obligatoris al frontend
    if (!titol || !autor || !categoria || !persona) {
        alert("Tots els camps son obligatoris per a poder desar el llibre.");
        return;
    }

    const bookData = {
        titol,
        autor,
        estat,
        valoracio: parseInt(valoracio),
        categoria,
        persona
    };

    try {
        let response;
        if (currentEditId) {
            // # Mode edicio
            response = await fetch(`${API_URL}/${currentEditId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData)
            });
            currentEditId = null;
            document.getElementById("submit-btn").innerText = "Afegir Llibre";
        } else {
            // # Mode creacio
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookData)
            });
        }

        if (response.ok) {
            clearForm();
            fetchBooks();
        }
    } catch (error) {
        console.error("Error en desar el llibre:", error);
    }
}

async function deleteBook(id) {
    if (confirm("Vols eliminar aquest llibre?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) fetchBooks();
        } catch (error) {
            console.error("Error en eliminar:", error);
        }
    }
}

function editBook(id, titol, autor, estat, valoracio, categoria, persona) {
    document.getElementById("titol").value = titol;
    document.getElementById("autor").value = autor;
    document.getElementById("estat").value = estat;
    document.getElementById("valoracio").value = valoracio;
    document.getElementById("categoria").value = categoria;
    document.getElementById("persona").value = persona;

    currentEditId = id;
    document.getElementById("submit-btn").innerText = "Actualitzar Llibre";
    window.scrollTo(0, 0);
}

function clearForm() {
    document.getElementById("titol").value = "";
    document.getElementById("autor").value = "";
    document.getElementById("valoracio").value = "0";
    document.getElementById("categoria").value = "";
    document.getElementById("persona").value = "";
}

function renderBooks(books) {
    const list = document.getElementById("book-list");
    list.innerHTML = "";

    books.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";
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
        list.appendChild(div);
    });
}