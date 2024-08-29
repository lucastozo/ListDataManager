showOrHideLoadingOverlay(true);
checkOpenPR(3).then(isOpen => {
    if(isOpen) {
        var confirmMessage = 'ATENÇÂO: Existem alterações pendentes na lista. Os dados atuais podem estar desatualizados.\n' +
                            'Você não será capaz de enviar alterações até que essas alterações sejam fechadas.\n' +
                            'É aconselhável contatar um administrador para solicitar a revisão das alterações.\n\n' +
                            'Deseja continuar mesmo assim?';
        if(!confirm(confirmMessage)) {
            window.location.href = '/';
            return;
        }
    }
    iniciarIgnoredNames();
});

function iniciarIgnoredNames() {
    getData();
    BotoesManipuladoresLevel();
}

function getData() {
    fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/ignoredNames.txt')
    .then(response => response.json())
    .then(data => {
        // Decodificar o conteúdo base64 usando TextDecoder
        const decodedContent = decodeBase64(data.content);
        criarNameTexts(decodedContent);
    });
}

function decodeBase64(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

function criarNameTexts(ignoredNames) { 
    // ignoredNames is a txt file with a list of names separated by line breaks
    var names = ignoredNames.split("\n");
    names.shift(); // ignore first line
    names = names.filter(name => name.trim() !== ''); // remove empty lines or lines with only spaces
    
    names.forEach(name => {
        textInput(name);
    });

    showOrHideLoadingOverlay(false);
    document.getElementById('ignoredNamesGroup-div').style.display = 'block';
}

function textInput(name = null) {
    /* MODELO DE TEXTBOX PARA CADA NOME
    <div class="mb-2">
        <input type="text" class="form-control" id="ignored-name">
    </div>
    */
    const ignoredNamesDiv = document.getElementById('ignored-names-div');
    const div = document.createElement('div');
    div.className = 'mb-2';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    if (name) input.value = name;
    input.placeholder = 'Nome a ser ignorado (deixe vazio para remover)';
    div.appendChild(input);
    ignoredNamesDiv.appendChild(div);
}

function addIgnoredName() {
    textInput();
}

function BotoesManipuladoresLevel()
{
    var buttonsManip = document.getElementById('botoes-manipuladores-container');

    var sendButton = document.createElement('button');
    sendButton.innerHTML = '<i class="fa-solid fa-upload"></i> Enviar Alterações';
    sendButton.className = 'btn btn-primary';
    sendButton.style.margin = '5px';

    sendButton.onclick = function() {
        var myModal = new bootstrap.Modal(document.getElementById('send-changes-modal'));
        myModal.show();
    }

    buttonsManip.appendChild(sendButton);
}