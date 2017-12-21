/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import Promise from 'bluebird';

import tmp from 'tmp';
import { createReadStream } from 'fs';

import { asc } from 'comparator';

import main from '../src/main';

describe('main', () => {
    
    it('should process simple json', () => 
        createTempFile().
            spread((temp, cleanup) => testSimple(temp).
                then(() => Promise.all([ 
                    toString(`${__dirname}/stream-tests/simple.json`),
                    toString(temp) 
                ]).spread((source, target) => 
                    expect(source).to.equal(target)
                ).finally(() => cleanup()))));

    it('should process simple json with utils', () => 
        createTempFile().
            spread((temp, cleanup) => testUtils(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort()).
                        to.be.deep.equal([2, 3, 4, 5, 6, 7])).
                    finally(() => cleanup()))));

    it('should process simple json with script', () => 
        createTempFile().
            spread((temp, cleanup) => testScript(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort()).
                        to.be.deep.equal([3, 4, 5, 6, 7, 8])).
                    finally(() => cleanup()))));

    it('should process simple json with script using "from"', () => 
        createTempFile().
            spread((temp, cleanup) => testScriptWithFrom(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort(asc('sort1'))).
                        to.be.deep.equal([
                            { sort1: 'val-1' },
                            { sort1: 'val-2' },
                            { sort1: 'val-3' }
                        ])).
                    finally(() => cleanup()))));
            
});

function testSimple(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/simple.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-r', '/some-bogus-directory'
    ]);
}

function testUtils(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-r', `${__dirname}/repo-test`,
        '-l',
        'select("!.num[*]").map(i => plusOne(i)).toArray()'
    ]);
}

function testScript(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-r', `${__dirname}/repo-test`,
        'script/testSimple',
        'num:1'
    ]);
}

function testScriptWithFrom(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-r', `${__dirname}/repo-test`,
        'script/testFrom'
    ]);
}

function createTempFile() {
    return new Promise((resolve, reject) => {
        tmp.file({ discardDescriptor: true }, (err, path, fd, cleanup) => {
            if (err) {
                return reject(err);
            }
            resolve([ path, cleanup ]);
        });
    });
}

function toString(stream) {
    stream = createReadStream(stream);
    return new Promise((resolve, reject) => {
        const array = [];
        stream.on('data', data => array.push(data));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(array.join('')));
    });
}