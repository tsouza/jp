'use strict';

import oboe from 'oboe';
import { Promise } from 'bluebird';
import { isObject, isArray, isNumber } from 'lodash';

export default (stream, path, onNode) =>
    new Promise((resolve, reject) => {
        const s = oboe(stream).
            on('node', path, (node) => {
                try {
                    onNode(node);
                } catch (e) {
                    s.abort();
                    reject(e);
                }
            })/*.
            on('node', '*', (node, path, ancestors) =>
                populatePathMetadata(node, 
                    path.filter(o => !isNumber(o)),
                    ancestors))*/.
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
            __parent: { value: parent },
            __path: { value: path },
            __key: { value: key }        
        });

    populatePathMetadata(parent, 
        path.slice(1), ancestors.slice(1));
}