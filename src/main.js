'use strict';

import parseArgv from './argv';
import { StreamScriptCompiler } from './compiler';

import './lib/extensions/rxjs';

export default (argv) =>
    parseArgv(argv).then(options => {
        const input = options['--input'].value;
        const output = options['--output'].value;
        const outputMode = options['--output-mode'].value;
        const inline = options.inline.value;

        const stream = new StreamScriptCompiler(input).
            setInlineScript(inline).
            compile();

        return new Promise((resolve, reject) =>
            outputMode(stream).
                on('error', err => reject(err)).
                on('end', () => resolve()).
                pipe(output));
    });


