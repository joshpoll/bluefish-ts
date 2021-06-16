export type Mark = any;
export type Gestalt = any;

export type Relation = {
    left: any,
    right: any,
    gestalt: any[]
};
// type Relation = (left: any, right: any) => Gestalt[];

export type Encoding = {
    marks: Mark[],
    relations: Relation[],
}
