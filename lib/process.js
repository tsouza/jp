import { Observable } from 'rxjs';
import parse from './parse';

export default (stream, path) => 
    Observable.create(observer =>
        parse(stream, path, node => observer.next(node)).
            then(() => observer.complete()).
            catch(err => observer.error(err)));
