import { Observable } from 'rxjs';
import _ from 'lodash';

Observable.prototype.kv = function kv (keyName = 'key', elementSelector) {
    elementSelector = elementSelector || ((e) => e);
    return this.
        map(value => Object.
            keys(value).
            map(key => {
                let val = elementSelector(value[key]);
                if (!_.isObject(val))
                    val = { value: val };
                return _.merge({ [keyName]: key }, val);
            })).
        flatMap(e => Observable.from(e));
};