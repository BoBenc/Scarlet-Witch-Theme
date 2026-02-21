import * as vscode from 'vscode';
import { showWelcomePanel } from './panels/welcomepanel';
import { showReleaseNotesPanel } from './panels/releasenotespanel';
import { showReleaseNotesFullPanel } from './panels/releasenotescollection';
import { showPictureGalleryPanel } from './panels/picturegallerypanel';
import { SidebarProvider } from './sidebarprovider';
import { createStatusBarItem } from './statusbaritem';
import { registerCopilotCommand } from './copilotcommand';
import { showDarkholdPanel } from './panels/darkholdpanel';
import { enableCursorMagic, disableCursorMagic } from './utils/cursormagic';
import { enableTypingMagic, disableTypingMagic } from './utils/typingmagic';

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

    function updateMagicFeatures() {
        const config = vscode.workspace.getConfiguration('scarlet-witch-theme');
        
        if (config.get('cursorMagic')) {
            enableCursorMagic(context);
        } else {
            disableCursorMagic();
        }

        if (config.get('typingMagic')) {
            enableTypingMagic(context);
        } else {
            disableTypingMagic();
        }
    }

    updateMagicFeatures();

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('scarlet-witch-theme')) {
                updateMagicFeatures();
            }
        })
    );
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

    let openDarkholdCommand = vscode.commands.registerCommand(
        'scarlet-witch-theme.openDarkhold',
        () => {
            showDarkholdPanel(context.extensionUri, context);
        }
    );

    context.subscriptions.push(welcomeCommand, releaseNotesCommand, pictureGalleryCommand, openDarkholdCommand);
}

export function deactivate() {
    disableCursorMagic();
    disableTypingMagic();
    vscode.window.showInformationMessage('🔮 Scarlet Witch Theme deactivated.');
}