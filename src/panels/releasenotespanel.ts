import * as vscode from 'vscode';

export function showReleaseNotesPanel(
    context: vscode.ExtensionContext,
    oldVersion: string,
    newVersion: string
) {
    const panel = vscode.window.createWebviewPanel(
        'scarletWitchReleaseNotes',
        '🔮 Scarlet Witch Theme - What\'s New?',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const tabIconUri = vscode.Uri.joinPath(
        context.extensionUri,
        'images',
        'logo.png'
    );
    panel.iconPath = tabIconUri;

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Scarlet Witch - Release Notes</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #fefbff 0%, #f8f3f8 100%);
                    color: #1a0c15;
                    line-height: 1.6;
                    padding: 40px 20px;
                    min-height: 100vh;
                }

                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(217, 26, 79, 0.1);
                    border: 1px solid rgba(217, 26, 79, 0.15);
                }

                .language-selector {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(217, 26, 79, 0.2);
                }

                .lang-btn {
                    background: rgba(217, 26, 79, 0.1);
                    color: #d91a4f;
                    border: 1px solid rgba(217, 26, 79, 0.3);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-size: 12px;
                }

                .lang-btn:hover {
                    background: rgba(217, 26, 79, 0.2);
                    transform: scale(1.05);
                }

                .lang-btn.active {
                    background: #d91a4f;
                    color: white;
                    border: 1px solid #d91a4f;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #d91a4f;
                    padding-bottom: 20px;
                }

                h1 {
                    font-size: 32px;
                    color: #d91a4f;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                .version-info {
                    display: inline-block;
                    background: linear-gradient(135deg, #d91a4f, #a626a4);
                    color: white;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }

                h2 {
                    color: #a626a4;
                    font-size: 20px;
                    margin-top: 30px;
                    margin-bottom: 15px;
                    font-weight: 600;
                }

                .features {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 30px;
                }

                .feature {
                    padding: 16px;
                    background: linear-gradient(135deg, #fefbff 0%, #f8f3f8 100%);
                    border-left: 4px solid #d91a4f;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }

                .feature:hover {
                    box-shadow: 0 4px 12px rgba(217, 26, 79, 0.15);
                    transform: translateX(4px);
                }

                .feature strong {
                    color: #d91a4f;
                    display: block;
                    margin-bottom: 6px;
                    font-size: 15px;
                }

                .feature span {
                    color: #666;
                    font-size: 14px;
                }

                code {
                    background: #ffffff;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    color: #d91a4f;
                    border: 1px solid #e0d0e0;
                }

                .divider {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #d91a4f, transparent);
                    margin: 30px 0;
                }

                .feedback {
                    text-align: center;
                    padding: 20px;
                    color: #FFFFFF;
                    background: linear-gradient(135deg, rgba(217, 26, 79, 0.05), rgba(166, 38, 164, 0.05));
                    border-radius: 8px;
                    margin-bottom: 20px;
                }

                .feedback a {
                    color: #d91a4f;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.3s ease;
                }

                .feedback a:hover {
                    color: #a626a4;
                    text-decoration: underline;
                }

                .footer {
                    text-align: center;
                    color: #a0a1a7;
                    font-size: 13px;
                    padding-top: 20px;
                    border-top: 1px solid #e0d0e0;
                }

                .footer-emoji {
                    font-size: 24px;
                    margin: 10px 0;
                }

                .content {
                    display: none;
                }

                .content.active {
                    display: block;
                }

                @media (prefers-color-scheme: dark) {
                    body {
                        background: linear-gradient(135deg, #140810 0%, #1a0c15 100%);
                    }

                    .container {
                        background: rgba(26, 12, 21, 0.95);
                        border-color: rgba(217, 26, 79, 0.25);
                        box-shadow: 0 10px 30px rgba(217, 26, 79, 0.2);
                    }

                    .language-selector {
                        border-color: rgba(217, 26, 79, 0.2);
                    }

                    .lang-btn {
                        background: rgba(217, 26, 79, 0.15);
                        color: #ff6b9d;
                        border-color: rgba(217, 26, 79, 0.3);
                    }

                    .lang-btn:hover {
                        background: rgba(217, 26, 79, 0.25);
                    }

                    .lang-btn.active {
                        background: #d91a4f;
                        color: white;
                    }

                    .feature {
                        background: linear-gradient(135deg, #2a0f20 0%, #1f0a17 100%);
                        border-color: #d91a4f;
                    }

                    .feature span {
                        color: #b8a0c0;
                    }

                    code {
                        background: rgba(217, 26, 79, 0.15);
                        color: #ff6b9d;
                        border-color: rgba(217, 26, 79, 0.3);
                    }

                    .feedback {
                        background: rgba(217, 26, 79, 0.1);
                        border-color: rgba(217, 26, 79, 0.3);
                    }

                    .feedback a {
                        color: #ff6b9d;
                    }

                    .feedback a:hover {
                        color: #d91a4f;
                    }

                    .footer {
                        color: #9b7fa0;
                        border-color: rgba(217, 26, 79, 0.2);
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

                <div id="en-content" class="content active">
                    <div class="header">
                        <h1>🔮 Scarlet Witch Theme 🔮</h1>
                        <span class="version-info">Updated: ${oldVersion} → ${newVersion}</span>
                    </div>

                    <h2>✨ What's New?</h2>
                    <div class="features">
                        <div class="feature">
                            <strong>🖼️ Upload your images</strong>
                            <span>You can upload your own .png image to Picture Gallery panel.</span>
                        </div>
                        <div class="feature">
                            <strong>🗑️ Delete your images</strong>
                            <span>You can delete uploaded images from Picture Gallery panel.</span>
                        </div>
                    </div>

                    <div class="feedback">
                        <p>💬 <strong>Your opinion matters!</strong> Please report any errors and if you have any ideas, please write on 
                            <a href="https://github.com/BoBenc/Scarlet-Witch-Theme.git">GitHub</a>
                        </p>
                    </div>

                    <div class="divider"></div>

                    <div class="footer">
                        <div class="footer-emoji">🔮✨</div>
                        <p>Experience the chaos magic. Code with chaos magic.</p>
                    </div>
                </div>

                <div id="hu-content" class="content">
                    <div class="header">
                        <h1>🔮 Scarlet Witch Theme 🔮</h1>
                        <span class="version-info">Frissítve: ${oldVersion} → ${newVersion}</span>
                    </div>

                    <h2>✨ Újdonságok</h2>
                    <div class="features">
                        <div class="feature">
                            <strong>🖼️ Feltöltheted a képeid</strong>
                            <span>Feltöltheted a saját .png képed a Képgaléria panelre.</span>
                        </div>
                        <div class="feature">
                            <strong>🗑️ Törölheted a képeid</strong>
                            <span>Törölheted a feltöltött képeket a Képgaléria panelről.</span>
                        </div>
                    </div>

                    <div class="feedback">
                        <p>💬 <strong>Számít a véleményed!</strong> Jelezd kérlek a hibákat és ha van új ötleted kérlek írj a 
                            <a href="https://github.com/BoBenc/Scarlet-Witch-Theme.git">GitHubon</a>
                        </p>
                    </div>

                    <div class="divider"></div>

                    <div class="footer">
                        <div class="footer-emoji">🔮✨</div>
                        <p>Éld át a káosz mágiát. Kódolj káosz mágiával.</p>
                    </div>
                </div>
            </div>

            <script>
                function switchLanguage(lang) {
                    document.getElementById('en-content').classList.remove('active');
                    document.getElementById('hu-content').classList.remove('active');
                    document.getElementById(lang + '-content').classList.add('active');
                    
                    document.querySelectorAll('.lang-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');
                }
            </script>
        </body>
        </html>
    `;
    panel.iconPath = tabIconUri;
    panel.webview.html = htmlContent;
}