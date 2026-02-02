import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const GLOBAL_KEY = 'scarlet-witch-theme.noMoreErrorsImage';
const BUBBLE_KEY = 'scarlet-witch-theme.showBubble';

const DARK_THEME = {
    background: '#120414',
    foreground: '#F5E6D3',
    accent: '#D91A4F',
    secondary: '#E6547A',
    bubble: '#2A0F20',
    bubbleText: '#F5E6D3',
    cursor: '#D91A4F',
    border: '#A50035'
};

const LIGHT_THEME = {
    background: '#FAF5FB',
    foreground: '#120414',
    accent: '#D91A4F',
    secondary: '#E6547A',
    bubble: '#FAF5FB',
    bubbleText: '#120414',
    cursor: '#D91A4F',
    border: '#D91A4F'
};

interface ThemeColors {
    background: string;
    foreground: string;
    accent: string;
    secondary: string;
    bubble: string;
    bubbleText: string;
    cursor: string;
    border: string;
}

interface ImageItem {
    name: string;
    src: string;
    type: 'BoBenc' | 'User';
}

export class PictureGalleryPanel {
    public static currentPanel: PictureGalleryPanel | undefined;
    public static readonly viewType = 'scarlet-witch-theme-picture-picker';

    private readonly panel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    private shouldAnimateFile: string | undefined;
    private colors: ThemeColors;
    private countdownCts: vscode.CancellationTokenSource | undefined;

    private constructor(
        panel: vscode.WebviewPanel,
        private readonly context: vscode.ExtensionContext,
    ) {
        this.panel = panel;

        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        this.colors = isDarkTheme ? DARK_THEME : LIGHT_THEME;

        const userStoragePath = this.context.globalStorageUri.fsPath;
        if (!fs.existsSync(userStoragePath)) {
            try { fs.mkdirSync(userStoragePath, { recursive: true }); } catch (e) { }
        }

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            async message => {
                if (message.type === 'selectImage' && typeof message.file === 'string') {
                    if (this.countdownCts) {
                        this.countdownCts.cancel();
                        this.countdownCts.dispose();
                    }

                    this.countdownCts = new vscode.CancellationTokenSource();
                    const internalToken = this.countdownCts.token;

                    this.shouldAnimateFile = message.file;
                    await this.context.globalState.update(GLOBAL_KEY, message.file);
                    this.update();

                    vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: "🖼️ Picture selected!",
                        cancellable: true
                    }, async (progress, token) => {
                        token.onCancellationRequested(() => {
                            vscode.window.showInformationMessage("❌ Auto close cancelled.");
                        });

                        let secondsLeft = 5;

                        while (secondsLeft > 0) {
                            if (internalToken.isCancellationRequested || token.isCancellationRequested) {
                                return;
                            }

                            progress.report({ message: `Close in ${secondsLeft} second...` });
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            secondsLeft--;
                        }

                        if (!internalToken.isCancellationRequested && !token.isCancellationRequested) {
                            this.dispose();
                        }
                    });

                    setTimeout(() => {
                        this.shouldAnimateFile = undefined;
                    }, 450);
                }

                if (message.type === 'deleteImage') {
                    const fileName = message.file;
                    const fileUri = vscode.Uri.joinPath(this.context.globalStorageUri, fileName);

                    try {
                        await vscode.workspace.fs.delete(fileUri, { useTrash: false });

                        if (this.context.globalState.get(GLOBAL_KEY) === fileName) {
                            await this.context.globalState.update(GLOBAL_KEY, undefined);
                        }

                        vscode.window.showInformationMessage(`✅ Deleted: ${fileName}`);
                        this.update();
                    } catch (error) {
                        vscode.window.showErrorMessage(`❌ Error deleting: ${error}`);
                    }
                }

                if (message.type === 'uploadImage') {
                    const options: vscode.OpenDialogOptions = {
                        canSelectMany: false,
                        openLabel: 'Upload your image',
                        filters: { 'Image (.png)': ['png'] }
                    };

                    const fileUri = await vscode.window.showOpenDialog(options);
                    if (fileUri && fileUri[0]) {
                        try {
                            const destUri = vscode.Uri.joinPath(this.context.globalStorageUri, path.basename(fileUri[0].fsPath));
                            await vscode.workspace.fs.copy(fileUri[0], destUri, { overwrite: true });
                            vscode.window.showInformationMessage(`✅ Uploaded: ${path.basename(fileUri[0].fsPath)}`);
                            this.update();
                        } catch (error) {
                            vscode.window.showErrorMessage(`❌ Upload failed: ${error}`);
                        }
                    }
                }

                if (message.type === 'toggleBubble') {
                    await this.context.globalState.update(BUBBLE_KEY, message.value);
                    this.update();
                }
            },
            null,
            this.disposables
        );

        this.update();
    }

    public static createPanel(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : vscode.ViewColumn.One;

        if (PictureGalleryPanel.currentPanel) {
            PictureGalleryPanel.currentPanel.panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            PictureGalleryPanel.viewType,
            'Scarlet Witch Theme - Picture Gallery',
            column ?? vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'images/picture-gallery'),
                    context.globalStorageUri
                ]
            }
        );

        const logoUri = vscode.Uri.joinPath(context.extensionUri, 'images', 'logo.png');
        panel.iconPath = logoUri;

        PictureGalleryPanel.currentPanel = new PictureGalleryPanel(panel, context);
    }

    private async update() {
        const webview = this.panel.webview;
        const images: ImageItem[] = [];

        try {
            const sysRoot = vscode.Uri.joinPath(this.context.extensionUri, 'images/picture-gallery');
            const sysFiles = await vscode.workspace.fs.readDirectory(sysRoot);
            sysFiles.forEach(([file]) => {
                if (/\.(png)$/i.test(file)) {
                    images.push({
                        name: file,
                        src: webview.asWebviewUri(vscode.Uri.joinPath(sysRoot, file)).toString(),
                        type: 'BoBenc'
                    });
                }
            });
        } catch (e) {
            console.error('❌ System folder error:', e);
        }

        try {
            const userRoot = this.context.globalStorageUri;
            const userFiles = await vscode.workspace.fs.readDirectory(userRoot);
            userFiles.forEach(([file]) => {
                if (/\.(png)$/i.test(file)) {
                    const uri = webview.asWebviewUri(vscode.Uri.joinPath(userRoot, file)).toString() + `?t=${Date.now()}`;
                    images.push({ name: file, src: uri, type: 'User' });
                }
            });
        } catch (e) {
            console.error('❌ User folder error:', e);
        }

        const selected = this.context.globalState.get(GLOBAL_KEY);
        const showBubble = this.context.globalState.get(BUBBLE_KEY, true);
        const animateFile = this.shouldAnimateFile;

        const itemsHtml = images
            .map(img => `
                <div class="item ${selected === img.name ? 'selected' : ''}" data-file="${img.name}">
                    ${img.type === 'User'
                    ? `<div class="delete-btn" onclick="triggerDelete('${img.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</div>`
                    : ''}
                <div class="image-wrapper" onclick="triggerSelect('${img.name.replace(/'/g, "\\'")}')" style="cursor:pointer;">
                    <img src="${img.src}" alt="${img.name}" style="max-width:auto; max-height:auto; object-fit:contain;">
                </div>
                <button class="select-btn" onclick="triggerSelect('${img.name.replace(/'/g, "\\'")}')" style="cursor:pointer;">
                    ${selected === img.name ? '✅ Selected' : 'Select'}
                </button>
                </div>
            `)
            .join('');

        this.panel.webview.html = this.getHtml(itemsHtml, animateFile, showBubble);
    }

    private getHtml(itemsHtml: string, animateFile: string | undefined, showBubble: boolean): string {
        const nonce = Date.now().toString();

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this.panel.webview.cspSource} https:; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🖼️ Picture Gallery</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            html, body {
                width: 100%;
                height: 100%;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: ${this.colors.background};
                color: ${this.colors.foreground};
                overflow: hidden;
            }

            body {
                display: flex;
                flex-direction: column;
                padding: 20px;
                gap: 15px;
            }

            .container {
                display: flex;
                gap: 30px;
                max-width: 1200px;
            }
            
            .sidebar {
                flex: 0 0 250px;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
                
            .main {
                flex: 1;
            }

            h1 {
                font-size: 24px;
                font-weight: 600;
                color: ${this.colors.accent};
                margin-bottom: 5px;
                letter-spacing: 0.5px;
                text-align: center;
            }

            .instructions {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 16px;
                background: ${this.colors.bubble};
                border-left: 4px solid ${this.colors.accent};
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .instructions:hover {
                box-shadow: 0 2px 8px rgba(${this.colors.accent.replace('#', '')}, 0.15);
            }

            .instructions p {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: ${this.colors.foreground};
            }

            .switch {
                position: relative;
                display: inline-block;
                width: 44px;
                height: 24px;
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
                background-color: rgba(${this.colors.secondary.replace('#', '')}, 0.4);
                transition: .4s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 24px;
                border: 1px solid ${this.colors.border};
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s cubic-bezier(0.4, 0, 0.2, 1);
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .switch input:checked + .slider {
                background-color: ${this.colors.accent};
                border-color: ${this.colors.accent};
                box-shadow: 0 0 8px rgba(${this.colors.accent.replace('#', '')}, 0.3);
            }

            .switch input:checked + .slider:before {
                transform: translateX(20px);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            .slider:hover {
                opacity: 0.9;
                border-color: ${this.colors.secondary};
            }

            .switch input:checked + .slider:hover {
                box-shadow: 0 0 12px rgba(${this.colors.accent.replace('#', '')}, 0.5);
            }

            .bubble-switch {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 15px;
                background: ${this.colors.bubble};
                border: 2px solid ${this.colors.border};
                border-radius: 8px;
                margin-top: 10px;
                transition: all 0.3s ease;
            }

            .bubble-switch:hover {
                border-color: ${this.colors.secondary};
                box-shadow: 0 2px 8px rgba(${this.colors.accent.replace('#', '')}, 0.1);
            }

            .bubble-switch-title {
                font-size: 13px;
                font-weight: 600;
                color: ${this.colors.foreground};
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 16px;
                overflow-y: auto;
                padding: 10px 8px 10px 4px;
                max-height: calc(100vh - 100px);
                min-height: 150px;
            }

            .grid::-webkit-scrollbar {
                width: 8px;
            }

            .grid::-webkit-scrollbar-track {
                background: transparent;
            }

            .grid::-webkit-scrollbar-thumb {
                background: ${this.colors.bubble};
                border-radius: 4px;
            }

            .grid::-webkit-scrollbar-thumb:hover {
                background: ${this.colors.secondary};
            }

            .item {
                position: relative;
                border: 2px solid ${this.colors.border};
                border-radius: 8px;
                padding: 10px;
                text-align: center;
                background: ${this.colors.bubble};
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .item:hover {
                border-color: ${this.colors.accent};
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(217, 26, 79, 0.2);
            }

            .item.selected {
                border-color: ${this.colors.accent};
                border-width: 2px;
                box-shadow: 0 0 0 3px rgba(217, 26, 79, 0.3);
                background: ${this.colors.bubble};
            }

            .image-wrapper {
                position: relative;
                overflow: hidden;
                border-radius: 4px;
                background: ${this.colors.background};
                padding: 4px;
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .image-wrapper img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            .checkmark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                background: ${this.colors.accent};
                color: ${this.colors.bubbleText};
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                font-weight: bold;
                animation: popIn 0.4s ease-out forwards;
                pointer-events: none;
                z-index: 10;
                box-shadow: 0 4px 12px rgba(217, 26, 79, 0.4);
            }

            @keyframes popIn {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 0;
                }
                70% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }

            .delete-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                width: 24px;
                height: 24px;
                background: rgba(255, 84, 89, 0.9);
                color: white;
                border: none;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                cursor: pointer;
                z-index: 100;
                box-shadow: 0 2px 8px rgba(217, 26, 79, 0.3);
                transition: all 0.2s ease;
                padding: 0;
                line-height: 1;
            }

            .delete-btn:hover {
                background: rgba(255, 84, 89, 1);
                transform: scale(1.15);
                box-shadow: 0 3px 12px rgba(217, 26, 79, 0.5);
            }

            .delete-btn:active {
                transform: scale(0.95);
            }

            button {
                font-size: 12px;
                padding: 6px 10px;
                border: 1px solid ${this.colors.border};
                background: ${this.colors.secondary};
                color: ${this.colors.bubbleText};
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
                width: 100%;
            }

            button:hover {
                background: ${this.colors.accent};
                border-color: ${this.colors.accent};
                transform: scale(1.02);
            }

            button:active {
                transform: scale(0.98);
            }

            .select-btn {
                background: ${this.colors.secondary};
            }

            .selected-btn {
                background: ${this.colors.accent} !important;
                border-color: ${this.colors.accent} !important;
                color: ${this.colors.bubbleText} !important;
            }

            .selected-btn:hover {
                background: ${this.colors.secondary} !important;
                border-color: ${this.colors.secondary} !important;
            }

            .empty-message {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 200px;
                color: ${this.colors.foreground};
                opacity: 0.6;
                text-align: center;
            }

            code {
                background: ${this.colors.background};
                border-radius: 3px;
                padding: 2px 4px;
                font-family: 'Courier New', monospace;
                color: ${this.colors.accent};
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                gap: 15px;
            }

            .upload-btn {
                background: ${this.colors.accent};
                padding: 10px 20px;
                font-weight: bold;
                white-space: nowrap;
            }

            .upload-btn:hover {
                background: ${this.colors.secondary};
            }
        </style>
      </head>
      <body>
        <div class="container">
            <aside class="sidebar">
            <div class="instructions">
              <p><strong>📋 Instructions</strong></p>
              <p>Select an image to be used in the "No More Errors!" feature. ➡️</p>
              <p>Please choose if you want a speech bubble. ⬇️</p>
              <p>Upload your images using the ➕ button.</p>
            </div>
            <div class="bubble-switch">
                <div class="bubble-switch-title">💬 Speech Bubble</div>
                <label class="switch">
                    <input type="checkbox" id="toggleBubble" ${showBubble ? 'checked' : ''}/>
                    <span class="slider"></span>
              </label>
            </div>
            <button class="upload-btn" onclick="triggerUpload()">➕ Upload Image</button>
            </aside>
            <main class="main">
                <div class="header">
                    <h1>🖼️ Picture Gallery 🖼️</h1>
                </div>
                <div class="grid">
                    ${itemsHtml || '<div class="empty-message">📁 No images available</div>'}
                </div>
            </main>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const ANIMATE_FILE = '${animateFile || ''}';
            const toggleBubble = document.getElementById('toggleBubble');

            window.triggerDelete = (fileName) => {
                vscode.postMessage({ type: 'deleteImage', file: fileName });
            };

            window.triggerSelect = (fileName) => {
                vscode.postMessage({ type: 'selectImage', file: fileName });
            };

            window.triggerUpload = () => {
                vscode.postMessage({ type: 'uploadImage' });
            };

            window.triggerBubble = (checked) => {
                vscode.postMessage({ type: 'toggleBubble', value: checked });
            };

            if (ANIMATE_FILE) {
                setTimeout(() => {
                const itemDiv = document.querySelector('[data-file="' + ANIMATE_FILE + '"]');
                if (itemDiv) {
                    const imageWrapper = itemDiv.querySelector('.image-wrapper');
                    if (imageWrapper) {
                    const oldCheckmark = imageWrapper.querySelector('.checkmark');
                    if (oldCheckmark) {
                        oldCheckmark.remove();
                    }

                    const checkmark = document.createElement('div');
                    checkmark.className = 'checkmark';
                    checkmark.textContent = '✓';
                    imageWrapper.appendChild(checkmark);

                    checkmark.addEventListener('animationend', () => {
                        checkmark.remove();
                    });
                    }
                }
                }, 50);
            }

            toggleBubble.addEventListener('change', (event) => {
                const isChecked = event.target.checked;
                window.triggerBubble(isChecked);
            });

            if (${showBubble}) {
                toggleBubble.checked = true;
            } else {
                toggleBubble.checked = false;
            }
        </script>
      </body>
      </html>
    `;
    }

    public dispose() {
        PictureGalleryPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

export function showPictureGalleryPanel(context: vscode.ExtensionContext) {
    PictureGalleryPanel.createPanel(context);
}

export function getSelectedImageFile(context: vscode.ExtensionContext): string | undefined {
    return context.globalState.get(GLOBAL_KEY);
}

export function isBubbleEnabled(context: vscode.ExtensionContext): boolean {
    const value = context.globalState.get<boolean>(BUBBLE_KEY);
    return value === undefined ? true : value;
}