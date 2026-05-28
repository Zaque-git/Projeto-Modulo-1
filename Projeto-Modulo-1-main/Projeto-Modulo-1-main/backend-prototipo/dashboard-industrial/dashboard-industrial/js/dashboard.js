/* ============================================================
   Dashboard - metricas e atividades
   ------------------------------------------------------------
   BACKEND (Flask) - implemente voce mesmo:
     GET /api/metrics
       resposta esperada:
       {
         "total_parts": 0,
         "total_quantity": 0,
         "critical": 0,
         "out_of_stock": 0,
         "activities": [
           { "description": "...", "created_at": "2026-05-26 10:00:00" }
         ]
       }
   ============================================================ */

document.getElementById("user-name").textContent =
  localStorage.getItem("user_email") || "Operador";

// Fallback de exemplo caso o backend ainda nao exista
const MOCK = {
  total_parts: 6,
  total_quantity: 81,
  critical: 2,
  out_of_stock: 1,
  activities: [
    { description: "Entrada de 20 unidades - Filtro de Óleo", created_at: "2026-05-26 09:12" },
    { description: "Diagnóstico realizado - Sensor de Oxigênio", created_at: "2026-05-26 08:45" },
    { description: "Saída de 2 unidades - Pastilha de Freio Dianteira", created_at: "2026-05-25 17:30" },
    { description: "Alerta de estoque crítico - Módulo de Ignição", created_at: "2026-05-25 14:02" }
  ]
};

async function loadMetrics() {
  let data;
  try {
    const res = await fetch("/api/metrics");
    if (!res.ok) throw new Error("backend off");
    data = await res.json();
  } catch {
    data = MOCK;
  }

  document.getElementById("m-total").textContent    = data.total_parts;
  document.getElementById("m-qty").textContent      = data.total_quantity;
  document.getElementById("m-critical").textContent = data.critical;
  document.getElementById("m-out").textContent      = data.out_of_stock;

  const tbody = document.getElementById("activities-body");
  if (!data.activities || data.activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="empty">Nenhuma atividade registrada.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.activities.map(a => `
    <tr>
      <td>${escapeHtml(a.description)}</td>
      <td class="muted">${escapeHtml(a.created_at || "")}</td>
    </tr>
  `).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

loadMetrics();
