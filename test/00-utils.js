/* eslint-env mocha */
'use strict';

import { expect } from 'chai';

import utils from '../dist/lib/extensions/utils';

describe('utils', () => {

    describe('bytes', () => {

        const bytes = utils.bytes;
        const suffixes = ['KB','MB','GB','TB','PB','EB'];

        it('should parse human value to number (simple)', () => {
            const parsed = bytes.parse();
            suffixes.forEach((suffix, idx) =>
                expect(parsed(`1${suffix}`)).to.be.equal(Math.pow(1024, idx + 1)));
        });
        
        it('should parse human value to number (object)', () => {
            expect(bytes.parse('prop1', 'prop2')({ prop1: '1kb', prop2: '1kb' })).
                to.be.deep.equal({ prop1: 1024, prop2: 1024 });

            expect(bytes.parse()({ prop1: '1kb', prop2: 'test' })).
                to.be.deep.equal({ prop1: 1024, prop2: 'test' });
        });

        it('should humanize number value (simple)', () => {
            const huminized = bytes.human();
            suffixes.forEach((suffix, idx) =>
                expect(huminized(Math.floor(Math.pow(1024, idx + 1)))).
                    to.be.equal(`1 ${suffix}`));
        });
    });

    describe('$', () => {
        const $ = utils['$'];

        it('should pick a nested field', () =>
            expect($('.prop1.nested')({ prop1: { nested: 1 } })).
                to.be.equal(1));

        it('should pick nested fields', () =>
            expect($({ 
                prop1: $('.prop1.nested1'),
                prop2: $('.prop1.nested2') 
            })({ prop1: { nested1: 1, nested2: 2 } })).
                to.be.deep.equal({ prop1: 1, prop2: 2 }));
    });
});