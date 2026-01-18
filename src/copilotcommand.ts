import * as vscode from 'vscode';
import { showMagicPanel } from './magicpanel';

export function registerCopilotCommand(context: vscode.ExtensionContext): vscode.Disposable {
    const fixCmd = vscode.commands.registerCommand(
        'scarlet-witch-theme.fixFileWithCopilot',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No file is currently open!');
                return;
            }

            await editor.document.save();

            await showMagicPanel(context);

            const progressOptions = {
                location: vscode.ProgressLocation.Notification,
                title: 'Copilot is fixing your file with Chaos Magic!',
                cancellable: true
            };

            await vscode.window.withProgress(progressOptions, async () => {
                let fixedCount = 0;
                let maxIterations = 50;

                while (maxIterations > 0) {
                    const diagnostics = vscode.languages.getDiagnostics(
                        editor.document.uri
                    );

                    if (diagnostics.length === 0) {
                        break;
                    }

                    maxIterations--;
                    let foundFix = false;

                    for (const diagnostic of diagnostics) {
                        editor.selection = new vscode.Selection(
                            diagnostic.range.start,
                            diagnostic.range.start
                        );

                        try {
                            await vscode.commands.executeCommand('editor.action.quickFix');
                            await new Promise((r) => setTimeout(r, 800));

                            await vscode.commands.executeCommand(
                                'acceptSelectedCodeAction'
                            );

                            foundFix = true;
                            fixedCount++;
                            await new Promise((r) => setTimeout(r, 500));

                            await editor.document.save();
                            break;
                        } catch (e) {
                            console.log('Error during fixing:', e);
                        }
                    }

                    if (!foundFix) {
                        break;
                    }
                }


                if (fixedCount > 0) {
                    vscode.window.showInformationMessage(
                        `No More Errors! ${fixedCount} errors fixed.`
                    );
                } else {
                    vscode.window.showInformationMessage('There are no fixable errors!');
                }
            });
        }
    );

    return fixCmd;
}