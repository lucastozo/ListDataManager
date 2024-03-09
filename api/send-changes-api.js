const axios = require('axios');
module.exports = async (req, res) => 
{
    const { userKey, tokenHash, changelog, changes, dataMode } = req.body;
    // userKey: unique key for each user
    // tokenHash: hash of the DLBRauto github token
    // changelog: description of the changes
    // changes: JSON
    // dataMode: 1 = level, 2 = records

    const adminData = process.env.USERS_KEYS;
    const token = process.env.DLBR_AUTO_GITHUB_TOKEN;
    const hash = process.env.DLBR_AUTO_HASH_TOKEN;

    const adminDataSplit = adminData.split(',');

    let userName;
    for (let i = 0; i < adminDataSplit.length; i++) {
        if (adminDataSplit[i] === userKey) {
            userName = adminDataSplit[i].split('@')[0];
            break;
        }
    }
    if (!userName || tokenHash !== hash) {
        res.status(403).json({ message: 'Acesso negado. Chave de usuário ou token inválidos' });
        return;
    }
  
    const owner = 'lucastozo';
    const repo = 'DemonlistBR';
    let path;
    switch (dataMode)
    {
        case 1:
            path = 'data/leveldata.json';
            break;
        case 2:
            path = 'data/playerdata.json';
            break;
        default:
            res.status(400).json({ message: 'Modo de dados inválido' });
            return;
    }
    const message = 'List Changes';
    const content = Buffer.from(changes).toString('base64');
    const branch = 'list-changes-commits';

    // Obter a lista de pull requests
    const { data: pullRequests } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    // Verificar se algum pull request está aberto com o título "List Changes"
    const openPullRequest = pullRequests.find(pr => pr.state === 'open' && pr.head.ref === branch && pr.title === 'List Changes');
    if (openPullRequest) {
        res.status(400).json({ message: 'Já existe um pull request aberto. Aguarde a revisão para criar um novo request.' });
        return;
    }

    // Deletar a branch 'copy'
    await axios.delete(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/copy`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    // Obter o último commit da branch 'main'
    const { data: { object: { sha: mainSha } } } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    // Criar a branch 'copy' a partir do último commit da branch 'main'
    await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        ref: 'refs/heads/copy',
        sha: mainSha
    }, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    const fileResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });
    const sha = fileResponse.data.sha;
    const updateResponse = await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        message,
        content,
        sha,
        branch
    }, {
        headers: {
            'Authorization': `token ${token}`
        }
    });
    
    const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const title = 'List Changes';
    const bodyPR = `Gerado automaticamente por DLBRauto em ${horario} (SP).\nAlterações feitas por: ${userName}\n\n${changelog}`;
    const head = 'list-changes-commits';
    const base = 'main';
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  
    const prResponse = await axios.post(url, {
        title,
        body: bodyPR,
        head,
        base
    }, {
        headers: {
            'Authorization': `token ${token}`
        }
    });
    res.json(prResponse.data);
}