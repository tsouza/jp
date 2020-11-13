/* global select plusOne */

module.exports = (argv) => select('.num').pipe(
    map(i => +argv.num + plusOne(i)),
    toArray());