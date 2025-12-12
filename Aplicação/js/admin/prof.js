const BASE = "https://link-da-sua-API-hospedada";
const API_PROFESSOR = `${BASE}/professor`;

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const profList = document.getElementById('prof-list');
const searchInput = document.getElementById('searchInput');

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let professorIdParaExcluir = null;

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}


// carregar professores da API
async function carregarProfessores() {
    profList.innerHTML = '<li style="justify-content:center;">Carregando professores...</li>';

    try {
        const response = await fetch(API_PROFESSOR);
        if (!response.ok) throw new Error('Erro na requisição');
        
        const professores = await response.json();

        // Limpa a lista
        profList.innerHTML = "";

        if (!Array.isArray(professores) || professores.length === 0) {
            profList.innerHTML = '<li style="justify-content:center;">Nenhum professor encontrado.</li>';
            return;
        }

        professores.forEach(prof => {
            adicionarProfessorNaTela(prof);
        });

    } catch (error) {
        console.error(error);
        profList.innerHTML = '<li style="justify-content:center; color: #ffcccc;">Erro ao carregar dados. Verifique a API.</li>';
    }
}

// renderizar item na lista 
function adicionarProfessorNaTela(prof) {
    const li = document.createElement("li");
    
    // ajuste de IDs
    const idProf = prof.id || prof.id_professor || prof._id; 
    const nomeProf = prof.nome;

    li.innerHTML = `
        <span class="course-name">${nomeProf}</span>

        <div class="buttonsControl">
            <td>
                <button class="btn-edit" onclick="irParaEdicao(${idProf})">Editar</button>
                <button class="btn-delete" onclick="abrirModalExcluir(${idProf}, '${nomeProf}')">Excluir</button>
            </td>
        </div>
    `;
    profList.appendChild(li);
}

// redirecionar para Edição
window.irParaEdicao = function(id) {
    window.location.href = `/html/admin/editProf.html?id=${id}`;
}

// exclusão
window.abrirModalExcluir = function(id, nome) {
    professorIdParaExcluir = id;
    confirmText.textContent = `Deseja realmente excluir o professor "${nome}"?`;
    confirmModal.style.display = "flex";
}

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
    professorIdParaExcluir = null;
});

confirmYes.addEventListener("click", async () => {
    if (!professorIdParaExcluir) return;

    try {
        const response = await fetch(`${API_PROFESSOR}/${professorIdParaExcluir}`, {
            method: "DELETE"
        });

        if (response.ok) {
            carregarProfessores(); // Recarrega a lista
        } else {
            alert("Erro ao excluir. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro de conexão com o servidor.");
    } finally {
        confirmModal.style.display = "none";
    }
});

//filtros de pesquisa
searchInput.addEventListener("input", function() {
    const termo = this.value.toLowerCase();
    const itens = profList.querySelectorAll("li");

    itens.forEach(item => {
        const texto = item.querySelector(".course-name").textContent.toLowerCase();
        if (texto.includes(termo)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
});


document.addEventListener("click", function(event) {
    const isButton = event.target.matches(".option-btn");
    
    // Seleciona todos os menus abertos
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;
        
        // Verifica se este específico já está aberto
        const isOpen = dropdown.style.display === "block";

        allMenus.forEach(menu => menu.style.display = "none");

        if (!isOpen) {
            dropdown.style.display = "block";
        }

    } else {
        // Se clicar fora, fecha tudo
        allMenus.forEach(menu => menu.style.display = "none");
    }
});

// Inicialização
document.addEventListener("DOMContentLoaded", carregarProfessores);
