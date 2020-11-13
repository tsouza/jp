'use strict';

import { Observable, Observer } from 'rxjs';
import input from './input';
import { Stream } from "stream";

export default function(stream: Stream, path: string): Observable<any> {
    return new Observable((observer: Observer<any>)  => {
        input(stream, path, (node: any) => observer.next(node)).
            then(() => observer.complete()).
            catch((err: any) => observer.error(err))
    });
}
