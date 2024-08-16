const axios = require('axios');
module.exports = async (req, res) => 
{
    const { userKey, tokenHash, changelog, changes, dataMode } = req.body;
    // userKey: unique key for each user
    // tokenHash: hash of the DLBRauto github token
    // changelog: description of the changes
    // changes: JSON
    // dataMode: 1 = level, 2 = records

    const REQUIRE_PULL_REQUEST = false;

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
    let message;
    let branch; //
    switch (dataMode)
    {
        case 1:
            path = 'data/leveldata.json';
            message = 'List Changes';
            branch = 'list-changes-commits'; //
            break;
        case 2:
            path = 'data/playerdata.json';
            message = 'Records Changes';
            branch = 'records-changes-commits'; //
            break;
        case 3:
            path = 'data/ignoredNames.txt';
            message = 'Ignored Names Changes';
            branch = 'ignored-names-commits'; //
            break;
        default:
            res.status(400).json({ message: 'Modo de dados inválido' });
            return;
    }
    if (!REQUIRE_PULL_REQUEST) branch = 'main';
    const content = Buffer.from(changes).toString('base64');

    if (REQUIRE_PULL_REQUEST) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
                headers: {
                    'Authorization': `token ${token}`
                }
            });

            if (response.status === 200) {
                // delete branchs
                await axios.delete(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
                    headers: {
                        'Authorization': `token ${token}`
                    }
                });
            }
        } catch (e) {}
    }

    // último commit da main
    const { data: { object: { sha: mainSha } } } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
        headers: {
            'Authorization': `token ${token}`
        }
    });

    if (REQUIRE_PULL_REQUEST) { // Criar a branch
        await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
            ref: `refs/heads/${branch}`,
            sha: mainSha
        }, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
    }

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
    
    if (REQUIRE_PULL_REQUEST) {
        const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        let title;
        let head;
        switch (dataMode)
        {
            case 1:
                title = 'List Changes';
                head = 'list-changes-commits';
                break;
            case 2:
                title = 'Records Changes';
                head = 'records-changes-commits';
                break;
            case 3:
                title = 'Ignored Names Changes';
                head = 'ignored-names-commits';
                break;
            default:
                res.status(400).json({ message: 'Modo de dados inválido' });
                return;
        }
        const bodyPR = `Gerado automaticamente por DLBRauto em ${horario} (SP).\nAlterações feitas por: ${userName}\n\n${changelog}`;
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
    } else {
        res.json(updateResponse.data);
    }
}