/* global select plusOne */

module.exports = (argv) => select('.num[*]').
    map(i => +argv.num + plusOne(i)).
    toArray();