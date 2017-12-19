import { Observable } from 'rxjs';

import TinyQueue from 'tinyqueue';
import { times } from 'lodash';

Observable.prototype.sort = function sort (comparator) {
    return this.reduce((queue, value) => {
        queue.push(value);
        return queue;
    }, new TinyQueue([], comparator)).
        map(queue => {
            const array = [];
            times(queue.length, () => array.push(queue.pop()));
            return array;
        }).flatMap(e => Observable.from(e));
};