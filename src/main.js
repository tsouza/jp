'use strict';

import parseArgv from './argv';
import { ScriptRunner } from './runner';

import Promise from 'bluebird';
import { attempt } from 'bluebird';

import './lib/extensions/rxjs';
import utils from './lib/extensions/utils';

import { stat } from 'fs';
import { resolve } from 'path';

export default (argv) =>
    parseArgv(argv).then(options => {
        const input = options.input;
        const output = options.output;
        const outputMode = options['output-mode'];
        const home = options.home;
        const command = options.command;
        const inline = options.inline;
  
        return verify(home).spread((cmdsPath, utilsPath) => {
            const runner = new ScriptRunner(input).
                addGlobal(utils);

            if (utilsPath)
                runner.addGlobalFromPath(utilsPath);

            if (cmdsPath)
                runner.setCommandsPath(cmdsPath);

            if (command)
                runner.setCommand(command.name).
                    setCommandArgs(command.args);

            if (inline)
                runner.setInlineScript(inline);

            return attempt(() => runner.run()).
                then((observable => new Promise((resolve, reject) =>
                    outputMode(observable, output).
                        on('error', err => reject(err)).
                        on('finish', () => resolve()))));
        });
    });

export function jp() {
    
}

function verify(repository) {
    return dirExists(repository).
        then(rootPath => {
            if (!rootPath)
                return [ false, false ];
            return Promise.all([
                dirExists(resolve(repository, 'scripts')), 
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
