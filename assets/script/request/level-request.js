assignRequests();
async function assignRequests(newestFirst = false) {
    showOrHideLoadingOverlay(true);
    const requests = await getLevelRequests();
    if (requests.length === 0) {
        showOrHideLoadingOverlay(false);
        return;
    }
    if (newestFirst) requests.reverse();
    await insertRequests(requests);
    showOrHideLoadingOverlay(false);
}

async function insertRequests(array) {
    /*
    EXAMPLE OF A ROW
    <tr>
        <td>000000</td>
        <td>Algum</td>
        <td>Fulano</td>
        <td>Sicrano</td>
        <td>https://a.com</td>
        <td>
            <button type="button" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
        </td>
    </tr>
    */
    const table = document.getElementById('level-request-table');
    const tbody = table.querySelector('tbody');
    array.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id_lvl}</td>
            <td>${request.name_lvl}</td>
            <td>${request.creator_lvl}</td>
            <td>${request.verifier_lvl}</td>
            <td>${request.video_lvl}</td>
            <td>
                <button type="button" class="btn btn-danger"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    const removeButtons = tbody.querySelectorAll('.btn-danger');
    removeButtons.forEach((button) => {
        button.setAttribute('title', 'Remover request');
        button.addEventListener('click', () => {
            const row = button.parentElement.parentElement;
            const rowIndex = row.rowIndex;
            removeRequestRow(rowIndex);
        });
    });
}

function removeRequestRow(rowIndex) {
    const table = document.getElementById('level-request-table');
    table.deleteRow(rowIndex);
}