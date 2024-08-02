import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile } from './GuidExtraction';

const AzureMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/AzureSummary.html');

const UserInputPath = path.resolve(__dirname, '../Txts/userInput.txt');
const AzureVariablesPath = path.resolve(__dirname, '../Txts/AzureVariables.csv');

const TargetMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
//const TargetWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/OtherWorksheet.html');
//const TargetSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/OtherSummary.html');

const NewMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/NewMeasurements.html');
const NewWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/NewWorksheet.html');
const NewSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/NewSummary.html');



function extractAzureVariable(line: string) : string {
    let start_index = line.indexOf('for ') + 4;
    let end_index = line.indexOf(' (');
    return line.substring(start_index, end_index).trim();
}

function extractUserAnswer(line: string) : string | null {
    let start_index = line.indexOf('[') + 1;
    let end_index = line.indexOf(']');
    if (start_index === end_index) {
        return null;
    } else {
        return line.substring(start_index, end_index).trim();
    }
}

function verifyResponse(response: string, TargetVariables: VariableInformation[]): VariableInformation | null {
    response = response.trim().toLowerCase();
    const match = TargetVariables.find(variable => variable.name.trim().toLowerCase() == response);
    return match || null;
}


// Specifically for measurements page.
function createMeasurementsCopy(matches: Match[], AzureVariables: VariableInformation[]) {
    let htmlFile = fs.readFileSync(AzureMeasurementsFilePath, 'utf-8');
    matches.forEach((match: Match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        htmlFile = htmlFile.replace(regex, match.targetVarGuid);
    });

    AzureVariables.forEach(azureVar => {
        if (!matches.some(match => match.azureVarName === azureVar.name)) {
            const regex = new RegExp(azureVar.guid, 'g');
            htmlFile = htmlFile.replace(regex, '');
        }
    });

    const unusedAzureVariables = AzureVariables.filter(azure => 
        !matches.some(match => match.azureVarName === azure.name)
    );

    fs.writeFileSync(NewMeasurementFilePath, htmlFile, 'utf-8');

    return unusedAzureVariables;
}

// For worksheet and summary pages
function createOtherCopies(matches: Match[], AzureVariables: VariableInformation[]) {
    let WorksheetFile = fs.readFileSync(AzureWorksheetFilePath, 'utf-8');
    matches.forEach((match: Match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        WorksheetFile = WorksheetFile.replace(regex, match.targetVarGuid);
    });

    AzureVariables.forEach(azureVar => {
        if (!matches.some(match => match.azureVarName === azureVar.name)) {
            const regex = new RegExp(azureVar.guid, 'g');
            WorksheetFile = WorksheetFile.replace(regex, '');
        }
    });

    fs.writeFileSync(NewWorksheetFilePath, WorksheetFile, 'utf-8');

    let SummaryFile = fs.readFileSync(AzureSummaryFilePath, 'utf-8');
    matches.forEach((match: Match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        SummaryFile = SummaryFile.replace(regex, match.targetVarGuid);
    });

    AzureVariables.forEach(azureVar => {
        if (!matches.some(match => match.azureVarName === azureVar.name)) {
            const regex = new RegExp(azureVar.guid, 'g');
            SummaryFile = SummaryFile.replace(regex, '');
        }
    });

    fs.writeFileSync(NewSummaryFilePath, SummaryFile, 'utf-8');
}

function getUserAnswers(AzureVariables: VariableInformation[], TargetVariables: VariableInformation[]) {
    let userAnswers: string[] = fs.readFileSync(UserInputPath, 'utf-8').split('\n');
    let matches: Match[] = [];

    userAnswers.forEach((line: string) => {
        let answer = extractUserAnswer(line);
        if (answer) {
            let answerInformation = verifyResponse(answer, TargetVariables);
            if (answerInformation) {
                let azureVarName = extractAzureVariable(line);
                let azureVar: VariableInformation = AzureVariables.find(variable => variable.name === azureVarName)!;
                matches.push({ azureVarName: azureVar.name, azurevarGuid: azureVar.guid, targetVarName: answerInformation.name, targetVarGuid:answerInformation.guid });
            }
        }
    });
    return matches;
}

function getUserAnswers2(AzureVariables: VariableInformation[], TargetVariables: VariableInformation[]) {
    let userAnswers: string[] = fs.readFileSync(AzureVariablesPath, 'utf-8').split('\n');
    let matches: Match[] = [];

    userAnswers.forEach((line: string) => {
        let answer = line.split(',')[5];
        answer = answer.substring(1, answer.length - 1);
        if (answer && answer.length > 0) {
            let answerInformation = verifyResponse(answer, TargetVariables);
            if (answerInformation) {
                let azureVarName = line.split(',')[0];
                azureVarName = azureVarName.substring(1, azureVarName.length - 1);
                let azureVar: VariableInformation = AzureVariables.find(variable => variable.name === azureVarName)!;
                matches.push({ azureVarName: azureVar.name, azurevarGuid: azureVar.guid, targetVarName: answerInformation.name, targetVarGuid:answerInformation.guid });
            }
        }
    });
    return matches;
}

function main2(AzureMeasurementsFilePath: string, TargetMeasurementFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureMeasurementsFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetMeasurementFilePath)));

    let matches = getUserAnswers2(AzureVariables, TargetVariables);

    let unused = createMeasurementsCopy(matches, AzureVariables);
    createOtherCopies(matches, AzureVariables);
    
    console.log('\n\nThe following may potentially need to have a mapping created or found elsewhere due to being unmatched:\n');
    unused.forEach((variable: VariableInformation) => {
        console.log(`${variable.name}\t${variable.guid}`);
    });
}

main2(AzureMeasurementsFilePath, TargetMeasurementFilePath);