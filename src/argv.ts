'use strict';

//import pap from 'posix-argv-parser';
import commandLineArgs from 'command-line-args';
import getUsage from 'command-line-usage';

import { createReadStream, createWriteStream } from 'fs';

import * as outputs from './lib/output';

import _ from 'lodash';
import { resolve } from 'path';
import { Stream } from 'stream';
import { Observable } from 'rxjs';
import { OutputSelector } from './lib/output';

const outputSelector:OutputSelector = outputs;

type FileToStream = (file:string) => Stream;

export interface ArgvOptions {
    input: FileToStream,
    output: FileToStream,
    'output-mode': (observable:Observable<any>, fileToStream: FileToStream) => Stream,
    home: string,
    inline: string,
    command: ArgvCommand,
    help: boolean
}

interface ArgvCommand {
  name: string,
  args: string[]
}

const optionDefinitions = [
    { name: 'input', alias: 'i', type: (file:string) => createReadStream(file),
        defaultValue: process.stdin,
        description: 'Input file path (defaults to stdin)',
        typeLabel: '[underline]{file}' },
    { name: 'output', alias: 'o', type: (file:string) => createWriteStream(file),
        defaultValue: process.stdout, 
        description: 'Output file path (defaults to stdout)',
        typeLabel: '[underline]{file}' },
    { name: 'output-mode', alias: 'm', type: (mode:string) => outputSelector[dashToCamelCase(mode)],
        defaultValue: outputSelector.tableAscii,
        description: 'Output mode. "raw", "json" or "table-ascii" (defaults to "table-ascii")',
        typeLabel: '[underline]{mode}'},
    { name: 'home', alias: 'h', type: String, defaultValue: resolve(require('os').homedir(), '.jp'),
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

export default (argv?: any): Promise<commandLineArgs.CommandLineOptions> =>
    new Promise((resolve, reject) => {
        let options: commandLineArgs.CommandLineOptions;
        try {
            options = commandLineArgs(optionDefinitions, argv && {
                argv: argv
            });
            if (options.help)
                throw new Error();
            if (!_.isEmpty(options.command))
                options.command = {
                    name: options.command[0],
                    args: options.command.slice(1).map((p:any) => {
                        p = /^([^:]+):(.+)$/.exec(p);
                        return { [p[1]]: p[2] };
                    }).reduce((args:any, arg:any) => _.merge({}, args, arg), {})
                };
        } catch (e) {
            const error = new Error('ARGV_ERROR');
            reject(error);
            return;
        }
        resolve(options);
    });

export function usage() {
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
                '$ cat some.json | jp -l \'select(".number") |> map(i => i + 1)\' -m json',
                '$ jp some/command',
                '$ jp some/command -l \'|> filter(v => v === "SOME_VALUE")\''
            ]
        }
    ])}`;
}

function dashToCamelCase(string:string) {
    return string.replace(/-([a-z])/g, 
        (g:string) => g[1].toUpperCase());
}
