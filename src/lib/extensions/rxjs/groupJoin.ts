import _ from 'lodash';
import { MonoTypeOperatorFunction, Observable, Observer, of } from 'rxjs';
import { mergeMap, reduce } from 'rxjs/operators';

const keySelector = (e: any) => e.key;
const elementSelector = (e: any) => e;

export default function groupJoin<T>(rightStream: Observable<any>,
    leftKeySelector = keySelector, rightKeySelector = keySelector,
    leftElementSelector = elementSelector, rightElementSelector = elementSelector): MonoTypeOperatorFunction<T> {
    return (source) => {
        return source.pipe(
            reduce((grouped: any, left) => toGroup(grouped, left), {}),
            mergeMap((left:any) => new Observable((observer:Observer<any>) => {
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
                    error: (err:any) => observer.error(err),
                    complete: () => observer.complete()
                });
            }))
        )

        function toGroup(grouped: any, left: any) {
            const key = leftKeySelector(left);
            (grouped[key] || (grouped[key] = [])).push(left);
            return grouped;
        }

    }
}

export function groupJoinOnKey<T>(rightStream: Observable<any>, key:string, 
    leftElementSelector?: (e: any) => any, rightElementSelector?: (e: any) => any): MonoTypeOperatorFunction<T> {
    return groupJoin(rightStream, 
       left => left[key], right => right[key],
        leftElementSelector,
        rightElementSelector);
};

