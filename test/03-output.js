/* eslint-env mocha */
'use strict';

import { repeat } from 'lodash';

import { expect } from 'chai';

import { json, tableAscii } from '../src/lib/output';

import filter from '../src/lib/filter';
import * as fs from 'fs';

import { asc } from 'comparator';

import { PassThrough } from 'stream';

describe('output', () => {

    describe('json', () => {

        it('should print simple json', () => 
            toString(json, test('ndjson', '$.object1')).
                then(out => expect(out).to.equal(repeat(
                    '{"prop1":"value1"}\n', 3
                ))));

        it('should print grouped json', () => 
            toString(json, test('ndjson', '$.object1').
                groupBy(o => o.prop1)).
                then(o => JSON.parse(o)).
                then(out => expect(out).to.be.deep.equal({
                    key: 'value1',
                    values:[
                        { prop1: 'value1' },
                        { prop1: 'value1' },
                        { prop1: 'value1' }]
                })));

        it('should print deep nested json', () => 
            toString(json, test('ndjson', '$..object5')).
                then(out => expect(out).to.equal(repeat(
                    '{"prop2":"value1"}\n', 9
                ))));

    });

    describe('table', () => {

        it('should print simple objects', () =>
            toString(tableAscii, test('ndjson', '$.object1')).
                then(out => expect(out).to.equal([
                    '.--------.\n',
                    '| prop1  |\n',
                    '|--------|\n',
                    '| value1 |\n',
                    '| value1 |\n',
                    '| value1 |\n',
                    '\'--------\'\n'
                ].join(''))));
       
        it('should not print nested structures objects', () =>
            toString(tableAscii, test('ndjson', '$').
                map(o => ({ num: o.num, prop1: o.prop1, object1: o.object1 }))).
                then(out => expect(out).to.equal([
                    '.-----------------------------.\n',
                    '|   num   | prop1  | object1  |\n',
                    '|---------|--------|----------|\n',
                    '| [array] | value1 | [object] |\n',
                    '| [array] | value1 | [object] |\n',
                    '| [array] | value1 | [object] |\n',
                    '\'-----------------------------\'\n'
                ].join(''))));


        it('should print grouped results', () =>
            toString(tableAscii, test('ndjson', '$').
                groupBy(o => o.group1)).
                then(out => expect(out).to.equal([
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group1                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '|   num   |  num2   | group1 | prop1  | object1  | object3  | object4  |  path1   |\n',
                    '|---------|---------|--------|--------|----------|----------|----------|----------|\n',
                    '| [array] | [array] | group1 | value1 | [object] | [object] | [object] | [object] |\n',
                    '\'---------------------------------------------------------------------------------\'\n',
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group2                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '|   num   |  num2   | group1 | prop1  | object1  | object3  | object4  |  path1   |\n',
                    '|---------|---------|--------|--------|----------|----------|----------|----------|\n',
                    '| [array] | [array] | group2 | value1 | [object] | [object] | [object] | [object] |\n',
                    '\'---------------------------------------------------------------------------------\'\n',
                    '.---------------------------------------------------------------------------------.\n',
                    '|                                     group3                                      |\n',
                    '|---------------------------------------------------------------------------------|\n',
                    '|   num   |  num2   | group1 | prop1  | object1  | object3  | object4  |  path1   |\n',
                    '|---------|---------|--------|--------|----------|----------|----------|----------|\n',
                    '| [array] | [array] | group3 | value1 | [object] | [object] | [object] | [object] |\n',
                    '\'---------------------------------------------------------------------------------\'\n'
                ].join(''))));

        it('should print sorted by "sort1" asc', () =>
            toString(tableAscii, test('ndjson-sort', '$').
                sort(asc('sort1'))).
                then(out => expect(out).to.equal([
                    '.-------.\n',
                    '| sort1 |\n',
                    '|-------|\n',
                    '| val-1 |\n',
                    '| val-2 |\n',
                    '| val-3 |\n',
                    '\'-------\'\n'
                ].join(''))));
    
    });
});

function test(json, path) {
    const stream = fs.createReadStream(`${__dirname}/stream-tests/${json}.json`);
    return filter(stream, path);
}

function toString(output, stream) {
    return new Promise((resolve, reject) => {
        const test = new PassThrough(), array = [];
        test.on('data', data => array.push(data.toString()));
        test.on('error', err => reject(err));
        test.on('end', () => resolve(array.join('')));

        output(stream, test);
    });
}