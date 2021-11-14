import { Constraint, Expression, Variable } from 'kiwi.js';
import { BBoxTreeVVE } from './compileWithRef';
export declare type BBoxTreeVV = BBoxTree<{
    bboxVars: bboxVars;
    bboxValues?: MaybeBBoxValues;
}, Variable>;
export declare type BBoxTreeValue = BBoxTree<BBoxValues, number>;
export declare type bbox = string;
export declare type bboxVars = {
    left: Variable;
    right: Variable;
    top: Variable;
    bottom: Variable;
    width: Variable;
    height: Variable;
    centerX: Variable;
    centerY: Variable;
};
export declare type bboxVarExprs = {
    left: Variable | Expression;
    right: Variable | Expression;
    top: Variable | Expression;
    bottom: Variable | Expression;
    width: Variable | Expression;
    height: Variable | Expression;
    centerX: Variable | Expression;
    centerY: Variable | Expression;
};
export declare const transformBBox: (bbox: bboxVarExprs, transform: Transform<Variable | Expression>) => bboxVarExprs;
export declare type BBoxValues = {
    [key in keyof bboxVars]: number;
};
export declare type MaybeBBoxValues = Partial<BBoxValues> | undefined;
export declare const makeBBoxVars: (bbox: string) => bboxVars;
export declare const addBBoxConstraints: (bboxTree: BBoxTreeVV, constraints: Constraint[]) => void;
export declare type Transform<T> = {
    translate: {
        x: T;
        y: T;
    };
};
export declare type BBoxTree<T, U> = {
    bbox: T;
    canvas: T;
    transform: Transform<U>;
    children: {
        [key: string]: BBoxTree<T, U>;
    };
};
export declare const getBBoxValues: (bboxVars: BBoxTreeVV | BBoxTreeVVE) => BBoxTreeValue;
//# sourceMappingURL=kiwiBBoxTransform.d.ts.map