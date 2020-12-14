'use strict';

import yajs from 'yajson-stream';
import { Promise } from 'bluebird';
import { isObject, isArray } from 'lodash';
import { Stream } from "stream";

export default (stream:Stream, path:string, onNode:any ) =>
    new Promise((resolve, reject) => {
        const s = stream.pipe(yajs(path)).
            on('data', (data: any) => {
                try {
                    populatePathMetadata(data.value, data.path);
                    onNode(data.value);
                } catch (e) {
                    s.destroy();
                    reject(e);
                }
            }).
            on('error', (err: any) => reject(err)).
            on('end', () => resolve());
    });

function populatePathMetadata(node: any, path: string) {
    if (isObject(node) || isArray(node))
        Object.defineProperties(node, {
            __path: { value: path, writable: true },
            __key: { value: path[path.length - 1], writable: true }        
        });
}