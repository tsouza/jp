exports = module.exports = create(1);
exports.asc = exports;
exports.desc = create(-1);

export default exports;

/* Credit https://github.com/juliangruber */
function create (inv:-1|1) {
  return function compare (prop:any) {
    return function (_a:any, _b:any) {
      var a = prop? deep(_a, prop) : _a;
      var b = prop? deep(_b, prop) : _b;
      return inv * (
          a < b? -1
        : a > b? 1
        : 0);
    }
  }
}

/* Credit https://github.com/juliangruber */
function deep (obj:any, prop:any) {
    var segs = prop.split('.');
    while (segs.length) {
      var seg = segs.shift();
      var existential = false;
      if (seg[seg.length - 1] == '?') {
        seg = seg.slice(0, -1);
        existential = true;
      }
      obj = obj[seg];
      if (!obj && existential) return obj;
    }
    return obj;
  }

