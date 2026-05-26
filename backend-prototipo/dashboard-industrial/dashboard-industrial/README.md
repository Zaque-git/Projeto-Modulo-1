# Dashboard Industrial - Frontend (HTML/CSS/JS puro)

Projeto frontend pronto para abrir no **Visual Studio Code**. Você fará o
back-end Flask + SQLite manualmente — os arquivos JS já estão preparados
com `fetch` apontando para as rotas que você precisa criar.

## Estrutura
```
dashboard-industrial/
├── index.html          # Tela de Login / Cadastro
├── dashboard.html      # Painel com métricas e atividades
├── armazem.html        # Inventário + botão "Adicionar Peça"
├── combinacao.html     # Diagnóstico por sintoma
├── css/
│   └── styles.css      # Design system completo (paleta industrial)
└── js/
    ├── login.js
    ├── dashboard.js
    ├── armazem.js
    └── combinacao.js
```

## Como abrir
1. Abra a pasta no VS Code.
2. Instale a extensão **Live Server** (opcional) e clique em "Go Live"
   sobre `index.html` — ou apenas abra `index.html` no navegador.
3. Sem back-end, o sistema funciona em **modo demo** (dados mock locais),
   inclusive permitindo adicionar peças no Armazém em memória.

## Onde plugar o back-end Flask + SQLite

Cada arquivo JS já tem um **cabeçalho** com a especificação exata da rota
que você deve implementar no Flask. Resumo:

| Tela        | Método | Rota                  | Body / Query                                         |
|-------------|--------|-----------------------|------------------------------------------------------|
| Login       | POST   | `/api/login`          | `{ email, password }`                                |
| Cadastro    | POST   | `/api/register`       | `{ name, email, password }`                          |
| Dashboard   | GET    | `/api/metrics`        | —                                                    |
| Armazém     | GET    | `/api/parts`          | `?q=&category=Todas|Metalurgica|Eletronica`          |
| Armazém     | POST   | `/api/parts`          | `{ name, category, brand, quantity }`                |
| Diagnóstico | POST   | `/api/diagnose`       | `{ symptom }`                                        |
| Diagnóstico | POST   | `/api/purchase-order` | `{ part_id }`                                        |

## Sugestão de tabelas SQLite

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE parts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'Metalurgica' | 'Eletronica'
  brand TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  symptom TEXT
);

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

CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Botão "Adicionar Peça"
Na tela **Armazém**, o botão abre um modal que coleta:
- Nome da peça
- Categoria (Metalúrgica ou Eletrônica)
- Marca
- Quantidade

Ao enviar, faz `POST /api/parts`. Se o backend não estiver disponível,
a peça é adicionada à lista em memória (modo demo).

## Servindo o frontend pelo Flask (dica)
Quando o Flask estiver pronto, basta servir esta pasta como `static_folder`
ou usar `send_from_directory` para entregar cada `.html`. Os caminhos
relativos (`css/...`, `js/...`) continuam funcionando.
