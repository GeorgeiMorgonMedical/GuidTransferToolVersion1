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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const GuidExtraction_1 = require("./GuidExtraction");
const MValueMatching_1 = require("./MValueMatching");
const AzureFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/Azure.html');
const TargetFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/Other.html');
const CopyFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/NewFile.html');
const UserInputPath = path_1.default.resolve(__dirname, '../Txts/userInput.txt');
const AzureVariablesPath = path_1.default.resolve(__dirname, '../Txts/AzureVariables.txt');
const TargetVariablesPath = path_1.default.resolve(__dirname, '../Txts/TargetVariables.txt');
function formatOutput(azure, target) {
    let azureTxt = 'AZURE VARIABLE INFORMATION\n';
    azure.forEach((azureVar) => {
        azureTxt += azureVar.name + '\t' + azureVar.guid + '\t' + azureVar.table + '\t' + azureVar.column + '\t' + azureVar.row + '\n';
    });
    fs.writeFileSync(AzureVariablesPath, azureTxt, 'utf-8');
    let targetTxt = 'TARGET VARIABLE INFORMATION\n';
    target.forEach((targetVar) => {
        targetTxt += targetVar.name + '\t' + targetVar.guid + '\t' + targetVar.table + '\t' + targetVar.column + '\t' + targetVar.row + '\n';
    });
    fs.writeFileSync(TargetVariablesPath, targetTxt, 'utf-8');
}
function main(AzureFilePath, TargetFilePath) {
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetFilePath)));
    formatOutput(AzureVariables, TargetVariables);
    let allPossibleMatches = new Map();
    AzureVariables.forEach((AzureVar) => {
        allPossibleMatches.set(AzureVar.name, (0, MValueMatching_1.narrowDownList)(AzureVar, TargetVariables));
    });
    let txtFile = 'Enter the following matches in the [answer] brackets. If a match does not exist, leave it blank.';
    AzureVariables.forEach((variable) => {
        let possibleMatch = allPossibleMatches.get(variable.name);
        if (possibleMatch && possibleMatch.length > 0) {
            txtFile += `\nEnter matching variable name for ${variable.name} (Recommended: ${possibleMatch}) (Leave blank if no match): []`;
        }
        else {
            txtFile += `\nEnter matching variable name for ${variable.name} (Leave blank if no match): []`;
        }
    });
    fs.writeFileSync(UserInputPath, txtFile, 'utf-8');
}
main(AzureFilePath, TargetFilePath);
//# sourceMappingURL=Main.js.map