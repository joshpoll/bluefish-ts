export declare function objectMap<O, T>(o: O, f: (key: keyof O, val: O[keyof O]) => T): ({
    [key in keyof O]: T;
});
export declare function objectFilter<O>(o: O, f: (key: string, val: O[keyof O]) => boolean): object;
//# sourceMappingURL=objectMap.d.ts.map