const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}

const BASE = "https://link-da-sua-API-hospedada";
const API_CURSO = `${BASE}/curso`;

// pegar id da URL
const params = new URLSearchParams(window.location.search);
const idCurso = params.get("id");

if (!idCurso) {
  showPopup("Curso não encontrado.", "erro");
  setTimeout(() => {
    window.location.href = "/html/admin/curso.html";
  }, 1500);
}

const inputNome = document.getElementById("nome");
const inputCarga = document.getElementById("hours");
const btnSalvar = document.getElementById("btnAtualizar");

// Pop-up
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupTitle = document.getElementById("popup-title");
const popupIcon = document.querySelector(".popup-icon");
const popupClose = document.getElementById("popup-close");
const btnConfirm = document.getElementById("popup-confirm");
const btnClose = document.getElementById("popup-close");

function showPopup(message, type = "erro") {
  popupText.textContent = message;

  popup.classList.remove("erro", "sucesso", "alert");
  popup.classList.add(type);

  if (type === "sucesso") {
    popupTitle.textContent = "Sucesso!";
    popupIcon.innerHTML = "✔️";
    btnConfirm.style.display = "none";
    btnClose.textContent = "OK";
  } else if (type === "erro") {
    popupTitle.textContent = "Erro!";
    popupIcon.innerHTML = "❌";
    btnClose.textContent = "OK";
    btnConfirm.style.display = "none";
  } else if (type === "alert") {
    btnClose.textContent = "NÃO";
    popupTitle.textContent = "Atenção!";
    popupIcon.innerHTML = "⚠️";
  }

  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("show"), 10);
}

function hidePopup() {
  popup.classList.remove("show");
  setTimeout(() => popup.style.display = "none", 250);
}

popupClose.addEventListener("click", hidePopup);

// botão com loading
function toggleLoading(isLoading) {
  if (isLoading) {
    btnSalvar.classList.add("loading");
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;
  } else {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.disabled = false;
  }
}

// carregar dados do curso
async function carregarCurso() {
  toggleLoading(true);
  btnSalvar.textContent = "Carregando...";

  try {
    const res = await fetch(`${API_CURSO}/${idCurso}`);

    if (!res.ok) {
      showPopup("Erro ao carregar curso.", "erro");
      return;
    }

    const curso = await res.json();

    inputNome.value = curso.nome ?? "";
    inputCarga.value = curso.carga_horaria ?? "";

  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    showPopup("Erro interno ao carregar curso.", "erro");
  } finally {
    toggleLoading(false);
  }
}

carregarCurso();

// salvar alterações
btnSalvar.addEventListener("click", async () => {
  const nome = inputNome.value.trim();
  const cargaRaw = inputCarga.value.trim();

  if (!nome || !cargaRaw) {
    showPopup("Preencha todos os campos.", "erro");
    return;
  }

  const carga = Number(cargaRaw);

  if (!Number.isFinite(carga) || carga <= 0) {
    showPopup("Informe uma carga horária válida (maior que 0).", "erro");
    return;
  }

  toggleLoading(true);

  try {
    const res = await fetch(`${API_CURSO}/${idCurso}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        carga_horaria: carga
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      showPopup("Erro ao atualizar: " + txt, "erro");
      return;
    }

    showPopup("Curso atualizado com sucesso!", "sucesso");

    setTimeout(() => {
      window.location.href = "/html/admin/curso.html";
    }, 1500);

  } catch (error) {
    console.error("Erro ao salvar alterações:", error);
    showPopup("Falha ao salvar. Verifique sua conexão.", "erro");

  } finally {
    toggleLoading(false);
  }
});

// enviar com ENTER
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnSalvar.click();
});


const API_DISCIPLINA = `${BASE}/disciplina`;
const API_CURSO_DISCIPLINA = `${BASE}/curso/disciplina`;


const modalVincular = document.getElementById('modalVincular');
const closeVincular = document.getElementById('closeVincular');
const tituloVincular = document.getElementById('tituloVincular');
const listaVinculadas = document.getElementById('listaVinculadas');
const btnAdicionarVinculo = document.getElementById('btnAdicionarVinculo');


const selectWrapper = document.getElementById("disciplinaSelect");
const trigger = selectWrapper.querySelector(".select-trigger");
const optionsBox = selectWrapper.querySelector(".select-options");

// pesquisa
const searchDiscInput = document.getElementById("searchDisciplina");

let cursoEmEdicaoVinculo = null;
let disciplinaSelecionada = null;

// abrir modal
async function abrirModalVincular() {
    try {
        // Garantir que existe ID
        if (!idCurso) {
            showPopup("ID do curso não encontrado na URL.","erro");
            return;
        }

        cursoEmEdicaoVinculo = idCurso;

        // Buscar dados do curso 
        const res = await fetch(`${API_BASE}/curso/${idCurso}`);

        if (!res.ok) {
            showPopup("Erro ao carregar informações do curso.","erro");
            return;
        }

        const curso = await res.json();

        // Abrir modal
        modalVincular.style.display = "block";
        tituloVincular.textContent = `Disciplinas de: ${curso.nome || "Curso"}`;

        // Resetar campos
        trigger.textContent = "Carregando...";
        trigger.dataset.value = "";
        optionsBox.innerHTML = "<div>Carregando...</div>";
        listaVinculadas.innerHTML = "<li>Carregando...</li>";
        btnAdicionarVinculo.disabled = true;
        disciplinaSelecionada = null;

        // Carregar dados do modal
        await carregarDadosDoModalVinculo(idCurso);

    } catch (err) {
        console.error("Erro ao abrir modal de vínculo:", err);
        showPopup("Erro interno ao abrir o modal de disciplinas.","erro");
    }
}

// carregar disciplinas
async function carregarDadosDoModalVinculo(idCurso) {
    try {
        // todas disciplinas
        const resTodas = await fetch(API_DISCIPLINA);
        const todasDisciplinas = await resTodas.json();

        // vinculadas
        const resVinc = await fetch(`${API_CURSO_DISCIPLINA}/${idCurso}`);
        const vinculadas = resVinc.ok ? await resVinc.json() : [];

        // lista vinculadas
        listaVinculadas.innerHTML = "";
        const idsVinculados = new Set();

        if (vinculadas.length === 0) {
            listaVinculadas.innerHTML = `<li style="color:#777;">Nenhuma disciplina vinculada.</li>`;
        } else {
            vinculadas.forEach(disc => {
                idsVinculados.add(disc.id_disciplina);
                const li = document.createElement("li");

                li.innerHTML = `
                    <span>${disc.nome}</span>
                    <button class="btn-remove-vinculo" onclick="removerDisciplina(${idCurso}, ${disc.id_disciplina})">✕</button>
                `;

                listaVinculadas.appendChild(li);
            });
        }

        // SELECT CUSTOM (somente não vinculadas)
        optionsBox.innerHTML = "";
        trigger.textContent = "Selecione uma disciplina...";
        trigger.dataset.value = "";
        disciplinaSelecionada = null;

        const disponiveis = todasDisciplinas.filter(d => !idsVinculados.has(d.id_disciplina));

        if (disponiveis.length === 0) {
            optionsBox.innerHTML = `<div style="padding:8px; color:#777;">Nenhuma disponível.</div>`;
        } else {
            disponiveis.forEach(d => {
                const item = document.createElement("div");
                item.classList.add("option-item");
                item.textContent = d.nome;
                item.dataset.value = d.id_disciplina;

                item.addEventListener("click", () => {
                    trigger.textContent = d.nome;
                    trigger.dataset.value = d.id_disciplina;
                    disciplinaSelecionada = d.id_disciplina;

                    optionsBox.style.display = "none";
                    btnAdicionarVinculo.disabled = false;
                });

                optionsBox.appendChild(item);
            });
        }

        // abrir/fechar select
        trigger.onclick = () =>
            optionsBox.style.display =
                optionsBox.style.display === "block" ? "none" : "block";

    } catch (err) {
        console.error("Erro ao carregar modal:", err);
        listaVinculadas.innerHTML = "<li>Erro ao carregar dados.</li>";
    }
}

// adicionar relação com disciplina
btnAdicionarVinculo.addEventListener("click", async () => {
    if (!cursoEmEdicaoVinculo || !disciplinaSelecionada) return;

    try {
        const res = await fetch(API_CURSO_DISCIPLINA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_curso: cursoEmEdicaoVinculo,
                id_disciplina: disciplinaSelecionada
            })
        });

        if (res.ok) {
            await carregarDadosDoModalVinculo(cursoEmEdicaoVinculo);
        } else {
            alert("Erro ao vincular disciplina.");
            showPopup("Erro ao vincular disciplina.","erro");
        }

    } catch (err) {
        console.error(err);
    }
});

// remover relação com disciplina
async function removerDisciplina(idCurso, idDisciplina) {
    showPopup("Remover esta disciplina do curso?", "alert");
    btnClose.addEventListener("click", () => {
      hidePopup();
      return;
    })
    btnConfirm.addEventListener("click", async () => {
      hidePopup();
      try {
        const res = await fetch(`${API_CURSO_DISCIPLINA}/${idCurso}/${idDisciplina}`, {
          method: "DELETE"
        });

        if (res.ok) {
            await carregarDadosDoModalVinculo(idCurso);
        } else {
            showPopup("Erro ao remover vínculo.","erro");
        }

    } catch (err) {
        console.error(err);
    }
    })

}

// fechar modal
closeVincular.addEventListener("click", () => {
    modalVincular.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modalVincular) {
        modalVincular.style.display = "none";
    }
});

// busca no SELECT CUSTOM
searchDiscInput.addEventListener("input", () => {
    const termo = searchDiscInput.value.toLowerCase();
    const items = document.querySelectorAll("#disciplinaSelect .select-options .option-item");

    items.forEach(item => {
        const txt = item.textContent.toLowerCase();
        item.style.display = txt.includes(termo) ? "" : "none";
    });

    // Abrir dropdown enquanto digita
    if (termo.length > 0) {
        optionsBox.style.display = "block";
    }
});


function abrirQuadroHorario() {
    const params = new URLSearchParams(window.location.search);
    const idCurso = params.get("id");

    if (!idCurso) {
        alert("ID do curso não encontrado na URL.");
        return;
    }

    window.location.href = `/html/admin/quadroHorario.html?id=${idCurso}`;
}
