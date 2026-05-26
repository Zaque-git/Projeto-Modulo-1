/* ============================================================
   Combinacao - diagnostico por sintoma
   ------------------------------------------------------------
   BACKEND (Flask) - implemente voce mesmo:

     POST /api/diagnose
       body: { "symptom": "barulho ao frear" }
       resposta esperada:
       {
         "ok": true,
         "found": true,
         "available": true,                         // false = em falta
         "part": {
           "id": 1, "name": "Pastilha de Freio Dianteira",
           "category": "Metalurgica", "brand": "Bosch",
           "quantity": 24
         },
         "compatible_cars": [
           { "brand": "Volkswagen", "model": "Gol" },
           { "brand": "Fiat",       "model": "Uno" }
         ]
       }

     POST /api/purchase-order
       body: { "part_id": 3 }
       resposta esperada: { "ok": true }

   Sugestao de schema SQLite:
     CREATE TABLE cars (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       brand TEXT NOT NULL,
       model TEXT NOT NULL
     );
     CREATE TABLE part_car_compat (
       part_id INTEGER NOT NULL,
       car_id  INTEGER NOT NULL,
       PRIMARY KEY (part_id, car_id)
     );
   ============================================================ */

document.getElementById("user-name").textContent =
  localStorage.getItem("user_email") || "Operador";

const form = document.getElementById("form-diagnose");
const result = document.getElementById("result");

// Mock de demonstracao caso nao tenha backend
const MOCK_DIAGNOSIS = {
  "barulho ao frear": {
    part: { id:1, name:"Pastilha de Freio Dianteira", category:"Metalurgica", brand:"Bosch", quantity:24 },
    available: true,
    compatible_cars: [
      { brand:"Volkswagen", model:"Gol" }, { brand:"Volkswagen", model:"Polo" },
      { brand:"Fiat", model:"Uno" }, { brand:"Chevrolet", model:"Onix" }
    ]
  },
  "luz da injecao acesa": {
    part: { id:3, name:"Sensor de Oxigênio (Sonda Lambda)", category:"Eletronica", brand:"NGK", quantity:0 },
    available: false,
    compatible_cars: [
      { brand:"Volkswagen", model:"Gol" }, { brand:"Fiat", model:"Palio" },
      { brand:"Chevrolet", model:"Onix" }, { brand:"Toyota", model:"Corolla" }
    ]
  },
  "carro nao da partida": {
    part: { id:4, name:"Bateria 60Ah", category:"Eletronica", brand:"Moura", quantity:5 },
    available: true,
    compatible_cars: [
      { brand:"Volkswagen", model:"Gol" }, { brand:"Fiat", model:"Uno" },
      { brand:"Ford", model:"Ka" }, { brand:"Chevrolet", model:"Prisma" }
    ]
  }
};

function normalize(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const symptom = document.getElementById("symptom").value.trim();
  if (!symptom) return;

  result.innerHTML = `<div class="card" style="margin-top:22px;"><div class="card-body empty">Analisando sintoma...</div></div>`;

  let data;
  try {
    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom }),
    });
    if (!res.ok) throw new Error("backend off");
    data = await res.json();
  } catch {
    // fallback mock
    const key = Object.keys(MOCK_DIAGNOSIS).find(k => normalize(symptom).includes(k));
    if (key) {
      const m = MOCK_DIAGNOSIS[key];
      data = { ok:true, found:true, ...m };
    } else {
      data = { ok:true, found:false };
    }
  }

  renderResult(data);
});

function renderResult(data) {
  if (!data.found) {
    result.innerHTML = `
      <div class="card" style="margin-top:22px;">
        <div class="card-body empty">
          Não foi possível identificar uma peça para esse sintoma.<br>
          Tente reformular a descrição.
        </div>
      </div>`;
    return;
  }

  const p = data.part;
  const cars = (data.compatible_cars || [])
    .map(c => `<span class="badge badge-slate">${escapeHtml(c.brand)} ${escapeHtml(c.model)}</span>`)
    .join("");

  if (data.available) {
    result.innerHTML = `
      <div class="result-card">
        <div class="result-header">
          <div>
            <h3 class="result-title">${escapeHtml(p.name)}</h3>
            <p class="muted" style="margin:4px 0 0;">Peça solução identificada para o sintoma informado.</p>
          </div>
          <span class="badge badge-ok">Disponível no estoque</span>
        </div>
        <div class="result-grid">
          <div><div class="label">Marca</div><div class="value">${escapeHtml(p.brand)}</div></div>
          <div><div class="label">Categoria</div><div class="value">${p.category === "Eletronica" ? "Eletrônica" : "Metalúrgica"}</div></div>
          <div><div class="label">Quantidade no armazém</div><div class="value">${p.quantity} un.</div></div>
        </div>
        <div class="compat-section">
          <h4>Outros carros compatíveis</h4>
          <div class="compat-list">${cars || '<span class="muted">Nenhum registro.</span>'}</div>
        </div>
      </div>`;
  } else {
    result.innerHTML = `
      <div class="result-card danger">
        <div class="result-header">
          <div>
            <h3 class="result-title" style="color:var(--danger);">Peça Solução em Falta no Estoque</h3>
            <p class="muted" style="margin:4px 0 0;">${escapeHtml(p.name)} - ${escapeHtml(p.brand)}</p>
          </div>
          <span class="badge badge-danger">Indisponível</span>
        </div>
        <div class="result-grid">
          <div><div class="label">Categoria</div><div class="value">${p.category === "Eletronica" ? "Eletrônica" : "Metalúrgica"}</div></div>
          <div><div class="label">Quantidade</div><div class="value">0 un.</div></div>
        </div>
        <div class="compat-section">
          <h4>Outros carros compatíveis</h4>
          <div class="compat-list">${cars || '<span class="muted">Nenhum registro.</span>'}</div>
        </div>
        <div style="margin-top:18px;">
          <button class="btn btn-danger" id="btn-purchase">Solicitar Ordem de Compra Urgente</button>
        </div>
      </div>`;

    document.getElementById("btn-purchase").addEventListener("click", async () => {
      try {
        await fetch("/api/purchase-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ part_id: p.id }),
        });
      } catch {}
      alert("Ordem de compra urgente solicitada para: " + p.name);
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
