import { Observable } from 'rxjs';

import { Stats } from 'fast-stats';

Observable.prototype.stats = function stats (elementSelector) {
    let stream = elementSelector ? this.map(elementSelector) : this;
    return stream.
        reduce((stats, val) => stats.push(+val), new Stats()).
        map(stats => ({
            min: stats.min,
            max: stats.max,
            sum: stats.sum,
            zeroes: stats.zeroes,
            mean: stats.amean(),
            stddev: stats.stddev(),
            p01: stats.percentile(1),
            p10: stats.percentile(10),
            p25: stats.percentile(25),
            p50: stats.percentile(50),
            p75: stats.percentile(75),
            p90: stats.percentile(90),
            p99: stats.percentile(99)
        }));
};