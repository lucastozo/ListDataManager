// LEVEL REQUEST OR RECORD REQUEST API
// use for send level or record request to be analyzed by the staff in ListDataManager/data/level-requests or ListDataManager/data/record-requests

// parameters:
// - levelStruct or recordStruct, struct containing data
// - dataMode, mode of data (1 for level, 2 for record)
// - apiToken

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
    const { struct } = req.body || {};
    const token = process.env.DLBR_AUTO_GITHUB_TOKEN;

    if (!struct) {
        return res.status(400).json({ message: 'Bad Request: Missing struct' });
    }

    const owner = 'lucastozo';
    const repo = 'ListDataManager';
    const path = 'data/level-requests.json';

    try {
        console.log("tentando o get");
        const { data: fileData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        console.log("Resposta do get:", fileData);

        console.log("SHA do arquivo:", fileData.sha);

        const content = Buffer.from(fileData.content, 'base64').toString();
        let level_requests_json = JSON.parse(content);
        if (!Array.isArray(level_requests_json)) level_requests_json = [];

        level_requests_json.push(struct);

        const updatedContent = JSON.stringify(level_requests_json, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');
        console.log("Conteúdo codificado em base64:", encodedContent);

        const commitMessage = `Add level request: ${struct.name_lvl}`;
        const commitResponse = await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
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

        console.log("Resposta do commit:", commitResponse.data);

        return res.status(200).json({ message: "Level request sent successfully" });
    } catch (error) {
        //console.error("Erro ao processar a requisição:", error);
        return res.status(500).json({ message: error.message });
    }
};
