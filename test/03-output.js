/* eslint-env mocha */
'use strict';

import { repeat } from 'lodash';

import { expect } from 'chai';

import { json } from '../lib/output';
import filter from '../lib/filter';
import * as fs from 'fs';

describe('output', () => {

    describe('json', () => {

        it('should output simple json', () => 
            toString(json(test('ndjson', '!.object1'))).
                then(out => expect(out).to.equal(repeat(
                    '{"prop1":"value1"}\n', 3
                ))));

        it('should output deep nested json', () => 
            toString(json(test('ndjson', '!..object5[*]'))).
                then(out => expect(out).to.equal(repeat(
                    '{"prop2":"value1"}\n', 9
                ))));

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