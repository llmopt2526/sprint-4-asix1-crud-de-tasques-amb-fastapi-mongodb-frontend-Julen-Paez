const API_URL = "http://127.0.0.1:8000/books";
let editingId = null; // Variable para saber si estamos editando

async function fetchBooks() {
    const res = await fetch(API_URL);
    const books = await res.json();
    const list = document.getElementById('book-list');
    list.innerHTML = '';
    books.forEach(book => {
        list.innerHTML += `
            <div class="book-card" style="border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                <strong>${book.titol}</strong> - ${book.autor} (${book.estat})
                <br><small>Cat: ${book.categoria} | Per: ${book.persona} | Nota: ${book.valoracio}/5</small>
                <div style="float:right">
                    <button onclick="prepareEdit('${book._id}', '${book.titol}', '${book.autor}', '${book.estat}', ${book.valoracio}, '${book.categoria}', '${book.persona}')">Editar</button>
                    <button onclick="deleteBook('${book._id}')" class="button">Eliminar</button>
                </div>
                <div style="clear:both"></div>
            </div>
        `;
    });
}

// Función para subir los datos al formulario
function prepareEdit(id, titol, autor, estat, valoracio, categoria, persona) {
    editingId = id;
    document.getElementById('titol').value = titol;
    document.getElementById('autor').value = autor;
    document.getElementById('estat').value = estat;
    document.getElementById('valoracio').value = valoracio;
    document.getElementById('categoria').value = categoria;
    document.getElementById('persona').value = persona;

    document.getElementById('submit-btn').innerText = "Guardar Canvis";
    window.scrollTo(0, 0); // Sube al formulario para que el usuario lo vea
}

async function saveBook() {
    const book = {
        titol: document.getElementById('titol').value,
        autor: document.getElementById('autor').value,
        estat: document.getElementById('estat').value,
        valoracio: parseInt(document.getElementById('valoracio').value),
        categoria: document.getElementById('categoria').value,
        persona: document.getElementById('persona').value
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    });

    // Resetear formulario y estado
    editingId = null;
    document.getElementById('submit-btn').innerText = "Afegir Llibre";
    clearForm();
    fetchBooks();
}

function clearForm() {
    document.getElementById('titol').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('estat').value = 'pendent';
    document.getElementById('valoracio').value = 0;
    document.getElementById('categoria').value = '';
    document.getElementById('persona').value = '';
}

async function deleteBook(id) {
    if(confirm("Segur que vols eliminar aquest llibre?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchBooks();
    }
}

window.onload = fetchBooks;