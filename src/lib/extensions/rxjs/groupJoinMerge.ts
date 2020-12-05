import _ from "lodash";
import { Observable, pipe } from "rxjs";
import { map } from "rxjs/operators";
import groupJoin from "./groupJoin";

export = (rightStream: Observable<any>,
    leftKeySelector: () => {}, rightKeySelector: () => {} ,
    leftElementSelector: () => {} , rightElementSelector: () => {} ) => {
    return pipe(
            groupJoin(rightStream, leftKeySelector, rightKeySelector, leftElementSelector, rightElementSelector), 
            map((e:any) => _.merge(e.right, e.left))
            )
}