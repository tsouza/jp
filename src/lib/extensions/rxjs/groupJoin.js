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
        mergeMap(left => Observable.create(observer => {
            rightStream.subscribe({
                next: rightElement => {
                    try {
                        const key = rightKeySelector(rightElement);
                        const leftJoin = left[key];
                        if (_.isEmpty(leftJoin))
                            return;
                        for (let i = leftJoin.length - 1; i >= 0; i--) {
                            observer.next({
                                key: key,
                                left: leftElementSelector(leftJoin[i]),
                                right: rightElementSelector(rightElement) 
                            });
                        }
                    } catch (e) {
                        observer.error(e);
                    }
                },
                error: err => observer.error(err),
                complete: () => observer.complete()
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