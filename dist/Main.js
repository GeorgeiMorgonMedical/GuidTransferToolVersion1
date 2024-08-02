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
exports.targetJsonToCsv = targetJsonToCsv;
exports.azureJsonToCsv = azureJsonToCsv;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const GuidExtraction_1 = require("./GuidExtraction");
const MValueMatching_1 = require("./MValueMatching");
const AzureFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const TargetFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
const UserInputPath = path_1.default.resolve(__dirname, '../Txts/userInput.txt');
const AzureVariablesPath = path_1.default.resolve(__dirname, '../Txts/AzureVariables.csv');
const TargetVariablesPath = path_1.default.resolve(__dirname, '../Txts/TargetVariables.csv');
function targetJsonToCsv(variables) {
    // Check if variables is defined and not empty
    if (!variables || variables.length === 0) {
        throw new Error("The variables array is undefined or empty.");
    }
    const headers = Object.keys(variables[0]);
    const csvRows = [];
    // Add the headers row
    csvRows.push(headers.join(','));
    // Add each row of data
    for (const row of variables) {
        const values = headers.map((header) => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}
function azureJsonToCsv(variables) {
    // Check if variables is defined and not empty
    if (!variables || variables.length === 0) {
        throw new Error("The variables array is undefined or empty.");
    }
    const headers = Object.keys(variables[0]);
    headers.push("Other ID"); // Add "Other ID" as the last header
    const csvRows = [];
    // Add the headers row
    csvRows.push(headers.join(','));
    // Add each row of data
    for (const row of variables) {
        const values = headers.map((header) => {
            // Check if the header is "Other ID", if so, leave it blank
            if (header === "Other ID") {
                return `""`;
            }
            else {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            }
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}
function formatOutput(azure, target) {
    let azureCsv = azureJsonToCsv(azure);
    fs.writeFileSync(AzureVariablesPath, azureCsv, 'utf-8');
    let targetCsv = targetJsonToCsv(target);
    fs.writeFileSync(TargetVariablesPath, targetCsv, 'utf-8');
}
function main(AzureFilePath, TargetFilePath) {
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetFilePath)));
    formatOutput(AzureVariables, TargetVariables);
    /*

    let allPossibleMatches : Map<string, string[]> = new Map();
    AzureVariables.forEach((AzureVar: VariableInformation) => {
        allPossibleMatches.set(AzureVar.name, narrowDownList(AzureVar, TargetVariables));
    });

    AzureVariables.forEach((variable: VariableInformation) => {
        let possibleMatch = allPossibleMatches.get(variable.name);
        if (possibleMatch && possibleMatch.length > 0) {
            txtFile += `\n${variable.name} (Recommended: ${possibleMatch}): []`;
        } else {
            txtFile += `\n${variable.name}: []`;
        }
    });
    
    fs.writeFileSync(UserInputPath, txtFile, 'utf-8');
    */
}
main(AzureFilePath, TargetFilePath);
//# sourceMappingURL=Main.js.map