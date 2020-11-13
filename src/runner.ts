import { NodeVM } from 'vm2';
import filter from './lib/filter';

import { merge } from 'lodash';
import requireDir from 'require-dir';

import { createReadStream } from 'fs';
import { resolve, dirname } from 'path';

import { isString, isEmpty } from 'lodash';
import { Stream } from 'stream';

export class ScriptRunner {

    _input: any;
    _global: {};
    _inlineScript: any;
    _command: any;
    _commandArgs: any;
    _commandsPath: any;

    constructor(input:Stream) {
        this._input = input;
        this._global = {};
    }

    _createSandbox() {
        let sandbox = merge({
            requireDir: requireDir,
            run: (command:string, input:Stream) => this._run(command, input),
            from: (path:string) => createReadStream(resolve(process.cwd(), path)),
            select: (pathOrInput:string|Stream, input:Stream) => {
                let path:string;
                if (!input && !isString(pathOrInput)) {
                    input = pathOrInput;
                    path = '$';
                } else if (typeof pathOrInput == 'string') {
                    path = (pathOrInput as string)
                } else {
                    throw new Error("Invalid Parameters on select()");
                }
                path = path[0] != '$' ? `$${path}` : path;
                return filter(input || this._input, path);
            }
        }, this._global);
        return sandbox;
    }

    _createVM() {
        return new NodeVM({
            sandbox: this._createSandbox(),
            require: { external: true, context: 'sandbox', builtin: ['*'] }
        });
    }

    addGlobal(object:any) {
        this._global = merge({}, this._global, object || {});
        return this;
    }

    addGlobalFromPath(path:string) {
        return this.addGlobal(this._loadPath(path));
    }

    setInlineScript(inline:string) {
        this._inlineScript = inline;
        return this;
    }

    setCommand(command:string) {
        this._command = command;
        return this;
    }

    setCommandArgs(args:any) {
        this._commandArgs = args;
        return this;
    }

    setCommandsPath(path:string) {
        this._commandsPath = path;
        return this;
    }

    setPluginsInfo(pluginsInfo:string) {
        return this.addGlobal(this._loadPlugins(pluginsInfo));
    }

    run() {
        if (!isEmpty(this._command)) {
            const commandFile:string = resolveCommand(this._commandsPath, this._command);
            return this._createVM().run(`'use strict';
                const command = require('${commandFile}');
                module.exports = (argv) => command(argv)${this._inlineScript ? '.' + this._inlineScript : ''}`,
            commandFile)(this._commandArgs || {});
        }
        
        const inlineScript = isEmpty(this._inlineScript) ?
            'select()' : this._inlineScript;
                
        return this._createVM().
            run(`'use strict';module.exports = () => ${inlineScript};`)();
    }

    _loadPlugins(pluginsInfo:string) {
        const homeDir = dirname(pluginsInfo);
        return this._createVM().run(`'use scrict';
            module.exports = () => {
                const pluginsInfo = require("${pluginsInfo}");
                const result = {};
                Object.keys(pluginsInfo).forEach(name => {
                    result["$" + name] = require(pluginsInfo[name])("${homeDir}");
                });
                return result;
            }
        `, pluginsInfo)();
    }

    _loadPath(path:string) {
        return this._createVM().run(`'use strict';
            module.exports = () =>
                requireDir('${path}', { 
                    recurse: true 
                })`, `${path}/index.js`)();
    }

    _run(command:string, input:Stream) {
        const runner = new ScriptRunner(input);
        runner._global = this._global;
        runner._command = command;
        runner._commandsPath = this._commandsPath;
        return runner.run();
    }
}

function resolveCommand(commandsPath:string, command:string): string {
    if (/^.+\.js$/.test(command)) return resolve(process.cwd(), command);
    return resolve(commandsPath, `${command}.js`);
}