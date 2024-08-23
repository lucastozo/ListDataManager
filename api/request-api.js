// LEVEL REQUEST OR RECORD REQUEST API
// use for send level or record request to be analyzed by the staff in ListDataManager/data/level-requests or ListDataManager/data/record-requests

// method: PUT or POST
/*
    if called with PUT, the api will add an struct to the level-requests or record-requests file
    if called with POST, the api will simply commit an given JSON object to the file
    ps: this json will be handled correctly by the function that calls this api
    ps2: reason for POST is to remove requests that are already analyzed
*/

// parameters:
// - levelobject or recordobject, object containing data; OR an JSON object containing the data to be commited
// - dataMode, string, 'level' or 'record'

// authorization: API_KEY in headers

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

const axios = require('axios');
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const CALLING_METHOD = req.method;
    const { object, dataMode } = req.body;
    const API_KEY = req.headers['authorization']
    const TOKEN = process.env.DLBR_AUTO_GITHUB_TOKEN;

    if (!API_KEY || (API_KEY !== process.env.REQUEST_API_KEY)) return res.status(403).json({ message: 'Unauthorized' });
    if (!object || (dataMode !== 'level' && dataMode !== 'record'))
        return res.status(400).json({ message: 'Bad Request: Missing object or invalid dataMode' });

    const isJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    };
    if (CALLING_METHOD === 'PUT' && isJSON(object)) return res.status(400).json({ message: 'Bad Request: Should not send JSON object for PUT method' });
    if (CALLING_METHOD === 'POST' && !isJSON(object)) return res.status(400).json({ message: 'Bad Request: Should send JSON object for POST method' });

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
    let updatedContent;
    
    try {
        let fileData;
        if (CALLING_METHOD === 'PUT') { // Send request
            const { data } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                headers: {
                    'Authorization': `token ${TOKEN}`
                }
            });
            fileData = data;
            const content = Buffer.from(fileData.content, 'base64').toString();
            let requests_json = JSON.parse(content);
            if(!Array.isArray(requests_json)) requests_json = [];

            requests_json.push(object);
            updatedContent = JSON.stringify(requests_json, null, 2);
        } else { // Send given JSON object
            updatedContent = JSON.stringify(object, null, 2);
        }
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