import { Observable } from 'rxjs';
import _ from 'lodash';

const keySelector = (e) => e.key;
const elementSelector = (e) => e;

Observable.prototype.groupJoin = function groupJoin (rightStream,
    leftKeySelector = keySelector, rightKeySelector = keySelector,
    leftElementSelector = elementSelector, rightElementSelector = elementSelector) {

    return this.
        reduce((grouped, left) => toGroup(grouped, left), {}).
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

        function toGroup(grouped, left) {
            const key = leftKeySelector(left);
            (grouped[key] || (grouped[key] = [])).push(left);
            return grouped;
        }
};

Observable.prototype.groupJoinOnKey = function groupJoinOnKey (
    rightStream, key, leftElementSelector, rightElementSelector) {
    return this.groupJoin(rightStream, 
        left => left[key], right => right[key],
        leftElementSelector,
        rightElementSelector);
};

