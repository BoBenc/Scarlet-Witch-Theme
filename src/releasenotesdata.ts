export interface ReleaseNote {
    version: string;
    date: string;
    title: {
        en: string;
        hu: string;
    };
    changes: {
        en: string[];
        hu: string[];
    };
}

export const RELEASE_NOTES: ReleaseNote[] = [
    {
        version: '0.0.5',
        date: '2026-01-26',
        title: {
            en: 'Picture Gallery panel',
            hu: 'Képgaléria panel'
        },
        changes: {
            en: [
                '🖼️ Picture Gallery panel added',
                '🔗 You can select an image from Picture Gallery to No More Errors! panel',
                '💬 You can switch on/off Speech Bubble from Picture Gallery panel',
                '🗄️ Activity Bar & Sidebar got a new button',
                '🔥 No More Errors! panel rework'
            ],
            hu: [
                '🖼️ Képgaléria panel hozzáadva',
                '🔗 Választhatsz képet a Képgalériából a No More Errors! panelhez',
                '💬 Be- és kikapcsolhatod a Beszédbuborékot a Képgaléria panelen',
                '🗄️ Tevékenység sáv & Oldalsáv kapott egy új gombot',
                '🔥 No More Errors! panel újragondolva'
            ]
        }
    },
    {
        version: '0.0.4',
        date: '2026-01-18',
        title: {
            en: 'Status Bar button',
            hu: 'Állapotsor gomb'
        },
        changes: {
            en: [
                '🖼️ Status Bar button added',
                '🔗 Copilot integration with Status Bar button',
                '🗄️ No More Errors! panel added',
                '🔥 Sticker image in the No More Errors! panel'
            ],
            hu: [
                '🖼️ Állapotsor gomb hozzáadva',
                '🔗 Copilot integráció az Állapotsor gombbal',
                '🗄️ No More Errors! panel hozzáadva',
                '🔥 Matrica kép a No More Errors! panelen'
            ]
        }
    },
    {
        version: '0.0.3',
        date: '2026-01-10',
        title: {
            en: 'Activity Bar & Sidebar',
            hu: 'Tevékenység sáv & Oldalsáv'
        },
        changes: {
            en: [
                '🖼️ Activity Bar icon added',
                '🔗 Activity Bar integration',
                '🗄️ Sidebar added',
                '🎯 Sidebar buttons for Welcome Panel and Release Notes'
            ],
            hu: [
                '🖼️ Tevékenység sáv ikon hozzáadva',
                '🔗 Tevékenység sáv integráció',
                '🗄️ Oldalsáv hozzáadva',
                '🎯 Oldalsáv gombok a Üdvözlő panelhez és a Kiadási megjegyzésekhez'
            ]
        }
    },
    {
        version: '0.0.2',
        date: '2026-01-03',
        title: {
            en: 'Update Panel & Light Theme',
            hu: 'Frissítési panel & Világos téma'
        },
        changes: {
            en: [
                '🆕 Update panel added',
                '🎨 Light Theme added',
                '🚀 Performance improvements'
            ],
            hu: [
                '🆕 Frissítési panel hozzáadva',
                '🎨 Világos téma hozzáadva',
                '🚀 Performance javítások'
            ]
        }
    },
    {
        version: '0.0.1',
        date: '2026-01-02',
        title: {
            en: 'Initial Release',
            hu: 'Kezdeti kiadás'
        },
        changes: {
            en: [
                '🎨 Dark theme',
                '🔮 Core features',
                '📝 Documentation'
            ],
            hu: [
                '🎨 Sötét téma',
                '🔮 Alapvető funkciók',
                '📝 Dokumentáció'
            ]
        }
    }
];

export function getReleaseNoteByVersion(version: string): ReleaseNote | undefined {
    return RELEASE_NOTES.find(note => note.version === version);
}

export function getAllReleaseNotes(): ReleaseNote[] {
    return RELEASE_NOTES;
}