import { Observable } from 'rxjs';
import _ from 'lodash';

Observable.prototype.kv = function kv (keyName = 'key', elementSelector) {
    elementSelector = elementSelector || ((e) => e);
    return this.
        map(value => Object.
            keys(value).
            map(key => {
                let val = elementSelector(value[key]);
                if (!_.isObject(val) || _.isArray(val))
                    val = { value: val };
                const result = _.merge({ [keyName]: key }, val);
                Object.defineProperties(result, {
                    __path: { value: value.__path, writable: true },
                    __key: { value: value.__key, writable: true }        
                });
                return result;
            })).
        flatMap(e => Observable.from(e));
};