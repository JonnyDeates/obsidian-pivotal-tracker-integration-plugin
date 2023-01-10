import {Notice} from "obsidian";

export default async function generateFilePath(folderPath: string): Promise<string> {
    let currentFolderPath = "";
    if (!(await this.app.vault.adapter.exists(folderPath))) {
        let path = folderPath.split('/');
        if(path[0] === '.'){
            path = path.slice(1)
        }
        for(let folder of path){
            if(folder.trim()) {
                currentFolderPath += folder;
                if (!(await this.app.vault.exists(currentFolderPath))) {
                    await this.app.vault.createFolder(currentFolderPath)
                }
                currentFolderPath += '/'
            }
        }
        new Notice('Folders Created For Story Output')
        return currentFolderPath;
    } else {
        return folderPath;
    }
};
