// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class MarkedEditor {
	filePath: string;
	ranges: vscode.Range[];
	constructor(filePath: string) {
		this.filePath = filePath;
		this.ranges = [];
	}
}

const markedEditors = new Map<string, vscode.Range[]>();

// Decorator type to highlight
const highlightDecorator = vscode.window.createTextEditorDecorationType({
	backgroundColor: '#fdff322f',
});

const noHighlightDecorator = vscode.window.createTextEditorDecorationType({
	backgroundColor: '#fdff3200'
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Highlight');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('easy-highlight.Highlight', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Easy Highlight!');
		
		// Get current text editor that is open and their selection
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		// Get values from user
		const uri = activeEditor.document.uri.toString();
		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Create range
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);
		let range = new vscode.Range(startPos, endPos);
		if (markedEditors.has(uri)) {
			markedEditors.get(uri)?.push(range);
		} else {
			markedEditors.set(uri, [range]);
		}

		let temp: vscode.Range[] =  markedEditors.get(uri)!;
		console.log(temp);
		activeEditor.setDecorations(highlightDecorator, temp);
	});

	let disposableNoHighlight = vscode.commands.registerCommand("easy-highlight.RemoveHighlight", () => {
		
		console.log('Remove Highlight');

		// Get current text editor that is open and their selection
		let activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Create range
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);
		let range = new vscode.Range(startPos, endPos);

		// activeEditor.setDecorations(noHighlightDecorator, ranges);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableNoHighlight);
}

// this method is called when your extension is deactivated
export function deactivate() {}
