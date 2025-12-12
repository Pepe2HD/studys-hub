const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

const btnHorario = document.getElementById("btnHorario");
const btnHorario2 = document.getElementById("btnHorario2");

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

//Pop-up
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupTitle = document.getElementById("popup-title");
const popupIcon = document.querySelector(".popup-icon");
const popupClose = document.getElementById("popup-close");

function showPopup(message, type = "erro") {
  popupText.innerHTML = message;

  popup.classList.remove("sucesso", "erro");
  popup.classList.add(type);

  if (type === "sucesso") {
    popupTitle.textContent = "Sucesso!";
    popupIcon.innerHTML = "✔️";
  } else {
    popupTitle.textContent = "Atenção!";
    popupIcon.innerHTML = "❗";
  }

  popup.style.display = "flex";

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);
}

function hidePopup() {
  popup.classList.remove("show");
  setTimeout(() => {
    popup.style.display = "none";
  }, 250);
}

popupClose.addEventListener("click", hidePopup);


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

if (btnHorario2) {
    btnHorario2.addEventListener("click", irParaHorario);
}

console.log("home.js carregado com sucesso");

