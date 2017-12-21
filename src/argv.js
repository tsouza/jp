'use strict';

//import pap from 'posix-argv-parser';
import commandLineArgs from 'command-line-args';
import { createReadStream, createWriteStream } from 'fs';

import * as outputs from './lib/output';

import _ from 'lodash';
import homedir from 'homedir';
import { resolve } from 'path';

const optionDefinitions = [
    { name: 'input', alias: 'i', type: (file) => createReadStream(file),
        defaultValue: process.stdin },
    { name: 'output', alias: 'o', type: (file) => createWriteStream(file),
        defaultValue: process.stdout },
    { name: 'output-mode', alias: 'm', type: (mode) => outputs[dashToCamelCase(mode)],
        defaultValue: outputs.tableAscii },
    { name: 'repository', alias: 'r', type: String, defaultValue: resolve(homedir(), '.jp') },
    { name: 'inline', alias: 'l', type: String },
    { name: 'script', type: String, multiple: true, defaultOption: true }
];

export default (argv) =>
    new Promise(resolve => {
        const options = commandLineArgs(optionDefinitions, argv && {
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

function dashToCamelCase(string) {
    return string.replace(/-([a-z])/g, 
        (g) => g[1].toUpperCase());
}

function camelCaseToDash(string) {
    return string.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}