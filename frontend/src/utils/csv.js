// ── Tiny CSV export helper ───────────────────────────────
// Turns an array of plain objects into a downloadable CSV file.
// Quotes any value containing comma, quote, or newline so the
// output is safe to open in Excel / Google Sheets.

const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
};

export function toCSV(rows, columns) {
    if (!Array.isArray(rows) || rows.length === 0) {
        // Still emit the header so the file is non-empty / importable.
        return columns.map((c) => escapeCell(c.label)).join(',') + '\n';
    }

    const header = columns.map((c) => escapeCell(c.label)).join(',');
    const body = rows
        .map((row) =>
            columns
                .map((c) => {
                    const raw = typeof c.value === 'function' ? c.value(row) : row[c.key];
                    return escapeCell(raw);
                })
                .join(',')
        )
        .join('\n');

    return header + '\n' + body + '\n';
}

export function downloadCSV(filename, csvText) {
    // BOM so Excel opens UTF-8 correctly (emails, names with accents).
    const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Defer revoke so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Search Highlight Utility ───────────────────────────────
// Returns a React-friendly string with <mark> tags around matches.
export const highlightText = (text, search) => {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-accent/30 text-accent-900 rounded px-0.5">$1</mark>');
};

// Safe innerHTML for React
export const HighlightedText = ({ text, search, className = '' }) => {
    const parts = highlightText(text, search).split(/<mark[^>]*>([^<]+)<\/mark>/gi);
    if (parts.length === 1) return <span className={className}>{text}</span>;
    
    return (
        <span className={className} dangerouslySetInnerHTML={{ __html: highlightText(text, search) }} />
    );
};