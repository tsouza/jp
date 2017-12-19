import { VM, NodeVM } from 'vm2';
import filter from './lib/filter';

import { merge } from 'lodash';
import requireDir from 'require-dir';

import { readFile as _readFile } from 'fs';
import { attempt } from 'bluebird';

export class StreamScriptCompiler {

    constructor(input) {
        this._input = input;
        this._global = {};
    }

    _createSandbox() {
        return merge({
            select: path => filter(this._input, `!${path || ''}`)
        }, this._global);
    }

    _createVM(createVM) {
        const vm = createVM();
        const sandbox = this._createSandbox();
        Object.keys(sandbox).forEach(key => 
            vm.freeze(sandbox[key], key));
        return vm;
    }

    addGlobal(object) {
        this._global = merge({}, this._global, object || {});
        return this;
    }

    addGlobalFromPath(path) {
        return this.addGlobal(loadGlobalFromPath(path));
    }

    setInlineScript(inline) {
        this._inlineScript = inline;
        return this;
    }

    setScriptPath(path) {
        this._scriptPath = path;
        return this;
    }

    compile() {
        if (this._inlineScript)
            return attempt(() => this._createVM(() => new VM()).
                run(`'use strict';${this._inlineScript};`));

        return readFile(this._scriptPath).then(script =>
            this._createVM(() => new NodeVM({
                require: { external: true, context: 'sandbox' }
            })).run(`'use strict';${script}`)());
    }
}

function loadGlobalFromPath(path) {
    const vm = new NodeVM({
        sandbox: { requireDir: requireDir },
        require: { external: true, context: 'sandbox' }
    });
    return vm.run('module.exports = () => requireDir(__dirname)',
        `${path}/index.js`)();
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        _readFile(path, (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data.toString());
        });
    });
}