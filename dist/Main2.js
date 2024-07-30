"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const MValueMatching_1 = require("./MValueMatching");
const GuidExtraction_1 = require("./GuidExtraction");
const AzureMeasurementsFilePath = path.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/AzureSummary.html');
const UserInputPath = path.resolve(__dirname, '../Txts/userInput.txt');
const TargetMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
//const TargetWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/OtherWorksheet.html');
//const TargetSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/OtherSummary.html');
const NewMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/NewMeasurements.html');
const NewWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/NewWorksheet.html');
const NewSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/NewSummary.html');
function extractAzureVariable(line) {
    let start_index = line.indexOf('for ') + 4;
    let end_index = line.indexOf(' (');
    return line.substring(start_index, end_index).trim();
}
function extractUserAnswer(line) {
    let start_index = line.indexOf('[') + 1;
    let end_index = line.indexOf(']');
    if (start_index === end_index) {
        return null;
    }
    else {
        return line.substring(start_index, end_index).trim();
    }
}
function verifyResponse(response, TargetVariables) {
    const match = TargetVariables.find(variable => variable.name === response);
    return match || null;
}
// Specifically for measurements page.
function createMeasurementsCopy(matches, AzureVariables) {
    let htmlFile = fs.readFileSync(AzureMeasurementsFilePath, 'utf-8');
    matches.forEach((match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        htmlFile = htmlFile.replace(regex, match.targetVarGuid);
    });
    AzureVariables.forEach(azureVar => {
        if (!matches.some(match => match.azureVarName === azureVar.name)) {
            const regex = new RegExp(azureVar.guid, 'g');
            htmlFile = htmlFile.replace(regex, '');
        }
    });
    const unusedAzureVariables = AzureVariables.filter(azure => !matches.some(match => match.azureVarName === azure.name));
    fs.writeFileSync(NewMeasurementFilePath, htmlFile, 'utf-8');
    return unusedAzureVariables;
}
// For worksheet and summary pages
function createOtherCopies(matches, AzureVariables) {
    let WorksheetFile = fs.readFileSync(AzureWorksheetFilePath, 'utf-8');
    matches.forEach((match) => {
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
    matches.forEach((match) => {
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
function getUserAnswers(AzureVariables, TargetVariables) {
    let userAnswers = fs.readFileSync(UserInputPath, 'utf-8').split('\n');
    let matches = [];
    userAnswers.forEach((line) => {
        let answer = extractUserAnswer(line);
        if (answer) {
            let answerInformation = verifyResponse(answer, TargetVariables);
            if (answerInformation) {
                let azureVarName = extractAzureVariable(line);
                let azureVar = AzureVariables.find(variable => variable.name === azureVarName);
                matches.push({ azureVarName: azureVar.name, azurevarGuid: azureVar.guid, targetVarName: answerInformation.name, targetVarGuid: answerInformation.guid });
            }
        }
    });
    return matches;
}
function main2(AzureMeasurementsFilePath, TargetMeasurementFilePath) {
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureMeasurementsFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetMeasurementFilePath)));
    let matches = getUserAnswers(AzureVariables, TargetVariables);
    console.log(matches);
    let unused = createMeasurementsCopy(matches, AzureVariables);
    createOtherCopies(matches, AzureVariables);
    console.log('\n\nThe following may potentially need to have a mapping created or found elsewhere due to being unmatched:\n');
    unused.forEach((variable) => {
        console.log(`${variable.name}\t${variable.guid}`);
    });
}
main2(AzureMeasurementsFilePath, TargetMeasurementFilePath);
//# sourceMappingURL=Main2.js.map