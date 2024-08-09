import path from 'path';
import * as fs from 'fs';
import { extractMvalueInfoFromFile, removeParagraphTags, removeUnnecessaryComments } from './GuidExtraction';
import { VariableInformation, Match } from './interfaces';
import { cleanExtractedMvalueInfo, storeAsVariableInformation, narrowDownList } from './MValueMatching';

const AzureMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/AzureSummary.html');
const TargetMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');

const AzureVariablesPath = path.resolve(__dirname, '../Txts/AzureVariables.csv');
const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.csv');

const StudyDatePath = path.resolve(__dirname, '../Txts/studydate.txt');

function azureJsonToCsv(variables: any[]): string {
    if (!variables || variables.length === 0) {
        return "";
    }

    const headers = Object.keys(variables[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of variables) {
        const values = headers.map((header) => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// Update to include reccomendations now with updated matching
function targetJsonToCsv(variables: any[]): string {
    if (!variables || variables.length === 0) {
        return "";
    }
    
    const headers = Object.keys(variables[0]);
    headers.push("Matching Azure Variable Name");
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of variables) {
        const values = headers.map((header) => {
            if (header === "Matching Azure Variable Name") {
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
    let azureCsv = azureJsonToCsv(azure);
    fs.writeFileSync(AzureVariablesPath, azureCsv, 'utf-8');

    let targetCsv = targetJsonToCsv(target);
    fs.writeFileSync(TargetVariablesPath, targetCsv, 'utf-8');

    let date = "Enter new study date guid: []";
    fs.writeFileSync(StudyDatePath, date, 'utf-8');
}

function cleanFiles() {
    removeParagraphTags(AzureMeasurementsFilePath);
    removeUnnecessaryComments(AzureMeasurementsFilePath);

    removeParagraphTags(AzureWorksheetFilePath);
    removeUnnecessaryComments(AzureWorksheetFilePath);

    removeParagraphTags(AzureSummaryFilePath);
    removeParagraphTags(AzureSummaryFilePath);

    removeParagraphTags(TargetMeasurementsFilePath);
    removeUnnecessaryComments(TargetMeasurementsFilePath);
}

function main(AzureFilePath: string, TargetFilePath: string) {
    cleanFiles();
    
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    formatOutput(AzureVariables, TargetVariables);
}


main(AzureMeasurementsFilePath, TargetMeasurementsFilePath);
