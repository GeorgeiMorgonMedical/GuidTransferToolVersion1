import * as fs from 'fs';
import * as path from 'path';

const UserInputPath = path.resolve(__dirname, '../userInput.txt');

console.log(fs.readFileSync(UserInputPath, 'utf-8').split('\n'));

export function read() {
    return fs.readFileSync(UserInputPath, 'utf-8').split('\n');
}