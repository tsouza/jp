import jpath from 'jsonpath';
import _ from 'lodash';

export default (path: string, mapper = (v:any) => v) => (object:any) => 
    process(path, object, mapper);

function process(path: string, object: any, mapper:any): any {
    if (_.isFunction(path))
        return path(object);
    if (_.isObject(path))
        return _.mapValues(path, 
            entry => process(entry, object, mapper));
    return mapper(jpath.value(object, `$${path}`));
}