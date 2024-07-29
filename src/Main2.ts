import * as path from 'path';
import * as fs from 'fs';

import { Match, VariableInformation } from './interfaces';
import { storeAsVariableInformation, cleanExtractedMvalueInfo } from './MValueMatching';
import { extractMvalueInfoFromFile } from './GuidExtraction';

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

// Read file
// Extract user answers
function getUserAnswers() {
    let userAnswers: string[] = fs.readFileSync(UserInputPath, 'utf-8').split('\n');

    userAnswers.forEach((line: string) => {
        let answer = extractUserAnswer(line);
        if (answer) {

        }
    });

} 


function main2(AzureFilePath: string, TargetFilePath: string) {
    let AzureVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(AzureFilePath)));
    let TargetVariables: VariableInformation[] = storeAsVariableInformation(cleanExtractedMvalueInfo(extractMvalueInfoFromFile(TargetFilePath)));

    let unused = createCopy(userMatches, AzureVariables);
    
    console.log('\n\nThe following may potentially need to have a mapping created or found elsewhere due to being unmatched:\n');
    unused.forEach((variable: VariableInformation) => {
        console.log(`${variable.name}\t${variable.guid}`);
    });
}

// Replace in new file