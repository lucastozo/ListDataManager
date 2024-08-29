assignRequests();
async function assignRequests(newestFirst = false) {
    const requests = await getRecordRequests();
    if (requests.length === 0) return;
    if (newestFirst) requests.reverse();
    insertRequests(requests);
}

function insertRequests(array) {
    const table = document.getElementById('record-request-table');
    const tbody = table.querySelector('tbody');
    array.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id_lvl}</td>
            <td>${request.name_lvl}</td>
            <td>${request.player_name}</td>
            <td>${request.progress}</td>
            <td>${request.video}</td>
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
    const table = document.getElementById('record-request-table');
    table.deleteRow(rowIndex);
}