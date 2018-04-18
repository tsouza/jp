/* global select from */

module.exports = () => select(from('./test/stream-tests/ndjson-join-left.json')).
    groupJoin(select(from('./test/stream-tests/ndjson-join-right.json')),
        left => left.keyLeft,   right => right.keyRight,
        left => left.valueLeft, right => right.valueRight).
    toArray();