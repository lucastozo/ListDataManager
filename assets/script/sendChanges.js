function sendLevelChanges()
{
    const userKey = document.getElementById('level-pr-user-key').value;
    const tokenHash = document.getElementById('level-pr-token').value;

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

    /*
    function DownloadLevelJSON(json)
    {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "NEWleveldata.json");
        dlAnchorElem.click();
    }
    */

    const json = ExportarLevel(document.getElementById('level-table'));
    const changes = json;

    fetch('/api/send-level-changes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userKey, tokenHash, changes}),
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
        alert("Alterações enviadas com sucesso!");
    })
    .catch(error => {
        alert("Erro ao enviar alterações: " + error.message);
    });
}