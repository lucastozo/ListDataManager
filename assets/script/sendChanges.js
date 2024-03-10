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
            level.id_lvl = table.rows[i].cells[1].textContent;
            level.name_lvl = table.rows[i].cells[2].textContent;
            level.creator_lvl = table.rows[i].cells[3].textContent;
            level.verifier_lvl = table.rows[i].cells[4].textContent;
            level.video_lvl = table.rows[i].cells[5].textContent;
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

    fetchAPI(userKey, tokenHash, changelog, changes, dataMode);
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
            var video = table.rows[i].cells[4].textContent;
            if(video && video.trim() !== '')
            {
                record.video = video;
            }
            json.Data.push(record);
        }
        return json;
    }

    const json = ExportarRecord(document.getElementById('player-table'));
    const changes = JSON.stringify(json, null, 2);

    fetchAPI(userKey, tokenHash, changelog, changes, dataMode);
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