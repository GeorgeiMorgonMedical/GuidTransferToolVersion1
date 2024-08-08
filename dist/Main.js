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
const AzureMeasurementsFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/AzureMeasurements.html');
const AzureWorksheetFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/AzureWorksheet.html');
const AzureSummaryFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/AzureSummary.html');
const TargetMeasurementsFilePath = path_1.default.resolve(__dirname, '../HTMLFiles/OtherMeasurements.html');
const AzureVariablesPath = path_1.default.resolve(__dirname, '../Txts/AzureVariables.csv');
const TargetVariablesPath = path_1.default.resolve(__dirname, '../Txts/TargetVariables.csv');
const StudyDatePath = path_1.default.resolve(__dirname, '../Txts/studydate.txt');
function azureJsonToCsv(variables) {
    if (!variables || variables.length === 0) {
        return "";
    }
    const headers = Object.keys(variables[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of variables) {
        const values = headers.map((header) => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}
// Update to include reccomendations now with updated matching
function targetJsonToCsv(variables) {
    if (!variables || variables.length === 0) {
        return "";
    }
    const headers = Object.keys(variables[0]);
    headers.push("Matching Azure Variable Name");
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of variables) {
        const values = headers.map((header) => {
            if (header === "Matching Azure Variable Name") {
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
    let date = "Enter new study date guid: []";
    fs.writeFileSync(StudyDatePath, date, 'utf-8');
}
function cleanFiles() {
    (0, GuidExtraction_1.removeParagraphTags)(AzureMeasurementsFilePath);
    (0, GuidExtraction_1.removeUnnecessaryComments)(AzureMeasurementsFilePath);
    (0, GuidExtraction_1.removeParagraphTags)(AzureWorksheetFilePath);
    (0, GuidExtraction_1.removeUnnecessaryComments)(AzureWorksheetFilePath);
    (0, GuidExtraction_1.removeParagraphTags)(AzureSummaryFilePath);
    (0, GuidExtraction_1.removeParagraphTags)(AzureSummaryFilePath);
    (0, GuidExtraction_1.removeParagraphTags)(TargetMeasurementsFilePath);
    (0, GuidExtraction_1.removeUnnecessaryComments)(TargetMeasurementsFilePath);
}
function main(AzureFilePath, TargetFilePath) {
    cleanFiles();
    console.log(StudyDatePath);
    console.log(fs.existsSync(StudyDatePath));
    let AzureVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(AzureFilePath)));
    let TargetVariables = (0, MValueMatching_1.storeAsVariableInformation)((0, MValueMatching_1.cleanExtractedMvalueInfo)((0, GuidExtraction_1.extractMvalueInfoFromFile)(TargetFilePath)));
    formatOutput(AzureVariables, TargetVariables);
}
main(AzureMeasurementsFilePath, TargetMeasurementsFilePath);
//# sourceMappingURL=Main.js.map