import { objectMap } from "./objectMap";

// https://github.com/microsoft/TypeScript/issues/1897#issuecomment-331765301
export type BFPrimitive = string | number | boolean | null;
export type BFObject<Ref> = { [member: string]: BFValue<Ref> };
export interface BFArray<Ref> extends Array<BFValue<Ref>> { };

export type RelativePath = (string | -1)[];
export type AbsolutePath = string[];

export type Ref<Path> = { $ref: true, path: Path };
export type RelativeBFRef = Ref<RelativePath>;
export type BFRef = Ref<AbsolutePath>;

export type BFValue<Ref> = BFPrimitive | BFObject<Ref> | BFArray<Ref> | Ref;
export type RelativeBFValue = BFValue<RelativeBFRef>;
export type AbsoluteBFValue = BFValue<BFRef>;

export const ref = (...args: string[]): RelativeBFRef => {
  const path = args
    .flatMap(s => s.split('/'))
    .map(s => s === ".." ? -1 : s);

  return {
    $ref: true,
    path,
  }
}

const ppAbsolutePath = (path: AbsolutePath): string => {
  return "/" + path.join("/")
}

const ppRelativePath = (path: RelativePath): string => {
  return path
    .map(s => s === -1 ? ".." : s)
    .join("/")
}

// takes a relative path and makes it absolute
// relative path must be of the form (more or less): (../)*([a-z0-9]+/)*
// basically we allow ../, but only at the beginning (for simplicity of implementation)
// and the rest is a local absolute path. neither piece is required
const resolvePath = (pathList: (string | -1)[], pathFromRoot: string[]): string[] => {
  const originalPathList = pathList;
  const originalPathFromRoot = pathFromRoot;

  const resolvePathAux = (pathList: (string | -1)[], pathFromRoot: string[]): string[] => {
    if (pathList.length === 0) {
      return pathFromRoot;
    } else {
      const [hd, ...tl] = pathList;
      if (hd === -1) {
        if (pathFromRoot.length >= 1) {
          // step up
          return resolvePathAux(tl, pathFromRoot.slice(0, -1));
        } else {
          throw Error(`
Relative path tries to navigate above root node.

The location of the ref is: ${ppAbsolutePath(originalPathFromRoot)}
The path you tried to look up is: ${ppRelativePath(originalPathList)}
Path resolution got stuck at: ${ppRelativePath(pathList)}
`)
        }
      } else {
        // step down
        return resolvePathAux(tl, [...pathFromRoot, hd]);
      }
    }
  }

  // the slice here ensures that we start from the object the ref is in
  return resolvePathAux(pathList, pathFromRoot.slice(0, -1));
}

// checks the absolute path to make sure it actually exists. We don't verify that the steps down are
// valid in resolve path.
const checkPath = (relativePath: (string | -1)[], pathFromRoot: string[], absolutePath: string[], data: RelativeBFValue): void => {
  const originalRelativePath = relativePath;
  const originalPathFromRoot = pathFromRoot;

  const checkPathAux = (absolutePath: string[], pathFromRoot: string[], data: RelativeBFValue): void => {
    // NOTE: we use ppRelativePath to print the absolutePath since the only failures occur after the
    // relative and absolute versions of the path would be indistinguishable (thanks to the earlier
    // check of the ..'s.)
    if (absolutePath.length === 0) {
      return
    } else {
      const [hd, ...tl] = absolutePath;
      if (data === null || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
        // primitive
        throw Error(`
Relative path tries to navigate into a primitive.

The location of the ref is: ${ppAbsolutePath(originalPathFromRoot)}
The path you tried to look up is: ${ppRelativePath(originalRelativePath)}
Path resolution got stuck at: ${ppAbsolutePath(pathFromRoot)}
Remaining path is: ${ppRelativePath(absolutePath)}
`)
      } else if (Array.isArray(data)) {
        // array
        const index = parseInt(hd);
        if (isNaN(index) || !(index in data)) {
          throw Error(`
Invalid relative path.

The location of the ref is: ${ppAbsolutePath(originalPathFromRoot)}
The path you tried to look up is: ${ppRelativePath(originalRelativePath)}
Path resolution got stuck at: ${ppAbsolutePath(pathFromRoot)}
Remaining path is: ${ppRelativePath(absolutePath)}

Available keys: ${Array.from(data.keys()).join(", ")}
`)
        } else {
          checkPathAux(tl, [...pathFromRoot, hd], data[index]);
        }
      } else if (typeof data === "object" && !("$ref" in data)) {
        // object
        if (!(hd in data)) {
          throw Error(`
Invalid relative path.

The location of the ref is: ${ppAbsolutePath(originalPathFromRoot)}
The path you tried to look up is: ${ppRelativePath(originalRelativePath)}
Path resolution got stuck at: ${ppAbsolutePath(pathFromRoot)}
Remaining path is: ${ppRelativePath(absolutePath)}

Available keys: ${Object.keys(data).join(", ")}
`)
        } else {
          checkPathAux(tl, [...pathFromRoot, hd], data[hd]);
        }
      } else if (typeof data === "object" && "$ref" in data) {
        // ref
        throw Error(`
Invalid relative path. Trying to navigate through a reference.

The location of the ref is: ${ppAbsolutePath(originalPathFromRoot)}
The path you tried to look up is: ${ppRelativePath(originalRelativePath)}
Path resolution got stuck at: ${ppAbsolutePath(pathFromRoot)}
Remaining path is: ${ppRelativePath(absolutePath)}
`)
      } else {
        console.error(data);
        throw Error(`Unexpected Bluefish data ${data}`);
      }
    }
  }

  checkPathAux(absolutePath, [], data);
}

export const makePathsAbsolute = (data: RelativeBFValue): AbsoluteBFValue => {
  const originalData = data;

  const makePathsAbsoluteAux = (data: RelativeBFValue, pathFromRoot: string[]): AbsoluteBFValue => {
    console.log("current path from root", pathFromRoot);
    if (data === null || typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
      // primitive
      return data
    } else if (Array.isArray(data)) {
      // array
      return data.map((d, i) => makePathsAbsoluteAux(d, [...pathFromRoot, i.toString()]));
    } else if (typeof data === "object" && !("$ref" in data)) {
      // object
      // TODO: for some reason TS infers that `k` has type `string | number` even though the keys of
      // data should all be strings.
      return objectMap(data, (k, v: RelativeBFValue) => makePathsAbsoluteAux(v, [...pathFromRoot, k as string]));
    } else if (typeof data === "object" && "$ref" in data) {
      // ref
      const ref = data as RelativeBFRef; // cast to a ref
      console.log("making this ref absolute", ref, pathFromRoot);
      // automatically bump one level up when resolving paths
      const absolutePath = resolvePath(ref.path, pathFromRoot);
      console.log("absolute path", absolutePath);
      checkPath(ref.path, pathFromRoot, absolutePath, originalData);
      return { $ref: true, path: absolutePath };
    } else {
      console.error(data);
      throw Error(`Unexpected Bluefish data ${data}`);
    }
  }

  return makePathsAbsoluteAux(data, []);
}
