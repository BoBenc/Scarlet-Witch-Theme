import * as vscode from 'vscode';

export async function openStorageFolder(uri: vscode.Uri) {
    try {
        await vscode.workspace.fs.stat(uri);
        const fileUri = vscode.Uri.file(uri.fsPath);
        await vscode.env.openExternal(fileUri);
    } catch (error) {
        vscode.window.showWarningMessage("Storage folder not found. Please save a picture or Darkhold content to create the folder.");
    }
}