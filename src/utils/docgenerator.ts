export function createDoc(text: string): string {
    return text.replace(/\n/g, '\r\n');
}