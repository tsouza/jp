'use strict';

// @ts-ignore
import AsciiTable from 'ascii-table';

import { any } from 'bluebird';
import _ from 'lodash';

import { GroupedObservable, Observable } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { Writable } from 'stream';

type Output = (observable:Observable<any>, stream:Writable) => Writable;

export interface OutputSelector {
    [output: string]: Output;
  }

export function raw (observable:Observable<any>, stream:Writable): Writable {
    observable.subscribe({
        next: value => {
            try {
                if (value instanceof GroupedObservable) {
                    const key = value.key;
                    value = value.pipe(
                        toArray(),
                        map(array => ({ key: key, values: array }))
                        );
                }
                
                if (value instanceof Observable)
                    value.
                        subscribe({
                            next: o => stream.write(o),
                            error: err => stream.emit('error', err)
                        });
                else {
                    stream.write(value);
                }
            } catch (e) {
                stream.emit('error', e);
            } 
        },
        error: err => stream.emit('error', err),
        complete: () => stream !== process.stdout && 
            stream.end()
    });
    return stream;
}

export function json (observable:Observable<any>, stream:Writable): Writable {
    observable.subscribe({
        next: value => {
            try {
                if (value instanceof GroupedObservable) {
                    const key = value.key;
                    value = value.pipe(
                        toArray(),
                        map(array => ({ key: key, values: array }))
                        );
                }
                
                if (value instanceof Observable)
                    value.pipe(map(o => `${JSON.stringify(o)}\n`))
                        .subscribe({
                            next: o => stream.write(o),
                            error: err => stream.emit('error', err)
                        });
                else
                    stream.write(`${JSON.stringify(value)}\n`);
            } catch (e) {
                stream.emit('error', e);
            } 
        },
        error: (err:Error) => stream.emit('error', err),
        complete: () => stream !== process.stdout && 
            stream.end()
    });
    return stream;
}

export function tableAscii (observable:Observable<any>, stream:Writable): Writable {
    let builder: TableBuilder;
    observable.subscribe({
        next: value => {
            try {
                if (value instanceof Observable) {
                    const builder = new TableBuilder((value as any).key);
                    value = value.subscribe({
                        next: value => builder.addRow(value),
                        error: err => stream.emit('error', err),
                        complete: () => builder.render(stream)      
                    });
                }
                
                else {
                    builder = builder || new TableBuilder('');
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
            if (process.stdout !== stream)
                stream.end();
        }
    });
    return stream;
}

class TableBuilder {

    _table: any;
    _heading: any[];

    constructor(title:string) {
        this._table = new AsciiTable(title);
        this._heading = [];
    }

    addRow(value:any) {
        this._setHeading(value);
        this._table.addRowMatrix([ 
            this._toRow(value) 
        ]);
    }

    render(stream:Writable) {
        stream.write(this._table.render());
        stream.write('\n');
    }

    _setHeading(value:any) {
        if (!_.isObject(value))
            return;
        return this._table.
            setHeading((this._heading = _(this._heading).
                concat(Object.keys(value)).
                uniq().value()));
    }

    _toRow(value:any) {
        if (_.isEmpty(this._heading))
            return value;
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