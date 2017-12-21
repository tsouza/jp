#!/usr/bin/env node
/*eslint no-console: 0 */

import main from './main';

main().catch(err => {
    if (err.stack)
        console.error(err.stack);
    else if (err instanceof Array)
        err.forEach(err => console.error(err.message));
    else
        console.error(err);
});