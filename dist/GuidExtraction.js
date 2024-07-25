"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTable = processTable;
exports.extractMvalueInfoFromFile = extractMvalueInfoFromFile;
exports.removeUnnecessaryComments = removeUnnecessaryComments;
exports.removeParagraphTags = removeParagraphTags;
const fs = __importStar(require("fs"));
// Extracting mvalue and associated peripheral information
// Inputs: A single line from an HTML file where it is known an mvalue exists.
// Outputs: The value in the groupdesc field.
function extractNameFromLine(line) {
    let nameStartIndex = line.indexOf("groupdesc=\"") + 11;
    let lastApostrapheIndex = line.indexOf("\"", nameStartIndex);
    return line.substring(nameStartIndex, lastApostrapheIndex);
}
// Inputs: A single line from an HTML file where it is known an mvalue exists.
// Outputs: The value in the groupguidkey field.
function extractGuidFromLine(line) {
    let guidStartIndex = line.indexOf("groupguidkey=\"") + 14;
    let lastApostrapheIndex = line.indexOf("\"", guidStartIndex);
    return line.substring(guidStartIndex, lastApostrapheIndex);
}
// Inputs: A line in the tr section of the table.
// Outputs: returns the extracted column name.
function extractColumnName(line) {
    let reversedLine = line.split('').reverse().join('');
    while (reversedLine.indexOf("/") != -1) {
        reversedLine = reversedLine.substring(reversedLine.indexOf("/") + 1);
    }
    return reversedLine.substring(reversedLine.indexOf("<") + 1, reversedLine.indexOf(">")).split('').reverse().join('');
}
// Inputs: A line in the tr section.
// Outputs: The colspan of this tr section line
function extractColumnSpan(line) {
    let colspanIndex = line.indexOf("colspan=\"");
    if (colspanIndex == -1) {
        return 1;
    }
    else {
        let stopIndex = line.indexOf("\"", colspanIndex + 9);
        return parseInt(line.substring(colspanIndex + 9, stopIndex));
    }
}
// Input: A tr section as a string.
// Output: Returns if this section is a column name descriptor
function isColumnDescriptorTrSection(trSection) {
    return trSection.indexOf("<mvalue") == -1;
}
// Inputs: The content inside of a tr section (excluding the tr).
// Outputs: The important information inside of the tr section.
function processTrSection(trSection) {
    if (isColumnDescriptorTrSection(trSection)) {
        let columnNames = [];
        let lines = trSection.split('\n');
        lines.forEach((line) => {
            if (line.indexOf("<td") !== -1) {
                let columnName = extractColumnName(line);
                let span = extractColumnSpan(line);
                for (let i = 0; i < span; i++) {
                    columnNames.push(columnName);
                }
            }
        });
        return columnNames;
    }
    else {
        // First column is row name, after that is mvalues
        let linesInTrSection = trSection.split('\n');
        if (linesInTrSection.length == 0)
            return [];
        let rowAndMvalues = [];
        let firstLine = true;
        linesInTrSection.forEach((line) => {
            if (line.indexOf("<td") !== -1) {
                if (firstLine) {
                    rowAndMvalues.push(extractColumnName(line)); // First line will be row name
                    firstLine = false;
                }
                else {
                    rowAndMvalues.push(extractNameFromLine(line));
                    rowAndMvalues.push(extractGuidFromLine(line));
                }
            }
        });
        return rowAndMvalues;
    }
}
// Input: A table section from the HTML file.
// Output: A dictionary in the format { mvalue_name : [mvalue_guid, mvalue_parent_table, mvalue_row, mvalue_column] }
function processTable(tableSection) {
    let trStartIndex = tableSection.indexOf("<tr>");
    let tableColumns = [];
    let tableName = "";
    let tableMvalueInfo = new Map();
    while (trStartIndex != -1) {
        let trEndIndex = tableSection.indexOf("</tr>", trStartIndex);
        if (trEndIndex == -1) {
            break;
        }
        let nextTrSection = tableSection.substring(trStartIndex + 4, trEndIndex);
        let trSectionColumnInformation = processTrSection(nextTrSection);
        if (isColumnDescriptorTrSection(nextTrSection)) {
            // First is table name, remaining are column names
            if (tableColumns.length == 0 && trSectionColumnInformation.length > 0) {
                tableName = trSectionColumnInformation[0];
                tableColumns = trSectionColumnInformation.slice(1); // remove first element which is table name
            }
            else if (tableColumns.length != 0 && trSectionColumnInformation.length == tableColumns.length + 1) {
                for (let i = 1; i < trSectionColumnInformation.length; i++) {
                    tableColumns[i - 1] = tableColumns[i - 1] + " " + trSectionColumnInformation[i];
                }
            }
        }
        else {
            let rowName = trSectionColumnInformation[0];
            for (let index = 1; index < trSectionColumnInformation.length; index += 2) {
                if (trSectionColumnInformation[index] != "") {
                    tableMvalueInfo.set(trSectionColumnInformation[index], [
                        trSectionColumnInformation[index + 1],
                        tableName,
                        rowName,
                        tableColumns[Math.floor((index - 1) / 2)]
                    ]);
                }
            }
        }
        trStartIndex = tableSection.indexOf("<tr>", trEndIndex);
    }
    return tableMvalueInfo;
}
// Returns mvalue info in the form mvalue_name: [mvalue_guid, parent table, row name, column name]
function extractMvalueInfoFromFile(filePath) {
    let htmlFile = fs.readFileSync(filePath, 'utf-8');
    let fileMValueInformation = new Map();
    let currentIndex = 0;
    while (currentIndex < htmlFile.length) {
        let nextTableStart = htmlFile.indexOf("<table", currentIndex);
        let nextMvalueStart = htmlFile.indexOf("<mvalue", currentIndex);
        // If no more tables or mvalues, break the loop
        if (nextTableStart === -1 && nextMvalueStart === -1) {
            break;
        }
        if (nextMvalueStart !== -1 && (nextMvalueStart < nextTableStart || nextTableStart === -1)) {
            let mvalueEnd = htmlFile.indexOf("</mvalue>", nextMvalueStart);
            if (mvalueEnd === -1) {
                break;
            }
            let mvalueSection = htmlFile.substring(nextMvalueStart, mvalueEnd + 9);
            let mvalueName = extractNameFromLine(mvalueSection);
            let mvalueGuid = extractGuidFromLine(mvalueSection);
            fileMValueInformation.set(mvalueName, [mvalueGuid, "", "", ""]);
            currentIndex = mvalueEnd + 9;
        }
        else if (nextTableStart !== -1) {
            let tableEnd = htmlFile.indexOf("</table>", nextTableStart);
            if (tableEnd === -1) {
                break;
            }
            let tableSection = htmlFile.substring(nextTableStart, tableEnd + 8);
            let tableMvalueInfo = processTable(tableSection);
            tableMvalueInfo.forEach((value, key) => {
                fileMValueInformation.set(key, value);
            });
            currentIndex = tableEnd + 8;
        }
        else {
            // Fallback to prevent infinite loop
            currentIndex++;
        }
    }
    return fileMValueInformation;
}
// Inputs: File path of the target HTML file.
// Outputs: Removes comments that contain tags which may mess up extracting information and saves file.
function removeUnnecessaryComments(filePath) {
    let HtmlFile = fs.readFileSync(filePath, 'utf-8');
    let commentStartIndex = HtmlFile.indexOf("<!--");
    while (commentStartIndex != -1) {
        let commentEndIndex = HtmlFile.indexOf("-->");
        if (commentEndIndex == -1) {
            HtmlFile = HtmlFile.substring(0, commentStartIndex);
            break;
        }
        else {
            let comment = HtmlFile.substring(commentStartIndex + 3, commentEndIndex);
            if (comment.indexOf("<") != -1) {
                HtmlFile = HtmlFile.substring(0, commentStartIndex) + HtmlFile.substring(commentEndIndex + 3);
            }
        }
    }
    fs.writeFileSync(filePath, HtmlFile, 'utf-8');
}
// Inputs: File path to target html file.
// Ouptuts: Removes all the excessive paragraph tags
function removeParagraphTags(filePath) {
    let HtmlFile = fs.readFileSync(filePath, 'utf-8');
    let ptags = "<p></p>\n";
    let result_string = HtmlFile.replace(ptags, '');
    fs.writeFileSync(filePath, HtmlFile, 'utf-8');
}
//# sourceMappingURL=GuidExtraction.js.map