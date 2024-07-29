"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.narrowDownList = narrowDownList;
exports.numberDescription = numberDescription;
exports.determineSide = determineSide;
exports.organOfInterest = organOfInterest;
exports.isNodule = isNodule;
exports.measurementOfInterest = measurementOfInterest;
exports.cleanExtractedMvalueInfo = cleanExtractedMvalueInfo;
exports.storeAsVariableInformation = storeAsVariableInformation;
function narrowDownList(variable, TargetVariables) {
    let resultSide = determineSide(variable);
    let measurement = measurementOfInterest(variable);
    let number = numberDescription(variable);
    let nodule = isNodule(variable);
    let organ = organOfInterest(variable);
    let possibleMatches = [];
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
function numberDescription(variable) {
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
function determineSide(variable) {
    if (variable.name.toLowerCase().substring(0, 3) === 'lt_') {
        return 'lt';
    }
    else if (variable.name.toLowerCase().substring(0, 3) === 'rt_') {
        return 'rt';
    }
    else {
        return null;
    }
}
function organOfInterest(variable) {
    const organs = new Map([
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
function isNodule(variable) {
    return ((variable.name !== null && variable.name.toLowerCase().indexOf('_nod') !== -1) ||
        (variable.table !== null && (variable.table.toLowerCase().indexOf('node') !== -1 ||
            variable.table.toLowerCase().indexOf('nodule') !== -1)) ||
        (variable.row !== null && (variable.row.toLowerCase().indexOf('node') !== -1 ||
            variable.row.toLowerCase().indexOf('nodule') !== -1)) ||
        (variable.column !== null && (variable.column.toLowerCase().indexOf('node') !== -1 ||
            variable.column.toLowerCase().indexOf('nodule') !== -1)));
}
function measurementOfInterest(variable) {
    let mapping = {
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
        }
        else if (variable.name.toLowerCase().indexOf('_s_ax') != -1 || variable.name.toLowerCase().indexOf('_short_ax') != -1) {
            return 'width';
        }
        else {
            return 'height';
        }
    }
    else if (mapping[key]) {
        return mapping[key];
    }
    else {
        return null;
    }
}
function cleanExtractedMvalueInfo(results) {
    results.forEach((value, key) => {
        if (key.indexOf('<') !== -1) {
            results.delete(key);
        }
    });
    return results;
}
function storeAsVariableInformation(mvalueInfo) {
    let VariableList = [];
    mvalueInfo.forEach((peripheralInfo, varName) => {
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
//# sourceMappingURL=MValueMatching.js.map