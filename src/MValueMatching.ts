import { extractMvalueInfoFromFile } from "./GuidExtraction";
import { VariableInformation, Match } from "./interfaces";
import * as fs from 'fs';
import * as path from 'path';

export function narrowDownList(variable: VariableInformation, TargetVariables: VariableInformation[]) {
    let resultSide = determineSide(variable);
    let measurement = measurementOfInterest(variable);
    let number = numberDescription(variable);
    let nodule = isNodule(variable);
    let organ = organOfInterest(variable);

    let possibleMatches: string[] = [];

    outerLoop: for (let TargetVariable of TargetVariables) {
        let targetSide = determineSide(TargetVariable);
        let targetMeasurement = measurementOfInterest(TargetVariable);
        let targetNumber = numberDescription(TargetVariable);
        let targetNodule = isNodule(TargetVariable);
        let targetOrgan = organOfInterest(TargetVariable);

        if (resultSide === targetSide && measurement === targetMeasurement && number === targetNumber && nodule === targetNodule && organ === targetOrgan) {
            possibleMatches.push(TargetVariable.name);
            break outerLoop; // Break out of the outer loop
        }
    }

    return possibleMatches;
}


export function numberDescription(variable: VariableInformation): string | null {
    // Regular expression to find a single, solitary digit
    const regex = /^(?:\D*\d\D*){1}$/;
    
    // Check if the string matches the condition of having exactly one single digit
    if (regex.test(variable.name.toLowerCase())) {
        // Extract the digit to return it
        const found = variable.name.toLowerCase().match(/\d/);
        return found ? found[0] : null;
    }
    return null;
}

export function determineSide(variable: VariableInformation) : string | null {
    if (variable.name.toLowerCase().substring(0, 3) === 'lt_' || variable.name.indexOf('_lt_') !== -1) {
        return 'lt';
    } else if (variable.name.toLowerCase().substring(0, 3) === 'rt_' || variable.name.indexOf('_rt_') !== -1) {
        return 'rt';
    } else {
        return null;
    }
}

export function organOfInterest(variable: VariableInformation): string | null {
    const organs: Map<string, string[]> = new Map([
        ['kidney', ['renal', 'kidney']],
        ['lymph', ['neck', 'lym', 'lymph']],
        ['liver', ['liver', 'liv']],
        ['isthmus', ['isth', 'isthmus']],
        ['aorta', ['aor', 'aorta']],
        ['scrotum', ['scrot', 'scrotum']],
        ['thyroid', ['thyroid', 'rt lobe', 'lt lobe']],
        ['spleen', ['spleen']]
    ]);


    // If no match is found, check the table, row, and column for an organ match
    for (const [organ, possibleNames] of organs) {
        for (const name of possibleNames) {
            if (variable.column.toLowerCase().indexOf(name) !== -1 || variable.row.toLowerCase().indexOf(name) !== -1) {
                return organ;
            }
        }
    }

    for (const [organ, possibleNames] of organs) {
        for (const name of possibleNames) {
            if (variable.name.toLowerCase().indexOf(name) !== -1) {
                return organ;
            }
        }
    }

    for (const [organ, possibleNames] of organs) {
        for (const name of possibleNames) {
            if (variable.table.toLowerCase().indexOf(name) !== -1) {
                return organ;
            }
        }
    }

    return null;
}



export function isNodule(variable: VariableInformation): boolean {
    return (
        (variable.name !== null && variable.name.toLowerCase().indexOf('_nod') !== -1) ||
        (variable.table !== null && (variable.table.toLowerCase().indexOf('node') !== -1 || 
                                     variable.table.toLowerCase().indexOf('nodule') !== -1)) ||
        (variable.row !== null && (variable.row.toLowerCase().indexOf('node') !== -1 || 
                                   variable.row.toLowerCase().indexOf('nodule') !== -1)) ||
        (variable.column !== null && (variable.column.toLowerCase().indexOf('node') !== -1 || 
                                      variable.column.toLowerCase().indexOf('nodule') !== -1))
    );
}

export function measurementOfInterest(variable: VariableInformation) : string | null {
    let mapping: { [key: string]: string } = {  // Adding an index signature
        'trv': 'width',
        'w': 'width',
        'width': 'width',
        'len': 'length',
        'l': 'length',
        'length': 'length',
        'ap': 'height',
        'h': 'height',
        'height': 'height'
    };

    let key = variable.name.substring(variable.name.lastIndexOf("_") + 1).toLowerCase();
    if (key === 'ax') {
        if (variable.name.toLowerCase().indexOf('_l_ax') != -1 || variable.name.toLowerCase().indexOf('_long_ax') != -1) {
            return 'length';
        } else if (variable.name.toLowerCase().indexOf('_s_ax') != -1 || variable.name.toLowerCase().indexOf('_short_ax') != -1) {
            return 'width';
        } else {
            return 'height';
        }
    }
    else if (mapping[key]) {
        return mapping[key];
    } else {
        return null;
    }
}

export function cleanExtractedMvalueInfo(results: Map<string, string[]>): Map<string, string[]> {
    results.forEach((value: string[], key:string) => {
        if (value[2].indexOf('<') !== -1) {
            value[2] === '';
        }

        if (key.indexOf('<') !== -1 || key.indexOf('=') !== -1) {
            results.delete(key);
        }
    });
    return results;
}

export function storeAsVariableInformation(mvalueInfo: Map<string, string[]>) {
    let VariableList: VariableInformation[] = [];
    mvalueInfo.forEach((peripheralInfo: string[], varName: string) => {
        VariableList.push({ 
            name: varName,
            guid: peripheralInfo[0],
            table: peripheralInfo[1],
            row: peripheralInfo[2],
            column: peripheralInfo[3],
        });
    });
    return VariableList;
}









