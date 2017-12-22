/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import { ScriptRunner } from '../src/runner';
import { json } from '../src/lib/output';

import { Readable, PassThrough } from 'stream';

import _ from 'lodash';

describe('compile', () => {

    const inJson = '{"prop1":1}\n';
    const outJson = '{"prop1":2}\n';

    it('should compile simple inline', () =>
        new ScriptRunner(fromString(inJson)).
            setInlineScript('select()').
            run().
            then(stream => toString(json, stream)).
            then(out => expect(out).to.equal(inJson)));

    it('should compile inline with a map call', () =>
        new ScriptRunner(fromString(inJson)).
            setInlineScript('select().map(o => ({prop1: o.prop1 + 1}))').
            run().
            then(stream => toString(json, stream)).
            then(out => expect(out).to.equal(outJson)));

    it('should create a pipeline with map using util', () =>
        new ScriptRunner(fromString(inJson)).
            addGlobal({ _: _}).
            setInlineScript('select().map(o => _.mapValues(o, v => v + 1))').
            run().
            then(stream => toString(json, stream)).
            then(out => expect(out).to.equal(outJson)));
});

function toString(output, stream) {
    return new Promise((resolve, reject) => {
        const test = new PassThrough(), array = [];
        test.on('data', data => array.push(data.toString()));
        test.on('error', err => reject(err));
        test.on('end', () => resolve(array.join('')));

        output(stream, test);
    });
}

function fromString(string) {
    const stream = new Readable();
    stream._read = function(){};
    stream.push(string);
    stream.push(null);
    return stream;
}