/* eslint-env node, mocha */
'use strict';

import { expect } from 'chai';

import stream from '../lib/stream';
import * as fs from 'fs';

describe('stream', () => {

    describe('root object', () => {
        generateTests('', [ 1, 2, 3 ]);
    });

    describe('single nested variable key', () => {
        generateTests('*.', [ 2, 4, 6 ]);
    });  

    describe('deep nested key', () => {
        generateTests('.', [ 3, 6, 9 ]);
    });  
});


function generateTests(path, counts) {
    it('should handle simple json object', () => {
        return test('simple', `!.${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[0]));
    });

    it('should handle simple array', () => {
        return test('array', `![*].${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[1]));
    });

    it('should handle newline delimited json', () => {
        return test('ndjson', `!.${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[2]));
    });
}

function test(num, path, validate) {
    let source = fs.createReadStream(`${__dirname}/stream-tests/${num}.json`);
    let counter = 0;
    return stream(source, path, node => {
        validate(node);
        counter++;
    }).then(() => counter);
}