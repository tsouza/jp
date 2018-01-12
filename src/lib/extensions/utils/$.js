import jpath from 'jsonpath';
import _ from 'lodash';

export default (path, mapper = (v) => v) => object => 
    process(path, object, mapper);

function process(path, object, mapper) {
    if (_.isFunction(path))
        return path(object);
    if (_.isObject(path))
        return _.mapValues(path, 
            entry => process(entry, object, mapper));
    return mapper(jpath.value(object, `$${path}`));
}