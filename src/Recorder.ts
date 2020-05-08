import * as vscode from 'vscode';

/**
 * Class that records all highlights done to files for a workspace.
 */
export class Recorder {
    files: {
        [file: string]: {
            [range: string]: Highlight
        }
    };

    // TODO: Refactor saving object maybe
    /**
     * @param files JSON object that conforms to the Recorder class.
     */
    constructor(files?: any) {
        this.files = {};
        if (files) {
            // for each file path in JSON create mapping with Range, Decoration, and Highlight objects.
            for (let file in files) {
                this.files[file] = {};
                for (let range in files[file]) {
                    // Create Range Object
                    let l1 = files[file][range].range[0].line;
                    let c1 = files[file][range].range[0].character;

                    let l2 = files[file][range].range[1].line;
                    let c2 = files[file][range].range[1].character;
                    let rangeObj = new vscode.Range(new vscode.Position(l1, c1), new vscode.Position(l2, c2));

                    let color = files[file][range].color;
                    let decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: color,
                    });

                    this.files[file][range] = {range: rangeObj, decoration, color};
                }
            }
        }
    }

    /**
     * If the Recorder has file that has highlights
     * @param filePath Unique path to file from workspace.
     * @returns true if file exists, false otherwise.
     */
    public hasFile(filePath: string): boolean {
        return undefined !== this.files[filePath];
    }

    /**
     * Add a file path to Recorder with object set.
     * @param filePath Unique path to file from workspace.
     * @param obj Blank object or instance of a object that conforms to Recorder mapping.
     */
    public setFile(filePath: string, obj: any): void {
        this.files[filePath] = obj;
    }

    /**
     * Get all the Highlight Ranges for a file path.
     * @param filePath Unique path to file from workspace.
     * @returns Object that maps a range key to a Highlight interface.
     */
    public getFileRanges(filePath: string): {[range: string]: Highlight} {
        if (this.files[filePath]) {
            return this.files[filePath];
        }
        return {};
    }

    /**
     * True if the file path has the range.
     * @param filePath Unique path to file from workspace.
     * @param rangeKey Unique string for that range, use generateRangeKey to create.
     * @returns true if file path has range, false otherwise.
     */
    public hasFileRange(filePath: string, rangeKey: string): boolean {
        if (this.files[filePath]) {
            if (this.files[filePath][rangeKey]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get a single range and highlight from a file path.
     * @param filePath Unique path to file from workspace.
     * @param rangeKey Unique string for that range, use generateRangeKey to create.
     * @returns Highlight interface if range exists on file, else undefined.
     */
    public getFileRange(filePath: string, rangeKey: string): Highlight | undefined {
        if (this.files[filePath]) {
            if (this.files[filePath][rangeKey]) {
                return this.files[filePath][rangeKey];
            }
        }
    }

    /**
     * Add a file range and highlight to the file path.
     * @param filePath Unique path to file from workspace.
     * @param rangeKey Unique string for that range, use generateRangeKey to create. 
     * @param range Range object to add to mapping.
     * @param decoration Decoration that will highlight the text.
     * @param color Color used on the decoration, e.g. #FFFFFF.
     */
    public addFileRange(filePath: string,
                        rangeKey: string,
                        range: vscode.Range,
                        decoration: vscode.TextEditorDecorationType,
                        color: string): void {
        if (this.files[filePath]) {
            this.files[filePath][rangeKey] = {range, decoration, color};
        }
    }

    /**
     * Remove range and highlight from file path.
     * @param filePath Unique path to file from workspace.
     * @param rangeKey Unique string for that range, use generateRangeKey to create. 
     */
    public removeFileRange(filePath: string, rangeKey: string): void {
        if (this.files[filePath] && this.files[filePath][rangeKey]) {
            delete this.files[filePath][rangeKey];
        }
    }

    /**
     * Remove file path from Recorder.
     * @param filePath Unique path to file from workspace.
     */
    public removeFile(filePath: string): void {
        if (this.files[filePath]) {
            delete this.files[filePath];
        }
    }
}

/**
 * Highlight Interface that holds Range, Color, and decoration for Range.
 */
interface Highlight {
    range: vscode.Range;
    decoration: vscode.TextEditorDecorationType;
    color: string;
}