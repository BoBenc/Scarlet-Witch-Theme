import * as vscode from "vscode";

export class DarkholdPanel {
    public static currentPanel: DarkholdPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly globalState: vscode.Memento;
    private disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, globalState: vscode.Memento) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.globalState = globalState;

        this.updateTitle(true);

        this.panel.onDidChangeViewState(
            e => {
                this.updateTitle(e.webviewPanel.active);
            },
            null,
            this.disposables
        );

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        this.panel.webview.html = this.getHtml(this.panel.webview);

        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case "save":
                        await this.saveContent(message.text);
                        return;

                    case "autoSave":
                        await this.globalState.update('darkhold_content', message.text);
                        return;

                    case "askDelete":
                        const answer = await vscode.window.showWarningMessage(
                            '🔥 Are you sure you want to delete (burn) all records?',
                            { modal: true },
                            'Yes',
                            'No'
                        );
                        if (answer === 'Yes') {
                            await this.globalState.update('darkhold_content', '');
                            this.panel.webview.postMessage({ command: 'clearEditor' });
                        }
                        return;

                    case "warning":
                        vscode.window.showWarningMessage(message.text);
                        return;
                }
            },
            null,
            this.disposables
        );
    }

    private updateTitle(isActive: boolean) {
        if (isActive) {
            this.panel.title = "📖 Darkhold";
        } else {
            this.panel.title = "📘 Darkhold";
        }
    }

    public static createPanel(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DarkholdPanel.currentPanel) {
            DarkholdPanel.currentPanel.panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "darkholdpanel",
            "📖 Darkhold",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "images")
                ],
            }
        );

        const logoUri = vscode.Uri.joinPath(context.extensionUri, 'images', 'logo.png');
        panel.iconPath = logoUri;

        DarkholdPanel.currentPanel = new DarkholdPanel(panel, extensionUri, context.globalState);
    }

    private async saveContent(content: string) {
        if (!content) {
            vscode.window.showErrorMessage("The Darkhold is empty, nothing to save!");
            return;
        }

        const uri = await vscode.window.showSaveDialog({
            saveLabel: "Save the Darkhold",
            filters: {
                "Text file": [".txt"],
                "All files": ["*"]
            }
        });

        if (uri) {
            try {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
                vscode.window.showInformationMessage("Darkhold content saved successfully!");
            } catch (err) {
                vscode.window.showErrorMessage("Failed to save Darkhold content: " + err);
            }
        }
    }

    public dispose() {
        DarkholdPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private getHtml(webview: vscode.Webview): string {
        const imageUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'images', 'scarlet_witch_sigil.png'));

        let savedContent = this.globalState.get<string>('darkhold_content', '');

        savedContent = savedContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>📖 Darkhold</title>
            <style>
                :root {
                    --line-height: 38px; 
                    --line-color: rgba(212, 175, 55, 0.15);
                    --text-color: #d4af37;
                }

                * { 
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    background: linear-gradient(135deg, #1a0a1f 0%, #2d0a2d 50%, #1a0a1f 100%);
                    font-family: 'Georgia', serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 20px;
                    overflow: auto;
                }

                .container {
                    width: 100%;
                    max-width: 1200px;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #d4af37;
                    text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
                }

                .header h1 {
                    font-size: 2.5em;
                    margin-bottom: 5px;
                    letter-spacing: 3px;
                    animation: glow 3s ease-in-out infinite;
                }

                @keyframes glow {
                    0%, 100% {
                        text-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
                    } 
                    50% {
                        text-shadow: 0 0 30px rgba(212, 175, 55, 0.8), 0 0 40px rgba(255, 107, 0, 0.4);
                    }
                }

                .header p {
                    color: #a0826d;
                    font-size: 0.9em;
                    font-style: italic;
                }

                .book-wrapper {
                    perspective: 1000px;
                    margin: 0 auto;
                    max-width: 900px;
                }

                .book {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 50%, #0a0805 100%);
                    border-radius: 3px;
                    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 80px rgba(212, 175, 55, 0.2), inset 0 0 40px rgba(0, 0, 0, 0.9), -20px 20px 50px rgba(0, 0, 0, 0.7);
                    overflow: hidden;
                    display: flex;
                    transform: rotateX(5deg) rotateY(-5deg);
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% {
                        transform: rotateX(5deg) rotateY(-5deg);
                    }
                    50% {
                        transform: rotateX(3deg) rotateY(-3deg);
                    }
                }

                .book::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: radial-gradient(ellipse at 10% 50%, rgba(255, 100, 0, 0.3) 0%, transparent 30%), radial-gradient(ellipse at 90% 40%, rgba(255, 80, 0, 0.25) 0%, transparent 30%), radial-gradient(ellipse at 5% 10%, rgba(255, 150, 0, 0.2) 0%, transparent 25%), radial-gradient(ellipse at 95% 90%, rgba(255, 80, 0, 0.2) 0%, transparent 25%);
                    pointer-events: none;
                    z-index: 1;
                    opacity: 0.7;
                    animation: flicker 4s ease-in-out infinite;
                }

                @keyframes flicker {
                    0%, 100% {
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                .burn-edges {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    overflow: visible;
                    pointer-events: none;
                    z-index: 2;
                }

                .burn-particle {
                    position: absolute;
                    background: radial-gradient(circle, rgba(255, 100, 0, 0.8) 0%, rgba(255, 50, 0, 0.4) 70%, transparent 100%);
                    border-radius: 50%;
                    animation: float-up 3s ease-out infinite;
                    filter: blur(2px);
                }

                @keyframes float-up {
                    0% {
                        transform: translateY(0) translateX(0);
                        opacity: 1;
                    } 
                    100% {
                        transform: translateY(-80px) translateX(var(--tx));
                        opacity: 0;
                    }
                }

                .page-left, .page-right {
                    flex: 1;
                    padding: 40px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .page-left {
                    background: linear-gradient(135deg, #3a2820 0%, #2a1810 100%);
                    border-right: 2px solid #1a0a0a;
                    box-shadow: inset 5px 0 10px rgba(0, 0, 0, 0.8);
                }

                .page-right {
                    background: linear-gradient(135deg, #2a1810 0%, #1a0a0a 100%);
                    box-shadow: inset -5px 0 10px rgba(0, 0, 0, 0.8);
                }

                .symbols {
                    position: absolute;
                    font-size: 40px;
                    opacity: 0.15;
                    top: 20px;
                    color: #d4af37;
                    font-weight: bold;
                }

                .symbols-left {
                    left: 30px;
                    font-family: serif;
                }

                .symbols-right {
                    right: 30px;
                    font-family: serif;
                }

                .editor {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    z-index: 3;
                }

                .textarea-wrapper {
                    position: relative;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                textarea {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-color);
                    font-family: 'Georgia', serif;
                    background-image: repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent calc(var(--line-height) - 1px),
                        var(--line-color) calc(var(--line-height) - 1px),
                        var(--line-color) var(--line-height)
                    );
                    background-attachment: local;
                    background-size: 100% var(--line-height);
                    line-height: var(--line-height);
                    font-size: calc(var(--line-height) * 0.65);
                    padding: 0 10px;
                    padding-top: 6px;
                    resize: none; outline: none; position: relative; z-index: 2;
                    text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
                    caret-color: #ff6b00;
                    overflow: auto;
                    scrollbar-width: thin;
                    scrollbar-color: #d4af37 transparent;
                }

                textarea::placeholder {
                    color: rgba(212, 175, 55, 0.3);
                    font-style: italic;
                }

                .controls {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                button {
                    padding: 12px 20px;
                    border: 2px solid #d4af37;
                    background: linear-gradient(135deg, #3a2820 0%, #2a1810 100%);
                    color: #d4af37;
                    font-family: 'Georgia', serif;
                    font-size: 14px;
                    cursor: pointer;
                    border-radius: 3px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    transition: all 0.3s ease;
                    text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
                    box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
                    position: relative;
                    overflow: hidden;
                }

                button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(212, 175, 55, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                button:hover::before {
                    width: 300px;
                    height: 300px;
                }

                button:hover {
                    background: linear-gradient(135deg, #4a3830 0%, #3a2820 100%);
                    box-shadow: 0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(255, 100, 0, 0.3);
                    transform: translateY(-2px);
                }

                button:active {
                    transform: translateY(0);
                }
                    
                button.danger {
                    border-color: #ff6b00;
                    color: #ff6b00;
                    text-shadow: 0 0 10px rgba(255, 107, 0, 0.4);
                    box-shadow: 0 0 20px rgba(255, 107, 0, 0.2);
                }

                button.danger:hover {
                    background: linear-gradient(135deg, #4a2810 0%, #3a1810 100%);
                    box-shadow: 0 0 30px rgba(255, 107, 0, 0.5), 0 0 60px rgba(255, 100, 0, 0.3);
                }

                .info {
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(212, 175, 55, 0.1);
                    border-left: 3px solid #d4af37;
                    color: #d4af37;
                    font-size: 13px;
                    border-radius: 3px;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 5px 0;
                }

                .word-count {
                    font-weight: bold;
                    color: #ff6b00;
                }
                
                .sigil-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .sigil-image {
                    max-width: auto;
                    max-height: auto;
                    object-fit: contain;
                    opacity: 0.85;
                    filter: drop-shadow(0 0 15px rgba(255, 50, 50, 0.6));
                    animation: pulse-sigil 4s infinite ease-in-out;
                }

                @keyframes pulse-sigil {
                    0%, 100% {
                        filter: drop-shadow(0 0 15px rgba(255, 50, 50, 0.6));
                        opacity: 0.85;
                        transform: scale(1);
                    } 
                    50% {
                        filter: drop-shadow(0 0 25px rgba(255, 80, 80, 0.8));
                        opacity: 1;
                        transform: scale(1.02);
                    }
                }

                @media (min-height: 1080px) {
                    :root { --line-height: 46px; }
                }

                @media (max-height: 700px) {
                    :root { --line-height: 32px; }
                }

            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔮 DARKHOLD 🔮</h1>
                    <p>Book of the Damned</p>
                </div>
                <div class="book-wrapper">
                    <div class="book">
                        <div class="burn-edges" id="burnEdges"></div>
                        <div class="page-left">
                            <div class="symbols symbols-left">ᛉ ᛟ ᛠ<br>ᛉ ᛝ ᛠ</div>
                            <div class="editor">
                                <div class="lines-background"></div>
                                <div class="textarea-wrapper">
                                    <textarea id="darkhold-text" placeholder="✏️ Write onto the pages of forbidden knowledge...">${savedContent}</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="page-right">
                            <div class="symbols symbols-right">ᛉ ᛟ ᛠ<br>ᛉ ᛝ ᛠ</div>
                            
                            <div class="sigil-container">
                                <img src="${imageUri}" alt="Scarlet Witch Sigil" class="sigil-image">
                            </div>

                        </div>
                    </div>
                </div>
                <div class="controls">
                    <button id="save-btn">💾 Save</button>
                    <button id="clear-btn" class="danger">🔥 Delete</button>
                </div>
                <div class="info">
                    <div class="info-item"><span>🪄 Spells:</span><span class="word-count" id="word-count">0</span></div>
                    <div class="info-item"><span>✨ Runes:</span><span id="char-count">0</span></div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const textarea = document.getElementById('darkhold-text');
                const wordCountEl = document.getElementById('word-count');
                const charCountEl = document.getElementById('char-count');
                const saveBtn = document.getElementById('save-btn');
                const clearBtn = document.getElementById('clear-btn');

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.command) {
                        case 'clearEditor':
                            textarea.value = '';
                            updateCounts();
                            break;
                    }
                });

                function generateBurnParticles() {
                    const container = document.getElementById('burnEdges');
                    container.innerHTML = '';
                    const createPart = (cls, props) => {
                        const p = document.createElement('div');
                        p.className = cls;
                        Object.assign(p.style, props);
                        p.style.setProperty('--tx', (Math.random() * 40 - 20) + 'px');
                        p.style.animationDelay = (Math.random() * 1) + 's';
                        container.appendChild(p);
                    };
                    for(let i=0; i<8; i++) createPart('burn-particle', {width: (Math.random()*20+10)+'px', height:(Math.random()*20+10)+'px', top:(Math.random()*30-10)+'px', left:(Math.random()*100)+'%'});
                    for(let i=0; i<8; i++) createPart('burn-particle', {width: (Math.random()*20+10)+'px', height:(Math.random()*20+10)+'px', bottom:(Math.random()*30-10)+'px', left:(Math.random()*100)+'%'});
                }
                generateBurnParticles();

                function updateCounts() {
                    const text = textarea.value;
                    const words = text.trim().split(/\\s+/).filter(w => w.length > 0).length;
                    const chars = text.length;
                    wordCountEl.textContent = words;
                    charCountEl.textContent = chars;
                    
                    vscode.postMessage({ command: 'autoSave', text: text });
                }

                saveBtn.addEventListener('click', () => {
                    const text = textarea.value;
                    if(!text.trim()) {
                        vscode.postMessage({ command: 'warning', text: 'The Darkhold is empty, nothing to save!' });
                        return;
                    }
                    vscode.postMessage({ command: 'save', text: text });
                });

                clearBtn.addEventListener('click', () => {
                    if (!textarea.value.trim()) return;
                    vscode.postMessage({ command: 'askDelete' });
                });

                textarea.addEventListener('input', updateCounts);
                updateCounts();
            </script>
        </body>
        </html>`;
    }
}

export function showDarkholdPanel(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    DarkholdPanel.createPanel(extensionUri, context);
}