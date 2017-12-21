'use strict';

//import pap from 'posix-argv-parser';
import commandLineArgs from 'command-line-args';
import { createReadStream, createWriteStream } from 'fs';
import { isEmpty } from 'lodash';

import * as outputs from './lib/output';

import _ from 'lodash';
import homedir from 'homedir';
import { resolve } from 'path';
import { stat } from 'fs';

const optionDefinitions = [
    { name: 'input', alias: 'i', type: (file) => '<stdin>' === file ? process.stdin : 
        createReadStream(file), defaultValue: '<stdin>' },
    { name: 'output', alias: 'o', type: (file) => '<stdout>' === file ? process.stdout : 
        createWriteStream(file), defaultValue: '<stdout>' },
    { name: 'output-mode', alias: 'm', type: (mode) => outputs[dashToCamelCase(mode)],
        defaultValue: 'table-ascii' },
    { name: 'repository', alias: 'r', type: String, defaultValue: resolve(homedir(), '.jp') },
    { name: 'inline', alias: 'l', type: Boolean, defaultValue: false },
    { name: 'script', type: String, multiple: true, defaultOption: true }
];
  
/*const args = pap.create();
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

args.createOption(['-r', '--repository'], {
    hasValue: true, defaultValue: resolve(homedir(), '.jp'),
    validate: (opt) => new Promise((resolve, reject) => {
        stat(opt.value, (err, stat) => {
            if (stat && !stat.isDirectory())
                return reject(new Error(`jp: ${opt.value}: Repository must be a directory`));
            resolve();
        });
    })
});

args.createOption(['-s', '--script'], {
    hasValue: true
});

args.createOperand('inline', {
    signature: 'Inline script'
});*/

export default (argv) =>
    new Promise(resolve => {
        const options = commandLineArgs(optionDefinitions, {
            argv: argv
        });
        if (!_.isEmpty(options.script))
            options.script = {
                command: options.script[0],
                args: options.script.slice(1).map(p => {
                    p = /^([^:]+):(.+)$/.exec(p);
                    return { [p[1]]: p[2] };
                }).reduce((args, arg) => _.merge({}, args, arg), {})
            };
        resolve(options);
    });

/*args.parse(argv, (err, options) =>
    (err? reject(err) : resolve(options))    
));*/


function dashToCamelCase(string) {
    return string.replace(/-([a-z])/g, 
        (g) => g[1].toUpperCase());
}

function camelCaseToDash(string) {
    return string.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}