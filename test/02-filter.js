/* eslint-env mocha */
'use strict';

// import '../dist/lib/extensions/rxjs/';

import { expect, use } from 'chai';
import chaiSorted from 'chai-sorted';

use(chaiSorted);

import filter from '../dist/lib/filter';
import * as fs from 'fs';

import { asc, desc } from '../dist/lib/extensions/utils/order';

import { max, toArray  } from 'rxjs/operators'
import kv from '../dist/lib/extensions/rxjs/kv'
import sort from '../dist/lib/extensions/rxjs/sort'
import stats from '../dist/lib/extensions/rxjs/stats'
import groupJoin from '../dist/lib/extensions/rxjs/groupJoin'

describe('filter', () => {

    it('should reduce to simple array', () => 
        new Promise((resolve, reject) => {
            const array = [];
            test('ndjson', '$.num').
                subscribe({
                    next: num => array.push(num),
                    error: err => reject(err),
                    complete: () => resolve(array)
                });
        }).then(array => expect(array.sort()).to.deep.equal([
            1, 2, 3, 4, 5, 6
        ])));

    it('should calculate max value', () =>
        test('ndjson', '$.num').pipe(
            max()).toPromise().
            then(val => expect(val).to.equal(6)));

    it('should transform to key-value objects', () =>
        test('ndjson-kv', '$').pipe(
                kv(),
                toArray()
            ).toPromise().
            then(val => expect(val.sort(asc('key'))).
                to.deep.equal([
                    { key: 'key1', value: 1 },
                    { key: 'key2', value: 2 },
                    { key: 'key3', value: 3 }
                ])));
    
    it('should sort by key "sort1" asc', () =>
        test('ndjson-sort', '$').pipe(
            sort(asc('sort1')),toArray()).toPromise().
            then(sorted => expect(sorted).to.
                be.instanceOf(Array).and.
                be.sortedBy('sort1')));
            
    it('should sort by key "sort1" desc', () =>
        test('ndjson-sort', '$').pipe(
            sort(desc('sort1')),toArray()).toPromise().
            then(sorted => expect(sorted).to.
                be.instanceOf(Array).and.
                be.sortedBy('sort1', true)));
    
    it('should groupJoin two streams', () =>
        test('ndjson-join-left', '$').pipe(
                groupJoin(test('ndjson-join-right', '$'),
                left => left.keyLeft,   right => right.keyRight,
                left => left.valueLeft, right => right.valueRight),
            toArray()).toPromise().
            then(join => expect(join.sort(asc('left', 'right'))).
                to.deep.equal([
                    { key: 'key', left: 'left-1', right: 'right-1' },
                    { key: 'key', left: 'left-1', right: 'right-2' },
                    { key: 'key', left: 'left-1', right: 'right-3' },
                    { key: 'key', left: 'left-2', right: 'right-1' },
                    { key: 'key', left: 'left-2', right: 'right-2' },
                    { key: 'key', left: 'left-2', right: 'right-3' },
                    { key: 'key', left: 'left-3', right: 'right-1' },
                    { key: 'key', left: 'left-3', right: 'right-2' },
                    { key: 'key', left: 'left-3', right: 'right-3' } ])));

    it('should calculate descriptive statistics over "num"', () =>
        test('ndjson', '$.num').pipe(
            stats()).toPromise().
            then(stats => expect(stats).to.deep.equal({ 
                min: 1,
                max: 6,
                sum: 21,
                zeroes: 0,
                mean: 3.5,
                stddev: 1.707825127659933,
                p01: 1,
                p10: 1,
                p25: 2.5,
                p50: 3.5,
                p75: 4.5,
                p90: 6,
                p99: 6 })));
});

function test(json, path) {
    const stream = fs.createReadStream(`${__dirname}/stream-tests/${json}.json`);
    return filter(stream, path);
}