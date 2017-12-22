import { Observable } from 'rxjs';
import _ from 'lodash';

const keySelector = (e) => e.key;
const elementSelector = (e) => e;

Observable.prototype.groupJoin = function groupJoin (rightStream,
    leftKeySelector = keySelector, rightKeySelector = keySelector,
    leftElementSelector = elementSelector, rightElementSelector = elementSelector) {

    return this.toArray().
        map(array => _.groupBy(array, leftKeySelector)).
        mergeMap(left => Observable.create(observable => {
            rightStream.subscribe({
                next: value => {
                    try {
                        const key = rightKeySelector(value);
                        (left[key] || []).forEach(left =>
                            observable.next({
                                key: key,
                                left: leftElementSelector(left),
                                right: rightElementSelector(value) 
                            }));
                    } catch (e) {
                        observable.error(e);
                    }
                },
                error: err => observable.error(err),
                complete: () => observable.complete()
            });
        }));
};

Observable.prototype.groupJoinOnKey = function groupJoinOnKey (
    rightStream, key, leftElementSelector, rightElementSelector) {
    return this.groupJoin(rightStream, 
        left => left[key], right => right[key],
        leftElementSelector,
        rightElementSelector);
};