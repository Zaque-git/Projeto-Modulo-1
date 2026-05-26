/* ============================================================
   Armazem - listagem, busca, filtro e cadastro de peca
   ------------------------------------------------------------
   BACKEND (Flask) - implemente voce mesmo:

     GET /api/parts?q=<busca>&category=<Todas|Metalurgica|Eletronica>
       resposta esperada:
       [
         { "id":1, "name":"Pastilha de Freio", "category":"Metalurgica",
           "brand":"Bosch", "quantity":24 },
         ...
       ]

     POST /api/parts
       body: { "name":"...", "category":"Metalurgica|Eletronica",
               "brand":"...", "quantity": 10 }
       resposta esperada: { "ok": true, "id": 99 }

   Sugestao de schema SQLite:
     CREATE TABLE parts (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       category TEXT NOT NULL,
       brand TEXT NOT NULL,
       quantity INTEGER NOT NULL DEFAULT 0
     );
   ============================================================ */

document.getElementById("user-name").textContent =
  localStorage.getItem("user_email") || "Operador";

const tbody = document.getElementById("parts-body");
const inputSearch = document.getElementById("search");
const selCategory = document.getElementById("filter-category");

const modal = document.getElementById("modal-add");
const btnOpen = document.getElementById("btn-open-add");
const formAdd = document.getElementById("form-add-part");
const addAlert = document.getElementById("add-alert");

// Mock local usado se o backend ainda nao existir
let MOCK_PARTS = [
  { id:1, name:"Pastilha de Freio Dianteira", category:"Metalurgica", brand:"Bosch",  quantity:24 },
  { id:2, name:"Disco de Freio Ventilado",    category:"Metalurgica", brand:"Fremax", quantity:8  },
  { id:3, name:"Sensor de Oxigênio",          category:"Eletronica",  brand:"NGK",    quantity:0  },
  { id:4, name:"Bateria 60Ah",                category:"Eletronica",  brand:"Moura",  quantity:5  },
  { id:5, name:"Filtro de Óleo",              category:"Metalurgica", brand:"Mann",   quantity:42 },
  { id:6, name:"Módulo de Ignição",           category:"Eletronica",  brand:"Delphi", quantity:2  },
];
let usingMock = false;

async function loadParts() {
  const q = inputSearch.value.trim();
  const cat = selCategory.value;

  let parts;
  try {
    const url = `/api/parts?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("backend off");
    parts = await res.json();
  } catch {
    usingMock = true;
    parts = MOCK_PARTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase());
      const matchC = cat === "Todas" || p.category === cat;
      return matchQ && matchC;
    });
  }

  render(parts);
}

function statusBadge(qty) {
  if (qty === 0) return `<span class="badge badge-danger">Em falta</span>`;
  if (qty <= 5)  return `<span class="badge badge-warn">Crítico</span>`;
  return `<span class="badge badge-ok">Disponível</span>`;
}

function categoryBadge(cat) {
  return cat === "Eletronica"
    ? `<span class="badge badge-info">Eletrônica</span>`
    : `<span class="badge badge-slate">Metalúrgica</span>`;
}

function render(parts) {
  if (!parts.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">Nenhuma peça encontrada.</td></tr>`;
    return;
  }
  tbody.innerHTML = parts.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${categoryBadge(p.category)}</td>
      <td>${escapeHtml(p.brand)}</td>
      <td>${p.quantity}</td>
      <td>${statusBadge(p.quantity)}</td>
    </tr>
  `).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

inputSearch.addEventListener("input", loadParts);
selCategory.addEventListener("change", loadParts);

/* ---------- Modal adicionar ---------- */
function openModal()  { modal.classList.add("open"); }
function closeModal() {
  modal.classList.remove("open");
  formAdd.reset();
  addAlert.style.display = "none";
}
btnOpen.addEventListener("click", openModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal || e.target.hasAttribute("data-close")) closeModal();
});

formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();
  addAlert.style.display = "none";

  const payload = {
    name:     document.getElementById("p-name").value.trim(),
    category: document.getElementById("p-category").value,
    brand:    document.getElementById("p-brand").value.trim(),
    quantity: parseInt(document.getElementById("p-quantity").value, 10),
  };

  if (!payload.name || !payload.category || !payload.brand || isNaN(payload.quantity) || payload.quantity < 0) {
    addAlert.textContent = "Preencha todos os campos corretamente.";
    addAlert.style.display = "block";
    return;
  }

  try {
    const res = await fetch("/api/parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao salvar.");
  } catch (err) {
    // Sem backend? adiciona no mock local
    if (!usingMock && err.message && !err.message.includes("Failed")) {
      addAlert.textContent = err.message;
      addAlert.style.display = "block";
      return;
    }
    const newId = MOCK_PARTS.length ? Math.max(...MOCK_PARTS.map(p => p.id)) + 1 : 1;
    MOCK_PARTS.push({ id: newId, ...payload });
  }

  closeModal();
  loadParts();
});

loadParts();
