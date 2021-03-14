import * as assert from 'assert';
import * as vscode from 'vscode';
import * as utils from '../../utils';
import {Recorder} from '../../Recorder';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	const decoration = vscode.window.createTextEditorDecorationType({});

	test('Test generateRangeKey', () => {
		// Different lines from start
		let key = utils.generateRangeKey(new vscode.Position(0, 0), new vscode.Position(10, 0));
		assert.strictEqual(key, "00100");

		// Same line in 100s
		key = utils.generateRangeKey(new vscode.Position(110, 15), new vscode.Position(110, 17));
		assert.strictEqual(key, "1101511017");

		// Both different line and character
		key = utils.generateRangeKey(new vscode.Position(5, 5), new vscode.Position(6, 6));
		assert.strictEqual(key, "5566");
	});

	test('Test modifyRange with outside positions', () => {
		let range = new vscode.Range(new vscode.Position(50, 0), new vscode.Position(60, 5));
		
		// Positions before Range
		let result = utils.modifyRange(
			new vscode.Position(40, 0),
			new vscode.Position(49, 1),
			range,
			decoration);
		
		assert.deepStrictEqual(result, {newRange1: range, newRange2: undefined});
		
		// Positions after Range
		result = utils.modifyRange(
			new vscode.Position(60, 6),
			new vscode.Position(61, 0),
			range,
			decoration
		);

		assert.deepStrictEqual(result, {newRange1: range, newRange2: undefined});
	});

	test('Test modifyRange with touching positions', () => {
		let range = new vscode.Range(new vscode.Position(50, 0), new vscode.Position(60, 5));
		
		// Positions touching start of Range
		let result = utils.modifyRange(
			new vscode.Position(40, 0),
			new vscode.Position(50, 1),
			range,
			decoration);
		
		let expectedRange = new vscode.Range(new vscode.Position(50, 1), new vscode.Position(60, 5));
		assert.deepStrictEqual(result, {newRange1: expectedRange, newRange2: undefined});
		
		// Positions touching end of Range
		result = utils.modifyRange(
			new vscode.Position(60, 4),
			new vscode.Position(61, 0),
			range,
			decoration
		);

		expectedRange = new vscode.Range(new vscode.Position(50, 0), new vscode.Position(60, 4));
		assert.deepStrictEqual(result, {newRange1: expectedRange, newRange2: undefined});
	});

	test('Test modifyRange with inside positions', () => {
		let range = new vscode.Range(new vscode.Position(50, 0), new vscode.Position(60, 5));
		
		// Positions inside of Range
		let result = utils.modifyRange(
			new vscode.Position(55, 0),
			new vscode.Position(55, 10),
			range,
			decoration);
		
		let expectedRange1 = new vscode.Range(new vscode.Position(50, 0), new vscode.Position(55, 0));
		let expectedRange2 = new vscode.Range(new vscode.Position(55, 10), new vscode.Position(60, 5));
		assert.deepStrictEqual(result, {newRange1: expectedRange1, newRange2: expectedRange2});
	});

	test('Test getConfigColor', () => {
		assert.ok(utils.getConfigColor());
	});

	test('Test Recorder hasFile', () => {
		let recorder = new Recorder();
		assert.ok(!recorder.hasFile("file"));
		recorder.setFile("file path", {});
		assert.ok(recorder.hasFile("file path"));
	});

	test('Test Recorder getFileRanges', () => {
		let recorder = new Recorder();
		assert.deepStrictEqual(recorder.getFileRanges("file path"), {});
		recorder.setFile("file path", {range: "range"});
		assert.deepStrictEqual(recorder.getFileRanges("file path"), {range: "range"});
	});

	test('Test Recorder hasFileRange', () => {
		let recorder = new Recorder();
		assert.ok(!recorder.hasFileRange("file path", "range"));
		recorder.setFile("file path", {range: "range"});
		assert.ok(recorder.hasFileRange("file path", "range"));
	});

	test('Test Recorder getFileRange', () => {
		let recorder = new Recorder();
		assert.strictEqual(recorder.getFileRange("file path", "range"), undefined);
		recorder.setFile("file path", {range: "range"});
		assert.strictEqual(recorder.getFileRange("file path", "range"), "range");
	});

	test('Test Recorder addFileRange', () => {
		let recorder = new Recorder();
		let range = new vscode.Range(new vscode.Position(0,0), new vscode.Position(1,0));
		assert.strictEqual(recorder.addFileRange("file path", "range", range, decoration, "color"), undefined);
		recorder.setFile("file path", {range: "range"});
		assert.ok(recorder.hasFileRange("file path", "range"));
	});

	test('Test removeFileRange', () => {
		let recorder = new Recorder();
		recorder.setFile("file path", {range: "range"});
		recorder.removeFileRange("file path", "range");
		assert.ok(!recorder.hasFileRange("file path", "range"));
	});

	test('Test Recorder removeFile', () => {
		let recorder = new Recorder();
		recorder.setFile('file path', {});
		recorder.removeFile('file path');
		assert.ok(!recorder.hasFile("file path"));
	});
});