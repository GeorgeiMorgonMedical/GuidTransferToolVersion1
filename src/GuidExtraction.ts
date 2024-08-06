import * as fs from 'fs';

// Extracting mvalue and associated peripheral information

// Inputs: A single line from an HTML file where it is known an mvalue exists.
// Outputs: The value in the groupdesc field.
function extractNameFromLine(line: string) : string {
    let nameStartIndex: number = line.indexOf("groupdesc=\"")  + 11;
    let lastApostrapheIndex: number = line.indexOf("\"", nameStartIndex);
    return line.substring(nameStartIndex, lastApostrapheIndex);
}

// Inputs: A single line from an HTML file where it is known an mvalue exists.
// Outputs: The value in the groupguidkey field.
function extractGuidFromLine(line: string) : string {
    let guidStartIndex: number = line.indexOf("groupguidkey=\"")  + 14;
    let lastApostrapheIndex: number = line.indexOf("\"", guidStartIndex);
    return line.substring(guidStartIndex, lastApostrapheIndex);
}

// Inputs: A line in the tr section of the table.
// Outputs: returns the extracted column name.
function extractColumnName(line: string) : string {
    let reversedLine: string = line.split('').reverse().join('');
    while (reversedLine.indexOf("/") != -1) {
        reversedLine = reversedLine.substring(reversedLine.indexOf("/") + 1);
    }
    return reversedLine.substring(reversedLine.indexOf("<") + 1, reversedLine.indexOf(">")).split('').reverse().join('');
}


// Inputs: A line in the tr section.
// Outputs: The colspan of this tr section line
function extractColumnSpan(line: string) : number {
    let colspanIndex: number = line.indexOf("colspan=\"");
    if (colspanIndex == -1) {
        return 1;
    } else {
        let stopIndex: number = line.indexOf("\"", colspanIndex + 9);
        return parseInt(line.substring(colspanIndex + 9, stopIndex));
    }
}

// Input: A tr section as a string.
// Output: Returns if this section is a column name descriptor
function isColumnDescriptorTrSection(trSection: string) : boolean {
    return trSection.indexOf("<mvalue") == -1;
}

// Inputs: The content inside of a tr section (excluding the tr).
// Outputs: The important information inside of the tr section.
function processTrSection(trSection: string) : string[] {
    if (isColumnDescriptorTrSection(trSection)) {
        let columnNames: string[] = [];
        let lines: string[] = trSection.split('\n');

        lines.forEach((line) => {
            if (line.indexOf("<td") !== -1) {
                let columnName : string = extractColumnName(line);
                let span : number = extractColumnSpan(line);
                
                for (let i = 0; i < span; i++) {
                    columnNames.push(columnName);
                }
            }
        });
        return columnNames;
    } else {
        // First column is row name, after that is mvalues
        let linesInTrSection: string[] = trSection.split('\n');
        if (linesInTrSection.length == 0) return [];
        
        let rowAndMvalues: string[] = [];
        let firstLine: Boolean = true;
        linesInTrSection.forEach((line) => {
            if (line.indexOf("<td") !== -1) {
                if (firstLine) {
                    rowAndMvalues.push(extractColumnName(line)); // First line will be row name
                    firstLine = false;
                } else {
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
export function processTable(tableSection: string): Map<string, string[]> {
    let trStartIndex = tableSection.indexOf("<tr>");
    let tableColumns: string[] = [];
    let tableName: string = "";
    let tableMvalueInfo: Map<string, string[]> = new Map<string, string[]>();

    while (trStartIndex != -1) {
        let trEndIndex = tableSection.indexOf("</tr>", trStartIndex);
        if (trEndIndex == -1) {
            break;
        }

        let nextTrSection: string = tableSection.substring(trStartIndex + 4, trEndIndex);
        let trSectionColumnInformation: string[] = processTrSection(nextTrSection);

        if (isColumnDescriptorTrSection(nextTrSection)) {
            // First is table name, remaining are column names
            if (tableColumns.length == 0 && trSectionColumnInformation.length > 0) {
                tableName = trSectionColumnInformation[0];
                tableColumns = trSectionColumnInformation.slice(1); // remove first element which is table name
            } 
            else if (tableColumns.length != 0 && trSectionColumnInformation.length == tableColumns.length + 1) {
                for (let i = 1; i < trSectionColumnInformation.length; i++) {
                    tableColumns[i - 1] = tableColumns[i - 1]  + " " + trSectionColumnInformation[i];
                }
            }
        } else {
            let rowName: string = trSectionColumnInformation[0];

            for (let index: number = 1; index < trSectionColumnInformation.length; index += 2) {
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
export function extractMvalueInfoFromFile(filePath: string): Map<string, string[]> {

    let htmlFile = fs.readFileSync(filePath, 'utf-8');
    let fileMValueInformation: Map<string, string[]> = new Map<string, string[]>();
    let currentIndex: number = 0;

    while (currentIndex < htmlFile.length) {
        let nextTableStart: number = htmlFile.indexOf("<table", currentIndex);
        let nextMvalueStart: number = htmlFile.indexOf("<mvalue", currentIndex);
        
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
        } else if (nextTableStart !== -1) {

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
        } else {

            // Fallback to prevent infinite loop
            currentIndex++;
        }
    }
    return fileMValueInformation;
}



// Inputs: File path of the target HTML file.
// Outputs: Removes comments that contain tags which may mess up extracting information and saves file.
export function removeUnnecessaryComments(filePath: string) : void {
    let HtmlFile: string = fs.readFileSync(filePath, 'utf-8');
    let commentStartIndex: number = HtmlFile.indexOf("<!--");
    while (commentStartIndex != -1) {
        let commentEndIndex: number = HtmlFile.indexOf("-->");
        if (commentEndIndex == -1) {
            HtmlFile = HtmlFile.substring(0, commentStartIndex);
        } else {
            HtmlFile = HtmlFile.substring(0, commentStartIndex) + HtmlFile.substring(commentEndIndex + 3);
        }
        commentStartIndex = HtmlFile.indexOf("<!--");
    }
    fs.writeFileSync(filePath, HtmlFile, 'utf-8');
}

// Inputs: File path to target html file.
// Ouptuts: Removes all the excessive paragraph tags
export function removeParagraphTags(filePath: string) : void {
    let HtmlFile: string = fs.readFileSync(filePath, 'utf-8');
    let ptags: string = "<p></p>\n";
    let result_string = HtmlFile.replace(ptags, '');
    
    fs.writeFileSync(filePath, result_string, 'utf-8');
} 
