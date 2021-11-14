export declare type Bag<T> = T[];
export declare type Ref = {
    location: string;
    index: number;
};
export declare type RefT<T> = {
    location: T;
    index: number;
};
export declare type BFInstance = string | number | boolean | null | BFInstance[] | {
    [key: string]: BFInstance;
} | Ref;
//# sourceMappingURL=instance.d.ts.map