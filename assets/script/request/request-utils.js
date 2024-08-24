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

    const API_KEY = process.env.REQUEST_API_KEY;
    const URL = "/api/request-api";

    axios({
        method: 'POST',
        url: URL,
        headers: {
            'Authorization': API_KEY
        },
        data: {
            userKey: userKey,
            tokenHash: tokenHash,
            object: objectArray,
            dataMode: dataMode
        }
    }).then(response => {
        console.log(response.data);
    }).catch(error => {
        console.error(error);
    });
}

async function sendRequestChanges(dataMode) {
    const userKey = document.getElementById('pr-user-key').value;
    const tokenHash = document.getElementById('pr-token').value;
    const changelog = document.getElementById('pr-changelog').value;
    if (!checkInputs(userKey, tokenHash, changelog)) return;
    sendButtonHandler(2);


    let table = document.getElementById('level-request-table');
    if (dataMode === 'record') table = document.getElementById('record-request-table');
    const objectArray = requestTableToObjectArray(table, dataMode);

    const response = await fetchAPI(userKey, tokenHash, objectArray, dataMode);
    if(response.status === 200) errorMsgHandler("Alterações enviadas com sucesso!", 3);
    else errorMsgHandler("Erro ao enviar as alterações!", 1);
    sendButtonHandler(1);
}