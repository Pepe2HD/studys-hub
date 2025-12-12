const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const salasList = document.getElementById('sala-list');
const searchInput = document.getElementById('searchInput');

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const btnBlocos = document.getElementById('btnBlocos');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

let salaSelecionada = null;
let blocos = [];
let activeFilters = { blocos: [] };
let currentList = [];

const BASE = "https://link-da-sua-API-hospedada";
const API_SALA = `${BASE}/sala`;

let salasCache = [];

// carrega salas
async function carregarSalas() {
    salasList.innerHTML = "<li>Carregando salas...</li>";

    try {
        const response = await fetch(API_SALA);
        const salas = await response.json();
        salasCache = salas;

        if (!Array.isArray(salas) || salas.length === 0) {
            salasList.innerHTML = `
                <li style="text-align:center; padding:15px;">
                    Nenhuma sala foi adicionada ainda.
                </li>
            `;
            return;
        }

        gerarListaDeBlocos(salas);
        renderizarSalas(salas);

    } catch (error) {
        console.error(error);
        salasList.innerHTML = "<li>Erro ao carregar salas.</li>";
    }
}

function gerarListaDeBlocos(salas) {
    const setBlocos = new Set();

    salas.forEach(sala => {
        if (sala.bloco) setBlocos.add(sala.bloco);
    });

    blocos = [...setBlocos];
}

// renderiza salas
function renderizarSalas(salas) {
    salasList.innerHTML = "";

    salas.forEach(sala => {
        const li = document.createElement("li");
        li.dataset.bloco = sala.bloco;

        li.innerHTML = `
            <span class="course-name">
                ${sala.nome} — Bloco ${sala.bloco}
            </span>

            <div class="option-container">
            </div>

            <div class="buttonsControl">
                <td>
                    <button class="btn-edit" onclick="editarSala(${sala.id_sala})">Editar</button>
                    <button class="btn-delete" onclick="abrirModalExcluir(${sala.id_sala}, '${sala.nome}')">Excluir</button>
                </td>
            </div>
        `;

        salasList.appendChild(li);
    });

    filterSalas();
}

// edição de salas
function editarSala(id) {
    window.location.href = `/html/admin/editSala.html?id=${id}`;
}

function abrirModalExcluir(id, nome) {
    salaSelecionada = id;
    confirmText.textContent = `Tem certeza que deseja excluir a sala “${nome}”?`;
    confirmModal.style.display = "flex";
}

// exlusão de salas
confirmYes.addEventListener("click", async () => {
    if (!salaSelecionada) return;

    try {
        const response = await fetch(`${API_SALA}/${salaSelecionada}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Não foi possível excluir a sala.");
            return;
        }

        confirmModal.style.display = "none";
        carregarSalas();

    } catch (error) {
        console.error(error);
        alert("Erro ao excluir sala.");
    }
});

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});


searchInput.addEventListener("input", () => filterSalas());

btnBlocos.addEventListener("click", () => openFiltro(blocos, 'blocos'));

// filtros de pesquisa
function openFiltro(list, type) {
    currentList = list;
    renderList(list, type);
    modalFiltro.style.display = 'block';
    modalSearch.value = '';
    modalFiltro.dataset.type = type;
    modalSearch.focus();
}

function renderList(list, type) {
    modalList.innerHTML = "";

    list.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;

        li.onclick = () => {
            addFilter(item, type);
            closeFiltro();
            filterSalas();
        };

        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = "none";
}

modalSearch.addEventListener("input", () => {
    const type = modalFiltro.dataset.type;
    const filtered = currentList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered, type);
});

window.addEventListener("click", (e) => {
    if (e.target === modalFiltro) closeFiltro();
});


function addFilter(item, type) {
    if (type === "blocos") {
        activeFilters.blocos.forEach(f => removeFilter(f, "blocos"));
    }

    if (!activeFilters[type].includes(item)) {
        activeFilters[type].push(item);

        const tag = document.createElement("span");
        tag.classList.add("filter-tag");
        tag.textContent = item + " ✕";
        tag.onclick = () => removeFilter(item, type);

        activeFiltersDiv.appendChild(tag);
    }
}

function removeFilter(item, type) {
    activeFilters[type] = activeFilters[type].filter(f => f !== item);

    [...activeFiltersDiv.children].forEach(tag => {
        if (tag.textContent.startsWith(item)) tag.remove();
    });

    filterSalas();
}

//filtrar salas
function filterSalas() {
    const termo = searchInput.value.toLowerCase();
    const items = salasList.querySelectorAll("li");

    items.forEach(li => {
        let show = true; 
        const nome = li.querySelector(".course-name").textContent.toLowerCase();
        const bloco = li.dataset.bloco;

        if (!nome.includes(termo)) {
            show = false;
        }

        if (activeFilters.blocos.length > 0) {
            if (!activeFilters.blocos.includes(bloco)) {
                show = false;
            }
        }

        li.style.display = show ? "flex" : "none";
    });
}


window.addEventListener("click", (e) => {
    if (e.target === modalFiltro) closeFiltro();
    if (e.target === modalVincular) {
        modalVincular.style.display = "none";
        carregarCursos();
    }
});

document.addEventListener("click", function(event) {
    const isButton = event.target.matches(".option-btn");
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;
        const isOpen = dropdown.style.display === "block";
        allMenus.forEach(menu => menu.style.display = "none");
        if (!isOpen) dropdown.style.display = "block";
    } else {
        allMenus.forEach(menu => menu.style.display = "none");
    }
});

// Inicialização
carregarSalas();


