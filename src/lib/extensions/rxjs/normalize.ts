import { Observable } from 'rxjs'
import { toArray } from 'rxjs/operators'
import { map } from "rxjs/operators";
import { MonoTypeOperatorFunction, GroupedObservable } from "rxjs";

export default (): MonoTypeOperatorFunction<any> => {
  
  return source => new Observable(subscriber => {
    source.subscribe({
      next(value) {
        try {
          if (value instanceof GroupedObservable) {
            const key = value.key;
            value = value.pipe(
              toArray(),
              map(array => ({ key: key, values: array }))
            );
          }

          if (value instanceof Observable) {
            value.pipe(map(o => o))
              .subscribe({
                next: o => subscriber.next(o),
                error: err => subscriber.error(err)
              });
          } else {
            subscriber.next(value);
          }
        } catch (e) {
          subscriber.error(e)
        }

      },
      error(error) {
        subscriber.error(error);
      },
      complete() {
        subscriber.complete();
      }
    })
  })

}

