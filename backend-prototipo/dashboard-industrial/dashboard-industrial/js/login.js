/* ============================================================
   Login / Cadastro
   ------------------------------------------------------------
   BACKEND (Flask) - implemente voce mesmo:
     POST /api/login     body: { email, password }     -> 200 { ok:true } | 401
     POST /api/register  body: { name, email, password } -> 200 { ok:true } | 400
   ============================================================ */

const tabs = document.querySelectorAll(".auth-tab");
const formLogin = document.getElementById("form-login");
const formRegister = document.getElementById("form-register");
const alertBox = document.getElementById("alert");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const which = tab.dataset.tab;
    formLogin.style.display    = which === "login"    ? "block" : "none";
    formRegister.style.display = which === "register" ? "block" : "none";
    hideAlert();
  });
});

function showAlert(msg, type = "error") {
  alertBox.className = "alert " + (type === "error" ? "alert-error" : "alert-success");
  alertBox.textContent = msg;
  alertBox.style.display = "block";
}
function hideAlert() { alertBox.style.display = "none"; }

// ----- LOGIN -----
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    // TODO: trocar pela rota real do seu Flask
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      // guarda info simples no localStorage para a navbar
      localStorage.setItem("user_email", email);
      window.location.href = "dashboard.html";
    } else {
      showAlert(data.error || "Credenciais inválidas.");
    }
  } catch (err) {
    // Sem backend ainda? Permite navegar mesmo assim:
    console.warn("Backend offline, entrando em modo demo.", err);
    localStorage.setItem("user_email", email);
    window.location.href = "dashboard.html";
  }
});

// ----- CADASTRO -----
formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      localStorage.setItem("user_email", email);
      window.location.href = "dashboard.html";
    } else {
      showAlert(data.error || "Não foi possível concluir o cadastro.");
    }
  } catch (err) {
    console.warn("Backend offline, entrando em modo demo.", err);
    localStorage.setItem("user_email", email);
    window.location.href = "dashboard.html";
  }
});
