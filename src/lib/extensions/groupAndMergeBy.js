import { Observable } from 'rxjs';

Observable.prototype.groupAndMergeBy = function groupAndMergeBy (keySelector, elementSelector) {
    return this.
        groupBy(keySelector, elementSelector).
        mergeMap(e => e.toArray().map(array => new KeyAndGroup(keySelector(array[0]), array)));
};

export function KeyAndGroup(key, values) {
    this.groupKey = key;
    this.values = values;
}