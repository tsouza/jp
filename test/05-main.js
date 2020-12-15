/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import Promise from 'bluebird';

import tmp from 'tmp';
import { createReadStream } from 'fs';

import { asc } from '../dist/lib/extensions/utils/order';

import main from '../dist/main';

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

    it('should process simple json with plugins', () => 
        createTempFile().
            spread((temp, cleanup) => testPlugins(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort()).
                        to.be.deep.equal([1, 1, 1, 1, 1, 1])).
                    finally(() => cleanup()))));
            
    it('should process simple json with script', () => 
        createTempFile().
            spread((temp, cleanup) => testScript(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort()).
                        to.be.deep.equal([3, 4, 5, 6, 7, 8])).
                    finally(() => cleanup()))));

    it('should process simple json with script using pipeline syntax', () => 
        createTempFile().
            spread((temp, cleanup) => testScriptWithPipelineSyntax(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort()).
                        to.be.deep.equal([3, 4, 5, 6, 7, 8])).
                    finally(() => cleanup()))));
            
    it('should process simple json with script and inline', () => 
        createTempFile().
            spread((temp, cleanup) => testScriptWithInline(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(count => expect(count).to.be.equal(6)).
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

    it('should process simple json with script using "run"', () => 
        createTempFile().
            spread((temp, cleanup) => testScriptWithRun(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort(asc('sort1'))).
                        to.be.deep.equal([
                            { sort1: 'val-1' },
                            { sort1: 'val-2' },
                            { sort1: 'val-3' }
                        ])).
                    finally(() => cleanup()))));
            
    it('should join multiple streams', () => 
        createTempFile().
            spread((temp, cleanup) => testScriptWithJoin(temp).
                then(() => toString(temp).
                    then(result => JSON.parse(result)).
                    then(array => expect(array.sort(asc('left', 'right'))).
                        to.be.deep.equal([
                            { key: 'key', left: 'left-1', right: 'right-1' },
                            { key: 'key', left: 'left-1', right: 'right-2' },
                            { key: 'key', left: 'left-1', right: 'right-3' },
                            { key: 'key', left: 'left-2', right: 'right-1' },
                            { key: 'key', left: 'left-2', right: 'right-2' },
                            { key: 'key', left: 'left-2', right: 'right-3' },
                            { key: 'key', left: 'left-3', right: 'right-1' },
                            { key: 'key', left: 'left-3', right: 'right-2' },
                            { key: 'key', left: 'left-3', right: 'right-3' } ])).
                    finally(() => cleanup()))));

    it('should throw error because of unknown option', () => 
        testUnknownOption().
            then(() => expect.fail('no error', 'ARGV_ERROR')).
            catch(err => {
                expect(err.message).to.be.equal('ARGV_ERROR');
            })
    );
});

function testSimple(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/simple.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', '/some-bogus-directory'
    ]);
}

function testUtils(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        '-l',
        'select(".num").pipe(map(i => plusOne(i)),toArray())'
    ]);
}

function testPlugins(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        '-l',
        'select(".num").pipe(map(i => $test_plugin(i)),toArray())'
    ]);
}

function testScript(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        'script/testSimple',
        'num:1'
    ]);
}

function testScriptWithPipelineSyntax(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        'script/testSimplePipelineSyntax',
        'num:1'
    ]);
}

function testScriptWithInline(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        '-l', 'pipe(flatMap(i => i),count())',
        'script/testSimple'
    ]);
}

function testScriptWithFrom(temp) {
    return main([ 
        '-i', `${__dirname}/stream-tests/ndjson.json`,
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        'script/testFrom'
    ]);
}

function testScriptWithRun(temp) {
    return main([ 
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        'script/testRun'
    ]);
}

function testScriptWithJoin(temp) {
    return main([ 
        '-o', `${temp}`,
        '-m', 'json',
        '-h', `${__dirname}/repo-test`,
        'script/testGroupJoin'
    ]);
}

function testUnknownOption() {
    return main(['--unknown']);
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