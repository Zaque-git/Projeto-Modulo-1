/* ============================================================
   Combinacao - Busca Inteligente em Tempo Real (Armazém)
   ============================================================ */

document.getElementById("user-name").textContent =
  localStorage.getItem("user_email") || "Operador";

const form = document.getElementById("form-diagnose");
const result = document.getElementById("result");

// Simulando a Base de Dados do seu Armazém para Autocompletar
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
            document.getElementById("part-brand").value = item.brand; 
            suggestionBox.style.display = "none";
            document.getElementById("part-brand").dispatchEvent(new Event('input'));
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    } 
    
    else if (type === "brand") {
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
      const carList = [];
      ARMAZEM_DATABASE.forEach(p => p.compatible_cars.forEach(c => {
        if (!carList.some(el => el.brand === c.brand && el.model === c.model)) {
          carList.push({ brand: c.brand, model: c.model });
        }
      }));
      
      matches = carList.filter(c => normalize(`${c.brand} ${c.model}`).includes(text));
      
      if (matches.length > 0) {
        suggestionBox.style.display = "block";
        matches.forEach(car => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = `${car.brand} ${car.model}`;
          div.addEventListener("click", () => {
            input.value = `${car.brand} ${car.model}`;
            suggestionBox.style.display = "none";
          });
          suggestionBox.appendChild(div);
        });
      } else {
        suggestionBox.style.display = "none";
      }
    } 
    
    else if (type === "year") {
      const years = [];
      ARMAZEM_DATABASE.forEach(p => p.compatible_cars.forEach(c => years.push(c.year)));
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

  document.addEventListener("click", (e) => {
    if (e.target !== input) {
      suggestionBox.style.display = "none";
    }
  });
}

setupAutocomplete("part-name", "part-suggestions", "part");
setupAutocomplete("part-brand", "brand-suggestions", "brand");
setupAutocomplete("car-model", "car-suggestions", "car");
setupAutocomplete("car-year", "year-suggestions", "year");


// --- SUBMISSÃO E ANÁLISE DE COMPATIBILIDADE ---

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const partName = document.getElementById("part-name").value;
  const partBrand = document.getElementById("part-brand").value;
  const carModel = document.getElementById("car-model").value;
  const carYear = document.getElementById("car-year").value;

  result.innerHTML = `
    <div class="card"><div class="card-body empty">Analisando compatibilidade da combinação...</div></div>
  `;

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
    const foundPart = ARMAZEM_DATABASE.find(p => 
      normalize(p.name) === normalize(partName) && 
      normalize(p.brand) === normalize(partBrand)
    );

    if (foundPart) {
      const isCompatible = foundPart.compatible_cars.some(c => 
        normalize(`${c.brand} ${c.model}`) === normalize(carModel) && 
        c.year === carYear
      );

      data = {
        found: true,
        isCompatible: isCompatible,
        available: foundPart.available,
        part: foundPart,
        compatible_cars: foundPart.compatible_cars
      };
    } else {
      data = { found: false };
    }
  }

  renderResult(data);
});

function renderResult(data) {
  if (!data.found) {
    result.innerHTML = `
      <div class="card">
        <div class="card-body empty">
          Nenhuma combinação exata pôde ser processada.<br>
          Certifique-se de escolher itens sugeridos válidos do Armazém.
        </div>
      </div>`;
    return;
  }

  const p = data.part;
  const cars = (data.compatible_cars || [])
    .map(c => `<span class="badge badge-slate">${escapeHtml(c.brand)} ${escapeHtml(c.model)} (${c.year})</span>`)
    .join("");

  if (data.available) {
    result.innerHTML = `
      <div class="result-card" style="margin-top: 0;">
        <div class="result-header">
          <div>
            <h3 class="result-title">${escapeHtml(p.name)}</h3>
            <p class="muted" style="margin:4px 0 0;">
              ${data.isCompatible ? "🟢 Peça 100% compatível com o veículo e ano informados!" : "❌ Atenção: Esta peça NÃO é compatível com o modelo digitado."}
            </p>
          </div>
          <span class="badge badge-ok">Disponível (${p.quantity} un.)</span>
        </div>
        <div class="result-grid">
          <div><div class="label">Marca da Peça</div><div class="value">${escapeHtml(p.brand)}</div></div>
          <div><div class="label">Categoria</div><div class="value">${p.category === "Eletronica" ? "Eletrônica" : "Metalúrgica"}</div></div>
          <div><div class="label">Validação Técnica</div><div class="value">${data.isCompatible ? "Liberado" : "Incompatível"}</div></div>
        </div>
        <div class="compat-section">
          <h4>Outros carros homologados para esta peça</h4>
          <div class="compat-list">${cars || '<span class="muted">Nenhum registro de compatibilidade.</span>'}</div>
        </div>
      </div>`;
  } else {
    result.innerHTML = `
      <div class="result-card danger" style="margin-top: 0;">
        <div class="result-header">
          <div>
            <h3 class="result-title" style="color:var(--danger);">${escapeHtml(p.name)}</h3>
            <p class="muted" style="margin:4px 0 0;">⚠️ Peça correta para a busca, porém está esgotada no armazém.</p>
          </div>
          <span class="badge badge-danger">Indisponível</span>
        </div>
        <div class="compat-section">
          <h4>Outros carros compatíveis</h4>
          <div class="compat-list">${cars}</div>
        </div>
        <div style="margin-top:18px;">
          <button class="btn btn-danger" id="btn-purchase">Emitir Pedido de Compra Automatizado</button>
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
      alert("Ordem de compra automatizada enviada para: " + p.name);
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}