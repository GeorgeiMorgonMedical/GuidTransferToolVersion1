export interface VariableInformation {
    name: string;
    guid: string;
    table: string;
    row: string;
    column: string;
}

export interface Match {
    azureVarName: string;
    azurevarGuid: string;
    targetVarName: string;
    targetVarGuid: string;
}