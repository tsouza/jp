'use strict';

import parseArgv from './argv';
import { StreamScriptCompiler } from './compiler';

import Promise from 'bluebird';

import './lib/extensions/rxjs';
import utils from './lib/extensions/utils';

import { stat } from 'fs';
import { resolve } from 'path';

import { isEmpty } from 'lodash';

export default (argv) =>
    parseArgv(argv).then(options => {
        const input = options['--input'].value;
        const output = options['--output'].value;
        const outputMode = options['--output-mode'].value;
        const repository = options['-r'].value;
  
        return repoExists(repository).spread((repoPath, utilsPath) => {
            const compiler = new StreamScriptCompiler(input).
                addGlobal(utils);

            if (utilsPath)
                compiler.addGlobalFromPath(utilsPath);

            const scriptName = options['-s'].value;
            if (!isEmpty(scriptName)) {
                const scriptPath = `${resolve(repoPath, scriptName)}.js`;
                compiler.setScriptPath(scriptPath);
            }
            else
                compiler.setInlineScript(options.inline.value);

            return compiler.compile().
                then((observable => new Promise((resolve, reject) =>
                    outputMode(observable, output).
                        on('error', err => reject(err)).
                        on('finish', () => resolve()))));
        });
    });


function repoExists(repository) {
    return root().then(rootPath => {
        if (!rootPath)
            return [ false, false ];
        return utils().then(utilsPath =>
            [ rootPath, utilsPath ]);
    });
    
    function root() {
        return dirExists(repository);
    }
    
    function utils() {
        return dirExists(resolve(repository, 'utils'));
    }

    function dirExists(path) {
        return new Promise(resolve => {
            stat(path, (err, stats) =>
                resolve(stats && 
                    stats.isDirectory() &&
                    path));
        });
    }
}