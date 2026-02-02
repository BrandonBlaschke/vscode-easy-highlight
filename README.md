# VSCode Easy Highlight

Easily add or remove highlights from text.

## Features

### Highlight

![Adding highlights gif](./resources/highlight.gif)

### Remove Highlight

![Removing highlights gif](./resources/remove_highlight.gif)

### Remove All Highlights

![Remove all highlights gif](./resources/remove_all_highlights.gif)

## Extension Settings

This extension contributes the following settings:

* `easy-highlight.highlightColor`: Change the color of the highlighter by passing a valid hexadecimal color.

## Release Notes

### 1.0.0

Initial release of Easy Highlight

### 1.1.0

Update Background

### 1.2.0

Highlights updated when new text is added or removed. 

### 1.2.1

Updated packages.

### 1.3.1

Fixed issue where duplicate highlight applied to the same range would not be able to be removed. Duplicate highlight does not happen on the same range, but will not cause issue when trying to remove highlight.

### 1.4.0

Added Highlight Color command.

## Known Issues:
- Selecting a single character and typing a single character reduces highlight range.
- Newlines added or removed within highlight range causes unexpected behavior.
- Multiline highlights end line will increase when typing.


