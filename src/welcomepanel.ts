import * as vscode from 'vscode';

export function showWelcomePanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'scarletWitchWelcomePanel',
        'Scarlet Witch Theme - Welcome',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    const logoUri = vscode.Uri.joinPath(
        context.extensionUri,
        'images',
        'logo.png'
    );
    panel.iconPath = logoUri;
    panel.webview.html = getWebviewContent();
    panel.webview.onDidReceiveMessage(
        message => {
            if (message.command === 'close') {
                panel.dispose();
            }
        }
    );
}

function getWebviewContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Scarlet Witch Theme</title>
            <style>
                body {
                    margin: 0;
                    padding: 40px;
                    background: linear-gradient(135deg, #120414 0%, #1A0C15 100%);
                    color: #F5E6D3;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    text-align: center;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .container {
                    max-width: 600px;
                    background: rgba(42, 15, 32, 0.5);
                    border: 2px solid #D91A4F;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 0 40px rgba(217, 26, 79, 0.3);
                    display: flex;
                    flex-direction: column;
                }

                .language-selector {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(217, 26, 79, 0.3);
                }

                .lang-btn {
                    background: rgba(217, 26, 79, 0.2);
                    color: #F5E6D3;
                    border: 1px solid rgba(217, 26, 79, 0.5);
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    font-size: 14px;
                }

                .lang-btn:hover {
                    background: rgba(217, 26, 79, 0.4);
                    transform: scale(1.05);
                }

                .lang-btn.active {
                    background: #D91A4F;
                    color: #120414;
                    border: 1px solid #D91A4F;
                }

                .content-wrapper {
                    flex: 1;
                }

                h1 {
                    font-size: 42px;
                    color: #D91A4F;
                    margin: 0 0 10px 0;
                    text-shadow: 0 0 10px rgba(217, 26, 79, 0.5);
                }

                .subtitle {
                    font-size: 16px;
                    color: #D370E5;
                    margin-bottom: 30px;
                    font-weight: 300;
                }

                p {
                    font-size: 14px;
                    line-height: 1.8;
                    color: #F5E6D3;
                    margin: 15px 0;
                }

                .features {
                    text-align: left;
                    margin: 30px 0;
                    list-style: none;
                    padding: 0;
                }

                .features li {
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(217, 26, 79, 0.2);
                }

                .features li:before {
                    content: "✨ ";
                    color: #D91A4F;
                    font-weight: bold;
                    margin-right: 10px;
                }

                .roadmap {
                    text-align: left;
                    margin: 30px 0;
                    background: rgba(217, 26, 79, 0.1);
                    border-left: 3px solid #D91A4F;
                    padding: 15px 20px;
                    border-radius: 6px;
                }

                .roadmap h3 {
                    margin: 0 0 15px 0;
                    color: #D370E5;
                    font-size: 16px;
                }

                .roadmap-item {
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(217, 26, 79, 0.15);
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                }

                .roadmap-item:last-child {
                    border-bottom: none;
                }

                .roadmap-item:before {
                    content: "➡️ ";
                    margin-right: 10px;
                    font-size: 14px;
                }

                .button {
                    display: inline-block;
                    background: #D91A4F;
                    color: #120414;
                    padding: 12px 30px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 15px rgba(217, 26, 79, 0.4);
                }

                .button:hover {
                    background: #E6547A;
                    transform: scale(1.05);
                    box-shadow: 0 0 25px rgba(217, 26, 79, 0.6);
                }

                .magic {
                    font-size: 24px;
                    margin: 20px 0;
                    animation: glow 2s ease-in-out infinite;
                }

                .content {
                    display: none;
                }

                .content.active {
                    display: block;
                }

                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(217, 26, 79, 0.3);
                    font-size: 12px;
                    color: #9B7FA0;
                    line-height: 1.6;
                }

                .footer li {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    margin-bottom: 8px;
                }

                .footer a {
                    color: #D370E5;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer a:hover {
                    color: #D91A4F;
                    text-decoration: underline;
                }

                .footer li:nth-child(3) a {
                    color: #D370E5;
                    text-decoration: none;
                    transition: color 0.3s ease;
                    font-weight: bold;
                }

                .footer li:nth-child(3) a:hover {
                    color: #D91A4F;
                    text-decoration: underline;
                }

                @keyframes glow {
                    0%, 100% {
                        color: #D91A4F;
                        text-shadow: 0 0 10px rgba(217, 26, 79, 0.5);
                    }
                    50% {
                        color: #D370E5;
                        text-shadow: 0 0 20px rgba(211, 112, 229, 0.8);
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="language-selector">
                    <button class="lang-btn active" onclick="switchLanguage('en')">English (EN)</button>
                    <button class="lang-btn" onclick="switchLanguage('hu')">Magyar (HU)</button>
                </div>

                <div class="content-wrapper">
                    <div id="en-content" class="content active">
                        <h1>🔮 Scarlet Witch Theme 🔮</h1>
                        <div class="subtitle">VS Code Theme</div>
                        <p>Welcome to the Scarlet Witch Theme welcome panel!</p>
                        <div class="magic">✨ Chaos Magic Unleashed ✨</div>
                        <ul class="features">
                            <li>Scarlet Witch inspired color palette</li>
                            <li>Perfect contrast for code syntax</li>
                            <li>More features to come!</li>
                        </ul>
                        <div class="roadmap">
                            <h3>🚀 Future plans</h3>
                            <div class="roadmap-item">Light theme ✅</div>
                            <div class="roadmap-item">Activity Bar and Sidebar ✅</div>
                            <div class="roadmap-item">Stickers</div>
                            <div class="roadmap-item">Other ideas</div>
                        </div>
                        <p><strong>Activate the theme:</strong></p>
                        <p>⚙️ File → Preferences → Themes → Color Theme → Scarlet Witch</p>
                        <button class="button" onclick="closePanel()">Let's Go!</button>
                    </div>

                    <div id="hu-content" class="content">
                        <h1>🔮 Skarlát Boszorkány Theme 🔮</h1>
                        <div class="subtitle">VS Code téma</div>
                        <p>Üdvözöllek a Skarlát Boszorkány téma üdvözlő felületén!</p>
                        <div class="magic">✨ Káosz Mágia elszabadítva ✨</div>
                        <ul class="features">
                            <li>Skarlát Boszorkány ihlette színek</li>
                            <li>Tökéletes kontrasztok</li>
                            <li>Még sok funkció a jövőben!</li>
                        </ul>
                        <div class="roadmap">
                            <h3>🚀 Jövőbeni tervek</h3>
                            <div class="roadmap-item">Világos téma ✅</div>
                            <div class="roadmap-item">Activity Bar és Sidebar ✅</div>
                            <div class="roadmap-item">Stickerek</div>
                            <div class="roadmap-item">Egyéb ötletek</div>
                        </div>
                        <p><strong>A téma aktiválása:</strong></p>
                        <p>⚙️ File → Preferences → Themes → Color Theme → Scarlet Witch</p>

                        <button class="button" onclick="closePanel()">Kezdjünk bele!</button>
                    </div>
                </div>
                
                <div class="footer">
                    <div id="en-footer" class="content active">
                        <li>⚠️ Fan-made project. Created for personal use purposes.</li>
                        <li>👨‍💻 Created by: BoBenc</li>
                        <li>🌐 <a href="https://github.com/BoBenc">GitHub</a></li>
                    </div>
                    <div id="hu-footer" class="content">
                        <li>⚠️ Fan-made projekt. Személyes használatra készült.</li>
                        <li>👨‍💻 Készítette: BoBenc</li>
                        <li>🌐 <a href="https://github.com/BoBenc">GitHub</a></li>
                    </div>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                function switchLanguage(lang) {
                    document.getElementById('hu-content').classList.remove('active');
                    document.getElementById('en-content').classList.remove('active');
                    document.getElementById(lang + '-content').classList.add('active');
                    
                    document.getElementById('hu-footer').classList.remove('active');
                    document.getElementById('en-footer').classList.remove('active');
                    document.getElementById(lang + '-footer').classList.add('active');
                    
                    document.querySelectorAll('.lang-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    
                    vscode.setState({ language: lang });
                }
                
                function closePanel() {
                    vscode.postMessage({ command: 'close' });
                }
            </script>
        </body>
        </html>
    `;
}