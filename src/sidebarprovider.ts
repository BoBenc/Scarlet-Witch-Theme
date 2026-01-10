import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'scarlet-witch-sidebar';
    private context: vscode.ExtensionContext;
    private webviewView: vscode.WebviewView | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        viewContext: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.webviewView = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.onDidReceiveMessage(
            data => {
                switch (data.type) {
                    case 'openWelcome': {
                        vscode.commands.executeCommand('scarlet-witch-theme.showWelcome');
                        break;
                    }
                    case 'openReleaseNotes': {
                        vscode.commands.executeCommand('scarlet-witch-theme.showReleaseNotes');
                        break;
                    }
                    case 'ready': {
                        break;
                    }
                    default:
                        console.warn('⚠️ Unknown message type:', data.type);
                }
            },
            undefined,
            this.context.subscriptions
        );
        webviewView.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Scarlet Witch Theme</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 20px;
                        background-color: transparent;
                        color: var(--vscode-foreground);
                    }

                    .header {
                        margin-bottom: 24px;
                        border-bottom: 2px solid var(--vscode-focusBorder);
                        padding-bottom: 12px;
                    }

                    .header h1 {
                        font-size: 18px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0;
                    }

                    .section {
                        margin-bottom: 20px;
                    }

                    .section-title {
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: var(--vscode-descriptionForeground);
                        margin-bottom: 8px;
                    }

                    .btn {
                        width: 100%;
                        padding: 12px 16px;
                        border: 1px solid rgba(217, 26, 79, 0.5);
                        font-weight: 500;
                        font-size: 14px;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 12px;
                        backdrop-filter: blur(10px);
                        position: relative;
                        overflow: hidden;
                    }

                    .btn-primary {
                        background: linear-gradient(135deg, #D91A4F 0%, #E6547A 100%);
                        color: #120414;
                        box-shadow: 0 4px 15px rgba(217, 26, 79, 0.3);
                    }

                    .btn-primary:hover {
                        background: linear-gradient(135deg, #E6547A 0%, #FF6B9D 100%);
                        transform: translateY(-3px) scale(1.02);
                        box-shadow: 0 8px 25px rgba(217, 26, 79, 0.5);
                    }

                    .btn-primary:active {
                        transform: translateY(-1px);
                    }

                    .btn-secondary {
                        background: linear-gradient(135deg, rgba(211, 112, 229, 0.2) 0%, rgba(217, 26, 79, 0.1) 100%);
                        color: #D370E5;
                        border: 1px solid rgba(211, 112, 229, 0.5);
                    }

                    .btn-secondary:hover {
                        background: linear-gradient(135deg, rgba(211, 112, 229, 0.3) 0%, rgba(217, 26, 79, 0.2) 100%);
                        color: #F5E6D3;
                        box-shadow: 0 4px 15px rgba(211, 112, 229, 0.3);
                        transform: translateY(-3px);
                    }

                    .btn-secondary:active {
                        transform: translateY(-1px);
                    }

                    .btn::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                        transition: left 0.5s;
                    }

                    .btn:hover::before {
                        left: 100%;
                    }

                    .section-title {
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #D370E5;
                        margin-bottom: 10px;
                        opacity: 0.9;
                    }

                    .info-box {
                        background-color: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-focusBorder);
                        border-radius: 4px;
                        padding: 12px;
                        font-size: 12px;
                        line-height: 1.6;
                        color: var(--vscode-descriptionForeground);
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔮 Scarlet Witch Theme 🔮</h1>
                </div>

                <div class="section">
                    <div class="section-title">Informations</div>
                    <button id="welcomeBtn" class="btn btn-primary">
                        <span>🏠</span>
                        Welcome Panel
                    </button>
                    <button id="releaseNotesBtn" class="btn btn-secondary">
                        <span>📖</span>
                        Release Notes
                    </button>
                </div>

                <div class="section">
                    <div class="info-box">
                        <strong>🎉 Enjoy! 🎉</strong>
                    </div>
                </div>

                <script>
                    let vscode;
                    const releaseNotesBtn = document.getElementById('releaseNotesBtn');
                    const welcomeBtn = document.getElementById('welcomeBtn');

                    try {
                        vscode = acquireVsCodeApi();
                    } catch (error) {
                        console.error('❌ VSCode API error:', error);
                    }

                    welcomeBtn.addEventListener('click', () => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'openWelcome'
                            });
                        } else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                    releaseNotesBtn.addEventListener('click', () => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'openReleaseNotes'
                            });
                        } else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                </script>
            </body>
            </html>
        `;
    }
}