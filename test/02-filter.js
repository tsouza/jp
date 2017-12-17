/* eslint-env mocha */
'use strict';

import { KeyAndGroup } from '../lib/extensions/groupAndMergeBy';

import { expect } from 'chai';

import filter from '../lib/filter';
import * as fs from 'fs';

describe('filter', () => {

    it('should reduce to simple array', () => 
        new Promise((resolve, reject) => {
            const array = [];
            test('ndjson', '!.num[*]').
                subscribe({
                    next: num => array.push(num),
                    error: err => reject(err),
                    complete: () => resolve(array)
                });
        }).then(array => expect(array.sort()).to.deep.equal([
            1, 2, 3, 4, 5, 6
        ])));

    it('should calculate max value', () =>
        test('ndjson', '!.num[*]').
            max().toPromise().
            then(val => expect(val).to.equal(6)));

    it('should group by key "value1"', () =>
        test('ndjson', '!').
            groupAndMergeBy(e => e.prop1).toPromise().
            then(group => expect(group).to.
                be.instanceOf(KeyAndGroup).and.
                have.property('groupKey', 'value1')));
    

});

function test(json, path) {
    const stream = fs.createReadStream(`${__dirname}/stream-tests/${json}.json`);
    return filter(stream, path);
}