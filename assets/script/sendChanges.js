function sendLevelChanges()
{
    errorMsgHandler('', 1);
    sendButtonHandler(2);
    const userKey = document.querySelector('#level-pr-user-key').value;
    const tokenHash = document.querySelector('#level-pr-token').value;
    const changelog = document.querySelector('#level-pr-changelog').value;
    const dataMode = 1;

    if(!checkInputs(userKey, tokenHash, changelog))
    {
        return;
    }

    //exportar tabela para json
    function ExportarLevel(table)
    {
        var lastEditor = userKey.split('@')[0];
        var horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        var json = {UltimoEditor: lastEditor, GeradoEm: horario, TipoData: "level", Data: []};
        for(var i = 1; i < table.rows.length; i++)
        {
            var level = {};
            level.position_lvl = parseInt(table.rows[i].cells[0].textContent);
            level.id_lvl = table.rows[i].cells[1].textContent;
            level.name_lvl = table.rows[i].cells[2].textContent;
            level.creator_lvl = table.rows[i].cells[3].textContent;
            level.verifier_lvl = table.rows[i].cells[4].textContent;
            level.video_lvl = parseYoutubeLink(table.rows[i].cells[5].textContent);
            var publisher = table.rows[i].cells[6].textContent;
            if(publisher && publisher.trim() !== '')
            {
                level.publisher_lvl = publisher;
            }
            var listpct = table.rows[i].cells[7].textContent;
            if(!isNaN(listpct) && listpct.trim() !== '' && listpct >= 0 && listpct <= 100 && listpct !== 'preencher!')
            {
                level.listpct_lvl = parseInt(listpct);
            }
            json.Data.push(level);
        }
        return json;
    }

    const json = ExportarLevel(document.getElementById('level-table'));
    const changes = JSON.stringify(json, null, 2);

    sendChanges(userKey, tokenHash, changelog, changes, dataMode);
}

function sendRecordsChanges()
{
    errorMsgHandler('', 1);
    sendButtonHandler(2);
    const userKey = document.querySelector('#record-pr-user-key').value;
    const tokenHash = document.querySelector('#record-pr-token').value;
    const changelog = document.querySelector('#record-pr-changelog').value;
    const dataMode = 2;

    if(!checkInputs(userKey, tokenHash, changelog))
    {
        return;
    }

    //exportar tabela para json
    function ExportarRecord(table)
    {
        var lastEditor = userKey.split('@')[0];
        var horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        var json = {UltimoEditor: lastEditor, GeradoEm: horario, TipoData: "record", Data: []};
        for(var i = 1; i < table.rows.length; i++)
        {
            var record = {};
            record.id_lvl = table.rows[i].cells[0].textContent;
            record.name_lvl = table.rows[i].cells[1].textContent;
            record.player_name = table.rows[i].cells[2].textContent;
            record.progress = parseInt(table.rows[i].cells[3].textContent);
            var video = parseYoutubeLink(table.rows[i].cells[4].textContent);
            if(video && video.trim() !== '')
            {
                record.video = video;
            }
            json.Data.push(record);
        }
        json.Data.sort((a, b) => a.name_lvl.localeCompare(b.name_lvl));
        return json;
    }

    const json = ExportarRecord(document.getElementById('player-table'));
    const changes = JSON.stringify(json, null, 2);

    sendChanges(userKey, tokenHash, changelog, changes, dataMode);
}

function sendIgnoredNamesChanges()
{
    errorMsgHandler('', 1);
    sendButtonHandler(2);
    const userKey = document.querySelector('#ignoredNames-pr-user-key').value;
    const tokenHash = document.querySelector('#ignoredNames-pr-token').value;
    const changelog = document.querySelector('#ignoredNames-pr-changelog').value;
    const dataMode = 3;

    if(!checkInputs(userKey, tokenHash, changelog)) return;

    function ExportarNomes(ignoredNamesDiv)
    {
        const firstLine = "NOMES A SEREM IGNORADOS DO RANKING (não brasileiros), separe por enter";
        var ignoredNames = firstLine + '\n';
        var inputs = ignoredNamesDiv.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.value.trim() !== '' && !/^\s+$/.test(input.value)) { // ignore empty lines or lines with only spaces
                ignoredNames += input.value + '\n';
            }
        });
        return ignoredNames;
    }
    const ignoredNamesTxt = ExportarNomes(document.getElementById('ignored-names-div'));
    sendChanges(userKey, tokenHash, changelog, ignoredNamesTxt, dataMode);
}

function sendChanges(userKey, tokenHash, changelog, changes, dataMode)
{
    checkOpenPR(dataMode).then(isOpen => {
        if(isOpen)
        {
            sendButtonHandler(1);
            errorMsgHandler("Já existe um pull request aberto. Aguarde a revisão para criar um novo request.", 2);
            return;
        }
        fetchAPI(userKey, tokenHash, changelog, changes, dataMode);
    });
}

function fetchAPI(userKey, tokenHash, changelog, changes, dataMode)
{
    fetch('/api/send-changes-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userKey, tokenHash, changelog, changes, dataMode}),
    })
    .then(response => {
        if (!response.ok) {
                return response.json().then(errorData => {
                throw new Error(errorData.message);
            });
        }
        return response.json();
    })
    .then(data => {
        sendButtonHandler(1);
        errorMsgHandler("Alterações enviadas com sucesso!", 3);
    })
    .catch(error => {
        sendButtonHandler(1);
        errorMsgHandler(error.message, 2);
    });
}

function checkInputs(userKey, tokenHash, changelog)
{
    if(!userKey || !tokenHash || !changelog)
    {
        errorMsgHandler("Preencha todos os campos!", 2);
        sendButtonHandler(1);
        return false;
    }
    return true;
}

function sendButtonHandler(mode)
{
    var sendButton = document.querySelector('#send-changes-button');

    if(mode == 1)
    {
        sendButton.disabled = false;
        sendButton.innerHTML = "Enviar";
    }
    else
    {
        sendButton.disabled = true;
        sendButton.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> Enviando...";
    }
}

function errorMsgHandler(msg, mode)
{
    var errorDiv = document.querySelector('#send-changes-error-div');
    var errorMsg = document.querySelector('#send-changes-error-msg');
    switch(mode)
    {
        case 1: // hide error
            errorDiv.style.display = 'none';
            break;
        case 2: // show error
            errorDiv.style.backgroundColor = 'rgba(173, 41, 53, 0.5)';
            errorDiv.style.display = 'block';
            errorMsg.innerHTML = "Erro: " + msg;
            break;
        case 3: // show success
            errorDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.5)';
            errorDiv.style.display = 'block';
            errorMsg.innerHTML = msg;
            break; 

    }
}

function parseYoutubeLink(url) {
    function extractYoutubeVideoID(url) {
        var regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/\?.*v=))([\w-]{11})/;
        var match = url.match(regExp);
        return (match && match[1].length == 11) ? match[1] : false;
    }
    var videoID = extractYoutubeVideoID(url);
    return videoID ? "https://youtu.be/" + videoID : false;
}