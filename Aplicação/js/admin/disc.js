const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const discList = document.getElementById('disc-list');
const searchInput = document.getElementById('searchInput');
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const btnCursos = document.getElementById('btnDisciplinas');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

let disciplinasCache = [];
let cursosUnicos = [];
let currentList = [];
let activeFilters = { cursos: [] };
let disciplinaSelecionada = null;

const BASE = "https://link-da-sua-API-hospedada";
const API_DISCIPLINA = `${BASE}/disciplina`;
const API_CURSO_DISCIPLINA = `${BASE}/curso/disciplina`;

// carregar disciplinas
async function carregarDisciplinas() {
    discList.innerHTML = "<li>Carregando disciplinas...</li>";

    try {
        let disciplinas = await fetch(API_DISCIPLINA).then(r => r.json());

        if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
            discList.innerHTML = `<li style="text-align:center; padding:15px;">Nenhuma disciplina cadastrada.</li>`;
            return;
        }

        disciplinas = await Promise.all(disciplinas.map(async disc => {
            const cursosRes = await fetch(`${API_CURSO_DISCIPLINA}/${disc.id_disciplina}`);
            const cursosData = await cursosRes.json();

            // Garantir que cursosData é um array
            disc.cursos = Array.isArray(cursosData) ? cursosData.map(c => c.nome) : [];

            return disc;
        }));

        disciplinasCache = disciplinas;

        gerarCursosUnicos(disciplinas);
        renderizarDisciplinas(disciplinas);

    } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        discList.innerHTML = "<li>Erro ao carregar disciplinas.</li>";
    }
}

function gerarCursosUnicos(disciplinas) {
    const cursosSet = new Set();
    disciplinas.forEach(d => d.cursos.forEach(c => cursosSet.add(c)));
    cursosUnicos = [...cursosSet].sort();
}

// renderizar lista
function renderizarDisciplinas(lista) {
    discList.innerHTML = "";

    lista.forEach(disc => {
        const li = document.createElement("li");
        li.dataset.cursos = disc.cursos.join(",").toLowerCase();

        li.innerHTML = `
            <span class="course-name">${disc.nome}</span>
            <div class="buttonsControl">
                <td>
                    <button class="btn-edit" onclick="editarDisciplina(${disc.id_disciplina})">Editar</button>
                    <button class="btn-delete" onclick="abrirModalExcluir(${disc.id_disciplina}, '${disc.nome}')">Excluir</button>
                </td>
            </div>
        `;


        discList.appendChild(li);
    });

    filterDisciplinas();
}

// editar
function editarDisciplina(id) {
    window.location.href = `/html/admin/editDisc.html?id=${id}`;
}

// exclusão de disciplinas
function abrirModalExcluir(id, nome) {
    disciplinaSelecionada = id;
    confirmText.textContent = `Deseja realmente excluir a disciplina “${nome}”?`;
    confirmModal.style.display = "flex";
}

// confirmar exclusão
confirmYes.addEventListener("click", async () => {
    if (!disciplinaSelecionada) return;

    try {
        const res = await fetch(`${API_DISCIPLINA}/${disciplinaSelecionada}`, { method: "DELETE" });

        if (!res.ok) {
            alert("Não foi possível excluir a disciplina.");
            return;
        }

        confirmModal.style.display = "none";
        carregarDisciplinas();

    } catch (err) {
        console.error(err);
        alert("Erro ao excluir a disciplina.");
    }
});

// fechar modal
confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

// pesquisa
searchInput.addEventListener("input", filterDisciplinas);

// filtro de cursos
btnCursos?.addEventListener("click", () => openFiltro(cursosUnicos));

function openFiltro(list) {
    currentList = list;
    modalFiltro.style.display = "block";
    modalSearch.value = "";
    renderList(list);
    modalSearch.focus();
}

function renderList(list) {
    modalList.innerHTML = "";
    list.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => {
            addFilter(item);
            closeFiltro();
            filterDisciplinas();
        };
        modalList.appendChild(li);
    });
}

modalSearch.addEventListener("input", () => {
    const filtered = currentList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered);
});

function closeFiltro() {
    modalFiltro.style.display = "none";
}

window.addEventListener("click", e => {
    if (e.target === modalFiltro) closeFiltro();
});

function addFilter(item) {
    activeFilters.cursos = [item];
    activeFiltersDiv.innerHTML = "";

    const tag = document.createElement("span");
    tag.classList.add("filter-tag");
    tag.textContent = item + " ✕";
    tag.onclick = () => removeFilter(item);
    activeFiltersDiv.appendChild(tag);
}

function removeFilter(item) {
    activeFilters.cursos = [];
    activeFiltersDiv.innerHTML = "";
    filterDisciplinas();
}

// filtrar disciplinas
function filterDisciplinas() {
    const termo = searchInput.value.toLowerCase();
    const items = discList.querySelectorAll("li");

    items.forEach(li => {
        let show = true;
        const nome = li.querySelector(".course-name").textContent.toLowerCase();
        const cursos = li.dataset.cursos;

        if (!nome.includes(termo)) show = false;
        if (activeFilters.cursos.length > 0) {
            const filtro = activeFilters.cursos[0].toLowerCase();
            if (!cursos.includes(filtro)) show = false;
        }

        li.style.display = show ? "flex" : "none";
    });
}

// Inicialização
carregarDisciplinas();
document.addEventListener("click", function(event) {
    const isButton = event.target.matches(".option-btn");
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;


        const isOpen = dropdown.style.display === "block";


        allMenus.forEach(menu => menu.style.display = "none");


        if (!isOpen) {
            dropdown.style.display = "block";
        }

    } else {

        allMenus.forEach(menu => menu.style.display = "none");
    }

});
