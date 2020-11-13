import { MonoTypeOperatorFunction, Observable, pipe } from 'rxjs';

import { Stats } from 'fast-stats';
import { map, reduce } from 'rxjs/operators';

export default function stats(elementSelector = (e:any) => e ): MonoTypeOperatorFunction<any> {
    return pipe(
        map(elementSelector),
        reduce((accumulator:Stats, current:Stats) => accumulator.push(+current), new Stats()),
        map((stats:Stats) => ({
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
        }))
    )
}