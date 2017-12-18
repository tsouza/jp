'use strict';

import parseArgv from './argv';
import { PipelineBuilder } from './pipeline';

export default (argv) =>
    parseArgv(argv).then(options => {
        const input = options['--input'].value;
        const output = options['--output'].value;
        const outputMode = options['--output-mode'].value;
        const pipeline = options.pipeline.value;

        const stream = new PipelineBuilder(input).
            addPipelinePart(pipeline).
            build();

        return new Promise((resolve, reject) =>
            outputMode(stream).
                on('error', err => reject(err)).
                on('end', () => resolve()).
                pipe(output));
    });


