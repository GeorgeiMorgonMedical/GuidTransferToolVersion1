import path from 'path';
import * as fs from 'fs';
import { extractMvalueInfoFromFile, removeParagraphTags, removeUnnecessaryComments } from './GuidExtraction';
import { VariableInformation, Match } from './interfaces';
import { cleanExtractedMvalueInfo, storeAsVariableInformation, narrowDownList } from './MValueMatching';

const AzureFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const TargetFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');

const UserInputPath = path.resolve(__dirname, '../Txts/userInput.txt');
const AzureVariablesPath = path.resolve(__dirname, '../Txts/AzureVariables.txt');
const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.txt');


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

function main(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    formatOutput(AzureVariables, TargetVariables);

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
