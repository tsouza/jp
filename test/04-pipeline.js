/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import { PipelineBuilder } from '../pipeline';

import { Readable } from 'stream';

import _ from 'lodash';

describe('pipeline', () => {

    it('should create a simple pipeline', () => {
        const json = '{"prop1":1}\n';
        const input = fromString(json);
        const builder = new PipelineBuilder(input);
        builder.addPipelinePart('select("!")');
        return toString(builder.build('json')).
            then(out => expect(out).to.equal(json));
    });

    it('should create a pipeline with map', () => {
        const inJson = '{"prop1":1}\n';
        const outJson = '{"prop2":2}\n';
        const input = fromString(inJson);
        const builder = new PipelineBuilder(input);
        builder.
            addPipelinePart('select("!")').
            addPipelinePart('map(o => ({prop2: o.prop1 + 1}))');
        return toString(builder.build('json')).
            then(out => expect(out).to.equal(outJson));
    });

    it('should create a pipeline with map using util', () => {
        const inJson = '{"prop1":1,"prop2":2}\n';
        const outJson = '{"prop2":2}\n';
        const input = fromString(inJson);
        const builder = new PipelineBuilder(input);
        builder.addGlobal({ _: _});
        builder.
            addPipelinePart('select("!")').
            addPipelinePart('map(o => _.omit(o, "prop1"))');
        return toString(builder.build('json')).
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