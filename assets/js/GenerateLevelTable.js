function GenerateLevelTable(fileInput) {
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
            th.style.textAlign = 'center';
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
            th.style.textAlign = 'center';
            tr.appendChild(th);

            ['name_lvl', 'creator_lvl', 'verifier_lvl', 'video_lvl', 'publisher_lvl', 'listpct_lvl'].forEach(function(key) {
                var td = document.createElement('td');
                td.style.textAlign = 'center';
                if (key === 'video_lvl' && item[key]) {
                    var a = document.createElement('a');
                    a.href = item[key];
                    a.textContent = item[key];
                    a.target = '_blank';
                    a.style.cursor = 'pointer';
                    td.appendChild(a);
                } else {
                    td.textContent = item[key];
                }
                td.contentEditable = true;
                td.spellcheck = false;
                //ignorar valores não numéricos para listpct
                if(key === 'listpct_lvl')
                {
                    var value = td.textContent;
                    td.oninput = function() {
                        if(isNaN(this.textContent) || this.textContent < 0 || this.textContent > 100)
                        {
                            this.textContent = value;
                        }
                        else
                        {
                            value = this.textContent;
                        }
                    }
                }
                tr.appendChild(td);
            });

            // Adicionar botões de ação: deletar, descer e subir
            var td = document.createElement('td');
            td.style.textAlign = 'center';

            var deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = 'btn btn-danger';
            deleteButton.style.margin = '5px';
            deleteButton.onclick = function() {
                DeletarLinhaTabela(table, tr.rowIndex);
            }
            td.appendChild(deleteButton);

            var downButton = document.createElement('button');
            downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
            downButton.className = 'btn btn-dark';
            downButton.style.margin = '5px';
            downButton.style.borderColor = '#6a767f';
            downButton.onclick = function() {
                if(tr.rowIndex < table.rows.length - 1)
                {
                    var linhaPosterior = table.rows[tr.rowIndex + 1];
                    var linhaAtual = table.rows[tr.rowIndex];
                    var posicaoPosterior = linhaPosterior.cells[0].textContent;
                    var posicaoAtual = linhaAtual.cells[0].textContent;
                    linhaPosterior.cells[0].textContent = posicaoAtual;
                    linhaAtual.cells[0].textContent = posicaoPosterior;
                    tbody.insertBefore(linhaAtual, linhaPosterior);
                    tbody.insertBefore(linhaPosterior, linhaAtual);
                }
            }
            td.appendChild(downButton);

            var upButton = document.createElement('button');
            upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            upButton.className = 'btn btn-dark';
            upButton.style.margin = '5px';
            upButton.style.borderColor = '#6a767f';
            upButton.onclick = function() {
                if(tr.rowIndex > 1)
                {
                    var linhaAnterior = table.rows[tr.rowIndex - 1];
                    var linhaAtual = table.rows[tr.rowIndex];
                    var posicaoAnterior = linhaAnterior.cells[0].textContent;
                    var posicaoAtual = linhaAtual.cells[0].textContent;
                    linhaAnterior.cells[0].textContent = posicaoAtual;
                    linhaAtual.cells[0].textContent = posicaoAnterior;
                    tbody.insertBefore(linhaAnterior, linhaAtual);
                    tbody.insertBefore(linhaAtual, linhaAnterior);
                }
            }
            td.appendChild(upButton);

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        document.body.appendChild(table);
    };
    reader.readAsText(file);
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