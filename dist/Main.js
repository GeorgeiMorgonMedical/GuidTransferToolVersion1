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
exports.verifyResponse = verifyResponse;
exports.createCopy = createCopy;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const GuidExtraction_1 = require("./GuidExtraction");
const MValueMatching_1 = require("./MValueMatching");
const AzureFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/Azure.html');
const TargetFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/Other.html');
const CopyFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/NewFile.html');
const UserInputPath = path_1.default.resolve(__dirname, '../userInput.txt');
function formatOutput(azure, target) {
    console.log('AZURE VARIABLE INFORMATION\n');
    azure.forEach((azureVar) => {
        console.log(azureVar.name + '\t' + azureVar.guid + '\t' + azureVar.table + '\t' + azureVar.column + '\t' + azureVar.row);
    });
    console.log('\nTARGET VARIABLE INFORMATION\n');
    target.forEach((targetVar) => {
        console.log(targetVar.name + '\t' + targetVar.guid + '\t' + targetVar.table + '\t' + targetVar.column + '\t' + targetVar.row);
    });
}
function verifyResponse(response, TargetVariables) {
    const match = TargetVariables.find(variable => variable.name === response);
    return match || null;
}
function createCopy(matches, AzureVariables) {
    let htmlFile = fs.readFileSync(AzureFilePath, 'utf-8');
    matches.forEach((match) => {
        const regex = new RegExp(match.azurevarGuid, 'g');
        htmlFile = htmlFile.replace(regex, match.targetVarGuid);
    });
    AzureVariables.forEach(target => {
        if (!matches.some(match => match.targetVarName === target.name)) {
            const regex = new RegExp(target.guid, 'g');
            htmlFile = htmlFile.replace(regex, '');
        }
    });
    const unusedAzureVariables = AzureVariables.filter(azure => !matches.some(match => match.azureVarName === azure.name));
    fs.writeFileSync(CopyFilePath, htmlFile, 'utf-8');
    return unusedAzureVariables;
}
function main(AzureFilePath, TargetFilePath) {
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetFilePath)));
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