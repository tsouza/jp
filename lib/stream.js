'use strict';

import oboe from 'oboe';
import { Promise } from 'bluebird';
export default (stream, path, onNode) =>
    new Promise((resolve, reject) => {
        oboe(stream).
            on('node', path, onNode).
            done(() => resolve()).
            fail(err => reject(err));
    });
