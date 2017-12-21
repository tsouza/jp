'use strict';

import oboe from 'oboe';
import { Promise } from 'bluebird';
import { isObject, isArray, isNumber } from 'lodash';

export default (stream, path, onNode) =>
    new Promise((resolve, reject) => {
        const s = oboe(stream).
            on('node', path, (node, path, ancestors) => {
                try {
                    populatePathMetadata(node, 
                        path.filter(p => !isNumber(p)), 
                        ancestors);
                    onNode(node);
                } catch (e) {
                    s.abort();
                    reject(e);
                }
            }).
            done(() => resolve()).
            fail(err => reject(err));
    });

function populatePathMetadata(node, path, ancestors) {
    if (!node || !ancestors || !ancestors.length || 
        node === ancestors[0] || node.__parent)
        return;

    let key = path[path.length - 1];
    let parent = ancestors[ancestors.length - 1];

    if (isObject(node) || isArray(node))
        Object.defineProperties(node, {
            __parent: { value: parent, writable: true },
            __path: { value: path, writable: true },
            __key: { value: key, writable: true }        
        });

    populatePathMetadata(parent, 
        path.slice(1), ancestors.slice(1));
}