'use strict';

import pap from 'posix-argv-parser';
import { createReadStream, createWriteStream } from 'fs';
import { isEmpty } from 'lodash';

import * as outputs from './lib/output';

import _ from 'lodash';

const args = pap.create();
const v = pap.validators;

args.createOption(['-i', '--input'], {
    hasValue: true,
    validators: [ v.file('jp: ${2}: No such input file') ],
    transform: (file) => isEmpty(file) ? process.stdin : 
        createReadStream(file)
});

args.createOption(['-o', '--output'], {
    hasValue: true,
    validators: [ v.file('jp: ${2}: No such output file') ],
    transform: (file) => isEmpty(file) ? process.stdout : 
        createWriteStream(file)
});

args.createOption(['-m', '--output-mode'], {
    hasValue: true, defaultValue: 'table-ascii',
    validators: [ (mode) => {
        const availableModes = Object.keys(outputs).
            map(output => camelCaseToDash(output));

        if (!_.includes(availableModes, mode.value))
            throw new Error(`jp: ${mode.value}: No such output mode. Available are: ${availableModes}`);
    } ],
    transform: (mode) => outputs[dashToCamelCase(mode)]
});

args.createOperand('inline', {
    signature: 'Inline script'
});

export default (argv) =>
    new Promise((resolve, reject) =>
        args.parse(argv, (err, options) =>
            (err? reject(err) : resolve(options))    
        ));


function dashToCamelCase(string) {
    return string.replace(/-([a-z])/g, 
        (g) => g[1].toUpperCase());
}

function camelCaseToDash(string) {
    return string.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}