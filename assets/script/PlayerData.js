let mainListMaxPosition
let extendedListMaxPosition
fetch('/data/listvalues.json')
.then(response => response.json())
.then(data => {
    mainListMaxPosition = data.Data[0].mainList;
    extendedListMaxPosition = data.Data[0].extendedList;
});

IniciarPlayerData();
function IniciarPlayerData()
{
    document.getElementById('overlay').style.display = 'flex';
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/playerdata.json')
    .then(response => response.json())
    .then(data => 
    {
        var decodedContent = atob(data.content);
        var jsonContent = JSON.parse(decodedContent);
        BotoesManipuladoresRecord();
        GeneratePlayerTable(jsonContent);
        document.getElementById('overlay').style.display = 'none';
    });
}

function GeneratePlayerTable(json) {
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
            td.contentEditable = key !== 'level_name';
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

        // descer
        var downButton = criarBotaoDescer(tr);
        td.appendChild(downButton);

        // subir
        var upButton = criarBotaoSubir(tr);
        td.appendChild(upButton);

        tr.appendChild(td);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    document.body.appendChild(table);
    //adicionar na div table-container
    var tableContainer = document.getElementById('table-container');
    tableContainer.appendChild(table);

    // função para fazer um input de texto com autocomplete
    function getPlayers()
    {
        var table = document.querySelector("#player-table");
        let playerNames = new Map();
        for (var i = 1, row; row = table.rows[i]; i++) {
            var playerName = row.cells[2].innerHTML;
            playerNames.set(playerName.toLowerCase(), playerName);
        }
        playerNames = Array.from(playerNames.values());
        playerNames.sort();
        //preencher a datalist players-list
        var datalist = document.getElementById("players-list");
        for (var i = 0; i < playerNames.length; i++) {
            var option = document.createElement("option");
            option.value = playerNames[i];
            datalist.appendChild(option);
        }
    }
    getPlayers();
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
    var buttonsManip = document.getElementById('botoes-manipuladores-container');

    var addButton = document.createElement('button');
    addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar Record';
    addButton.className = 'btn btn-success';
    addButton.style.margin = '5px';
    addButton.setAttribute('data-bs-toggle', 'modal');
    addButton.setAttribute('data-bs-target', '#addRecord-modal');
    buttonsManip.appendChild(addButton);
    var addRecordButton  = document.querySelector('#addRecord');
    addRecordButton.onclick = function() {
        var level = document.querySelector('#level').value;
        var player = document.querySelector('#player-name').value;
        var progress = document.querySelector('#progress').value;
        var video = document.querySelector('#video').value;
        AdicionarRecord(level, player, progress, video);
    }

    var sendButton = document.createElement('button');
    sendButton.innerHTML = '<i class="fa-solid fa-upload"></i> Enviar Alterações';
    sendButton.className = 'btn btn-primary';
    sendButton.style.margin = '5px';
    sendButton.setAttribute('data-bs-toggle', 'modal');
    sendButton.setAttribute('data-bs-target', '#send-changes-modal');
    buttonsManip.appendChild(sendButton);
    buttonsManip.appendChild(sendButton);
}

function AdicionarRecord(level, player, progress, video)
{
    if(level === "" || player === "" || progress === "")
    {
        alert("Preencha os campos obrigatórios!");
        return;
    }
    let levelInput = level;
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/leveldata.json')
    .then(response => response.json())
    .then(data =>
    {
        var decodedContent = atob(data.content);
        //search for the level
        levelInput = JSON.parse(decodedContent).Data.find(function(element) {
            if (element.name_lvl === level)
            {
                return element;
            }
        });
        if(levelInput)
        {
            let levelPosition = levelInput.position_lvl;
            let listpctLevel = levelInput.listpct_lvl;
            // if listpctlevel is undefined, it will be 100
            if(!listpctLevel)
            {
                listpctLevel = 100;
            }
            if(levelPosition > extendedListMaxPosition) // check if level is in the list
            {
                alert("Erro: O level está fora da lista!");
                return;
            }
            if(isNaN(progress) || progress < 0 || progress > 100 || progress < listpctLevel) // check if progress is valid
            {
                alert("Progresso inválido ou menor que list% (" + listpctLevel + ")!");
                return;
            }
            insertRecord(level, player, progress, video);
        } else {
            alert("Level não encontrado!");
            return;
        }
    });

    function insertRecord(level, player, progress, video)
    {
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

        // descer
        var downButton = criarBotaoDescer(newRow);
        actionsCell.appendChild(downButton);

        // subir
        var upButton = criarBotaoSubir(newRow);
        actionsCell.appendChild(upButton);

        document.querySelector('#level-id-record').value = '';
        document.querySelector('#level').value = '';
        document.querySelector('#player-name').value = '';
        document.querySelector('#progress').value = '';
        document.querySelector('#video').value = '';

        var modal = document.getElementById('addRecord-modal');
        var modalBS = bootstrap.Modal.getInstance(modal);
        modalBS.hide();
    }
}

// javascript me obrigou a fazer as duas funções separadas pro botão deletar e clonar de rows clonadas funcionarem
function criarBotaoDeletar(tr) {
    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.margin = '5px';
    //tooltip
    deleteButton.setAttribute('data-bs-toggle', 'tooltip');
    deleteButton.setAttribute('data-bs-placement', 'top');
    deleteButton.setAttribute('title', 'Deletar Record');
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
    //tooltip
    cloneButton.setAttribute('data-bs-toggle', 'tooltip');
    cloneButton.setAttribute('data-bs-placement', 'top');
    cloneButton.setAttribute('title', 'Clonar abaixo');
    cloneButton.onclick = function() {
        var clone = tr.cloneNode(true);
        clone.children[clone.children.length - 1].children[0].onclick = criarBotaoDeletar(clone).onclick;
        clone.children[clone.children.length - 1].children[1].onclick = criarBotaoClonar(clone).onclick;
        clone.children[clone.children.length - 1].children[2].onclick = criarBotaoDescer(clone).onclick;
        clone.children[clone.children.length - 1].children[3].onclick = criarBotaoSubir(clone).onclick;
        tr.parentNode.insertBefore(clone, tr.nextSibling);
    }
    return cloneButton;
}
function criarBotaoDescer(tr) {
    var downButton = document.createElement('button');
    downButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    downButton.className = 'btn btn-dark';
    downButton.style.margin = '5px';
    downButton.style.borderColor = '#6a767f';
    //tooltip
    downButton.setAttribute('data-bs-toggle', 'tooltip');
    downButton.setAttribute('data-bs-placement', 'top');
    downButton.setAttribute('title', 'Descer');
    downButton.onclick = function() {
        var next = tr.nextSibling;
        if(next)
        {
            tr.parentNode.insertBefore(next, tr);
        }
    }
    return downButton;
}
function criarBotaoSubir(tr) {
    var upButton = document.createElement('button');
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    upButton.className = 'btn btn-dark';
    upButton.style.margin = '5px';
    upButton.style.borderColor = '#6a767f';
    //tooltip
    upButton.setAttribute('data-bs-toggle', 'tooltip');
    upButton.setAttribute('data-bs-placement', 'top');
    upButton.setAttribute('title', 'Subir');
    upButton.onclick = function() {
        var previous = tr.previousSibling;
        if(previous)
        {
            tr.parentNode.insertBefore(tr, previous);
        }
    }
    return upButton;
}