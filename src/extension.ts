import * as vscode from 'vscode';
import { processText, Mode } from './utils';

export function activate(context: vscode.ExtensionContext) {

    // Helper: Gets user's current indentation setting (defaults to 4)
    const getIndent = () => {
        const options = vscode.window.activeTextEditor?.options;
        return options?.insertSpaces ? options.tabSize as number : 4;
    };

    // Helper: Handles the VS Code Editor Interaction
    const runCommand = (mode: Mode) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const document = editor.document;
        const selection = editor.selection;
        
        // If selection is empty, use the whole document
        const hasSelection = !selection.isEmpty;
        const range = hasSelection 
            ? new vscode.Range(selection.start, selection.end)
            : new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
        
        const input = document.getText(range);

        try {
            const output = processText(input, mode, getIndent());
            editor.edit(editBuilder => editBuilder.replace(range, output));
        } catch (e) {
            vscode.window.showErrorMessage("Error: Input is not valid JSON or JSONL.");
        }
    };

    // 1. FORMAT COMMAND
    const format = vscode.commands.registerCommand('jsontool.format', () => runCommand('format'));

    // 2. MINIFY COMMAND
    const minify = vscode.commands.registerCommand('jsontool.minify', () => runCommand('minify'));

    // 3. TO JSONL COMMAND
    const toJsonl = vscode.commands.registerCommand('jsontool.toJsonl', () => runCommand('toJsonl'));

    context.subscriptions.push(format, minify, toJsonl);
}