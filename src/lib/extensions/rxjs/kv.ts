import { from, MonoTypeOperatorFunction, pipe } from 'rxjs';
import _ from 'lodash';
import { mergeMap, map } from 'rxjs/operators';

export default function kv(keyName = 'key', elementSelector = (e:any) => e) : MonoTypeOperatorFunction<any> {
    //elementSelector = elementSelector || ((e:any) => e);
    return pipe(
        map((value:any) => Object.
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
            })),
        mergeMap(e => from(e))
    )
}