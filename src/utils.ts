export type Mode = 'format' | 'minify' | 'toJsonl';

const toJsonlLine = (item: unknown): string => {
    const s = JSON.stringify(item);
    let result = '';
    let inString = false;
    let escape = false;
    for (const ch of s) {
        if (escape) { escape = false; result += ch; continue; }
        if (inString) {
            if (ch === '\\') { escape = true; }
            else if (ch === '"') { inString = false; }
            result += ch;
        } else {
            if (ch === '"') { inString = true; }
            result += ch;
            if (ch === ':' || ch === ',') { result += ' '; }
        }
    }
    return result;
};

function extractJsonBlocks(text: string): unknown[] {
    const blocks: unknown[] = [];
    let i = 0;

    while (i < text.length) {
        while (i < text.length && /\s/.test(text[i])) { i++; }
        if (i >= text.length) { break; }

        if (text[i] !== '{' && text[i] !== '[') { throw new Error("Invalid JSON/JSONL"); }

        const start = i;
        let depth = 0;
        let inString = false;
        let escape = false;

        while (i < text.length) {
            const ch = text[i];
            if (escape)          { escape = false; }
            else if (inString)   { if (ch === '\\') { escape = true; } else if (ch === '"') { inString = false; } }
            else {
                if      (ch === '"')           { inString = true; }
                else if (ch === '{' || ch === '[') { depth++; }
                else if (ch === '}' || ch === ']') { depth--; if (depth === 0) { i++; break; } }
            }
            i++;
        }

        blocks.push(JSON.parse(text.slice(start, i)));
    }

    if (blocks.length === 0) { throw new Error("Invalid JSON/JSONL"); }
    return blocks;
}

export function processText(text: string, mode: Mode, indent: number = 4): string {
    const trimmed = text.trim();

    try {
        const json = JSON.parse(trimmed);
        if (mode === 'toJsonl') {
            if (!Array.isArray(json)) { return toJsonlLine(json); }
            return json.map(toJsonlLine).join('\n');
        }
        return mode === 'format' ? JSON.stringify(json, null, indent) : JSON.stringify(json);
    } catch (e) {
        if (mode === 'toJsonl') {
            const lines = trimmed.split('\n').filter(l => l.trim());
            const parsedLines: unknown[] = [];
            let allValidLines = true;
            for (const l of lines) {
                try { parsedLines.push(JSON.parse(l)); }
                catch { allValidLines = false; break; }
            }
            if (allValidLines && parsedLines.length > 0) {
                // Compact JSONL (each line equals its own JSON.stringify output) — nothing to convert
                const isCompact = parsedLines.every((p, i) => JSON.stringify(p) === lines[i].trim());
                if (isCompact) { throw new Error("Input is already JSONL"); }
                // Non-compact JSONL (pretty or messy) — normalize
                return parsedLines.map(toJsonlLine).join('\n');
            }

            // Multi-line JSONL blocks: extract by brace depth
            return extractJsonBlocks(trimmed).map(toJsonlLine).join('\n');
        }
        // Fallback: Try JSONL (Line by Line)
        try {
            const lines = trimmed.split('\n').filter(l => l.trim());
            return lines.map(l => {
                const parsed = JSON.parse(l);
                return mode === 'format' ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
            }).join(mode === 'format' ? '\n\n' : '\n');
        } catch {
            throw new Error("Invalid JSON/JSONL");
        }
    }
}
