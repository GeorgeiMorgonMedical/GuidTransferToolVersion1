import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile } from './GuidExtraction';
import { createCopy, verifyResponse } from './Main';
import { read } from './debug';

const AzureFilePath = path.resolve(__dirname, '../HTMLFiles/Azure.html');
const TargetFilePath = path.resolve(__dirname, '../HTMLFiles/Other.html');
const UserInputPath = path.resolve(__dirname, '../userInput.txt');
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

function getUserAnswers(AzureVariables: VariableInformation[], TargetVariables: VariableInformation[]) {
    let userAnswers: string[] = fs.readFileSync(UserInputPath, 'utf-8').split('\n');
    let matches: Match[] = [];
    console.log('Checkpoint 1');

    userAnswers.forEach((line: string) => {
        let answer = extractUserAnswer(line);
        if (answer) {
            console.log(answer);
            console.log('Checkpoint 2');
            let answerInformation = verifyResponse(answer, TargetVariables);
            console.log(answerInformation);
            if (answerInformation) {
                console.log('Checkpoint 3');
                let azureVarName = extractAzureVariable(line);
                let azureVar: VariableInformation = AzureVariables.find(variable => variable.name === azureVarName)!;
                matches.push({ azureVarName: azureVar.name, azurevarGuid: azureVar.guid, targetVarName: answerInformation.name, targetVarGuid:answerInformation.guid });
            }
        }
    });
    return matches;
}

function debug() {
    console.log('DEBUGGING');
    console.log(read());
}


function main2(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    debug();

    let matches = getUserAnswers(AzureVariables, TargetVariables);

    let unused = createCopy(matches, AzureVariables);
    
    console.log('\n\nThe following may potentially need to have a mapping created or found elsewhere due to being unmatched:\n');
    unused.forEach((variable: VariableInformation) => {
        console.log(`${variable.name}\t${variable.guid}`);
    });
}

main2(AzureFilePath, TargetFilePath);