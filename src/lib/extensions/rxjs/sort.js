import { Observable } from 'rxjs';
import TinyQueue from 'tinyqueue';

Observable.prototype.sort = function sort (comparator) {
    return this.reduce((queue, value) => {
        queue.push(value);
        return queue;
    }, new TinyQueue([], comparator)).
        mergeMap(queue => Observable.create(observer => {
            for (let i = queue.length - 1; i >= 0; i--) {
                observer.next(queue.pop());
            }
            observer.complete();
        }));
};