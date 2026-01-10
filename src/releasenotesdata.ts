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