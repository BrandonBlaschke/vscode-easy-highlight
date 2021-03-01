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

		if (recorder.hasFileRange(path, rangeKey)) {
			let highlight = recorder.getFileRange(path, rangeKey)!;
			highlight.decoration = decoration;
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
			utils.moveRanges(event.contentChanges[0].range, path, recorder);
			updateDecorations(activeEditor);
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
	context.subscriptions.push(disposableNoHighlight);
	context.subscriptions.push(disposableRemoveAll);
}

// this method is called when your extension is deactivated
export function deactivate() {}
