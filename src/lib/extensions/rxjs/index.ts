
import requireDir from 'require-dir';
import _ from 'lodash'; 

export default _.mapValues(requireDir('.'), 
    (value:any) => 'default' in value ? value.default : value);