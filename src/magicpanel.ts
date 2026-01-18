import * as vscode from 'vscode';
import * as path from 'path';

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

export async function showMagicPanel(context: vscode.ExtensionContext): Promise<boolean> {
    return new Promise((resolve) => {
        const panel = vscode.window.createWebviewPanel(
            'magicPanel',
            'No More Errors!',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'images'))
                ]
            }
        );

        const imageUri = panel.webview.asWebviewUri(
            vscode.Uri.file(
                path.join(context.extensionPath, 'images', 'scarlet-witch-crown-sticker.png')
            )
        );

        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const colors = isDarkTheme ? DARK_THEME : LIGHT_THEME;

        const logoUri = vscode.Uri.joinPath(
            context.extensionUri,
            'images',
            'logo.png'
        );
        panel.iconPath = logoUri;

        panel.webview.html = getWebviewContent(imageUri.toString(), colors);

        panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'animationFinished') {
                setTimeout(() => {
                    panel.dispose();
                    resolve(true);
                }, 500);
            }
        });

        panel.onDidDispose(() => {
            resolve(true);
        });
    });
}

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

function getWebviewContent(imageUri: string, colors: ThemeColors): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>No More Errors!</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: ${colors.background};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: ${colors.foreground};
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            display: grid;
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
            gap: 20px;
            max-width: 600px;
            animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
            from { transform: translateY(-40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .bubble-wrapper {
            grid-column: 2;
            grid-row: 1;
            position: relative;
            width: fit-content;
        }

        .speech-bubble {
            background: ${colors.bubble};
            color: ${colors.bubbleText};
            padding: 16px 22px;
            border-radius: 14px;
            max-width: 280px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
            border: 2px solid ${colors.border};
            position: relative;
            animation: bubbleAppear 0.45s ease-out 0.2s both;
        }

        .speech-bubble::after {
            content: "";
            position: absolute;
            bottom: -8px;
            left: 2px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 14px 12px 0 12px;
            border-color: ${colors.border} transparent transparent transparent;
            transform: rotate(15.5deg);
            transform-origin: top left;
            z-index: 0;
        }

        .speech-bubble::before {
            content: "";
            position: absolute;
            bottom: -6px;
            left: 4px;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 12px 10px 0 10px;
            border-color: ${colors.bubble} transparent transparent transparent;
            transform: rotate(15.5deg);
            transform-origin: top left;
            z-index: 1;
        }

        @keyframes bubbleAppear {
            from { transform: translateY(-10px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .text-content {
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .cursor {
            display: inline-block;
            width: 2px;
            height: 1.1em;
            background: ${colors.cursor};
            animation: blink 0.7s infinite;
        }

        @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }

        .emoji {
            font-size: 22px;
            display: inline-block;
            animation: spin 1.5s linear infinite;
            margin-left: 2px;
            color: ${colors.secondary};
            opacity: 0;
        }

        @keyframes spin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
        }

        .image-wrapper {
            grid-column: 1;
            grid-row: 2;
            width: 280px;
            height: 280px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            border: 2px solid ${colors.border};
            animation: imageBounce 2s ease-in-out infinite;
        }

        .image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        @keyframes imageBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-15px) scale(1.02); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="bubble-wrapper">
            <div class="speech-bubble">
                <div class="text-content">
                    <span id="animatedText"></span>
                    <span class="cursor" id="cursor"></span>
                    <span class="emoji" id="emoji">✨</span>
                </div>
            </div>
        </div>
        <div class="image-wrapper">
            <img src="${imageUri}" alt="Image"/>
        </div>
    </div>

    <script>
        const text = 'No More Errors!';
        const textEl = document.getElementById('animatedText');
        const cursor = document.getElementById('cursor');
        const emoji = document.getElementById('emoji');
        let index = 0;

        function typeWriter() {
            if (index < text.length) {
                textEl.textContent += text[index];
                index++;
                setTimeout(typeWriter, 75);
            } else {
                cursor.style.display = 'none';
                emoji.style.opacity = '1';
                setTimeout(() => {
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({ command: 'animationFinished' });
            }, 2000);
        }
    }
    typeWriter();
    </script>
</body>
</html>
`;
}