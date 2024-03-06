document.getElementById('levels-button').addEventListener('click', function() {
    // receber do github leveldata.json
    document.getElementById('overlay').style.display = 'flex';
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/leveldata.json')
    .then(response => response.json())
    .then(data => 
    {
        hideElements();
        var decodedContent = atob(data.content);
        var jsonContent = JSON.parse(decodedContent);
        IniciarLevelData(jsonContent);
        document.getElementById('overlay').style.display = 'none';
    });

});

document.getElementById('records-button').addEventListener('click', function() {
    // receber do github leveldata.json
    document.getElementById('overlay').style.display = 'flex';
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/playerdata.json')
    .then(response => response.json())
    .then(data => 
    {
        hideElements();
        var decodedContent = atob(data.content);
        var jsonContent = JSON.parse(decodedContent);
        IniciarPlayerData(jsonContent);
        document.getElementById('overlay').style.display = 'none';
    });

});

function hideElements()
{
    const dataTypeButtons = document.getElementById('data-type-buttons');
    dataTypeButtons.style.display = 'none';
    const footer = document.getElementById('footer');
    if(footer)
    {
        footer.remove();
    }
}