import * as vscode from 'vscode';
import { showWelcomePanel } from './welcomepanel';
import { showReleaseNotesPanel } from './releasenotespanel';

export async function activate(context: vscode.ExtensionContext) {
	const currentVersion = context.extension.packageJSON.version;
    const lastSeenVersion = context.globalState.get<string>('scarletWitch.lastSeenVersion');

    if (!lastSeenVersion) {
        showWelcomePanel(context);
        await context.globalState.update('scarletWitch.lastSeenVersion', currentVersion);
    }
    else if (lastSeenVersion !== currentVersion) {
        showReleaseNotesPanel(context, lastSeenVersion, currentVersion);
        await context.globalState.update('scarletWitch.lastSeenVersion', currentVersion);
    }
}

export function deactivate() {
	vscode.window.showInformationMessage('🔮 Scarlet Witch Theme deactivated.');
}