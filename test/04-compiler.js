/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import { StreamScriptCompiler } from '../src/compiler';
import { json as toJSON } from '../src/lib/output';

import { Readable } from 'stream';

import _ from 'lodash';

describe('compile', () => {

    const inJson = '{"prop1":1}\n';
    const outJson = '{"prop1":2}\n';

    it('should compile simple inline', () =>
        new StreamScriptCompiler(fromString(inJson)).
            setInlineScript('select()').compile().
            then(stream => toString(toJSON(stream))).
            then(out => expect(out).to.equal(inJson)));

    it('should compile inline with a map call', () =>
        new StreamScriptCompiler(fromString(inJson)).
            setInlineScript('select().map(o => ({prop1: o.prop1 + 1}))').
            compile().
            then(stream => toString(toJSON(stream))).
            then(out => expect(out).to.equal(outJson)));

    it('should create a pipeline with map using util', () =>
        new StreamScriptCompiler(fromString(inJson)).
            addGlobal({ _: _}).
            setInlineScript('select().map(o => _.mapValues(o, v => v + 1))').
            compile().
            then(stream => toString(toJSON(stream))).
            then(out => expect(out).to.equal(outJson)));
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