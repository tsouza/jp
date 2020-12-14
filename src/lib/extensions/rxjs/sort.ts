import _ from "lodash";
import { MonoTypeOperatorFunction, Observable, Observer, pipe } from "rxjs";
import { reduce, mergeMap } from "rxjs/operators";
import TinyQueue, { Comparator } from "tinyqueue";

export default function sort(comparator: Comparator<any>): MonoTypeOperatorFunction<any> {
    return pipe(
        reduce((queue: any, value: any) => {
            queue.push(value);
            return queue;
        }, new TinyQueue([], comparator)),
        mergeMap((queue: any) => new Observable((observer: Observer<any>) => {
            for (let i = queue.length - 1; i >= 0; i--) {
                observer.next(queue.pop());
            }
            observer.complete();
        }))
    )
}