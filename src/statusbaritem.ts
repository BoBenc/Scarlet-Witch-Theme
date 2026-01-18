import * as vscode from 'vscode';

export let statusBarItem: vscode.StatusBarItem | undefined;

export function createStatusBarItem(context: vscode.ExtensionContext): vscode.Disposable {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'scarlet-witch-theme.fixFileWithCopilot';
    statusBarItem.tooltip = 'Click to fix all errors with Chaos Magic!';

    statusBarItem.show();

    const editorChange = vscode.window.onDidChangeActiveTextEditor(
        updateStatusBarItem
    );
    context.subscriptions.push(editorChange);

    updateStatusBarItem();
    return {
        dispose: () => statusBarItem?.dispose()
    };
}

function updateStatusBarItem(): void {
    if (!statusBarItem) return;
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const fileName = editor.document.fileName.split('\\').pop() || 'file';
        statusBarItem.text = `🔮 No More Errors!: ${fileName}`;
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }
}