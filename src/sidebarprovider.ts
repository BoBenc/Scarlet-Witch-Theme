import * as vscode from 'vscode';
import { openStorageFolder } from './utils/openstoragefolder';

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
                    case 'openPictureGallery': {
                        vscode.commands.executeCommand('scarlet-witch-theme.showPictureGallery');
                        break;
                    }
                    case 'openDarkhold': {
                        vscode.commands.executeCommand('scarlet-witch-theme.openDarkhold');
                        break;
                    }
                    case 'openStorageFolder': {
                        openStorageFolder(this.context.globalStorageUri);
                        break;
                    }
                    case 'toggleCursorMagic': {
                        vscode.workspace.getConfiguration('scarlet-witch-theme').update('cursorMagic', data.value, vscode.ConfigurationTarget.Global);
                        break;
                    }
                    case 'toggleTypingMagic': {
                        vscode.workspace.getConfiguration('scarlet-witch-theme').update('typingMagic', data.value, vscode.ConfigurationTarget.Global);
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
        const config = vscode.workspace.getConfiguration('scarlet-witch-theme');
        const isCursorMagicEnabled = config.get<boolean>('cursorMagic', true);
        const isTypingMagicEnabled = config.get<boolean>('typingMagic', true);
        webviewView.webview.html = this.getHtml(isCursorMagicEnabled, isTypingMagicEnabled);
    }

    private getHtml(isCursorMagicEnabled: boolean, isTypingMagicEnabled: boolean): string {
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
                    
                    .btn-third {
                        background: linear-gradient(135deg, #FF6B9D 0%, #C71585 50%, #8B008B 100%);
                        color: #F5E6D3;
                        border: 1px solid rgba(199, 21, 133, 0.3);
                    }

                    .btn-third:hover {
                        background: linear-gradient(135deg, #FF1493 0%, #FF69B4 50%, #DA70D6 100%);
                        color: #120414;
                        box-shadow: 0 4px 15px rgba(255, 20, 147, 0.5);
                        transform: translateY(-3px) scale(1.02);
                    }

                    .btn-third:active {
                        transform: translateY(-1px);
                    }

                    .btn-darkhold {
                        background: linear-gradient(135deg, #2b201e 0%, #1a1614 100%);
                        color: #dcd0c0;
                        border: 1px solid #5c4a42;
                    }

                    .btn-darkhold:hover {
                        background: linear-gradient(135deg, #3d2b1f 0%, #2b201e 100%);
                        color: #ff3333;
                        box-shadow: 0 4px 15px rgba(92, 74, 66, 0.5);
                        transform: translateY(-3px) scale(1.02);
                        border-color: #ff3333;
                    }

                    .btn-storage {
                        background: linear-gradient(135deg, #4a3b32 0%, #2e241f 100%);
                        color: #d4af37;
                        border: 1px solid #8c6a4f;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    }

                    .btn-storage:hover {
                        background: linear-gradient(135deg, #5c4a42 0%, #3d2b25 100%);
                        color: #ffecd1;
                        transform: translateY(-3px) scale(1.02);
                        border-color: #d4af37;
                        box-shadow: 0 6px 20px rgba(92, 74, 66, 0.4);
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

                    .toggle-container {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        padding: 8px 12px;
                        background: transparent;
                        border: 1px solid rgba(217, 26, 79, 0.2);
                        border-radius: 6px;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .toggle-container:hover {
                        border-color: rgba(217, 26, 79, 0.5);
                        background: rgba(217, 26, 79, 0.05);
                    }

                    .switch {
                        position: relative;
                        display: inline-block;
                        width: 36px;
                        height: 20px;
                    }

                    .switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }

                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: var(--vscode-scrollbarSlider-background, #6a5a70); 
                        transition: .4s;
                        border-radius: 20px;
                    }

                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 14px;
                        width: 14px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: .4s;
                        border-radius: 50%;
                    }

                    input:checked + .slider {
                        background: linear-gradient(135deg, #D91A4F 0%, #E6547A 100%);
                        box-shadow: 0 0 8px rgba(217, 26, 79, 0.6);
                    }

                    input:checked + .slider:before {
                        transform: translateX(16px);
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
                    <div class="section-title">Actions</div>
                    <button id="pictureBtn" class="btn btn-third">
                        <span>🖼️</span>
                        Picture Gallery
                    </button>
                    <button id="darkholdBtn" class="btn btn-darkhold">
                        <span>📘</span>
                        Darkhold
                    </button>
                </div>

                <div class="section">
                    <div class="section-title">Local Files</div>
                    <button id="storageBtn" class="btn btn-storage">
                        <span>📁</span>
                        Storage
                    </button>
                </div>

                <div class="section">
                    <div class="section-title">Magic Effects</div>
                    
                    <label class="toggle-container">
                        <span>Cursor Magic</span>
                        <div class="switch">
                            <input type="checkbox" id="cursorToggle" ${isCursorMagicEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>

                    <label class="toggle-container">
                        <span>Typing Magic</span>
                        <div class="switch">
                            <input type="checkbox" id="typingToggle" ${isTypingMagicEnabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
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
                    const pictureBtn = document.getElementById('pictureBtn');
                    const darkholdBtn = document.getElementById('darkholdBtn');
                    const storageBtn = document.getElementById('storageBtn');
                    const cursorToggle = document.getElementById('cursorToggle');
                    const typingToggle = document.getElementById('typingToggle');

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

                    pictureBtn.addEventListener('click', () => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'openPictureGallery'
                            });
                        } else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                    darkholdBtn.addEventListener('click', () => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'openDarkhold'
                            });
                        } else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                    storageBtn.addEventListener('click', () => {
                        if (vscode) {
                            vscode.postMessage({ 
                                type: 'openStorageFolder'
                            });
                        } else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                    cursorToggle.addEventListener('change', (e) => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'toggleCursorMagic',
                                value: e.target.checked
                            });
                        }
                        else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                    typingToggle.addEventListener('change', (e) => {
                        if (vscode) {
                            vscode.postMessage({
                                type: 'toggleTypingMagic',
                                value: e.target.checked
                            });
                        }
                        else {
                            console.error('❌ VSCode API not available');
                        }
                    });

                </script>
            </body>
            </html>
        `;
    }
}