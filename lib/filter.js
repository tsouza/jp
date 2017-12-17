'use strict';

import './extensions/groupAndMergeBy';

import { Observable } from 'rxjs';
import input from './input';

export default (stream, path) => 
    Observable.create(observer =>
        input(stream, path, node => observer.next(node)).
            then(() => observer.complete()).
            catch(err => observer.error(err)));
