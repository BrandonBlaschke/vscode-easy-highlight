// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from './utils';
import {Recorder} from './Recorder';

let activeEditor: vscode.TextEditor | undefined = undefined;

// Record Editors that have been marked
let recorder = new Recorder();

export function activate(context: vscode.ExtensionContext) {
	
	let temp = context.workspaceState.get("Recorder");
	if (temp) {
		// @ts-ignore Will always have attribute "files" else undefined and fresh Recorder.
		recorder = new Recorder(temp["files"]);
	}

	// Add highlight to the region the user selected.
	let disposable = vscode.commands.registerCommand('easy-highlight.Highlight', () => {
		// Get current text editor that is open and their selection
		activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		// Get values from user
		const path = activeEditor.document.uri.path.toString();
		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Create range
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);
		let range = new vscode.Range(startPos, endPos);
		
		// Create range key
		const rangeKey = utils.generateRangeKey(startPos, endPos);

		if (!recorder.hasFile(path)) {
			recorder.setFile(path, {});
		}

		const color = utils.getConfigColor();

		const decoration = vscode.window.createTextEditorDecorationType({
			backgroundColor: color,
		});
		
		// If already exists, delete the current one and add a new one incase the color is different.
		if (recorder.hasFileRange(path, rangeKey)) {
			let highlight = recorder.getFileRange(path, rangeKey)!;
			highlight?.decoration.dispose();
			recorder.removeFileRange(path, rangeKey);
			recorder.addFileRange(path, rangeKey, range, decoration, color);
		} else {
			recorder.addFileRange(path, rangeKey, range, decoration, color);
		}

		updateDecorations(activeEditor);
	});

	// Helper to create a colored circle icon
	const createIcon = (color: string) => {
		const baseColor = color.length > 7 ? color.substring(0, 7) : color;
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="${baseColor}" /></svg>`;
		return vscode.Uri.parse(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
	};

	// Color palette with soft, highlight-friendly colors
	const colorPalette = [
		{ label: 'Yellow', description: 'Soft yellow highlight', color: '#fdff3240', iconPath: createIcon('#fdff3240') },
		{ label: 'Orange', description: 'Soft orange highlight', color: '#ffa50040', iconPath: createIcon('#ffa50040') },
		{ label: 'Pink', description: 'Soft pink highlight', color: '#ff69b440', iconPath: createIcon('#ff69b440') },
		{ label: 'Red', description: 'Soft red highlight', color: '#ff6b6b40', iconPath: createIcon('#ff6b6b40') },
		{ label: 'Green', description: 'Soft green highlight', color: '#90ee9040', iconPath: createIcon('#90ee9040') },
		{ label: 'Cyan', description: 'Soft cyan highlight', color: '#00ced140', iconPath: createIcon('#00ced140') },
		{ label: 'Blue', description: 'Soft blue highlight', color: '#87ceeb40', iconPath: createIcon('#87ceeb40') },
		{ label: 'Purple', description: 'Soft purple highlight', color: '#dda0dd40', iconPath: createIcon('#dda0dd40') },
		{ label: 'Lavender', description: 'Soft lavender highlight', color: '#e6e6fa40', iconPath: createIcon('#e6e6fa40') },
		{ label: 'Mint', description: 'Soft mint highlight', color: '#98fb9840', iconPath: createIcon('#98fb9840') },
		{ label: 'Peach', description: 'Soft peach highlight', color: '#ffdab940', iconPath: createIcon('#ffdab940') },
		{ label: 'Coral', description: 'Soft coral highlight', color: '#f0808040', iconPath: createIcon('#f0808040') },
	];

	// Add highlight with custom color to the region the user selected.
	let disposableHighlightColor = vscode.commands.registerCommand('easy-highlight.HighlightColor', async () => {
		// Get current text editor that is open and their selection
		activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		// Show color palette picker
		const selectedColor = await vscode.window.showQuickPick(colorPalette, {
			placeHolder: 'Select a highlight color',
			matchOnDescription: true
		});

		if (!selectedColor) {
			return; // User cancelled
		}

		// Get values from user
		const path = activeEditor.document.uri.path.toString();
		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Create range
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);
		let range = new vscode.Range(startPos, endPos);
		
		// Create range key
		const rangeKey = utils.generateRangeKey(startPos, endPos);

		if (!recorder.hasFile(path)) {
			recorder.setFile(path, {});
		}

		const color = selectedColor.color;

		const decoration = vscode.window.createTextEditorDecorationType({
			backgroundColor: color,
		});
		
		// If already exists, delete the current one and add a new one with the new color.
		if (recorder.hasFileRange(path, rangeKey)) {
			let highlight = recorder.getFileRange(path, rangeKey)!;
			highlight?.decoration.dispose();
			recorder.removeFileRange(path, rangeKey);
			recorder.addFileRange(path, rangeKey, range, decoration, color);
		} else {
			recorder.addFileRange(path, rangeKey, range, decoration, color);
		}

		updateDecorations(activeEditor);
	});

	// Remove any highlights that the user selected within the region.
	let disposableNoHighlight = vscode.commands.registerCommand("easy-highlight.RemoveHighlight", () => {

		// Get current text editor that is open and their selection
		activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		const path = activeEditor.document.uri.path.toString();
		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Get Positions
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);

		// Create range key
		const rangeKey = utils.generateRangeKey(startPos, endPos);

		if (recorder.hasFile(path) && recorder.hasFileRange(path, rangeKey)) {
			recorder.getFileRange(path, rangeKey)?.decoration.dispose();
			recorder.removeFileRange(path, rangeKey);
			return;
		}

		for (let key in recorder.getFileRanges(path)) {
			let highlight = recorder.getFileRange(path, key)!;
			
			let newRanges = utils.modifyRange(startPos, endPos, highlight?.range, highlight?.decoration);
			if (newRanges === undefined) {
				recorder.removeFileRange(path, key);
				continue;
			}

			let newRange1 = newRanges?.newRange1;
			let newRange2 = newRanges?.newRange2;
			
			if (newRange1) {
				const decoration = vscode.window.createTextEditorDecorationType({
					backgroundColor: highlight.color,
				});
				recorder.removeFileRange(path, key);
				highlight?.decoration.dispose();
				let newKey = utils.generateRangeKey(newRange1.start, newRange1.end);
				recorder.addFileRange(path, newKey, newRange1, decoration, highlight.color);
			}

			if (newRange2) {
				const decoration = vscode.window.createTextEditorDecorationType({
					backgroundColor: highlight.color,
				});
				let newKey = utils.generateRangeKey(newRange2.start, newRange2.end);
				recorder.addFileRange(path, newKey, newRange2, decoration, highlight.color);
			}
		}
		updateDecorations(activeEditor);
	});

	// Disposes of all highlights on a single text editor
	let disposableRemoveAll = vscode.commands.registerCommand("easy-highlight.RemoveAllHighlights", () => {

		if (!activeEditor) {
			return;
		}

		const path = activeEditor.document.uri.path.toString();

		if (!recorder.hasFile(path)) {
			return;
		}

		for (let rangeKey in recorder.getFileRanges(path)) {
			recorder.getFileRange(path, rangeKey)?.decoration.dispose();
			recorder.removeFileRange(path, rangeKey);
		}
	});

	// Updates Decorations on current ActiveEditor
	let updateDecorations = (activeEditor: vscode.TextEditor) => {

		if (!activeEditor) {
			return;
		}

		const path = activeEditor.document.uri.path.toString();
		if (!recorder.hasFile(path)) {
			return;
		}

		let ranges = recorder.getFileRanges(path);
		for (let range in ranges) {
			let highlight = ranges[range];
			activeEditor.setDecorations(highlight.decoration, [highlight.range]);
		}

		context.workspaceState.update("Recorder", recorder);
	};

	// Update files when vscode is opened.
	activeEditor = vscode.window.activeTextEditor!;
	updateDecorations(activeEditor);

	// When editor switches update activeEditor and update decorations.
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			updateDecorations(editor);
		}
	}, null, context.subscriptions);

	// When text is added to active editor update any highlights that should be moved up/down
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			const path = activeEditor.document.uri.path.toString();
			
			for (const change of event.contentChanges) {
				utils.moveRanges(change, path, recorder);
				updateDecorations(activeEditor);
			}
			
		}
	}, null, context.subscriptions);

	// If file name changes update key for markedEditors
	vscode.workspace.onWillRenameFiles((event) => {
		event.files.forEach((files) => {
			const oldPath = files.oldUri.path.toString();
			if (recorder.hasFile(oldPath)) {
				const highlights = recorder.getFileRanges(oldPath);
				recorder.removeFile(oldPath);
				recorder.setFile(files.newUri.path.toString(), highlights);
			}
		});
	}, null, context.subscriptions);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableHighlightColor);
	context.subscriptions.push(disposableNoHighlight);
	context.subscriptions.push(disposableRemoveAll);
}

// this method is called when your extension is deactivated
export function deactivate() {}
