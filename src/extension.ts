import * as vscode from 'vscode';
import { showWelcomePanel } from './welcomepanel';
import { showReleaseNotesPanel } from './releasenotespanel';
import { showReleaseNotesFullPanel } from './releasenotescollection';
import { SidebarProvider } from './sidebarprovider';
import { createStatusBarItem } from './statusbaritem';
import { registerCopilotCommand } from './copilotcommand';

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
    
    registerCommands(context);

    const sidebarProvider = new SidebarProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SidebarProvider.viewType,
            sidebarProvider
        )
    );

    context.subscriptions.push(createStatusBarItem(context), registerCopilotCommand(context));
}

function registerCommands(context: vscode.ExtensionContext) {
    let welcomeCommand = vscode.commands.registerCommand(
        'scarlet-witch-theme.showWelcome',
        () => {
            showWelcomePanel(context);
        }
    );

    let releaseNotesCommand = vscode.commands.registerCommand(
        'scarlet-witch-theme.showReleaseNotes',
        () => {
            showReleaseNotesFullPanel(context);
        }
    );

    context.subscriptions.push(welcomeCommand, releaseNotesCommand);
}

export function deactivate() {
    vscode.window.showInformationMessage('🔮 Scarlet Witch Theme deactivated.');
}