function IniciarPlayerData(fileInput)
{
    BotoesManipuladoresRecord();
    GeneratePlayerTable(fileInput);
}

function GeneratePlayerTable(fileInput) {
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var fileContent = e.target.result;
        var json = JSON.parse(fileContent);
        json.Data.sort(function(a, b) {
            return a.level_name.localeCompare(b.level_name);
        });

        var table = document.createElement('table');
        table.className = 'table table-striped table-hover align-middle';
        table.id = 'player-table';

        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        ['', 'Level', 'Player', 'Progresso', 'Vídeo', 'Ações'].forEach(function(header) {
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

            ['level_name', 'player_name', 'progress', 'video'].forEach(function(key) {
                var td = document.createElement('td');
                td.style.textAlign = 'center';
                if (key === 'video' && item[key]) {
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
                if(key === 'progress')
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
            var td = document.createElement('td');

            // deletar
            var deleteButton = criarBotaoDeletar(tr);
            td.appendChild(deleteButton);

            // clonar
            var cloneButton = criarBotaoClonar(tr);
            td.appendChild(cloneButton);

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

function DeletarLinhaPlayerTable(tr) {
    var table = tr.parentNode;
    var levelName = tr.cells[1].textContent;
    var playerName = tr.cells[2].textContent;
    var progress = tr.cells[3].textContent;
    var video = tr.cells[4].textContent;
    var confirmMessage = "O seguinte record será EXCLUÍDO: \n" +
                        "\nLevel: " + levelName + 
                        "\nPlayer: " + playerName +
                        "\nProgresso: " + progress +
                        "\nVídeo: " + video +
                        "\n\nEXCLUIR?";
    if(confirm(confirmMessage)) {
        table.deleteRow(tr.rowIndex-1); // eu não sei porque agora precisa do -1, mas alguma magia negra aconteceu e agora precisa
    }
}

function BotoesManipuladoresRecord()
{
    var addRemoveContainer = document.getElementById('botoes-manipuladores-container');

    var addButton = document.createElement('button');
    addButton.textContent = 'Adicionar Record';
    addButton.className = 'btn btn-success';
    addButton.style.margin = '5px';
    addButton.setAttribute('data-bs-toggle', 'modal');
    addButton.setAttribute('data-bs-target', '#addRecord-modal');
    addRemoveContainer.appendChild(addButton);

    var addRecordButton  = document.querySelector('#addRecord');
    addRecordButton.onclick = function() {
        var level = document.querySelector('#level').value;
        var player = document.querySelector('#player-name').value;
        var progress = document.querySelector('#progress').value;
        var video = document.querySelector('#video').value;
        console.log(level, player, progress, video);
        AdicionarRecord(level, player, progress, video);
    }

    var exportButton = document.createElement('button');
    exportButton.textContent = 'Exportar Arquivo';
    exportButton.className = 'btn btn-primary';
    exportButton.style.margin = '5px';
    exportButton.onclick = function() {
        var table = document.getElementById('player-table');
        var json = ExportarRecord(table);
        DownloadRecordJSON(json);
    }
    addRemoveContainer.appendChild(exportButton);
}

function AdicionarRecord(level, player, progress, video)
{
    if(level === "" || player === "" || progress === "")
    {
        alert("Preencha os campos obrigatórios!");
        return;
    }
    else if(isNaN(progress) || progress < 0 || progress > 100)
    {
        alert("Progresso inválido!");
        return;
    }
    var table = document.querySelector('#player-table');

    var newRow = table.insertRow(1);
    newRow.insertCell();
    newRow.spellcheck = false;
    var levelCell = newRow.insertCell();
    levelCell.textContent = level;
    levelCell.contentEditable = true;
    var playerCell = newRow.insertCell();
    playerCell.textContent = player;
    playerCell.contentEditable = true;
    var progressCell = newRow.insertCell();
    progressCell.textContent = progress;
    progressCell.contentEditable = true;
    var videoCell = newRow.insertCell();
    if(video)
    {
        var a = document.createElement('a');
        a.href = video;
        a.textContent = video;
        a.target = '_blank';
        videoCell.appendChild(a);
    }
    else
    {
        videoCell.textContent = video;
    }
    videoCell.contentEditable = true;
    var actionsCell = newRow.insertCell();
    actionsCell.style.textAlign = 'center';

    // deletar
    var deleteButton = criarBotaoDeletar(newRow);
    actionsCell.appendChild(deleteButton);

    // clonar
    var cloneButton = criarBotaoClonar(newRow);
    actionsCell.appendChild(cloneButton);

    document.querySelector('#level').value = '';
    document.querySelector('#player-name').value = '';
    document.querySelector('#progress').value = '';
    document.querySelector('#video').value = '';

    var modal = document.getElementById('addRecord-modal');
    var modalBS = bootstrap.Modal.getInstance(modal);
    modalBS.hide();
}

// javascript me obrigou a fazer as duas funções separadas pro botão deletar e clonar de rows clonadas funcionarem
function criarBotaoDeletar(tr) {
    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.margin = '5px';
    deleteButton.onclick = function() {
        DeletarLinhaPlayerTable(tr);
    }
    return deleteButton;
}
function criarBotaoClonar(tr) {
    var cloneButton = document.createElement('button');
    cloneButton.innerHTML = '<i class="fas fa-clone"></i>';
    cloneButton.className = 'btn btn-primary';
    cloneButton.style.margin = '5px';
    cloneButton.onclick = function() {
        var clone = tr.cloneNode(true);
        clone.children[clone.children.length - 1].children[0].onclick = criarBotaoDeletar(clone).onclick;
        clone.children[clone.children.length - 1].children[1].onclick = criarBotaoClonar(clone).onclick;
        tr.parentNode.insertBefore(clone, tr.nextSibling);
    }
    return cloneButton;
}

//exportar tabela para json
function ExportarRecord(table)
{
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1; //January is 0
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var generatedAt = day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
    var json = {GeradoEm: generatedAt, TipoData: "record", Data: []};
    for(var i = 1; i < table.rows.length; i++)
    {
        var record = {};
        record.level_name = table.rows[i].cells[1].textContent;
        record.player_name = table.rows[i].cells[2].textContent;
        record.progress = parseInt(table.rows[i].cells[3].textContent);
        record.video = table.rows[i].cells[4].textContent;
        json.Data.push(record);
    }
    return json;
}

function DownloadRecordJSON(json)
{
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
    var dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "NEWplayerdata.json");
    dlAnchorElem.click();
}