async function getLevelInfo(levelId) {
    try {
        const response = await fetch(`https://gdbrowser.com/api/level/${levelId}`);
        const data = await response.json();
        console.log(data);
        return data
    } catch {
        throw new Error("Não foi possível coletar as informações do level (você tem certeza que o ID está correto?)")
    }
}

async function fillLevelInfo(levelOrRecord){
    var levelId;
    if(levelOrRecord == "level"){
        var levelId = document.getElementById("level-id-level").value;
    } else if(levelOrRecord == "record"){
        var levelId = document.getElementById("level-id-record").value;
    }
    try{
        var searchButton;
        if(levelOrRecord == "level"){
            searchButton = document.getElementById("search-button-level");
        } else if(levelOrRecord == "record"){
            searchButton = document.getElementById("search-button-record");
        }
        searchButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span class="visually-hidden">Loading...</span>';
        searchButton.disabled = true;
        var data = await getLevelInfo(levelId);
        searchButton.innerHTML = "Buscar";
        searchButton.disabled = false;
    } catch (error) {
        alert(error);
        searchButton.innerHTML = "Buscar";
        searchButton.disabled = false;
        return;
    }
    if(levelOrRecord == "level"){
        var levelName = document.getElementById("level-name");
        levelName.value = data.name;
        var creatorName = document.getElementById("level-creator");
        creatorName.value = data.author;
    } else if(levelOrRecord == "record"){
        var levelName = document.getElementById("level");
        levelName.value = data.name;
    }
}

async function checkLevelId(id){
    try{
        var data = await getLevelInfo(id);
        return true;
    } catch {
        return false;
    }
}