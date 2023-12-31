function PrintLevelData(fileInput) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContent = e.target.result;
        var json = JSON.parse(fileContent);
        json.Data.sort(function(a, b) {
            return a.position_lvl - b.position_lvl;
        });

        // Criar uma tabela com todos os elementos do arquivo json
        var table = document.createElement('table');
        table.className = 'table table-striped';

        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        ['Posição', 'Nome', 'Criador', 'Verificador', 'Vídeo', 'Publicador', 'List%', 'Ações'].forEach(function(header) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        json.Data.forEach(function(item) {
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.scope = 'row';
            th.textContent = item.position_lvl;
            tr.appendChild(th);

            ['name_lvl', 'creator_lvl', 'verifier_lvl', 'video_lvl', 'publisher_lvl', 'listpct_lvl'].forEach(function(key) {
                var td = document.createElement('td');
                if (key === 'video_lvl' && item[key]) {
                    var a = document.createElement('a');
                    a.href = item[key];
                    a.textContent = item[key];
                    td.appendChild(a);
                } else {
                    td.textContent = item[key];
                }
                tr.appendChild(td);
            });

            // Adicionar botões de "Editar" e "Excluir"
            var td = document.createElement('td');
            var editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editButton.className = 'btn btn-primary';
            editButton.onclick = function() {
                //implementar função de editar
            }
            td.appendChild(editButton);

            var deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = 'btn btn-danger';
            deleteButton.onclick = function() {
                DeletarLinhaTabela(table, tr.rowIndex);
            }

            td.appendChild(deleteButton);
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        document.body.appendChild(table);
    };
    reader.readAsText(file);
}

function EditarLinhaTabela(row) {

}

function DeletarLinhaTabela(table, rowIndex) {
    var levelPosition = table.rows[rowIndex].cells[0].textContent;
    var levelName = table.rows[rowIndex].cells[1].textContent;
    var levelCreator = table.rows[rowIndex].cells[2].textContent;
    var levelVerifier = table.rows[rowIndex].cells[3].textContent;
    var confirmMessage = "O seguinte level será EXCLUÍDO: \n" +
                        "\nPosição: " + levelPosition + 
                        "\nNome: " + levelName + 
                        "\nCriador: " + levelCreator + 
                        "\nVerificador: " + levelVerifier +
                        "\n\nEXCLUIR?";
    if(confirm(confirmMessage)) {
        table.deleteRow(rowIndex);
    }
}