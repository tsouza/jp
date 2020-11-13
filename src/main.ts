'use strict';

import parseArgv, { ArgvOptions } from './argv';
import { ScriptRunner } from './runner';

import Promise from 'bluebird';
import { attempt } from 'bluebird';

import utils from './lib/extensions/utils';
import rxjs_extensions from './lib/extensions/rxjs';

import * as rxjs from 'rxjs/operators';

import { stat } from 'fs';
import { resolve } from 'path';
import { CommandLineOptions } from 'command-line-args';

export default (argv?: any) =>
    parseArgv(argv).then((options: CommandLineOptions) => {

        const input = options.input;
        const output = options.output;
        const outputMode = options['output-mode'];
        const home = options.home;
        const command = options.command;
        const inline = options.inline;

        return verify(home).spread((cmdsPath, utilsPath, pluginsJson) => {
            const runner = new ScriptRunner(input)
                .addGlobal(rxjs)
                .addGlobal(utils)
                .addGlobal(rxjs_extensions);

            if (utilsPath)
                runner.addGlobalFromPath(utilsPath);

            if (cmdsPath)
                runner.setCommandsPath(cmdsPath);

            if (pluginsJson)
                runner.setPluginsInfo(pluginsJson);

            if (command)
                runner.setCommand(command.name).
                    setCommandArgs(command.args);

            if (inline)
                runner.setInlineScript(inline);

            return attempt(() => runner.run()).
                then((observable => new Promise((resolve, reject) =>
                    outputMode(observable, output).
                        on('error', (err:Error) => reject(err)).
                        on('finish', () => resolve()))));
        });
    });

function verify(repository: string): Promise<[string|false, string|false, string|false]> {
    return dirExists(repository).
        then(rootPath => {
            if (!rootPath)
                return [false, false, false];
            return Promise.all([
                dirExists(resolve(repository, 'scripts')),
                dirExists(resolve(repository, 'utils')),
                fileExists(resolve(repository, 'plugins.json'))
            ]);
        });

    type BoolCheck = (e:any) => boolean ;

    function fileExists(path:string): Promise<string|false> {
        return exists(path, stats => !stats.isDirectory());
    }

    function dirExists(path:string): Promise<string|false> {
        return exists(path, stats => stats.isDirectory());
    }

    function exists(path:string, check:BoolCheck): Promise<string|false> {
        return new Promise<string|false>(resolve => {
            stat(path, (err, stats) =>
                resolve(stats && check(stats) && path));
        });
    }
}
