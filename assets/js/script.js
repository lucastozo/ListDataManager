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
        /*
        var parent = document.getElementById('form-container');
        while(parent.firstChild) 
        {
            parent.removeChild(parent.firstChild);
        }
        */
        var fileInput = document.getElementById('formFile');
        PrintLevelData(fileInput);
    }).catch(error => 
    {
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
                    console.log("level");
                    resolve(true);
                }
                else if(obj.TipoData == "record")
                {
                    console.log("record");
                    resolve(true);
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