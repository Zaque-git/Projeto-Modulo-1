/* ============================================================
   Combinacao - Busca Inteligente em Tempo Real (Armazém)
   ============================================================ */

document.getElementById("user-name").textContent =
  localStorage.getItem("user_email") || "Operador";

const form = document.getElementById("form-diagnose");
const result = document.getElementById("result");

// Simulando a Base de Dados do seu Armazém. Quando criar seu Back-End, 
// o fetch enviará requisições e receberá uma estrutura similar a esta.
const ARMAZEM_DATABASE = [
  {
    id: 1,
    name: "Pastilha de Freio Dianteira",
    brand: "Bosch",
    category: "Metalurgica",
    quantity: 24,
    available: true,
    compatible_cars: [
      { brand: "Volkswagen", model: "Gol", year: "2020" },
      { brand: "Volkswagen", model: "Polo", year: "2021" },
      { brand: "Fiat", model: "Uno", year: "2019" },
      { brand: "Chevrolet", model: "Onix", year: "2022" }
    ]
  },
  {
    id: 2,
    name: "Bateria 60Ah v12",
    brand: "Moura",
    category: "Eletronica",
    quantity: 12,
    available: true,
    compatible_cars: [
      { brand: "Volkswagen", model: "Gol", year: "2020" },
      { brand: "Fiat", model: "Uno", year: "2018" },
      { brand: "Ford", model: "Ka", year: "2019" }
    ]
  },
  {
    id: 3,
    name: "Sensor de Oxigênio (Sonda Lambda)",
    brand: "NGK",
    category: "Eletronica",
    quantity: 0,
    available: false,
    compatible_cars: [
      { brand: "Volkswagen", model: "Gol", year: "2018" },
      { brand: "Fiat", model: "Palio", year: "2015" },
      { brand: "Chevrolet", model: "Onix", year: "2020" }
    ]
  },
  {
    id: 4,
    name: "Filtro de Óleos e Fluidos",
    brand: "Fram",
    category: "Metalurgica",
    quantity: 50,
    available: true,
    compatible_cars: [
      { brand: "Chevrolet", model: "Onix", year: "2021" },
      { brand: "Hyundai", model: "HB20", year: "2020" }
    ]
  }
];

function normalize(s) {
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// --- LÓGICA DO AUTOCOMPLETAR EM TEMPO REAL ---

function setupAutocomplete(inputId, suggestionId, type) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionId);

  input.addEventListener("input", () => {
    const text = normalize(input.value);
    suggestionBox.innerHTML = "";
    
    if (!text) {
      suggestionBox.style.display = "none";
      return;
    }

    let matches = [];

    if (type === "part") {
      // Procura peças cujo nome contenha o termo digitado
      matches = ARMAZEM_DATABASE.filter(item => normalize(item.name).includes(text));
      
      if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach(item => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          const stockText = item.quantity > 0 ? `${item.quantity} un.` : "Em falta";
          const stockClass = item.quantity > 0 ? "stock-ok" : "stock-empty";
          
          div.innerHTML = `
            <div class="suggest-main"><strong>${item.name}</strong> <span class="suggest-sub">(${item.brand})</span></div>
            <span class="suggest-badge ${stockClass}">${stockText}</span>
          `;
          
          div.addEventListener("click", () => {
            input.value = item.name;
            suggestionBox.style.display = "none";
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    } 
    
    else if (type === "brand") {
      // Extrai marcas únicas da lista de peças
      const brands = [...new Set(ARMAZEM_DATABASE.map(item => item.brand))];
      matches = brands.filter(b => normalize(b).includes(text));
      
      if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach(brand => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = brand;
          div.addEventListener("click", () => {
            input.value = brand;
            suggestionBox.style.display = "none";
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    } 
    
    else if (type === "car") {
      // Coleta todas as combinações únicas de Marca/Modelo de carro das peças homologadas
      const carList = [];
      ARMAZEM_DATABASE.forEach(p => p.compatible_cars.forEach(c => {
        const fullName = `${c.brand} ${c.model}`;
        if (!carList.includes(fullName)) {
          carList.push(fullName);
        }
      }));
      
      matches = carList.filter(car => normalize(car).includes(text));
      
      if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach(car => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = car;
          div.addEventListener("click", () => {
            input.value = car;
            suggestionBox.style.display = "none";
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    } 
    
    else if (type === "year") {
      // Coleta anos cadastrados nas compatibilidades
      const years = [];
      ARMAZEM_DATABASE.forEach(p => p.compatible_cars.forEach(c => years.push(String(c.year))));
      const uniqueYears = [...new Set(years)];
      
      matches = uniqueYears.filter(y => normalize(y).includes(text));
      
      if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach(year => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = year;
          div.addEventListener("click", () => {
            input.value = year;
            suggestionBox.style.display = "none";
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    }
  });

  // Fecha as caixas de sugestões se o usuário clicar fora do input
  document.addEventListener("click", (e) => {
    if (e.target !== input) {
      suggestionBox.style.display = "none";
    }
  });
}

// Ativando autocomplete individual e desacoplado para cada campo
setupAutocomplete("part-name", "part-suggestions", "part");
setupAutocomplete("part-brand", "brand-suggestions", "brand");
setupAutocomplete("car-model", "car-suggestions", "car");
setupAutocomplete("car-year", "year-suggestions", "year");


// --- SUBMISSÃO E ANÁLISE DE COMPATIBILIDADE FLEXÍVEL (CAMPOS OPCIONAIS) ---

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const partName = document.getElementById("part-name").value;
  const partBrand = document.getElementById("part-brand").value;
  const carModel = document.getElementById("car-model").value;
  const carYear = document.getElementById("car-year").value;

  result.innerHTML = `
    <div class="card"><div class="card-body empty">Analisando dados do armazém...</div></div>
  `;

  // Esta chamada de API já está pronta estruturalmente para receber seu back-end manual no futuro
  let data;
  try {
    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ part: partName, brand: partBrand, model: carModel, year: carYear }),
    });
    if (!res.ok) throw new Error("offline");
    data = await res.json();
  } catch {
    // Algoritmo local inteligente que filtra cumulativamente apenas o que for digitado
    let filteredParts = ARMAZEM_DATABASE;

    // Se digitou Peça
    if (partName.trim() !== "") {
      filteredParts = filteredParts.filter(p => normalize(p.name).includes(normalize(partName)));
    }

    // Se digitou Marca
    if (partBrand.trim() !== "") {
      filteredParts = filteredParts.filter(p => normalize(p.brand).includes(normalize(partBrand)));
    }

    // Se digitou Carro/Modelo
    if (carModel.trim() !== "") {
      filteredParts = filteredParts.filter(p => 
        p.compatible_cars.some(c => normalize(`${c.brand} ${c.model}`).includes(normalize(carModel)))
      );
    }

    // Se digitou Ano
    if (carYear.trim() !== "") {
      filteredParts = filteredParts.filter(p => 
        p.compatible_cars.some(c => normalize(c.year) === normalize(carYear))
      );
    }

    data = {
      found: filteredParts.length > 0,
      results: filteredParts
    };
  }

  renderResults(data);
});

function renderResults(data) {
  if (!data.found || !data.results || data.results.length === 0) {
    result.innerHTML = `
      <div class="card">
        <div class="card-body empty">
          Nenhuma peça ou compatibilidade correspondente foi encontrada para as informações digitadas.
        </div>
      </div>`;
    return;
  }

  result.innerHTML = "";

  // Renderiza dinamicamente todas as peças encontradas no filtro parcial, listando seus carros
  data.results.forEach(p => {
    const cars = p.compatible_cars
      .map(c => `<span class="badge badge-slate">${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${c.year})</span>`)
      .join("");

    const resultBox = document.createElement("div");
    resultBox.style.marginBottom = "20px";

    if (p.available) {
      resultBox.innerHTML = `
        <div class="result-card" style="margin-top: 0;">
          <div class="result-header">
            <div>
              <h3 class="result-title">${escapeHtml(p.name)}</h3>
              <p class="muted" style="margin:4px 0 0;">🟢 Peça localizada no sistema com especificações compatíveis.</p>
            </div>
            <span class="badge badge-ok">Disponível (${p.quantity} un.)</span>
          </div>
          <div class="result-grid">
            <div><div class="label">Marca da Peça</div><div class="value">${escapeHtml(p.brand)}</div></div>
            <div><div class="label">Categoria</div><div class="value">${p.category === "Eletronica" ? "Eletrônica" : "Metalúrgica"}</div></div>
            <div><div class="label">Status do Estoque</div><div class="value">Liberado</div></div>
          </div>
          <div class="compat-section">
            <h4>Veículos Homologados / Compatíveis</h4>
            <div class="compat-list">${cars || '<span class="muted">Nenhum registro de compatibilidade.</span>'}</div>
          </div>
        </div>`;
    } else {
      resultBox.innerHTML = `
        <div class="result-card danger" style="margin-top: 0;">
          <div class="result-header">
            <div>
              <h3 class="result-title" style="color:var(--danger);">${escapeHtml(p.name)}</h3>
              <p class="muted" style="margin:4px 0 0;">⚠️ Peça correspondente encontrada, porém encontra-se esgotada no armazém.</p>
            </div>
            <span class="badge badge-danger">Indisponível</span>
          </div>
          <div class="result-grid">
            <div><div class="label">Marca da Peça</div><div class="value">${escapeHtml(p.brand)}</div></div>
            <div><div class="label">Categoria</div><div class="value">${p.category === "Eletronica" ? "Eletrônica" : "Metalúrgica"}</div></div>
            <div><div class="label">Status</div><div class="value" style="color:var(--danger)">Esgotado</div></div>
          </div>
          <div class="compat-section">
            <h4>Veículos Homologados / Compatíveis</h4>
            <div class="compat-list">${cars}</div>
          </div>
          <div style="margin-top:18px;">
            <button class="btn btn-danger btn-purchase-action" data-part="${escapeHtml(p.name)}" data-id="${p.id}">Emitir Pedido de Compra Automatizado</button>
          </div>
        </div>`;
    }
    result.appendChild(resultBox);
  });

  // Eventos para botões de compra automatizados criados em tempo de execução
  document.querySelectorAll(".btn-purchase-action").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const partId = e.target.getAttribute("data-id");
      const partName = e.target.getAttribute("data-part");
      try {
        await fetch("/api/purchase-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ part_id: partId }),
        });
      } catch {}
      alert("Ordem de compra automatizada enviada para: " + partName);
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}