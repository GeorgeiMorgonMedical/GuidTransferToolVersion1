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
const TargetVariablesPath = path.resolve(__dirname, '../Txts/TargetVariables.csv');
const StudyDatePath = path.resolve(__dirname, '../Txts/studydate.txt');
const TargetMeasurementFilePath = path.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
const NewWorksheetFilePath = path.resolve(__dirname, '../HTMLFiles/NewWorksheet.html');
const NewSummaryFilePath = path.resolve(__dirname, '../HTMLFiles/NewSummary.html');
function verifyResponse(response, AzureVariables) {
    response = response.trim().toLowerCase();
    const match = AzureVariables.find(variable => variable.name.trim().toLowerCase() == response);
    return match || null;
}
function createOtherCopies(matches, AzureVariables) {
    let originalSdGuid = (0, GuidExtraction_1.extractStudyDateGuid)(AzureWorksheetFilePath);
    let newGuid = getNewSdGuid();
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
    if (originalSdGuid && newGuid) {
        const regex = new RegExp(originalSdGuid, 'g');
        WorksheetFile = WorksheetFile.replace(regex, newGuid);
        SummaryFile = SummaryFile.replace(regex, newGuid);
    }
    fs.writeFileSync(NewWorksheetFilePath, WorksheetFile, 'utf-8');
    fs.writeFileSync(NewSummaryFilePath, SummaryFile, 'utf-8');
}
function getUserAnswers(AzureVariables, TargetVariables) {
    let userAnswers = fs.readFileSync(TargetVariablesPath, 'utf-8').split('\n');
    let matches = [];
    userAnswers.forEach((line) => {
        let answer = line.split(',')[5];
        if (answer) {
            answer = answer.substring(1, answer.length - 1);
            if (answer && answer.length > 0) {
                let answerInformation = verifyResponse(answer, AzureVariables);
                if (answerInformation) {
                    let targetVarName = line.split(',')[0];
                    targetVarName = targetVarName.substring(1, targetVarName.length - 1);
                    let targetVar = TargetVariables.find(variable => variable.name === targetVarName);
                    matches.push({ azureVarName: answerInformation.name, azurevarGuid: answerInformation.guid, targetVarName: targetVar.name, targetVarGuid: targetVar.guid });
                }
            }
        }
    });
    return matches;
}
function getNewSdGuid() {
    let response = fs.readFileSync(StudyDatePath, 'utf-8');
    if (response.indexOf('[') + 1 !== response.indexOf(']')) {
        return response.substring(response.indexOf('[') + 1, response.indexOf(']'));
    }
    return null;
}
function main2(AzureMeasurementsFilePath, TargetMeasurementFilePath) {
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureMeasurementsFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetMeasurementFilePath)));
    let matches = getUserAnswers(AzureVariables, TargetVariables);
    console.log(matches);
    createOtherCopies(matches, AzureVariables);
}
main2(AzureMeasurementsFilePath, TargetMeasurementFilePath);
//# sourceMappingURL=Main2.js.map