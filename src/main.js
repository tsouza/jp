'use strict';

import parseArgv from './argv';
import { StreamScriptCompiler } from './compiler';

import Promise from 'bluebird';

import './lib/extensions/rxjs';
import utils from './lib/extensions/utils';

import { stat } from 'fs';
import { resolve } from 'path';

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

            if (options.inline.isSet)
                compiler.setInlineScript(options.inline.value);
            else {
                const scriptName = options['-s'].value;
                const scriptPath = `${resolve(repoPath, scriptName)}.js`;
                compiler.setScriptPath(scriptPath);
            }

            return compiler.compile().
                then((stream => new Promise((resolve, reject) =>
                    outputMode(stream).
                        on('error', err => reject(err)).
                        on('end', () => resolve()).
                        pipe(output))));
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