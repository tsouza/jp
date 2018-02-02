import { Observable } from 'rxjs';

import TinyQueue from 'tinyqueue';
import { times } from 'lodash';

Observable.prototype.sort = function sort (comparator) {
    return this.toArray().
        map(array => new TinyQueue(array, comparator)).
        mergeMap(queue => Observable.create(observer => {
            for (let i = queue.length - 1; i >= 0; i--) {
                observer.next(queue.pop());
            }
            observer.complete();
        }));
};