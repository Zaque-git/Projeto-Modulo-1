import csv
from app import app, db, Part, Compatibility

def importar_tabelas():
    print("Importando dados...")

    # ADICIONADO: 'Planilhas/' antes do nome do arquivo para o Python achar a pasta certa
    nome_arquivo = 'Planilhas/Compatibilidade de Autopeças - Catálogo MLB - Compatibilidade de Autopeças - Catálogo MLB.csv'
    # CORRIGIDO: Todo o bloco abaixo agora está devidamente indentado dentro da função
    try:
        with open(nome_arquivo, mode='r', encoding='utf-8') as file:
            # O csv.DictReader lê a primeira linha como os títulos das colunas
            leitor_csv = csv.DictReader(file)
            
            for linha in leitor_csv:
                # Pegar as informações de cada coluna da planilha
                marca = linha.get('Marca')
                part_number = linha.get('Part Number')
                montadora = linha.get('Montadora')
                modelo = linha.get('Modelo')
                motorizacao = linha.get('Motorização')
                ano = inline_ano = linha.get('Ano de Compatibilidade')

                # Regra de Negócio: Verificar se essa peça já foi cadastrada na tabela 'parts'
                peça_existente = Part.query.filter_by(part_number=part_number, brand=marca).first()

                if not peça_existente:
                    # Se a peça não existe no estoque, criamos ela com quantidade inicial zero
                    peça_existente = Part(
                        name=f"Peça {part_number}", # Nome genérico inicial
                        brand=marca,
                        part_number=part_number,
                        category="Metalurgica",     # Categoria padrão (pode ser ajustada)
                        quantity=10                 # Quantidade simulada em estoque
                    )
                    db.session.add(peça_existente)
                    db.session.flush() # Faz o banco gerar o ID da peça antes de salvar o commit definitivo

                # Agora cadastramos a compatibilidade vinculando com o ID da peça achada/criada
                nova_compatibilidade = Compatibility(
                    part_id=peça_existente.id,
                    automaker=montadora,
                    model=modelo,
                    engine=motorizacao,
                    year_range=ano
                )
                db.session.add(nova_compatibilidade)

            # Salva todas as alterações permanentemente no banco
            db.session.commit()
            print("Importação concluída com sucesso!")

    except FileNotFoundError:
        print(f"Erro: O arquivo '{nome_arquivo}' não foi encontrado na pasta.")
    except Exception as e:
        db.session.rollback()
        print(f"Ocorreu um erro durante a importação: {e}")

if __name__ == '__main__':
    # Executa a importação dentro do contexto do Flask
    with app.app_context():
        importar_tabelas()