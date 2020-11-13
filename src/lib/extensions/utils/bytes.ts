import _ from 'lodash';
import filesize from 'filesize';

export function parse (...fields:string[]) {
    return (input:any) => process(input, fields, (value:string) => {
        try {
            const match = /^([-0-9.]+)\s*([a-zA-Z]+)$/.exec(value);
            if (match === null || match.length < 3) 
                return value;
            else
                return +match[1] * multiplier(match[2]);
        } catch (e) {
            return value;
        }
    });
}

export function human (...fields:string[]) {
    return (input:any) => process(input, fields, (value:number) => {
        try {
            return filesize(+value);
        } catch (e) {
            return value;
        }
    });
}

function process(input:any, fields:string[], onEntry: (input:any) => any ): any {
    if ((_.isEmpty(input) && !_.isNumber(input)) || _.isBoolean(input))
        return input;
    if (_.isArray(input))
        return input.map((input) =>
            process(input, fields ,onEntry));
    if (_.isObject(input)) {
        const _input:any = input;
        fields = _.isEmpty(fields) ? Object.keys(input) : fields;
        fields.forEach((field:string) => _input[field] = onEntry(_input[field]));
        return input;
    }
    return onEntry(input);
}

function multiplier(value:string): number {
    switch (value.trim().toLowerCase()) {
        case 'b': return 1;
        case 'kb': return 1024;
        case 'mb': return Math.pow(1024, 2);
        case 'gb': return Math.pow(1024, 3);
        case 'tb': return Math.pow(1024, 4);
        case 'pb': return Math.pow(1024, 5);
        case 'eb': return Math.pow(1024, 6);
        default: return Number.NaN;
    }
}