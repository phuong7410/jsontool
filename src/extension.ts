import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // Helper: Gets user's current indentation setting (defaults to 4)
    const getIndent = () => {
        const options = vscode.window.activeTextEditor?.options;
        return options?.insertSpaces ? options.tabSize as number : 4;
    };

    // Helper: The "Core Brain" that handles the logic
    const processText = (text: string, mode: 'format' | 'minify') => {
        const indent = getIndent();
        const trimmed = text.trim();

        try {
            // Try Standard JSON
            const json = JSON.parse(trimmed);
            return mode === 'format' ? JSON.stringify(json, null, indent) : JSON.stringify(json);
        } catch {
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
    };

    // Helper: Handles the VS Code Editor Interaction
    const runCommand = (mode: 'format' | 'minify') => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selection = editor.selection;
        
        // If selection is empty, use the whole document
        const hasSelection = !selection.isEmpty;
        const range = hasSelection 
            ? new vscode.Range(selection.start, selection.end)
            : new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
        
        const input = document.getText(range);

        try {
            const output = processText(input, mode);
            editor.edit(editBuilder => editBuilder.replace(range, output));
        } catch (e) {
            vscode.window.showErrorMessage("Error: Input is not valid JSON or JSONL.");
        }
    };

    // 1. FORMAT COMMAND
    const format = vscode.commands.registerCommand('jsontool.format', () => runCommand('format'));

    // 2. MINIFY COMMAND
    const minify = vscode.commands.registerCommand('jsontool.minify', () => runCommand('minify'));

    // 3. TO JSONL COMMAND (Keep this separate as it specifically expects Arrays)
    const toJsonl = vscode.commands.registerCommand('jsontool.toJsonl', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        
        const doc = editor.document;
        const text = doc.getText().trim();

        try {
            const json = JSON.parse(text);
            if (Array.isArray(json)) {
                const output = json.map(item => JSON.stringify(item)).join('\n');
                editor.edit(e => e.replace(new vscode.Range(doc.positionAt(0), doc.positionAt(text.length)), output));
            } else {
                vscode.window.showInformationMessage("Input is already a single object (JSONL style).");
            }
        } catch {
            vscode.window.showErrorMessage("To JSONL requires a valid JSON Array.");
        }
    });

    context.subscriptions.push(format, minify, toJsonl);
}