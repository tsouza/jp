'use strict';

import { rxToStream } from 'rxjs-stream';

export function json (observable) {
    return rxToStream(observable.
        map(o => `${JSON.stringify(o)}\n`));
}