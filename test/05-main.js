/* eslint-env mocha */
'use strict';

import { expect } from 'chai';
import Promise from 'bluebird';

import tmp from 'tmp';
import { createReadStream } from 'fs';

import main from '../src/main';

describe('main', () => {
    
    it('should process simple json', () => 
        createTempFile().
            spread((temp, cleanup) => test(temp).
                then(() => Promise.all([ 
                    toString(`${__dirname}/stream-tests/simple.json`),
                    toString(temp) 
                ]).spread((source, target) => 
                    expect(source).to.equal(target)
                ).finally(() => cleanup()))));

});

function test(temp) {
    return main([ 
        `-i=${__dirname}/stream-tests/simple.json`,
        `-o=${temp}`,
        '-m=json',
        'select()'
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