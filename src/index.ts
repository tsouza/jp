#!/usr/bin/env node
/*eslint no-console: 0 */

import main from './main';
import { usage } from './argv'

main().catch(err => {
    if ('ARGV_ERROR' === err.message)
        console.log(usage());
    else if (err.stack)
        console.error(err.stack);
    else if (err instanceof Array)
        err.forEach(err => console.error(err.message));
    else
        console.error(err);
});