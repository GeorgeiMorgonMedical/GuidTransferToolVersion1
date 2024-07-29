import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile } from './GuidExtraction';

const AzureFilePath = path.resolve(__dirname, '../HTMLFiles/Azure.html');
const TargetFilePath = path.resolve(__dirname, '../HTMLFiles/Other.html');
const UserInputPath = path.resolve(__dirname, '../Txts/userInput.txt');
const CopyFilePath = path.resolve(__dirname, '../HTMLFiles/NewFile.html');


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
    const match = TargetVariables.find(variable => variable.name === response);
    return match || null;
}

function createCopy(matches: Match[], AzureVariables: VariableInformation[]) {
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

function main2(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    let matches = getUserAnswers(AzureVariables, TargetVariables);

    let unused = createCopy(matches, AzureVariables);
    
    console.log('\n\nThe following may potentially need to have a mapping created or found elsewhere due to being unmatched:\n');
    unused.forEach((variable: VariableInformation) => {
        console.log(`${variable.name}\t${variable.guid}`);
    });
}

main2(AzureFilePath, TargetFilePath);