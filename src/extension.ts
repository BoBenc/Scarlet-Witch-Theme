import * as vscode from 'vscode';
import { showWelcomePanel } from './panels/welcomepanel';
import { showReleaseNotesPanel } from './panels/releasenotespanel';
import { showReleaseNotesFullPanel } from './panels/releasenotescollection';
import { PictureGalleryPanel, showPictureGalleryPanel } from './panels/picturegallerypanel';
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

    let pictureGalleryCommand = vscode.commands.registerCommand(
        'scarlet-witch-theme.showPictureGallery',
        () => {
            showPictureGalleryPanel(context);
        }
    );

    context.subscriptions.push(welcomeCommand, releaseNotesCommand, pictureGalleryCommand);
}

export function deactivate() {
    vscode.window.showInformationMessage('🔮 Scarlet Witch Theme deactivated.');
}