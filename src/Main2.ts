import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile } from './GuidExtraction';

const AzureMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/AzureSummary.html');

const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.csv');

const TargetMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
const TargetWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/OtherWorksheet.html');
const TargetSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/OtherSummary.html');

//const NewMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/NewMeasurements.html');
const NewWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/NewWorksheet.html');
const NewSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/NewSummary.html');

function verifyResponse(response: string, AzureVariables: VariableInformation[]): VariableInformation | null {
    response = response.trim().toLowerCase();
    const match = AzureVariables.find(variable => variable.name.trim().toLowerCase() == response);
    return match || null;
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

function getUserAnswers2(AzureVariables: VariableInformation[], TargetVariables: VariableInformation[]) {
    let userAnswers: string[] = fs.readFileSync(TargetVariablesPath, 'utf-8').split('\n');
    let matches: Match[] = [];

    userAnswers.forEach((line: string) => {
        let answer = line.split(',')[5];
        if (answer) {
            answer = answer.substring(1, answer.length - 1);
            if (answer && answer.length > 0) {
                let answerInformation = verifyResponse(answer, AzureVariables);
                if (answerInformation) {
                    let targetVarName = line.split(',')[0];
                    targetVarName = targetVarName.substring(1, targetVarName.length - 1);
                    let targetVar: VariableInformation = TargetVariables.find(variable => variable.name === targetVarName)!;
                    matches.push({ azureVarName: answerInformation.name, azurevarGuid: answerInformation.guid, targetVarName: targetVar.name, targetVarGuid: targetVar.guid });
                }
            }
        }
    });
    return matches;
}

function main2(AzureMeasurementsFilePath: string, TargetMeasurementFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureMeasurementsFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetMeasurementFilePath)));

    let matches = getUserAnswers2(AzureVariables, TargetVariables);
    console.log(matches);

    createOtherCopies(matches, AzureVariables);
}

main2(AzureMeasurementsFilePath, TargetMeasurementFilePath);