import * as vscode from 'vscode';
import isHexColor from 'validator/lib/isHexColor';
import { Recorder } from './Recorder';
import { privateEncrypt } from 'crypto';

const DEFAULT_COLOR = '#fdff322f';

// Relative position of position compared to range.
enum RelativePosition {
    Behind,
    In,
    Ahead
}

/**
 * Generates a unique string key for the Map for a given start and end position.
 * @param startPosition Start position of the Range.
 * @param endPosition End position of the Range.
 * @returns Key that can be used to identify range in Recorder mapping.
 */ 
export let generateRangeKey = (startPosition: vscode.Position, endPosition: vscode.Position): string  => {
    return `${startPosition.line}${startPosition.character}${endPosition.line}${endPosition.character}`; 
};

/**
 * Checks if position is behind, in, or ahead given range.
 * @param position Position to check against Range.
 * @param range Range to be checked with given position.
 * @returns 0 if position is behind the range, 1 if the position is in the range, 2 if the position
 * is ahead of the range.
 */
let positionRelativeToRange = (position: vscode.Position, range: vscode.Range): RelativePosition => {

    // Check if behind
    if (position.line < range.start.line) {
        return RelativePosition.Behind;
    } else if (position.line === range.start.line && position.character <= range.start.character) {
        return RelativePosition.Behind;
    }

    // Check if ahead
    if (position.line > range.end.line) {
        return RelativePosition.Ahead;
    } else if (position.line === range.end.line && position.character >= range.end.character) {
        return RelativePosition.Ahead;
    }

    return RelativePosition.In;
};

/**
 * Modifies the range of a given highlight based on the start and end position the user specified to remove.
 * @param startPosition Start Position of range to remove.
 * @param endPosition End position of range to remove.
 * @param range Range that is highlighted.
 * @param decoration Current decoration being used for highlight.
 * @returns Object with two ranges newRange1 & newRange2 if a new Range was generated. If no Range was generated from
 * the given position then returns undefined.
 */
export let modifyRange = (
    startPosition: vscode.Position, 
    endPosition: vscode.Position, 
    range: vscode.Range, 
    decoration: vscode.TextEditorDecorationType):
    {newRange1: vscode.Range, newRange2: vscode.Range | undefined} | undefined => {

    let startLoc = positionRelativeToRange(startPosition, range);
    let endLoc = positionRelativeToRange(endPosition, range);

    // If start is in and end is ahead trim to the start
    if (startLoc === RelativePosition.In && endLoc === RelativePosition.Ahead) {
        let newRange1 = new vscode.Range(range.start, startPosition);
        return {newRange1, newRange2: undefined};
    }

    // If end is in and start is behind trim to end
    if (startLoc === RelativePosition.Behind && endLoc === RelativePosition.In) {
        let newRange1 = new vscode.Range(endPosition, range.end);
        return {newRange1, newRange2: undefined};
    }

    // if start is behind and end is ahead remove highlight
    if (startLoc === RelativePosition.Behind && endLoc === RelativePosition.Ahead) {
        decoration.dispose();
        return undefined;
    }

    // if both in highlight then split highlight into two.
    if (startLoc === RelativePosition.In && endLoc === RelativePosition.In) {
        let newRange1 = new vscode.Range(range.start, startPosition);
        let newRange2 = new vscode.Range(endPosition, range.end);
        return {newRange1, newRange2};
    }

    return {newRange1: range, newRange2: undefined};
};

/**
 * Get the color set in the JSON configuration.
 * @returns String that is formatted in hex color notation.
 */
export let getConfigColor = (): string => {

	// @ts-ignore Always returns string
    let color = vscode.workspace.getConfiguration().get("easy-highlight")["highlightColor"];
    if (isHexColor(color)) { return color; } 

    return DEFAULT_COLOR;
};

/**
 * Moves all highlight ranges by the length of the new range provided in the file filePath, if it should be updated.
 * @param range New Range Object that was inserted into the document.
 * @param filePath Path to the file that the new range is associated with.
 * @param recorder Recorder Object.
 */
export let moveRanges = (range: vscode.Range, filePath: string, recorder: Recorder): void => {
    let rangeItems = recorder.getFileRanges(filePath);
    for (let key in Object.keys(rangeItems)) {
        let highlightRange = rangeItems[key].range;
        
        // if added text on same line as highlight and its before the highlight, bump highlight by its length
        if (range.isSingleLine && highlightRange.start.line == range.start.line && highlightRange.start.character >= range.end.character) {
            let length = range.end.character - range.start.character;

            let rangeObj = new vscode.Range(
                new vscode.Position(highlightRange.start.line, highlightRange.start.character + length),
                new vscode.Position(highlightRange.end.line, highlightRange.end.character + length));
            let rangeKey = generateRangeKey(rangeObj.start, rangeObj.end);
            
            // Add new range and remove the old range
            recorder.addFileRange(filePath, rangeKey, rangeObj, rangeItems[key].decoration, rangeItems[key].color);
            recorder.removeFileRange(filePath, key);
        }
    }
}