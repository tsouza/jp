import jpath from 'jsonpath';
import _ from 'lodash';

export default path => object => 
    process(path, object);

function process(path, object) {
    if (_.isFunction(path))
        return path(object);
    if (_.isObject(path))
        return _.mapValues(path, 
            entry => process(entry, object));
    return jpath.value(object, `$${path}`);
}