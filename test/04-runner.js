/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import { ScriptRunner } from '../dist/runner';
import { json } from '../dist/lib/output';

import { Readable, PassThrough } from 'stream';

import _ from 'lodash';

import { attempt } from 'bluebird';

import utils from '../dist/lib/extensions/utils';
import rxjs_extensions from '../dist/lib/extensions/rxjs';

import * as rxjs from 'rxjs/operators';

describe('compile', () => {

    const inJson = '{"prop1":1}\n';
    const outJson = '{"prop1":2}\n';

    it('should compile simple inline', () =>
        attempt(() => new ScriptRunner(fromString(inJson))
            .addGlobal(rxjs)
            .addGlobal(utils)
            .addGlobal(rxjs_extensions)
            .setInlineScript('select()')
            .run())
            .then(stream => toString(json, stream))
            .then(out => expect(out).to.equal(inJson)));

    it('should compile inline with a map call', () =>
        attempt(() => new ScriptRunner(fromString(inJson))
            .addGlobal(rxjs)
            .addGlobal(utils)
            .addGlobal(rxjs_extensions)
            .setInlineScript('select().pipe(map(o => ({prop1: o.prop1 + 1})))')
            .run())
            .then(stream => toString(json, stream))
            .then(out => expect(out).to.equal(outJson)));

    it('should compile inline with a map call with pipeline operator syntax', () =>
        attempt(() => new ScriptRunner(fromString(inJson))
            .addGlobal(rxjs)
            .addGlobal(utils)
            .addGlobal(rxjs_extensions)
            .setInlineScript('select() |> map(o => ({prop1: o.prop1 + 1}))')
            .run())
            .then(stream => toString(json, stream))
            .then(out => expect(out).to.equal(outJson)));

    it('should create a pipeline with map using util', () =>
        attempt(() => new ScriptRunner(fromString(inJson))
            .addGlobal(rxjs)
            .addGlobal(utils)
            .addGlobal(rxjs_extensions)
            .setInlineScript('select().pipe(map(o => _.mapValues(o, v => v + 1)))')
            .run())
            .then(stream => toString(json, stream))
            .then(out => expect(out).to.equal(outJson)));
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