/* util function for mapping over objects */

// TODO: some version of TypeScript or ESLint or Babel or whatever doesn't like exporting this as a
// const arrow fn
export function objectMap<O, T>(o: O, f: (key: keyof O, val: O[keyof O]) => T): ({ [key in keyof O]: T }) {
  return Object.entries(o).reduce((o: { [key in keyof O]: T }, [key, val]) => ({
    ...o, [key]: f(key as keyof O, val)
  }), {} as { [key in keyof O]: T });
}

// TODO: this type is really weak
export function objectFilter<O>(o: O, f: (key: string, val: O[keyof O]) => boolean): object {
  return Object.entries(o).reduce((o: object, [key, val]) => f(key, val) ? ({ ...o, [key]: val }) : o, {});
}
