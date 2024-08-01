import path from 'path';
import * as fs from 'fs';
import { extractMvalueInfoFromFile, removeParagraphTags, removeUnnecessaryComments } from './GuidExtraction';
import { VariableInformation, Match } from './interfaces';
import { cleanExtractedMvalueInfo, storeAsVariableInformation, narrowDownList } from './MValueMatching';

const AzureFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const TargetFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');

const UserInputPath = path.resolve(__dirname, '../Txts/userInput.txt');
const AzureVariablesPath = path.resolve(__dirname, '../Txts/AzureVariables.csv');
const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.csv');

export function targetJsonToCsv(variables: any[]): string {
    // Check if variables is defined and not empty
    if (!variables || variables.length === 0) {
        throw new Error("The variables array is undefined or empty.");
    }

    const headers = Object.keys(variables[0]);
    const csvRows = [];

    // Add the headers row
    csvRows.push(headers.join(','));

    // Add each row of data
    for (const row of variables) {
        const values = headers.map((header) => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

export function azureJsonToCsv(variables: any[]): string {
    // Check if variables is defined and not empty
    if (!variables || variables.length === 0) {
        throw new Error("The variables array is undefined or empty.");
    }

    const headers = Object.keys(variables[0]);
    headers.push("Other ID"); // Add "Other ID" as the last header
    const csvRows = [];

    // Add the headers row
    csvRows.push(headers.join(','));

    // Add each row of data
    for (const row of variables) {
        const values = headers.map((header) => {
            // Check if the header is "Other ID", if so, leave it blank
            if (header === "Other ID") {
                return `""`;
            } else {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            }
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}


function formatOutput(azure: VariableInformation[], target: VariableInformation[]) {
    let azureTxt = 'AZURE VARIABLE INFORMATION\n';
    azure.forEach((azureVar: VariableInformation) => {
        azureTxt += azureVar.name + '\t' + azureVar.guid + '\t' + azureVar.table + '\t' + azureVar.column + '\t' + azureVar.row + '\n';
    });
    fs.writeFileSync(AzureVariablesPath, azureTxt, 'utf-8');

    let targetTxt = 'TARGET VARIABLE INFORMATION\n';
    target.forEach((targetVar: VariableInformation) => {
        targetTxt += targetVar.name + '\t' + targetVar.guid + '\t' + targetVar.table + '\t' + targetVar.column + '\t' + targetVar.row + '\n';
    });
    fs.writeFileSync(TargetVariablesPath, targetTxt, 'utf-8');
}

function formatOutput2(azure: VariableInformation[], target: VariableInformation[]) {
    let azureCsv = azureJsonToCsv(azure);
    fs.writeFileSync(AzureVariablesPath, azureCsv, 'utf-8');

    let targetCsv = targetJsonToCsv(target);
    fs.writeFileSync(TargetVariablesPath, targetCsv, 'utf-8');
}

function main(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    formatOutput2(AzureVariables, TargetVariables);

    let allPossibleMatches : Map<string, string[]> = new Map();
    AzureVariables.forEach((AzureVar: VariableInformation) => {
        allPossibleMatches.set(AzureVar.name, narrowDownList(AzureVar, TargetVariables));
    });

    let txtFile = 'Enter the following matches in the [answer] brackets. If a match does not exist, leave it blank.';

    AzureVariables.forEach((variable: VariableInformation) => {
        let possibleMatch = allPossibleMatches.get(variable.name);
        if (possibleMatch && possibleMatch.length > 0) {
            txtFile += `\n${variable.name} (Recommended: ${possibleMatch}): []`;
        } else {
            txtFile += `\n${variable.name}: []`;
        }
    });
    
    fs.writeFileSync(UserInputPath, txtFile, 'utf-8');
}


main(AzureFilePath, TargetFilePath);
