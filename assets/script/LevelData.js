let mainListMaxPosition;
let extendedListMaxPosition;
fetch('/data/listvalues.json')
.then(response => response.json())
.then((data) => {
    mainListMaxPosition = data.Data[0].mainList;
    extendedListMaxPosition = data.Data[0].extendedList;
});

document.getElementById('overlay').style.display = 'flex';
checkOpenPR(1).then(isOpen => {
    if(isOpen) {
        var confirmMessage = 'ATENÇÂO: Existem alterações pendentes na lista. Os dados atuais podem estar desatualizados.\n' +
                            'Você não será capaz de enviar alterações até que essas alterações sejam fechadas.\n' +
                            'É aconselhável contatar um administrador para solicitar a revisão das alterações.\n\n' +
                            'Deseja continuar mesmo assim?';
        if(!confirm(confirmMessage)) {
            window.location.href = '/';
            return;
        }
    }
    IniciarLevelData();
    document.getElementById('overlay').style.display = 'none';
});

function IniciarLevelData()
{
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/leveldata.json')
    .then(response => response.json())
    .then(data => 
    {
        var decodedContent = atob(data.content);
        var jsonContent = JSON.parse(decodedContent);
        BotoesManipuladoresLevel();
        GenerateLevelTable(jsonContent).then(() => {
            updateTable();
        });
    });
}
function updateTable() {
    var table = document.querySelector('#level-table');

    function updateColor() {
        for (var i = 0; i < table.rows.length; i++) {
            listpctHandler(i);
            hideLegacyLevels(i);
            var row = table.rows[i];
            var th = row.cells[0];

            // Pintar a célula de 'posição' de acordo com a posição
            var position = parseInt(th.textContent);
            if(position <= mainListMaxPosition) {
                //striped
                if(position % 2 != 0) {
                    th.style.backgroundColor = 'rgba(173, 41, 53, 0.5)';
                } else {
                    th.style.backgroundColor = 'rgba(173, 41, 53, 0.25)';
                }
            } else if(position <= extendedListMaxPosition) {
                //striped
                if(position % 2 != 0) {
                    th.style.backgroundColor = 'rgba(135, 73, 32, 0.5)';
                } else {
                    th.style.backgroundColor = 'rgba(135, 73, 32, 0.25)';
                }
            } else {
                th.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
            }
        }
    }

    function listpctHandler(i) {
        var row = table.rows[i];
        var listpct = row.cells[7];
        var position = parseInt(row.cells[0].textContent);

        listpct.contentEditable = false;
        if(position <= mainListMaxPosition) {
            if(listpct.textContent.trim() === '') {
                listpct.textContent = 'preencher!';
            }
            listpct.contentEditable = true;
        } else if(position <= extendedListMaxPosition) {
            listpct.textContent = '';
        }
    }

    function hideLegacyLevels(i) {
        var row = table.rows[i];
        var position = parseInt(row.cells[0].textContent);
        if(position > extendedListMaxPosition) {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    }

    // função para fazer um input de texto com autocomplete
    function getCreators()
    {
        var table = document.querySelector("#level-table");
        let creatorNames = new Map();
        for (var i = 1, row; row = table.rows[i]; i++) {
            var creatorName = row.cells[3].innerHTML;
            creatorNames.set(creatorName.toLowerCase(), creatorName);
        }
        creatorNames = Array.from(creatorNames.values());
        creatorNames.sort();
        //preencher a datalist creators-list
        var datalist = document.getElementById("creators-list");
        for (var i = 0; i < creatorNames.length; i++) {
            var option = document.createElement("option");
            option.value = creatorNames[i];
            datalist.appendChild(option);
        }
    }
    function getVerifiers()
    {
        var table = document.querySelector("#level-table");
        let verifierNames = new Map();
        for (var i = 1, row; row = table.rows[i]; i++) {
            var verifierName = row.cells[4].innerHTML;
            verifierNames.set(verifierName.toLowerCase(), verifierName);
        }
        verifierNames = Array.from(verifierNames.values());
        verifierNames.sort();
        //preencher a datalist verifiers-list
        var datalist = document.getElementById("verifiers-list");
        for (var i = 0; i < verifierNames.length; i++) {
            var option = document.createElement("option");
            option.value = verifierNames[i];
            datalist.appendChild(option);
        }
    }
    getCreators();
    getVerifiers();

    updateColor();
}

function GenerateLevelTable(json) {
    return new Promise((resolve, reject) => {
        json.Data.sort(function(a, b) {
            return a.position_lvl - b.position_lvl;
        });

        var table = document.createElement('table');
        table.className = 'table table-striped table-hover align-middle';
        table.id = 'level-table';

        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        ['Posição', 'ID', 'Nome', 'Criador', 'Verificador', 'Vídeo', 'Publicador', 'List%', 'Ações'].forEach(function(header) {
            var th = document.createElement('th');
            th.scope = 'col';
            th.style.textAlign = 'center';
            th.textContent = header;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        json.Data.forEach(function(item, index) {
            index = index + 1;
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.scope = 'row';
            th.textContent = item.position_lvl;
            th.style.textAlign = 'center';

            tr.appendChild(th);

            ['id_lvl', 'name_lvl', 'creator_lvl', 'verifier_lvl', 'video_lvl', 'publisher_lvl', 'listpct_lvl'].forEach(function(key) {
                var td = document.createElement('td');
                td.contentEditable = key !== 'name_lvl' && key !== 'id_lvl';
                td.spellcheck = false;
                td.style.textAlign = 'center';

                // VERIFICAÇOES DE VALORES
                if (key === 'video_lvl' && item[key]) {
                    var a = document.createElement('a');
                    a.href = item[key];
                    a.textContent = item[key];
                    a.target = '_blank';
                    td.appendChild(a);
                } else if (key === 'listpct_lvl') {
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
                    if (index <= mainListMaxPosition) {
                        td.textContent = item[key];
                    } else if (index <= extendedListMaxPosition) {
                        td.textContent = "";
                    }
                } else {
                    td.textContent = item[key];
                }
                tr.appendChild(td);
            });
            var td = document.createElement('td');
            td.style.textAlign = 'center';

            // deletar
            var deleteButton = createDeleteButton(table, tr);
            td.appendChild(deleteButton);

            // atualizar
            var refreshButton = createRefreshButton(tr);
            td.appendChild(refreshButton);

            // diminuir posição
            var downButton = createDownButton(table, tr);
            td.appendChild(downButton);

            // aumentar posição
            var upButton = createUpButton(table, tr);
            td.appendChild(upButton);

            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        document.body.appendChild(table);
        //adicionar na div table-container
        var tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
        resolve();
    });
}

function DeletarLinhaLevelTable(table, rowIndex) {
    var levelPosition = table.rows[rowIndex].cells[0].textContent;
    var levelName = table.rows[rowIndex].cells[2].textContent;
    var levelCreator = table.rows[rowIndex].cells[3].textContent;
    var levelVerifier = table.rows[rowIndex].cells[4].textContent;
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
        updateTable();
    }
}

function BotoesManipuladoresLevel()
{
    var buttonsManip = document.getElementById('botoes-manipuladores-container');
    
    var addButton = document.createElement('button');
    addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar Level';
    addButton.className = 'btn btn-success';
    addButton.style.margin = '5px';
    addButton.setAttribute('data-bs-toggle', 'modal');
    addButton.setAttribute('data-bs-target', '#addLevel-modal');
    buttonsManip.appendChild(addButton);
    var addLevelButton  = document.querySelector('#addLevel');
    addLevelButton.onclick = function() {
        var position = document.querySelector('#level-position').value;
        var id = document.querySelector('#level-id-level').value;
        var name = document.querySelector('#level-name').value;
        var creator = document.querySelector('#level-creator').value;
        var verifier = document.querySelector('#level-verifier').value;
        var video = document.querySelector('#level-video').value;
        var publisher = document.querySelector('#level-publisher').value;
        var listpct = document.querySelector('#level-listpct').value;
        AdicionarLevel(position, id, name, creator, verifier, video, publisher, listpct);
    }

    var sendButton = document.createElement('button');
    sendButton.innerHTML = '<i class="fa-solid fa-upload"></i> Enviar Alterações';
    sendButton.className = 'btn btn-primary';
    sendButton.style.margin = '5px';
    sendButton.setAttribute('data-bs-toggle', 'modal');
    sendButton.setAttribute('data-bs-target', '#send-changes-modal');
    buttonsManip.appendChild(sendButton);

    var refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync"></i> Atualizar Tudo';
    refreshButton.className = 'btn btn-warning';
    refreshButton.style.margin = '5px';
    refreshButton.onclick = function() {
        RefreshAll();
    }
    buttonsManip.appendChild(refreshButton);
}

async function AdicionarLevel(position, id, name, creator, verifier, video, publisher, listpct)
{
    if(!await checarInputs()) {
        return;
    }
    async function checarInputs() {
        if(position === '' || id === '' || name === '' || creator === '' || verifier === '' || video === '')
        {
            alert('Preencha todos os campos!');
            return false;
        }
        else if(position < 1 || position > extendedListMaxPosition)
        {
            alert('Posição inválida. Insira um valor entre 1 e ' + extendedListMaxPosition +'.');
            return false;
        }
        if(await checkLevelId(id)){
            //se o level já existe, não adicionar
            var table = document.querySelector('#level-table');
            var idExists = false;
            //verificar se o id já existe percorrendo a tabela
            for (var i = 0; i < table.rows.length; i++) {
                var row = table.rows[i];
                var currentId = row.cells[1].textContent;
                if (currentId == id) {
                    idExists = true;
                    break;
                }
            }
            if (idExists) {
                alert('O level com o ID ' + id + ' já existe!');
                return false;
            }
        } else {
            alert('ID inválido. Verifique se o ID está correto e se o level existe.');
            return false;
        }
        return true;
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
    
    function createCell(row, text, isEditable, isLink = false) {
        var cell = row.insertCell();
        cell.textContent = text;
        cell.contentEditable = isEditable;
    
        if (isLink && text) {
            var a = document.createElement('a');
            a.href = text;
            a.textContent = text;
            a.target = '_blank';
            a.style.cursor = 'pointer';
            cell.textContent = '';
            cell.appendChild(a);
        }
    
        return cell;
    }
    
    var rowIndex = parseInt(position);
    var newRow = table.insertRow(rowIndex);
    newRow.spellcheck = false;
    
    createCell(newRow, position, false);
    createCell(newRow, id, true);
    createCell(newRow, name, true);
    createCell(newRow, creator, true);
    createCell(newRow, verifier, true);
    createCell(newRow, video, true, true);
    createCell(newRow, publisher, true);
    createCell(newRow, listpct, true);
    var actionsCell = newRow.insertCell();

    // deletar
    var deleteButton = createDeleteButton(table, newRow);
    actionsCell.appendChild(deleteButton);

    // atualizar
    var refreshButton = createRefreshButton(newRow);
    actionsCell.appendChild(refreshButton);

    // diminuir posição
    var downButton = createDownButton(table, newRow);
    actionsCell.appendChild(downButton);

    // aumentar posição
    var upButton = createUpButton(table, newRow);
    actionsCell.appendChild(upButton);

    document.querySelector('#level-position').value = '';
    document.querySelector('#level-id-level').value = '';
    document.querySelector('#level-name').value = '';
    document.querySelector('#level-creator').value = '';
    document.querySelector('#level-verifier').value = '';
    document.querySelector('#level-video').value = '';
    document.querySelector('#level-publisher').value = '';
    document.querySelector('#level-listpct').value = '';
    updateTable();

    var modal = document.querySelector('#addLevel-modal');
    var modalBS = bootstrap.Modal.getInstance(modal);
    modalBS.hide();
}

async function RefreshAll()
{
    var confirmMessage = "Tem certeza que deseja atualizar todos os nomes e criadores?\n\n" +
                        "A atualização irá reescrever o nome de todos os levels e seus criadores para os nomes atuais no Geometry Dash.\n" +
                        "Isso pode causar alterações indesejadas, por favor, revise a tabela depois de atualizar.\n\n" +
                        "\nATUALIZAR?";
    if(!confirm(confirmMessage)) {
        return;
    }
    var table = document.querySelector('#level-table');
    document.getElementById('overlay').style.display = 'flex';

    var nameMap = {};
    for(var i = 1; i < table.rows.length; i++)
    {
        loadingSpinnerLabel = document.getElementById('loading-spinner-label');
        loadingSpinnerLabel.textContent = i + '/' + (table.rows.length - 1);

        var levelId = table.rows[i].cells[1].textContent;
        if(levelId && levelId.trim() !== '')
        {
            try{
                var data = await getLevelInfo(levelId);
                if(data)
                {
                    table.rows[i].cells[2].textContent = data.name;

                    var creatorCell = table.rows[i].cells[3];
                    var verifierCell = table.rows[i].cells[4];
                    var publisherCell = table.rows[i].cells[6];

                    var oldName = creatorCell.textContent.toLowerCase();

                    //se existir publiser, não atualizar criador
                    if(publisherCell.textContent.trim() === '') {
                        creatorCell.textContent = data.author;
                    } else {
                        publisherCell.textContent = data.author;
                    }

                    // atualizar todas as ocorrencias do nome antigo
                    if(nameMap[oldName] === undefined) {
                        nameMap[oldName] = data.author;
                        for(var j = 1; j < table.rows.length; j++) {
                            var levelIdOther = table.rows[j].cells[1].textContent;
                            if (levelIdOther === levelId) {
                                var verifierCellOther = table.rows[j].cells[4];
                                var publisherCellOther = table.rows[j].cells[6];
                        
                                if(verifierCellOther.textContent.toLowerCase() === oldName) {
                                    verifierCellOther.textContent = data.author;
                                }
                                if(publisherCellOther.textContent.toLowerCase() === oldName) {
                                    publisherCellOther.textContent = data.author;
                                }
                            }
                        }
                    }
                    // o código acima parece errar em alguns casos, TODO: corrigir
                }
            } catch (error) {
                alert(error);
            }
        }
    }
    document.getElementById('overlay').style.display = 'none';
}

function createDeleteButton(table, tr) {
    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.margin = '5px';
    deleteButton.setAttribute('data-bs-toggle', 'tooltip');
    deleteButton.setAttribute('data-bs-placement', 'top');
    deleteButton.setAttribute('title', 'Deletar level');
    deleteButton.onclick = function() {
        DeletarLinhaLevelTable(table, tr.rowIndex);
    }
    return deleteButton;
}

function createRefreshButton(tr) {
    var refreshButton = document.createElement('button');
    refreshButton.innerHTML = '<i class="fas fa-sync"></i>';
    refreshButton.className = 'btn btn-primary';
    refreshButton.style.margin = '5px';
    refreshButton.setAttribute('data-bs-toggle', 'tooltip');
    refreshButton.setAttribute('data-bs-placement', 'top');
    refreshButton.setAttribute('title', 'Atualizar nome e criador');
    refreshButton.onclick = async function() {
        var levelId = tr.cells[1].textContent;
        if(levelId && levelId.trim() !== '') {
            try {
                refreshButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span class="visually-hidden">Loading...</span>';
                refreshButton.disabled = true;
                var data = await getLevelInfo(levelId);
                if(data) {
                    tr.cells[2].textContent = data.name;
                    if(tr.cells[6].textContent.trim() === '') {
                        tr.cells[3].textContent = data.author;
                    } else {
                        tr.cells[6].textContent = data.author;
                    }
                }
            } catch (error) {
                alert(error);
            }
        }
        refreshButton.innerHTML = '<i class="fas fa-sync"></i>';
        refreshButton.disabled = false;
    }
    return refreshButton;
}

function createDownButton(table, tr) {
    var downButton = document.createElement('button');
    downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    downButton.className = 'btn btn-dark';
    downButton.style.margin = '5px';
    downButton.style.borderColor = '#6a767f';
    //tooltip
    downButton.setAttribute('data-bs-toggle', 'tooltip');
    downButton.setAttribute('data-bs-placement', 'top');
    downButton.setAttribute('title', 'Diminuir posição');
    downButton.onclick = function() {
        if(tr.rowIndex >= extendedListMaxPosition) { return; }

        var linhaPosterior = table.rows[tr.rowIndex + 1];
        var posicaoPosterior = linhaPosterior.cells[0].textContent;
        linhaPosterior.cells[0].textContent = tr.cells[0].textContent;
        tr.cells[0].textContent = posicaoPosterior;
        table.tBodies[0].insertBefore(tr, linhaPosterior.nextSibling);

        updateTable();
    }
    return downButton;
}

function createUpButton(table, tr) {
    var upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    upButton.className = 'btn btn-dark';
    upButton.style.margin = '5px';
    upButton.style.borderColor = '#6a767f';
    //tooltip
    upButton.setAttribute('data-bs-toggle', 'tooltip');
    upButton.setAttribute('data-bs-placement', 'top');
    upButton.setAttribute('title', 'Aumentar posição');
    upButton.onclick = function() {
        if (tr.rowIndex <= 1) { return; }
        
        var linhaAnterior = table.rows[tr.rowIndex - 1];
        var posicaoAnterior = linhaAnterior.cells[0].textContent;
        linhaAnterior.cells[0].textContent = tr.cells[0].textContent;
        tr.cells[0].textContent = posicaoAnterior;
        table.tBodies[0].insertBefore(tr, linhaAnterior);
        
        updateTable();
    }
    return upButton;
}