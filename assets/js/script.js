document.getElementById('formFile').addEventListener('change', function() {
    var submitButton = document.getElementById('submit-button');
    submitButton.disabled = !this.files.length;
    submitButton.textContent = 'Enviar';
});

document.getElementById('submit-button').addEventListener('click', function()
{
    var submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;
    var file = document.getElementById('formFile').files[0];
    VerificaArquivoValido(file).then(isValid => 
    {
        submitButton.textContent = 'Enviado ✅';
        var parent = document.getElementById('form-container');
        var fileInput = document.getElementById('formFile');
        while(parent.firstChild)
        {
            parent.removeChild(parent.firstChild);
        }
        var footer = document.getElementById('footer');
        if(footer)
        {
            footer.remove();
        }

        console.log('Tipo Data: ' + isValid[1]);
        if(isValid[1] === 'level')
        {
            IniciarLevelData(fileInput);
        }
        else if(isValid[1] === 'record')
        {
            IniciarPlayerData(fileInput);
        }
    }).catch(error => 
    {
        console.error(error);
        submitButton.textContent = 'Arquivo Inválido ❌';
    });
});

function VerificaArquivoValido(file)
{
    return new Promise((resolve, reject) => 
    {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() 
        {
            try 
            {
                var obj = JSON.parse(reader.result);
                if(obj.TipoData == "level")
                {
                    resolve([true, 'level']); //array porque o resolve só aceita um parâmetro
                }
                else if(obj.TipoData == "record")
                {
                    resolve([true, 'record']); //array porque o resolve só aceita um parâmetro
                }
                else
                {
                    throw new Error("Arquivo inválido.");
                }
            } 
            catch (error) 
            {
                reject(error);
            }
        }
        reader.onerror = function() 
        {
            reject(new Error("Erro ao ler o arquivo."));
        }
    });
}