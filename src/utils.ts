import * as vscode from 'vscode';

// Generates a unique string key for the Map for a given start and end position. 
export let generateRangeKey = (startPosition: vscode.Position, endPosition: vscode.Position): string  => {
    return `${startPosition.line}${startPosition.character}${endPosition.line}${endPosition.character}`; 
};

// Checks if position if below, in, or above range.
export let posToRange = (position: vscode.Position, range: vscode.Range): number => {

    // Check if below
    if (position.line < range.start.line) {
        return 0;
    } else if (position.line === range.start.line) {
        if (position.character <= range.start.character) {
            return 0;
        }
    }

    // Check if above
    if (position.line > range.end.line) {
        return 2;
    } else if (position.line === range.end.line) {
        if (position.character >= range.end.character) {
            return 2;
        }
    }

    return 1;
};

// Modifies the range of a given highlight based on the start and end position the user specified to remove.
export let modifyRange = (
    startPosition: vscode.Position, 
    endPosition: vscode.Position, 
    range: vscode.Range, 
    decoration: vscode.TextEditorDecorationType): {newRange1: vscode.Range, newRange2: vscode.Range | undefined} | undefined => {

    let startLoc = posToRange(startPosition, range);
    let endLoc = posToRange(endPosition, range);
    console.log(startLoc, endLoc);

    // If start is in and end is above trim to the start
    if (startLoc === 1 && endLoc === 2) {
        let newRange1 = new vscode.Range(range.start, startPosition);
        return {newRange1, newRange2: undefined};
    }

    // If end is in and start is below trim to end
    if (startLoc === 0 && endLoc === 1) {
        let newRange1 = new vscode.Range(endPosition, range.end);
        return {newRange1, newRange2: undefined};
    }

    // if start is below and end is above remove highlight
    if (startLoc === 0 && endLoc === 2) {
        decoration.dispose();
        return undefined;
    }

    // if both in highlight then split highlight into two.
    if (startLoc === 1 && endLoc === 1) {
        let newRange1 = new vscode.Range(range.start, startPosition);
        let newRange2 = new vscode.Range(endPosition, range.end);
        return {newRange1, newRange2};
    }

    return {newRange1: range, newRange2: undefined};
};

