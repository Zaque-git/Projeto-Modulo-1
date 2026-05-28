import os  # IMPORTANTE: Garanta que importou o 'os' no topo do arquivo
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# --- CORREÇÃO DEFINITIVA DO CAMINHO DO BANCO DO DADOS ---
# Cria a pasta 'instance' automaticamente se ela não existir
os.makedirs(app.instance_path, exist_ok=True)
# Configura o caminho absoluto completo para o banco de dados dentro de 'instance'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==========================================
# MODELOS (TABELAS DO BANCO DE DADOS)
# ==========================================

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Part(db.Model):
    __tablename__ = 'parts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    brand = db.Column(db.String, nullable=False)
    part_number = db.Column(db.String, nullable=False)
    category = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    
    # Relacionamento virtual com a tabela de compatibilidade
    compatibilidades = db.relationship('Compatibility', backref='part', lazy=True)

class Compatibility(db.Model):
    __tablename__ = 'compatibilities'
    id = db.Column(db.Integer, primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('parts.id'), nullable=False)
    automaker = db.Column(db.String, nullable=False)
    model = db.Column(db.String, nullable=False)
    engine = db.Column(db.String, nullable=False)
    year_range = db.Column(db.String, nullable=False)


# ==========================================
# ROTAS DA API
# ==========================================

# 1. ROTA DE CADASTRO (Criar Usuário)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"ok": False, "error": "Todos os campos são obrigatórios."}), 400

    # Verifica se o e-mail já existe
    if User.query.filter_by(email=email).first():
        return jsonify({"ok": False, "error": "Este e-mail já está cadastrado."}), 400

    # Criptografa a senha por segurança
    hashed_password = generate_password_hash(password)
    
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"ok": True}), 201


# 2. ROTA DE LOGIN (Autenticar Usuário)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    # Verifica se o usuário existe e se a senha confere com o hash criptografado
    if user and check_password_hash(user.password, password):
        return jsonify({"ok": True}), 200
        
    return jsonify({"ok": False, "error": "E-mail ou senha incorretos."}), 401


# 3. ROTA DO ARMAZÉM (Listar Peças vindas da planilha)
@app.route('/api/parts', methods=['GET'])
def get_parts():
    # Pega os filtros opcionais que a tela armazem.js pode enviar (?q=busca)
    query_search = request.args.get('q', '').strip()
    category_filter = request.args.get('category', 'Todas').strip()

    # Começa a consulta pegando todas as peças
    query = Part.query

    # Se o usuário digitou algo na busca, filtra por nome ou marca
    if query_search:
        query = query.filter((Part.name.like(f"%{query_search}%")) | (Part.brand.like(f"%{query_search}%")))

    # Se o usuário filtrou por categoria (Metalúrgica ou Eletrônica)
    if category_filter != 'Todas':
        query = query.filter_by(category=category_filter)

    parts = query.all()

    # Transforma os objetos do banco no formato JSON que o armazem.js espera receber
    output = []
    for p in parts:
        output.append({
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "quantity": p.quantity
        })

    return jsonify(output), 200


if __name__ == '__main__':
    # Garante que o banco e as tabelas existam antes de ligar o servidor
    with app.app_context():
        db.create_all()
    # Liga o servidor Flask na porta 5000
    app.run(debug=True, port=5000)