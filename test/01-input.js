/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import input from '../src/lib/input';
import * as fs from 'fs';

describe('input', () => {
    describe('value', () => {
        describe('root object', () =>
            generateValueTests('', [ 1, 2, 3 ]));

        describe('single nested variable key', () =>
            generateValueTests('*.', [ 2, 4, 6 ]));  

        describe('deep nested key', () =>
            generateValueTests('.', [ 3, 6, 9 ]));
    });

    /*describe('path metadata', () => {
        describe('key', () =>
            generatePathMetadataTests(node =>
                expect(node).to.have.property('__key', 'path3')));

        describe('parent', () =>
            generatePathMetadataTests(node =>
                expect(node).to.have.property('__parent')));

        describe('path', () =>
            generatePathMetadataTests(node =>
                expect(node).to.have.deep.property('__path',
                    ['path1', 'path2', 'path3'])));

    });*/
});

function generatePathMetadataTests(validate) {

    it('should handle simple json object', () =>
        test('simple', '!.path1.path2[*].path3', data => onNode(data)).
            then(counter => expect(counter).to.equal(1)));

    it('should handle simple array', () =>
        test('array', '![*].path1.path2[*].path3', data => onNode(data)).
            then(counter => expect(counter).to.equal(2)));

    it('should handle newline delimited json', () =>
        test('ndjson', '!.path1.path2[*].path3', data => onNode(data)).
            then(counter => expect(counter).to.equal(3)));
    
    function onNode(node) {
        expect(node).to.have.property('path4', 'value2');
        validate(node);
    }
}
function generateValueTests(path, counts) {
    it('should handle simple json object', () =>
        test('simple', `!.${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[0])));

    it('should handle simple array', () =>
        test('array', `![*].${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[1])));

    it('should handle newline delimited json', () =>
        test('ndjson', `!.${path}prop1`, data => 
            expect(data).to.equal('value1')).
            then(counter => expect(counter).to.equal(counts[2])));
}

function test(json, path, validate) {
    const source = fs.createReadStream(`${__dirname}/stream-tests/${json}.json`);
    let counter = 0;
    return input(source, path, node => {
        validate(node);
        counter++;
    }).then(() => counter);
}