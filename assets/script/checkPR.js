function checkOpenPR(dataMode) {
    return fetch('/api/check-pr-api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({dataMode}),
    })
    .then(response => {
        if (!response.ok) {
            return false;
        }
        return response.json();
    })
    .then(data => {
        return data.openPullRequest;
    })
    .catch(error => {
        return false;
    });
}