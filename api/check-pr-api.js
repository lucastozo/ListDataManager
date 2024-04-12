const axios = require('axios');
module.exports = async (req, res) => 
{
    const { dataMode } = req.body;
    const token = process.env.DLBR_AUTO_GITHUB_TOKEN;
    const owner = 'lucastozo';
    const repo = 'DemonlistBR';
    const branch = 'list-changes-commits';

    // Obter a lista de pull requests
    const { data: pullRequests } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    // Verificar se algum pull request está aberto
    let title;
    switch (dataMode)
    {
        case 1:
            title = 'List Changes';
            break;
        case 2:
            title = 'Records Changes';
            break;
        default:
            res.status(400).json({ message: 'Modo de dados inválido' });
            return;
    }
    const openPullRequest = pullRequests.find(pr => pr.state === 'open' && pr.head.ref === branch && pr.title === title);
    res.status(200).json({ openPullRequest: !!openPullRequest });
}