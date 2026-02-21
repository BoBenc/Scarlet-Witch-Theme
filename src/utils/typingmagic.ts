import * as vscode from 'vscode';

let typeFlashDecoration: vscode.TextEditorDecorationType | undefined;
let typingListener: vscode.Disposable | undefined;

export function enableTypingMagic(context: vscode.ExtensionContext) {
    if (typingListener) return;

    typeFlashDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 0, 0, 0.6)',
        color: '#FFFFFF',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        textDecoration: 'none; box-shadow: 0 0 20px 5px rgba(255, 20, 100, 0.9);'
    });

    typingListener = vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document !== editor.document || !typeFlashDecoration) return;

        const newCharRanges: vscode.Range[] = [];
        for (const change of event.contentChanges) {
            if (change.text.length > 0) {
                const startPos = change.range.start;
                const endPos = startPos.translate(0, change.text.length);
                newCharRanges.push(new vscode.Range(startPos, endPos));
            }
        }

        if (newCharRanges.length > 0) {
            editor.setDecorations(typeFlashDecoration, newCharRanges);
            setTimeout(() => {
                if (typeFlashDecoration) editor.setDecorations(typeFlashDecoration, []);
            }, 150);
        }
    });

    context.subscriptions.push(typingListener);
}

export function disableTypingMagic() {
    if (typingListener) {
        typingListener.dispose();
        typingListener = undefined;
    }
    if (typeFlashDecoration) {
        typeFlashDecoration.dispose();
        typeFlashDecoration = undefined;
    }
}