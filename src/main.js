'use strict';

import parseArgv from './argv';
import { StreamScriptCompiler } from './compiler';

import Promise from 'bluebird';

import './lib/extensions/rxjs';
import utils from './lib/extensions/utils';

import { stat } from 'fs';
import { resolve } from 'path';

//import { isEmpty } from 'lodash';

export default (argv) =>
    parseArgv(argv).then(options => {
        const input = options.input;
        const output = options.output;
        const outputMode = options['output-mode'];
        const repository = options.repository;
        const script = options.script;
        const inline = options.inline;
  
        return verify(repository).spread((cmdsPath, utilsPath) => {
            const compiler = new StreamScriptCompiler(input).
                addGlobal(utils);

            if (utilsPath)
                compiler.addGlobalFromPath(utilsPath);

            if (cmdsPath)
                compiler.setCommandsPath(cmdsPath);

            if (script)
                compiler.setCommand(script.command).
                    setCommandArgs(script.args);

            if (inline)
                compiler.setInlineScript(inline);

            return compiler.compile().
                then((observable => new Promise((resolve, reject) =>
                    outputMode(observable, output).
                        on('error', err => reject(err)).
                        on('finish', () => resolve()))));
        });
    });


function verify(repository) {
    return dirExists(repository).
        then(rootPath => {
            if (!rootPath)
                return [ false, false ];
            return Promise.all([
                dirExists(resolve(repository, 'commands')), 
                dirExists(resolve(repository, 'utils'))
            ]);
        });
        
    function dirExists(path) {
        return new Promise(resolve => {
            stat(path, (err, stats) =>
                resolve(stats && 
                    stats.isDirectory() &&
                    path));
        });
    }
}