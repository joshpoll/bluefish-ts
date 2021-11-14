import { Constraint, Variable } from 'kiwi.js';
export declare type BBoxTreeVV = BBoxTree<{
    bboxVars: bboxVars;
    bboxValues?: MaybeBBoxValues;
}>;
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
export declare type BBoxValues = {
    [key in keyof bboxVars]: number;
};
export declare type MaybeBBoxValues = Partial<BBoxValues> | undefined;
export declare const makeBBoxVars: (bbox: string) => bboxVars;
export declare const addBBoxConstraints: (bboxTree: BBoxTreeVV, constraints: Constraint[]) => void;
export declare type BBoxTree<T> = {
    bbox: T;
    canvas: T;
    children: {
        [key: string]: BBoxTree<T>;
    };
};
export declare const getBBoxValues: (bboxVars: BBoxTreeVV) => BBoxTree<BBoxValues>;
//# sourceMappingURL=kiwiBBox.d.ts.map