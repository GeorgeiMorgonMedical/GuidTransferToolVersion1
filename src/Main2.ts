import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile, extractStudyDateGuid } from './GuidExtraction';

const AzureMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/AzureSummary.html');

const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.csv');
const StudyDatePath = path.resolve(__dirname, '../Txts/studydate.txt');

const TargetMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');

const NewWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/NewWorksheet.html');
const NewSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/NewSummary.html');

function verifyResponse(response: string, AzureVariables: VariableInformation[]): VariableInformation | null {
    response = response.trim().toLowerCase();
    const match = AzureVariables.find(variable => variable.name.trim().toLowerCase() == response);
    return match || null;
}

function createOtherCopies(matches: Match[], AzureVariables: VariableInformation[]) {
    let originalSdGuid = extractStudyDateGuid(AzureWorksheetFilePath);
    let newGuid = getNewSdGuid();
    
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

    if (originalSdGuid && newGuid) {
        const regex = new RegExp(originalSdGuid, 'g');
        WorksheetFile = WorksheetFile.replace(regex, newGuid);
        SummaryFile = SummaryFile.replace(regex, newGuid);
    }

    fs.writeFileSync(NewWorksheetFilePath, WorksheetFile, 'utf-8');
    fs.writeFileSync(NewSummaryFilePath, SummaryFile, 'utf-8');
}


function getUserAnswers(AzureVariables: VariableInformation[], TargetVariables: VariableInformation[]) {
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

function getNewSdGuid() {
    let response: string = fs.readFileSync(StudyDatePath, 'utf-8');
    if (response.indexOf('[') + 1 !== response.indexOf(']')) {
        return response.substring(response.indexOf('[') + 1, response.indexOf(']'));
    }
    return null;
}

function main2(AzureMeasurementsFilePath: string, TargetMeasurementFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureMeasurementsFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetMeasurementFilePath)));

    let matches = getUserAnswers(AzureVariables, TargetVariables);
    console.log(matches);

    createOtherCopies(matches, AzureVariables);
}

main2(AzureMeasurementsFilePath, TargetMeasurementFilePath);