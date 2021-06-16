export type Bag<T> = T[];
export type Ref = { location: string, index: number }
export type RefT<T> = { location: T, index: number }

export type BFInstance =
  | string
  | number
  | boolean
  | null
  | BFInstance[]
  | { [key: string]: BFInstance }
  | Ref
