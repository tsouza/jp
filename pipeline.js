import { VM } from 'vm2';
import filter from './lib/filter';

import { merge, isString } from 'lodash';
import requireDir from 'require-dir';

import { json, asciiTable } from './lib/output';
class GlobalChain {

    constructor(parent) {
        this._parent = parent;
        this._global = {};
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
    }

} 
export class PipelineBuilder extends GlobalChain {

    constructor(input, parent) {
        super(parent);
        this._input = input;
    }

    _createSandbox() {
        return merge({
            stream: () => this._stream,
            select: path => filter(this._input, path)
        }, this._getGlobal());
    }

    _initVM() {
        if (!this._vm) {
            this._vm = new VM();
            const sandbox = this._createSandbox();
            Object.keys(sandbox).forEach(key => 
                this._vm.freeze(sandbox[key], key));
        }
    }

    addPipelinePart(part) {
        part = part.trim();
        this._initVM();
        this._stream = !this._stream ?
            this._vm.run(`'use strict';${part}`) :
            this._vm.run(`'use strict';stream().${part}`);
        return this;
    }

    build(mode) {
        switch (mode) {
            case 'json': return json(this._stream);
            case 'table-ascii': return asciiTable(this._stream);
        }
    }
}