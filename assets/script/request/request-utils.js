function requestTableToObjectArray(table, dataMode) {
    // dataMode is a string that can be 'level' or 'record'
    /*
    TABLE INTO SOMETHING LIKE THIS
    [
        {
            "id_lvl": "level id",
            "name_lvl": "level name",
            "creator_lvl": "creator name",
            "verifier_lvl": "verifier name",
            "video_lvl": "video link"
        },
        {
            "id_lvl": "level id",
            "name_lvl": "level name",
            "creator_lvl": "creator name",
            "verifier_lvl": "verifier name",
            "video_lvl": "video link"
        }
    ]
    */

    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    const objectArray = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        var object;
        switch (dataMode) {
            case 'level':
                object = {
                    "id_lvl": cells[0].innerText,
                    "name_lvl": cells[1].innerText,
                    "creator_lvl": cells[2].innerText,
                    "verifier_lvl": cells[3].innerText,
                    "video_lvl": cells[4].innerText
                };
                break;
            case 'record':
                object = {
                    "id_lvl": cells[0].innerText,
                    "name_lvl": cells[1].innerText,
                    "player_name": cells[2].innerText,
                    "progress": cells[3].innerText,
                    "video": cells[4].innerText
                };
                break;
        }
        objectArray.push(object);
    });
    return objectArray;
}

function fetchAPI(userKey, tokenHash, objectArray, dataMode) {
    // dataMode is a string that can be 'level' or 'record'
    // objectArray is an array of objects containing the data to be commited
    // authorization: API_KEY in headers

    fetch('/api/request-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userKey: userKey,
            tokenHash: tokenHash,
            object: objectArray,
            dataMode: dataMode
        })
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
        errorMsgHandler("Alterações enviadas com sucesso!", 3);
        disableSendButton(false);
    })
    .catch(error => {
        errorMsgHandler(error.message, 2);
        disableSendButton(false);
    });
}

async function sendRequestChanges(dataMode) {
    disableSendButton(true);
    const userKey = document.getElementById('pr-user-key').value;
    const tokenHash = document.getElementById('pr-token').value;
    const changelog = document.getElementById('pr-changelog').value;
    if (!checkInputs(userKey, tokenHash, changelog)) return;

    let table = document.getElementById('level-request-table');
    if (dataMode === 'record') table = document.getElementById('record-request-table');
    const objectArray = requestTableToObjectArray(table, dataMode);

    await fetchAPI(userKey, tokenHash, objectArray, dataMode);
}

function disableSendButton(disabled) {
    const sendButton = document.querySelector('#send-changes-button');
    sendButton.disabled = disabled;
    if (disabled) sendButton.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> Enviando...";
    else sendButton.innerHTML = "Enviar";
}