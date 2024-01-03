function IniciarLevelData(fileInput)
{
    BotoesManipuladoresLevel();
    GenerateLevelTable(fileInput);
}

function GenerateLevelTable(fileInput) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContent = e.target.result;
        var json = JSON.parse(fileContent);
        json.Data.sort(function(a, b) {
            return a.position_lvl - b.position_lvl;
        });

        var table = document.createElement('table');
        table.className = 'table table-striped table-hover align-middle';
        table.id = 'level-table';

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
                    var posicaoPosterior = linhaPosterior.cells[0].textContent;
                    linhaPosterior.cells[0].textContent = tr.cells[0].textContent;
                    tr.cells[0].textContent = posicaoPosterior;
                    table.tBodies[0].insertBefore(tr, linhaPosterior.nextSibling);
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
                    var posicaoAnterior = linhaAnterior.cells[0].textContent;
                    linhaAnterior.cells[0].textContent = tr.cells[0].textContent;
                    tr.cells[0].textContent = posicaoAnterior;
                    table.tBodies[0].insertBefore(tr, linhaAnterior);
                }
            }
            td.appendChild(upButton);

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        document.body.appendChild(table);
        //adicionar na div table-container
        var tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
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
        //para cada linha onde posição é maior que a posição do level excluído, diminuir 1
        for(var i = rowIndex; i < table.rows.length; i++)
        {
            table.rows[i].cells[0].textContent = i;
        }
    }
}

function BotoesManipuladoresLevel()
{
    var addRemoveContainer = document.getElementById('botoes-manipuladores-container');
    
    var addButton = document.createElement('button');
    addButton.textContent = 'Adicionar Level';
    addButton.className = 'btn btn-success';
    addButton.style.margin = '5px';
    addButton.setAttribute('data-bs-toggle', 'modal');
    addButton.setAttribute('data-bs-target', '#addLevel-modal');
    addRemoveContainer.appendChild(addButton);

    var addLevelButton  = document.querySelector('#addLevel');
    addLevelButton.onclick = function() {
        var position = document.querySelector('#level-position').value;
        var name = document.querySelector('#level-name').value;
        var creator = document.querySelector('#level-creator').value;
        var verifier = document.querySelector('#level-verifier').value;
        var video = document.querySelector('#level-video').value;
        var publisher = document.querySelector('#level-publisher').value;
        var listpct = document.querySelector('#level-listpct').value;
        AdicionarLevel(position, name, creator, verifier, video, publisher, listpct);
    }

    var exportButton = document.createElement('button');
    exportButton.textContent = 'Exportar Arquivo';
    exportButton.className = 'btn btn-primary';
    exportButton.style.margin = '5px';
    exportButton.onclick = function() {
        var table = document.getElementById('level-table');
        var json = ExportarTabela(table);
        downloadJSON(json);
    }
    addRemoveContainer.appendChild(exportButton);

}

function AdicionarLevel(position, name, creator, verifier, video, publisher, listpct)
{
    if(position === '' || name === '' || creator === '' || verifier === '' || video === '')
    {
        alert('Preencha todos os campos!');
        return;
    }
    else if(position < 1 || position > document.querySelector('#level-table').rows.length)
    {
        alert('Posição inválida. Insira um valor entre 1 e ' + document.querySelector('#level-table').rows.length + '.');
        return;
    }
    var table = document.querySelector('#level-table');
    for(var i = table.rows.length - 1; i >= position; i--)
    {
        var row = table.rows[i];
        var currentPosition = parseInt(row.cells[0].textContent);
        if(currentPosition >= position)
        {
            row.cells[0].textContent = currentPosition + 1;
        }
    }
    var rowIndex = parseInt(position);

    var newRow = table.insertRow(rowIndex);
    newRow.spellcheck = false;
    var positionCell = newRow.insertCell();
    positionCell.textContent = position;
    var nameCell = newRow.insertCell();
    nameCell.textContent = name;
    nameCell.contentEditable = true;
    var creatorCell = newRow.insertCell();
    creatorCell.textContent = creator;
    creatorCell.contentEditable = true;
    var verifierCell = newRow.insertCell();
    verifierCell.textContent = verifier;
    verifierCell.contentEditable = true;
    var videoCell = newRow.insertCell();
    //colocar o texto como link
    if(video)
    {
        var a = document.createElement('a');
        a.href = video;
        a.textContent = video;
        a.target = '_blank';
        a.style.cursor = 'pointer';
        videoCell.appendChild(a);
    }
    else
    {
        videoCell.textContent = video;
    }
    videoCell.contentEditable = true;
    var publisherCell = newRow.insertCell();
    publisherCell.textContent = publisher;
    publisherCell.contentEditable = true;
    var listpctCell = newRow.insertCell();
    listpctCell.textContent = listpct;
    listpctCell.contentEditable = true;
    var actionsCell = newRow.insertCell();

    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.margin = '5px';
    deleteButton.onclick = function() {
        DeletarLinhaTabela(table, newRow.rowIndex);
    }
    actionsCell.appendChild(deleteButton);

    var downButton = document.createElement('button');
    downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    downButton.className = 'btn btn-dark';
    downButton.style.margin = '5px';
    downButton.style.borderColor = '#6a767f';
    downButton.onclick = function() {
        if(newRow.rowIndex < table.rows.length - 1)
        {
            var linhaPosterior = table.rows[newRow.rowIndex + 1];
            var posicaoPosterior = linhaPosterior.cells[0].textContent;
            linhaPosterior.cells[0].textContent = newRow.cells[0].textContent;
            newRow.cells[0].textContent = posicaoPosterior;
            table.tBodies[0].insertBefore(newRow, linhaPosterior.nextSibling);
        }
    }
    actionsCell.appendChild(downButton);

    var upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    upButton.className = 'btn btn-dark';
    upButton.style.margin = '5px';
    upButton.style.borderColor = '#6a767f';
    upButton.onclick = function() {
        if(newRow.rowIndex > 1)
        {
            var linhaAnterior = table.rows[newRow.rowIndex - 1];
            var posicaoAnterior = linhaAnterior.cells[0].textContent;
            linhaAnterior.cells[0].textContent = newRow.cells[0].textContent;
            newRow.cells[0].textContent = posicaoAnterior;
            table.tBodies[0].insertBefore(newRow, linhaAnterior);
        }
    }
    actionsCell.appendChild(upButton);

    document.querySelector('#level-position').value = '';
    document.querySelector('#level-name').value = '';
    document.querySelector('#level-creator').value = '';
    document.querySelector('#level-verifier').value = '';
    document.querySelector('#level-video').value = '';
    document.querySelector('#level-publisher').value = '';
    document.querySelector('#level-listpct').value = '';

    var modal = document.querySelector('#addLevel-modal');
    var modalBS = bootstrap.Modal.getInstance(modal);
    modalBS.hide();
}

//exportar tabela para json
function ExportarTabela(table)
{
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1; //January is 0
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var generatedAt = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
    var json = {GeradoEm: generatedAt, TipoData: "level", Data: []};
    for(var i = 1; i < table.rows.length; i++)
    {
        var level = {};
        level.position_lvl = parseInt(table.rows[i].cells[0].textContent);
        level.name_lvl = table.rows[i].cells[1].textContent;
        level.creator_lvl = table.rows[i].cells[2].textContent;
        level.verifier_lvl = table.rows[i].cells[3].textContent;
        level.video_lvl = table.rows[i].cells[4].textContent;
        level.publisher_lvl = table.rows[i].cells[5].textContent;
        level.listpct_lvl = parseInt(table.rows[i].cells[6].textContent);
        json.Data.push(level);
    }
    return json;
}

function downloadJSON(json)
{
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "leveldata.json");
    dlAnchorElem.click();
}