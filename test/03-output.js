/* eslint-env mocha */
'use strict';

import { repeat } from 'lodash';

import { expect } from 'chai';

import { json, tableAscii } from '../src/lib/output';

import filter from '../src/lib/filter';
import * as fs from 'fs';

import { asc } from 'comparator';

describe('output', () => {

    describe('json', () => {

        it('should print simple json', () => 
            toString(json(test('ndjson', '!.object1'))).
                then(out => expect(out).to.equal(repeat(
                    '{"prop1":"value1"}\n', 3
                ))));

        it('should print deep nested json', () => 
            toString(json(test('ndjson', '!..object5[*]'))).
                then(out => expect(out).to.equal(repeat(
                    '{"prop2":"value1"}\n', 9
                ))));

    });

    describe('table', () => {

        it('should print simple objects', () =>
            toString(tableAscii(test('ndjson', '!.object1'))).
                then(out => expect(out).to.equal([
                    '.--------.\n',
                    '| prop1  |\n',
                    '|--------|\n',
                    '| value1 |\n',
                    '| value1 |\n',
                    '| value1 |\n',
                    '\'--------\''
                ].join(''))));
       
        it('should not print nested structures objects', () =>
            toString(tableAscii(test('ndjson', '!').
                map(o => ({ num: o.num, prop1: o.prop1, object1: o.object1 })))).
                then(out => expect(out).to.equal([
                    '.-----------------------------.\n',
                    '|   num   | object1  | prop1  |\n',
                    '|---------|----------|--------|\n',
                    '| [array] | [object] | value1 |\n',
                    '| [array] | [object] | value1 |\n',
                    '| [array] | [object] | value1 |\n',
                    '\'-----------------------------\''
                ].join(''))));


        it('should print grouped results', () =>
            toString(tableAscii(test('ndjson', '!').
                groupAndMergeBy(o => o.group1))).
                then(out => expect(out).to.equal([
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group1                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '| group1 |   num   |  num2   | object1  | object3  | object4  |  path1   | prop1  |\n',
                    '|--------|---------|---------|----------|----------|----------|----------|--------|\n',
                    '| group1 | [array] | [array] | [object] | [object] | [object] | [object] | value1 |\n',
                    '\'---------------------------------------------------------------------------------\'\n',
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group2                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '| group1 |   num   |  num2   | object1  | object3  | object4  |  path1   | prop1  |\n',
                    '|--------|---------|---------|----------|----------|----------|----------|--------|\n',
                    '| group2 | [array] | [array] | [object] | [object] | [object] | [object] | value1 |\n',
                    '\'---------------------------------------------------------------------------------\'\n',
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group3                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '| group1 |   num   |  num2   | object1  | object3  | object4  |  path1   | prop1  |\n',
                    '|--------|---------|---------|----------|----------|----------|----------|--------|\n',
                    '| group3 | [array] | [array] | [object] | [object] | [object] | [object] | value1 |\n',
                    '\'---------------------------------------------------------------------------------\''
                ].join(''))));

        it('should print sorted by "sort1" asc', () =>
            toString(tableAscii(test('ndjson-sort', '!').
                sort(asc('sort1')))).
                then(out => expect(out).to.equal([
                    '.-------.\n',
                    '| sort1 |\n',
                    '|-------|\n',
                    '| val-1 |\n',
                    '| val-2 |\n',
                    '| val-3 |\n',
                    '\'-------\''
                ].join(''))));
    
    });
});

function test(json, path) {
    const stream = fs.createReadStream(`${__dirname}/stream-tests/${json}.json`);
    return filter(stream, path);
}

function toString(stream) {
    return new Promise((resolve, reject) => {
        const array = [];
        stream.on('data', data => array.push(data));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(array.join('')));
    });
}