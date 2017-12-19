import requireDir from 'require-dir';
import _ from 'lodash'; 

module.exports = _.mapValues(requireDir(), 
    value => 'default' in value ?
        value.default : value);