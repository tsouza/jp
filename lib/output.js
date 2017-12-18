'use strict';

import { rxToStream } from 'rxjs-stream';

import AsciiTable from 'ascii-table';
import _ from 'lodash';

import { KeyAndGroup } from './extensions/groupAndMergeBy';

export function json (observable) {
    return fromRxToStream(observable.
        map(o => `${JSON.stringify(o)}\n`));
}

export function asciiTable (observable) {
    return fromRxToStream(observable.
        reduce((builder, row) => builder.onRow(row), tableBuilder()).
        map(builder => builder.render()));
}

function tableBuilder(title) {
    let heading = [], table;
    const builder = {
        //table: table,
        onRow: (row) => {
            if (row instanceof KeyAndGroup) {
                if (!table)
                    table = new CompositeTable();
                const nested = tableBuilder(row.groupKey);
                row.values.forEach(row => nested.onRow(row));
                table.addTable(nested.table());
            } else {
                if (!table)
                    table = new AsciiTable(title);
                setHeading(row);
                table.addRowMatrix(toRowMatrix(row));
            }
            return builder;
        },
        render: () => table.render(),
        table: () => table
    };
    return builder;

    function setHeading(row) {
        if (!_.isObject(row))
            return table;
        return table.setHeading((heading = _(heading).
            concat(Object.keys(row)).
            uniq().sort().value()));
    }

    function toRowMatrix(row) {
        if (_.isEmpty(heading))
            return [ row ];
        return [ heading.map(h => {
            const val = row[h];
            if (_.isArray(val))
                return '[array]';
            if (_.isObject(val))
                return '[object]';
            return val;
        }) ];
    }
}

function CompositeTable() {
    this.tables = [];
}

CompositeTable.prototype.render = function() {
    return this.tables.map(table => table.render()).join('\n');
};

CompositeTable.prototype.addTable = function(table) {
    this.tables.push(table);
};


function fromRxToStream(observable) {
    return rxToStream(observable, undefined,
        (err, readable) => readable.emit('error', err));
}