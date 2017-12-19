/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import { StreamScriptCompiler } from '../src/compiler';
import { json as toJSON } from '../src/lib/output';

import { Readable } from 'stream';

import _ from 'lodash';

describe('compile', () => {

    it('should compile simple inline', () => {
        const json = '{"prop1":1}\n';
        const input = fromString(json);
        const compiler = new StreamScriptCompiler(input);
        compiler.setInlineScript('select()');
        return toString(toJSON(compiler.compile())).
            then(out => expect(out).to.equal(json));
    });

    it('should compile inline with a map call', () => {
        const inJson = '{"prop1":1}\n';
        const outJson = '{"prop2":2}\n';
        const input = fromString(inJson);
        const compiler = new StreamScriptCompiler(input);
        compiler.setInlineScript('select().map(o => ({prop2: o.prop1 + 1}))');
        return toString(toJSON(compiler.compile())).
            then(out => expect(out).to.equal(outJson));
    });

    it('should create a pipeline with map using util', () => {
        const inJson = '{"prop1":1,"prop2":2}\n';
        const outJson = '{"prop2":2}\n';
        const input = fromString(inJson);
        const compiler = new StreamScriptCompiler(input);
        compiler.
            addGlobal({ _: _}).
            setInlineScript('select().map(o => _.omit(o, "prop1"))');
        return toString(toJSON(compiler.compile())).
            then(out => expect(out).to.equal(outJson));
    });
});

function toString(stream) {
    return new Promise((resolve, reject) => {
        const array = [];
        stream.on('data', data => array.push(data));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(array.join('')));
    });
}

function fromString(string) {
    const stream = new Readable();
    stream._read = function(){};
    stream.push(string);
    stream.push(null);
    return stream;
}