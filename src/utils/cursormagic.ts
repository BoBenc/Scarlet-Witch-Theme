import * as vscode from 'vscode';

let cursorAuraDecoration: vscode.TextEditorDecorationType | undefined;
let cursorListener: vscode.Disposable | undefined;
let cursorTimeout: NodeJS.Timeout | undefined;

export function enableCursorMagic(context: vscode.ExtensionContext) {
    if (cursorListener) return;

    cursorAuraDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(220, 20, 60, 0.2)',
        border: '1px solid rgba(255, 50, 50, 0.5)',
        borderRadius: '3px',
        textDecoration: 'none; box-shadow: 0 0 10px 1px rgba(255, 0, 0, 0.5);'
    });

    cursorListener = vscode.window.onDidChangeTextEditorSelection(event => {
        const editor = event.textEditor;
        if (!editor || !cursorAuraDecoration) return;

        const cursorRanges = event.selections.map(selection =>
            new vscode.Range(selection.active, selection.active.translate(0, 1))
        );

        editor.setDecorations(cursorAuraDecoration, cursorRanges);

        if (cursorTimeout) clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(() => {
            if (cursorAuraDecoration) editor.setDecorations(cursorAuraDecoration, []);
        }, 300);
    });

    context.subscriptions.push(cursorListener);
}

export function disableCursorMagic() {
    if (cursorListener) {
        cursorListener.dispose();
        cursorListener = undefined;
    }
    if (cursorAuraDecoration) {
        cursorAuraDecoration.dispose();
        cursorAuraDecoration = undefined;
    }
    if (cursorTimeout) clearTimeout(cursorTimeout);
}