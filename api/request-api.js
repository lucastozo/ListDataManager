// LEVEL REQUEST OR RECORD REQUEST API
// use for send level or record request to be analyzed by the staff in ListDataManager/data/level-requests or ListDataManager/data/record-requests

// parameters:
// - levelStruct or recordStruct, struct containing data
// - dataMode, mode of data (1 for level, 2 for record)
// - apiToken

const axios = require('axios');
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { struct } = req.body;
    const token = process.env.DLBR_AUTO_GITHUB_TOKEN;

    /*
    if(apiKey !== process.env.REQUEST_API_KEY) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    */

    const owner = 'lucastozo';
    const repo = 'ListDataManager';
    const path = 'data/level-requests.json';
    let level_requests_json;
    
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString();
        level_requests_json = JSON.parse(content);

        level_requests_json.push(struct);

        const updatedContent = JSON.stringify(level_requests_json, null, 2);
        return res.status(200).json({ message: "START \n" + updatedContent + "\nEND" });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}