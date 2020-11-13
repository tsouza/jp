/* global select from */

module.exports = () => select(from('./test/stream-tests/ndjson-sort.json')).pipe(
    toArray());