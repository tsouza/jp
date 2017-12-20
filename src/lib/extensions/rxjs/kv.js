import { Observable } from 'rxjs';

Observable.prototype.kv = function kv (elementSelector) {
    elementSelector = elementSelector || ((e) => e);
    return this.
        map(value => Object.
            keys(value).
            map(key => ({ key: key, value: elementSelector(value[key]) }))).
        flatMap(e => Observable.from(e));
};