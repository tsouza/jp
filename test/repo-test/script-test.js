/* global select plusOne */

module.exports = () => select('.num[*]').
    map(i => plusOne(i)).
    toArray();