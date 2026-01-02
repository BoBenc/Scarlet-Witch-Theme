import * as vscode from 'vscode';
import { getWebviewContent } from './welcomepanel';

export async function activate(context: vscode.ExtensionContext) {
	const isFirstTime = context.globalState.get<boolean>('scarletWitch.firstTime', false);

	if (!isFirstTime) {
		showWelcomePanel(context);
		await context.globalState.update('scarletWitch.firstTime', true);
	}
	else {}

	function showWelcomePanel(context: vscode.ExtensionContext) {
		const panel = vscode.window.createWebviewPanel(
			'scarletWitchWelcomePanel',
			'Scarlet Witch Theme',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		const logoUri = vscode.Uri.joinPath(
			context.extensionUri,
			'media',
			'logo.png'
		);
		panel.iconPath = logoUri;

		panel.webview.html = getWebviewContent();
		panel.webview.onDidReceiveMessage(
			message => {
				if (message.command === 'close') {
					panel.dispose();
				}
			}
		);
	}
}

export function deactivate() {}