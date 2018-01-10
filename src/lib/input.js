'use strict';

//import oboe from 'oboe';
import yajs from 'yajson-stream';
import { Promise } from 'bluebird';
import { isObject, isArray, isNumber } from 'lodash';

export default (stream, path, onNode) =>
    new Promise((resolve, reject) => {
        const s = stream.pipe(yajs(path)).
            on('data', (data) => {
                try {
                    populatePathMetadata(data.value, data.path);
                    onNode(data.value);
                } catch (e) {
                    s.destroy();
                    reject(e);
                }
            }).
            on('error', err => reject(err)).
            on('end', () => resolve());
        /*const s = oboe(stream).
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
            fail(err => reject(err));*/
    });

function populatePathMetadata(node, path) {
    if (isObject(node) || isArray(node))
        Object.defineProperties(node, {
            __path: { value: path, writable: true },
            __key: { value: path[path.length - 1], writable: true }        
        });
}