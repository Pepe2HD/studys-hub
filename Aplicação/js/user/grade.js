const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const cursosList = document.getElementById('curso-list');
const searchInput = document.getElementById('searchInput');

// Modais existentes
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const btnDisciplinas = document.getElementById('btnDisciplinas');
const btnProfessores = document.getElementById('btnProfessores');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

// Elementos do NOVO Modal de Vínculo
const modalVincular = document.getElementById('modalVincular');
const closeVincular = document.getElementById('closeVincular');
const tituloVincular = document.getElementById('tituloVincular');
const selectDisciplinaVincular = document.getElementById('selectDisciplinaVincular');
const btnAdicionarVinculo = document.getElementById('btnAdicionarVinculo');
const listaVinculadas = document.getElementById('listaVinculadas');

let cursosCache = [];
let currentList = [];
let disciplinasUnicas = [];
let professoresUnicos = [];
let activeFilters = { disciplinas: [], professores: [] };

let cursoSelecionadoExclusao = null;
let cursoEmEdicaoVinculo = null;

const BASE = "https://link-da-sua-API-hospedada";
const API_CURSO = `${BASE}/curso`;
const API_DISCIPLINA = `${BASE}/disciplina`;
const API_PROFESSOR = `${BASE}/professor`;
const API_CURSO_DISCIPLINA = `${BASE}/curso/disciplina`;

let disciplinasMap = new Map();
let professoresMap = new Map();

//carregar cursos
async function carregarCursos() {
    cursosList.innerHTML = "<li>Carregando cursos...</li>";

    try {
        //Carrega cursos e disciplinas
        const cursosRes = await fetch(API_CURSO);
        const discRes = await fetch(API_DISCIPLINA);

        if (!cursosRes.ok || !discRes.ok) {
            throw new Error("Falha ao carregar dados principais.");
        }

        let cursos = await cursosRes.json();
        const disciplinasData = await discRes.json();

        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosList.innerHTML = `<li style="text-align:center; padding:15px;">Nenhum curso foi adicionado ainda.</li>`;
            return;
        }

        // Mapas auxiliares
        disciplinasMap.clear();
        disciplinasData.forEach(d => disciplinasMap.set(d.id_disciplina, d.nome));

        //Carregar disciplinas de cada curso
        cursos = await Promise.all(cursos.map(async curso => {
            try {
                const discDoCursoRes = await fetch(`${API_CURSO_DISCIPLINA}/${curso.id_curso}`);
                let discDoCursoData = [];

                if (discDoCursoRes.ok) {
                    discDoCursoData = await discDoCursoRes.json();
                    if (!Array.isArray(discDoCursoData)) discDoCursoData = [];
                }

                const disciplinaIDs = discDoCursoData.map(d => d.id_disciplina);

                curso.disciplinasNomes = disciplinaIDs
                    .map(id => disciplinasMap.get(id))
                    .filter(Boolean);

                curso.professoresNomes = []; //removido, mas mantido para não quebrar filtros antigos

                return curso;

            } catch (err) {
                console.warn(`Erro ao carregar vínculo do curso ${curso.id_curso}:`, err);
                curso.disciplinasNomes = [];
                curso.professoresNomes = [];
                return curso;
            }
        }));

        cursosCache = cursos;
        gerarListasUnicas(cursos);
        renderizarCursos(cursos);

    } catch (error) {
        console.error("ERRO FINAL:", error);
        cursosList.innerHTML = "<li>Erro ao carregar cursos e associações.</li>";
    }
}


function gerarListasUnicas(cursos) {
    const discSet = new Set();
    const profSet = new Set();

    cursos.forEach(curso => {
        curso.disciplinasNomes.forEach(nome => discSet.add(nome));
        curso.professoresNomes.forEach(nome => profSet.add(nome));
    });

    disciplinasUnicas = [...discSet].sort();
    professoresUnicos = [...profSet].sort();
}

function renderizarCursos(cursos) {
    cursosList.innerHTML = "";

    cursos.forEach(curso => {
        const li = document.createElement("li");

        li.dataset.disciplinas = curso.disciplinasNomes.join(',');
        li.dataset.professores = curso.professoresNomes.join(',');

        li.innerHTML = `
            <span class="course-name">${curso.nome}</span>
        `;

        
        li.addEventListener("click", (e) => {
            // Evita conflito com os botões dos 3 pontinhos
            if (!e.target.classList.contains("option-btn") &&
                !e.target.closest(".option-dropdown")) {
                selecionarCurso(curso.id_curso, curso.nome);
            }
        });

        cursosList.appendChild(li);
    });
}

function selecionarCurso(id, nome) {
    window.location.href = `/html/user/quadroHorario.html?id=${id}`;
}

function abrirQuadroHorario(idCurso) {
    window.location.href = `/html/user/quadroHorario.html?id=${idCurso}`;
}

//exclusão de cursos
confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

async function abrirModalVincular(idCurso, nomeCurso) {
    cursoEmEdicaoVinculo = idCurso;
    tituloVincular.textContent = `Disciplinas de: ${nomeCurso}`;
    modalVincular.style.display = "block";
    
    selectDisciplinaVincular.innerHTML = '<option>Carregando...</option>';
    listaVinculadas.innerHTML = '<li>Carregando...</li>';
    selectDisciplinaVincular.disabled = true;
    btnAdicionarVinculo.disabled = true;

    await carregarDadosDoModalVinculo(idCurso);
}

// Atualiza lista com base nos filtros ativos
function aplicarFiltros() {
    let filtrados = [...cursosCache];

    // Filtro por disciplinas
    if (activeFilters.disciplinas.length > 0) {
        filtrados = filtrados.filter(curso =>
            curso.disciplinasNomes.some(d =>
                activeFilters.disciplinas.includes(d)
            )
        );
    }

    // Campo de busca (search)
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue !== "") {
        filtrados = filtrados.filter(curso =>
            curso.nome.toLowerCase().includes(searchValue) ||
            curso.disciplinasNomes.some(d => d.toLowerCase().includes(searchValue))
        );
    }

    renderizarCursos(filtrados);
    exibirFiltrosAtivos();
}

function abrirFiltro() {
    modalList.innerHTML = "";
    modalSearch.value = "";
    modalFiltro.style.display = "block";

    currentList = disciplinasUnicas;

    atualizarListaModal();

    modalSearch.addEventListener("input", atualizarListaModal);

    btnDisciplinas.classList.add("active");
}

function atualizarListaModal() {
    modalList.innerHTML = "";
    const filtro = modalSearch.value.trim().toLowerCase();

    const filtradas = disciplinasUnicas.filter(item =>
        item.toLowerCase().includes(filtro)
    );

    if (filtradas.length === 0) {
        modalList.innerHTML = "<li>Nenhum resultado encontrado.</li>";
        return;
    }

    filtradas.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;

        const isSelected = activeFilters.disciplinas.includes(item);
        if (isSelected) li.classList.add("selected");

        li.addEventListener("click", () => {
            if (isSelected) {
                activeFilters.disciplinas =
                    activeFilters.disciplinas.filter(i => i !== item);
            } else {
                activeFilters.disciplinas.push(item);
            }

            aplicarFiltros();
            atualizarListaModal();
            modalFiltro.style.display = "none";
        });

        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = "none";
    btnDisciplinas.classList.remove("active");
}

function exibirFiltrosAtivos() {
    activeFiltersDiv.innerHTML = "";

    const filtros = [...activeFilters.disciplinas];

    if (filtros.length === 0) {
        activeFiltersDiv.style.display = "none";
        return;
    }

    activeFiltersDiv.style.display = "flex";

    filtros.forEach(f => {
        const tag = document.createElement("div");
        tag.className = "filter-tag";
        tag.innerHTML = `${f} <span class="remove-tag">✕</span>`;

        tag.querySelector(".remove-tag").addEventListener("click", () => {
            activeFilters.disciplinas =
                activeFilters.disciplinas.filter(v => v !== f);
            aplicarFiltros();
        });

        activeFiltersDiv.appendChild(tag);
    });
}

// BOTÃO PARA ABRIR FILTRO
btnDisciplinas.addEventListener("click", abrirFiltro);

// Campo de busca geral
searchInput.addEventListener("input", aplicarFiltros);

//verifica clique
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

function irParaHorario(event) {
    event.preventDefault();

    // Recupera o ID salvo no localStorage
    const cursoId = localStorage.getItem("cursoSelecionado");

    if (!cursoId) {
        showPopup(`Você ainda não selecionou um curso!<br>Vá até a página de cursos e escolha um.`, "erro");
        return;
    }

    // Redireciona para a página de horário com ID na URL
    window.location.href = `/html/user/quadroHorario.html?id=${cursoId}`;
}

if (btnHorario) {
    btnHorario.addEventListener("click", irParaHorario);
}


// Inicialização
carregarCursos();


