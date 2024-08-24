// LEVEL REQUEST OR RECORD REQUEST API
// use for send level or record request to be analyzed by the staff in ListDataManager/data/level-requests or ListDataManager/data/record-requests

// method: PUT or POST
/*
    if called with PUT, the api will add an struct to the level-requests or record-requests file
    if called with POST, the api will simply commit an given array of objects to the file
    ps: this array of objects will be handled correctly by the function that calls this api
    ps2: reason for POST is to remove requests that are already analyzed
*/

// parameters:
// - userKey, string
// - tokenHash, string
// - levelobject or recordobject, object containing data; OR an array of objects containing the data to be commited
// - dataMode, string, 'level' or 'record'

// object for level request:
/*
{
    "id_lvl": "level id",
    "name_lvl": "level name",
    "creator_lvl": "creator name",
    "verifier_lvl": "verifier name",
    "video_lvl": "video link"
}
*/

// object for record request:
/*
{
    "id_lvl": "level id",
    "name_lvl": "level name",
    "player_name": "player name",
    "progress": 100,
    "video": "video link"
}
*/

// object for array of objects:
/*
[
    {
        "id_lvl": "level id",
        "name_lvl": "level name",
        "creator_lvl": "creator name",
        "verifier_lvl": "verifier name",
        "video_lvl": "video link"
    },
    {
        "id_lvl": "level id",
        "name_lvl": "level name",
        "creator_lvl": "creator name",
        "verifier_lvl": "verifier name",
        "video_lvl": "video link"
    }
]
*/

const axios = require('axios');
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const CALLING_METHOD = req.method;
    const { object, dataMode } = req.body;
    const TOKEN = process.env.DLBR_AUTO_GITHUB_TOKEN;
    
    if (CALLING_METHOD === 'POST') {
        const { userKey, tokenHash } = req.body;
        let userName;
        for (let i = 0; i < adminDataSplit.length; i++) {
            if (adminDataSplit[i] === userKey) {
                userName = adminDataSplit[i].split('@')[0];
                break;
            }
        }
        if (!userName || tokenHash !== hash) {
            return res.status(403).json({ message: 'Acesso negado. Chave de usuário ou token inválidos' });
        }
    }
    
    if (!object || (dataMode !== 'level' && dataMode !== 'record'))
        return res.status(400).json({ message: 'Bad Request: Missing object or invalid dataMode' });
    
    const isArrayOfObjects = (arr) => {
        if (!Array.isArray(arr)) return false;
        for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] !== 'object') return false;
        }
        return true;
    };
    const isGivenObjectAnArray = isArrayOfObjects(object);
    if (CALLING_METHOD === 'PUT' && isGivenObjectAnArray) return res.status(400).json({ message: 'Bad Request: Should not send array of objects for PUT method' });
    if (CALLING_METHOD === 'POST' && !isGivenObjectAnArray) return res.status(400).json({ message: 'Bad Request: Should send array of objects for POST method' });

    const owner = 'lucastozo';
    const repo = 'ListDataManager';
    let path;
    let commitMessage;
    switch (dataMode) {
        case 'level':
            path = 'data/level-requests.json';
            if (CALLING_METHOD === 'PUT') commitMessage = `Add level request: ${object.name_lvl} with ID: ${object.id_lvl}`;
            else commitMessage = `Level request remove`;
            break;
        case 'record':
            path = 'data/record-requests.json';
            if (CALLING_METHOD === 'PUT') commitMessage = `Add record request: ${object.player_name} on ${object.name_lvl}`;
            else commitMessage = `Record request remove`;
            break;
        default:
            return res.status(400).json({ message: 'Invalid dataMode' });
    }
    
    try {
        let json = [];
        const { data: fileData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${TOKEN}`
            }
        });
        if (CALLING_METHOD === 'PUT') {
            const content = Buffer.from(fileData.content, 'base64').toString();
            let requests_json = JSON.parse(content);
            if(!Array.isArray(requests_json)) requests_json = [];
            requests_json.push(object);
            json = requests_json;
        } else json = object;

        const updatedContent = JSON.stringify(json, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');
        
        await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            message: commitMessage,
            content: encodedContent,
            sha: fileData.sha,
            branch: 'main'
        }, {
            headers: {
                'Authorization': `token ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}