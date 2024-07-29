import path from 'path';
import * as fs from 'fs';
import { extractMvalueInfoFromFile, removeParagraphTags, removeUnnecessaryComments } from './GuidExtraction';
import { VariableInformation, Match } from './interfaces';
import { cleanExtractedMvalueInfo, storeAsVariableInformation, narrowDownList } from './MValueMatching';
import PromptSync, * as prompt from 'prompt-sync';

const AzureFilePath = path.resolve(__dirname, '../HTMLFiles/Azure.html');
const TargetFilePath = path.resolve(__dirname, '../HTMLFiles/Other.html');
const CopyFilePath = path.resolve(__dirname, '../HTMLFiles/NewFile.html');
const UserInputPath = path.resolve(__dirname, '../userInput.txt');

function formatOutput(azure: VariableInformation[], target: VariableInformation[]) {
    console.log('AZURE VARIABLE INFORMATION\n');
    azure.forEach((azureVar: VariableInformation) => {
        console.log(azureVar.name + '\t' + azureVar.guid + '\t' + azureVar.table + '\t' + azureVar.column + '\t' + azureVar.row);
    });
    console.log('\nTARGET VARIABLE INFORMATION\n');
    target.forEach((targetVar: VariableInformation) => {
        console.log(targetVar.name + '\t' + targetVar.guid + '\t' + targetVar.table + '\t' + targetVar.column + '\t' + targetVar.row);
    });
}

export function verifyResponse(response: string, TargetVariables: VariableInformation[]): VariableInformation | null {
    const match = TargetVariables.find(variable => variable.name === response);
    return match || null;
}

export function createCopy(matches: Match[], AzureVariables: VariableInformation[]) {
    let htmlFile = fs.readFileSync(AzureFilePath, 'utf-8');
    matches.forEach((match: Match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        htmlFile = htmlFile.replace(regex, match.targetVarGuid);
    });

    AzureVariables.forEach(target => {
        if (!matches.some(match => match.targetVarName === target.name)) {
            const regex = new RegExp(target.guid, 'g');
            htmlFile = htmlFile.replace(regex, '');
        }
    });

    const unusedAzureVariables = AzureVariables.filter(azure => 
        !matches.some(match => match.azureVarName === azure.name)
    );

    fs.writeFileSync(CopyFilePath, htmlFile, 'utf-8');

    return unusedAzureVariables;
}

function main(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    let allPossibleMatches : Map<string, string[]> = new Map();
    AzureVariables.forEach((AzureVar: VariableInformation) => {
        allPossibleMatches.set(AzureVar.name, narrowDownList(AzureVar, TargetVariables));
    });

    let txtFile = 'Enter the following matches in the [answer] brackets. If a match does not exist, leave it blank.';

    AzureVariables.forEach((variable: VariableInformation) => {
        let possibleMatch = allPossibleMatches.get(variable.name);
        if (possibleMatch && possibleMatch.length > 0) {
            txtFile += `\nEnter matching variable name for ${variable.name} (Recommended: ${possibleMatch}) (Leave blank if no match): []`;
        } else {
            txtFile += `\nEnter matching variable name for ${variable.name} (Leave blank if no match): []`;
        }
    });
    
    fs.writeFileSync(UserInputPath, txtFile, 'utf-8');
}


main(AzureFilePath, TargetFilePath);
