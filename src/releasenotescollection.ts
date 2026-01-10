import * as vscode from 'vscode';
import { RELEASE_NOTES } from './releasenotesdata';

export function showReleaseNotesFullPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'scarletWitchReleaseNotes',
        'Scarlet Witch - Release Notes',
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
            <title>Release Notes</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #120414 0%, #1A0C15 100%);
                    color: #F5E6D3;
                    padding: 40px;
                    line-height: 1.6;
                }

                .container {
                    max-width: 900px;
                    margin: 0 auto;
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

                .header {
                    text-align: center;
                    margin-bottom: 50px;
                    border-bottom: 2px solid #D91A4F;
                    padding-bottom: 30px;
                }

                .header h1 {
                    font-size: 42px;
                    color: #D91A4F;
                    margin-bottom: 10px;
                    text-shadow: 0 0 10px rgba(217, 26, 79, 0.5);
                }

                .header p {
                    font-size: 16px;
                    color: #D370E5;
                }

                .release-item {
                    background: rgba(42, 15, 32, 0.5);
                    border: 2px solid #D91A4F;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 30px;
                    transition: all 0.3s ease;
                }

                .release-item:hover {
                    background: rgba(42, 15, 32, 0.8);
                    box-shadow: 0 0 20px rgba(217, 26, 79, 0.3);
                    transform: translateY(-5px);
                }

                .release-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(217, 26, 79, 0.3);
                }

                .release-version {
                    font-size: 24px;
                    font-weight: bold;
                    color: #D370E5;
                }

                .release-date {
                    font-size: 14px;
                    color: #9B7FA0;
                }

                .release-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #F5E6D3;
                    margin-bottom: 15px;
                }

                .release-changes {
                    list-style: none;
                    padding: 0;
                }

                .release-changes li {
                    padding: 10px 0;
                    padding-left: 30px;
                    position: relative;
                    font-size: 14px;
                }

                .release-changes li:before {
                    content: "▸";
                    color: #D91A4F;
                    font-size: 20px;
                    position: absolute;
                    left: 0;
                    top: -5px;
                }

                .close-btn {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #D91A4F;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .close-btn:hover {
                    background: #E6547A;
                }

                .footer {
                    text-align: center;
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 1px solid rgba(217, 26, 79, 0.3);
                    color: #9B7FA0;
                    font-size: 12px;
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

                .content {
                    display: none;
                }

                .content.active {
                    display: block;
                }
            </style>
        </head>
        <body>
            <button class="close-btn" onclick="closePanel()">❌</button>

            <div class="container">
                <div class="language-selector">
                    <button class="lang-btn active" onclick="switchLanguage('en')">English (EN)</button>
                    <button class="lang-btn" onclick="switchLanguage('hu')">Magyar (HU)</button>
                </div>

                <div id="en-header" class="header content active">
                    <h1>🔮 Release Notes 🔮</h1>
                    <p>Scarlet Witch Theme - Updates and Improvements</p>
                </div>

                <div id="hu-header" class="header content">
                    <h1>🔮 Release Notes 🔮</h1>
                    <p>Scarlet Witch Theme - Frissítések és fejlesztések</p>
                </div>

                <div id="releaseNotesContainer"></div>

                <div id="en-footer" class="footer content">
                    <p>Created by BoBenc.</p>
                    <p><a href="https://github.com/BoBenc">GitHub</a></p>
                </div>

                <div id="hu-footer" class="footer content active">
                    <p>Készítette: BoBenc.</p>
                    <p><a href="https://github.com/BoBenc">GitHub</a></p>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const releaseNotes = ${JSON.stringify(RELEASE_NOTES)};
                let currentLanguage = 'en';

                function renderReleaseNotes() {
                    const container = document.getElementById('releaseNotesContainer');
                    container.innerHTML = '';
                    
                    releaseNotes.forEach((note) => {
                        const item = document.createElement('div');
                        item.className = 'release-item';
                        
                        const changesHtml = note.changes[currentLanguage]
                            .map(change => \`<li>\${change}</li>\`)
                            .join('');
                        
                        item.innerHTML = \`
                            <div class="release-header">
                                <div>
                                    <div class="release-version">\${note.version}</div>
                                    <div class="release-title">\${note.title[currentLanguage]}</div>
                                </div>
                                <div class="release-date">\${note.date}</div>
                            </div>
                            <ul class="release-changes">
                                \${changesHtml}
                            </ul>
                        \`;
                        
                        container.appendChild(item);
                    });
                }

                function switchLanguage(lang) {
                    currentLanguage = lang;
                    
                    document.getElementById('hu-header').classList.remove('active');
                    document.getElementById('en-header').classList.remove('active');
                    document.getElementById(lang + '-header').classList.add('active');
                    
                    document.getElementById('hu-footer').classList.remove('active');
                    document.getElementById('en-footer').classList.remove('active');
                    document.getElementById(lang + '-footer').classList.add('active');
                    
                    document.querySelectorAll('.lang-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                    
                    renderReleaseNotes();
                }

                function closePanel() {
                    vscode.postMessage({
                        command: 'close'
                    });
                }

                renderReleaseNotes();
            </script>
        </body>
        </html>
    `;
}