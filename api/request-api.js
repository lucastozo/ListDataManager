// LEVEL REQUEST OR RECORD REQUEST API
// use for send level or record request to be analyzed by the staff in ListDataManager/data/level-requests or ListDataManager/data/record-requests

// parameters:
// - levelStruct or recordStruct, struct containing data
// - dataMode, string, 'level' or 'record'

// authorization: apiKey in headers

// struct for level request:
/*
{
    "id_lvl": "level name",
    "name_lvl": "level name",
    "creator_lvl": "creator name",
    "verifier_lvl": "verifier name",
    "video_lvl": "video link"
}
*/

const axios = require('axios');
module.exports = async (req, res) => {
    //res.setHeader('Access-Control-Allow-Origin', '*');
    //res.setHeader('Access-Control-Allow-Methods', 'POST');
    //res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { struct, dataMode } = req.body || {};
    //const apiKey = req.headers['authorization']
    const token = process.env.DLBR_AUTO_GITHUB_TOKEN;

    // if(apiKey !== process.env.REQUEST_API_KEY) return res.status(403).json({ message: 'Unauthorized' });
    if (!struct || (dataMode !== 'level' && dataMode !== 'record'))
        return res.status(400).json({ message: 'Bad Request: Missing struct or invalid dataMode' });

    const owner = 'lucastozo';
    const repo = 'ListDataManager';
    var path;
    switch (dataMode) {
        case 'level':
            path = 'data/level-requests.json';
            break;
        case 'record':
            path = 'data/record-requests.json';
            break;
        default:
            return res.status(400).json({ message: 'Invalid dataMode' });
    }
    let level_requests_json;
    
    try {
        const { data: fileData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        level_requests_json = JSON.parse(content);
        if(!Array.isArray(level_requests_json)) level_requests_json = [];

        level_requests_json.push(struct);

        const updatedContent = JSON.stringify(level_requests_json, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        const commitMessage = `Add level request: ${struct.name_lvl}`;
        await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            message: commitMessage,
            content: encodedContent,
            sha: fileData.sha,
            branch: 'main'
        }, {
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return res.status(200).json({ message: 'Request sent successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}