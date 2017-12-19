import { VM } from 'vm2';
import filter from './lib/filter';

import { merge, isString } from 'lodash';
import requireDir from 'require-dir';

class GlobalChain {

    constructor(parent) {
        this._parent = parent;
        this._global = {};
        this._parts = [];
    }

    _getGlobal() {
        if (this._parent)
            return this._parent._getGlobal();
        return this._global;
    }

    addGlobal(object) {
        if (isString(object))
            object = requireDir(object, { recurse: true });

        this._global = merge({}, this._global, object || {});
        return this;
    }

} 
export class StreamScriptCompiler extends GlobalChain {

    constructor(input, parent) {
        super(parent);
        this._input = input;
    }

    _createSandbox() {
        return merge({
            select: path => filter(this._input, `!${path || ''}`)
        }, this._getGlobal());
    }

    _createVM() {
        const vm = new VM();
        const sandbox = this._createSandbox();
        Object.keys(sandbox).forEach(key => 
            vm.freeze(sandbox[key], key));
        return vm;
    }

    setInlineScript(inline) {
        this._inline = (inline || '').trim();
        return this;
    }

    compile() {
        const vm = this._createVM();
        if (this._inline)
            return vm.run(`'use strict';${this._inline};`);
    }
}