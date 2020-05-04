import * as vscode from 'vscode';

// Generates a unique string key for the Map for a given start and end position. 
export let generateRangeKey = (startPosition: vscode.Position, endPosition: vscode.Position): string  => {
    return `${startPosition.line}${startPosition.character}${endPosition.line}${endPosition.character}`; 
};

// Checks if position if below, in, or above range.
let posToRange = (position: vscode.Position, range: vscode.Range): number => {

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

// Records all highlights done to files in a workspace.
// TODO: Documentation / clean up
export class Recorder {
    files: {
        [file: string]: {
            [range: string]: Highlight
        }
    };

    // TODO: Fix saving object
    constructor(files: void | any) {
        this.files = {};
        if (files) {
            for (let file in files) {
                this.files[file] = {};
                for (let range in files[file]) {
                    let l1 = files[file][range].range[0].line;
                    let c1 = files[file][range].range[0].character;

                    let l2 = files[file][range].range[1].line;
                    let c2 = files[file][range].range[1].character;
                    let rangeObj = new vscode.Range(new vscode.Position(l1, c1), new vscode.Position(l2, c2));

                    const decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: '#fdff322f',
                    });

                    this.files[file][range] = new Highlight(rangeObj, decoration);
                }
            }
        }
    }

    public hasFile(filePath: string): boolean {
        return undefined !== this.files[filePath];
    }

    public setFile(filePath: string, obj: any) {
        this.files[filePath] = obj;
    }

    public getFileRanges(filePath: string): {[range: string]: Highlight} {
        return this.files[filePath];
    }

    public hasFileRange(filePath: string, rangeKey: string): boolean {
        if (this.files[filePath]) {
            if (this.files[filePath][rangeKey]) {
                return true;
            }
        }
        return false;
    }

    public getFileRange(filePath: string, rangeKey: string): Highlight | undefined {
        if (this.files[filePath]) {
            if (this.files[filePath][rangeKey]) {
                return this.files[filePath][rangeKey];
            }
        }

        return undefined;
    }

    public addFileRange(filePath: string, rangeKey: string, range: vscode.Range, decoration: vscode.TextEditorDecorationType) {
        if (this.files[filePath]) {
            this.files[filePath][rangeKey] = new Highlight(range, decoration);
        }
    }

    public removeFileRange(filePath: string, rangeKey: string) {
        if (this.files[filePath] && this.files[filePath][rangeKey]) {
            delete this.files[filePath][rangeKey];
        }
    }

    public removeFile(filePath: string) {
        if (this.files[filePath]) {
            delete this.files[filePath];
        }
    }
}

export class Highlight {
    range: vscode.Range;
    decoration: vscode.TextEditorDecorationType;

    constructor(range: vscode.Range, decoration: vscode.TextEditorDecorationType) {
        this.range = range;
        this.decoration = decoration;
    }
}
