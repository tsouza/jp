import { Observable } from 'rxjs';
import _ from 'lodash';
import { isEmpty } from 'rxjs/operator/isEmpty';

const keySelector = (e) => e.key;
const elementSelector = (e) => e;

Observable.prototype.groupJoin = function groupJoin (rightStream,
    leftKeySelector = keySelector, rightKeySelector = keySelector,
    leftElementSelector = elementSelector, rightElementSelector = elementSelector) {

    return this.toArray().
        map(array => _.groupBy(array, leftKeySelector)).
        mergeMap(left => Observable.create(observable => {
            rightStream.subscribe({
                next: rightElement => {
                    try {
                        const key = rightKeySelector(rightElement);
                        const leftJoin = left[key];
                        if (_.isEmpty(leftJoin))
                            return;
                        for (let i = leftJoin.length - 1; i >= 0; i--) {
                            observable.next({
                                key: key,
                                left: leftElementSelector(leftJoin[i]),
                                right: rightElementSelector(rightElement) 
                            });
                        }
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