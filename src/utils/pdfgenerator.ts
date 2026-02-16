export function createPdf(text: string): string {
    const objects: string[] = [];

    const addObj = (content: string) => {
        objects.push(content);
        return objects.length;
    };

    const catalogId = addObj(`<< /Type /Catalog /Pages 2 0 R >>`);

    const pagesId = addObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

    const sanitizedText = text
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .split('\n')
        .map(line => `(${line}) Tj T*`)
        .join(' ');

    const pageId = addObj(`<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 5 0 R >>`);

    const fontId = addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);

    const contentStream = `
        BT
        /F1 12 Tf
        50 750 Td
        15 TL
        ${sanitizedText}
        ET`;

    const streamId = addObj(`<< /Length ${contentStream.length} >>\nstream${contentStream}\nendstream`);

    let pdfBody = `%PDF-1.4\n`;
    const xrefOffsets: number[] = [0];

    objects.forEach((objContent, index) => {
        const id = index + 1;
        xrefOffsets.push(pdfBody.length);
        pdfBody += `${id} 0 obj\n${objContent}\nendobj\n`;
    });

    const xrefStart = pdfBody.length;
    pdfBody += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdfBody += xrefOffsets[i].toString().padStart(10, '0') + " 00000 n \n";
    }

    pdfBody += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return pdfBody;
}