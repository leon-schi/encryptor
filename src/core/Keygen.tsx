import { binaryExpression } from "@babel/types";

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateRandomHex(length: number): string {
    // length is the number of bytes, therefore
    length = Math.ceil(length / 8);
    let bytes = [];
    for (let i = 0; i < length; i++)
        bytes.push(getRandomInt(16).toString(16));
    return bytes.join('');
}

export { generateRandomHex };