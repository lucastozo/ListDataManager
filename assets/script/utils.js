async function getListSettingsValues() {
    try {
        const response = await fetch('https://api.github.com/repos/lucastozo/DemonlistBR/contents/data/listsettings.json');
        const data = await response.json();
        const decodedContent = atob(data.content);
        const listSettings = JSON.parse(decodedContent);
        return listSettings;
    } catch (error) {
        console.error(error);
        return null;
    }
}