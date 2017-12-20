'use strict';

import AsciiTable from 'ascii-table';
import _ from 'lodash';

import { Observable } from 'rxjs';
import { GroupedObservable } from 'rxjs/operator/groupBy';

export function json (observable, stream) {
    observable.subscribe({
        next: value => {
            try {
                if (value instanceof GroupedObservable) {
                    const key = value.key;
                    value = value.toArray().
                        map(array => ({ key: key, values: array }));
                }
                
                if (value instanceof Observable)
                    value.map(o => `${JSON.stringify(o)}\n`).
                        subscribe({
                            next: o => stream.write(o),
                            error: err => stream.emit('error', err)
                        });
                else
                    stream.write(`${JSON.stringify(value)}\n`);
            } catch (e) {
                stream.emit('error', e);
            } 
        },
        error: err => stream.emit('error', err),
        complete: () => stream.end()
    });
    return stream;
}

export function tableAscii (observable, stream) {
    let builder;
    observable.subscribe({
        next: value => {
            try {
                if (value instanceof Observable) {
                    const builder = new TableBuilder(value.key);
                    value = value.subscribe({
                        next: value => builder.addRow(value),
                        error: err => stream.emit('error', err),
                        complete: () => builder.render(stream)      
                    });
                }
                
                else {
                    builder = builder || new TableBuilder();
                    builder.addRow(value);
                }
            } catch (e) {
                stream.emit('error', e);
            }
        },
        error: err => stream.emit('error', err),
        complete: () => {
            if (builder)
                builder.render(stream);
            stream.end();
        }
    });
    return stream;
}

class TableBuilder {

    constructor(title) {
        this._table = new AsciiTable(title);
        this._heading = [];
    }

    addRow(value) {
        this._setHeading(value);
        this._table.addRowMatrix([ 
            this._toRow(value) 
        ]);
    }

    render(stream) {
        stream.write(this._table.render());
        stream.write('\n');
    }

    _setHeading(value) {
        if (!_.isObject(value))
            return;
        return this._table.
            setHeading((this._heading = _(this._heading).
                concat(Object.keys(value)).
                uniq().value()));
    }

    _toRow(value) {
        if (_.isEmpty(this._heading))
            return row;
        return this._heading.map(h => {
            const val = value[h];
            if (_.isArray(val))
                return '[array]';
            if (_.isObject(val))
                return '[object]';
            return val;
        });       
    }
}