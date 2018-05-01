'use strict';

//import pap from 'posix-argv-parser';
import commandLineArgs from 'command-line-args';
import getUsage from 'command-line-usage';

import { createReadStream, createWriteStream } from 'fs';

import * as outputs from './lib/output';

import _ from 'lodash';
import homedir from 'homedir';
import { resolve } from 'path';

const optionDefinitions = [
    { name: 'input', alias: 'i', type: (file) => createReadStream(file),
        defaultValue: process.stdin,
        description: 'Input file path (defaults to stdin)',
        typeLabel: '[underline]{file}' },
    { name: 'output', alias: 'o', type: (file) => createWriteStream(file),
        defaultValue: process.stdout, 
        description: 'Output file path (defaults to stdout)',
        typeLabel: '[underline]{file}' },
    { name: 'output-mode', alias: 'm', type: (mode) => outputs[dashToCamelCase(mode)],
        defaultValue: outputs.tableAscii,
        description: 'Output mode. "raw", "json" or "table-ascii" (defaults to "table-ascii")',
        typeLabel: '[underline]{mode}'},
    { name: 'home', alias: 'h', type: String, defaultValue: resolve(homedir(), '.jp'),
        description: 'Script home path (defaults to ~/.jp)',
        typeLabel: '[underline]{directory}' },
    { name: 'inline', alias: 'l', type: String,
        description: 'Inline script definition',
        typeLabel: '[underline]{script}' },
    { name: 'command', type: String, multiple: true, defaultOption: true,
        description: 'Repository command to invoke',
        typeLabel: '[underline]{command}' },
    { name: 'help', type: Boolean, defaultValue: false,
        description: 'Prints this help message' }
];

export default (argv) =>
    new Promise((resolve, reject) => {
        let options;
        try {
            options = commandLineArgs(optionDefinitions, argv && {
                argv: argv
            });
            if (options.help)
                throw new Error();
            if (!_.isEmpty(options.command))
                options.command = {
                    name: options.command[0],
                    args: options.command.slice(1).map(p => {
                        p = /^([^:]+):(.+)$/.exec(p);
                        return { [p[1]]: p[2] };
                    }).reduce((args, arg) => _.merge({}, args, arg), {})
                };
        } catch (e) {
            const error = new Error('ARGV_ERROR');
            error.getUsage = usage;
            reject(error);
            return;
        }
        resolve(options);
    });

function usage() {
    const version = require('../package.json').version;
    return `\njp v${version}\n${getUsage([
        {
            header: 'Usage',
            content: 'jp [options] [<command> [<arg:value>...]]'
        },
        {
            header: 'Options',
            optionList: optionDefinitions.
                filter(opt => opt.name !== 'command')
        },
        {
            header: 'Synopsis',
            content: [
                '$ cat some.json | jp -l \'select(".number").map(i => i + 1)\' -m json',
                '$ jp some/command',
                '$ jp some/command -l \'filter(v => v === \"SOME_VALUE\")\''
            ]
        }
    ])}`;
}

function dashToCamelCase(string) {
    return string.replace(/-([a-z])/g, 
        (g) => g[1].toUpperCase());
}
