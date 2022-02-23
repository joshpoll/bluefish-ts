import { constraints as C, marks as M, RelativeBFRef } from '@bfjs/core';
import { Shape, ref, createShape, render } from '@bfjs/core';
import * as _ from "lodash";

const mkList = (xs: any) => ({
  elements: xs,
  neighbors: xs.length < 2 ? [] :
    _.zipWith(_.range(xs.length - 1), _.range(1, xs.length), (curr, next) => (
      {
        curr: ref(`../../elements/${curr}`),
        next: ref(`../../elements/${next}`),
      }
    ))
})

const data = mkList([1, 2, 3, 4, 5]);

type MyList<T> = {
  elements: Array<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
}

type SplatTest = {
  node: number,
  children: MyList<number>
}

const splatTestData: SplatTest = {
  node: 20,
  children: data,
}

const refrefData = {
  original: {
    a: 'blue',
    b: 'red',
  },
  oneRef: {
    aRef: ref('../original/a'),
    bRef: ref('../original/b'),
  },
  twoRef: {
    aRefRef: ref('../oneRef/aRef'),
    bRefRef: ref('../oneRef/bRef'),
  },
}

const refrefShape: Shape<typeof refrefData> = createShape({
  shapes: {
    $original$: createShape({
      shapes: {
        $a$: (color: string) => M.rect({ width: 20, height: 20, fill: color }),
        $b$: (color: string) => M.rect({ width: 20, height: 20, fill: color }),
      },
    }),
    $oneRef$: createShape({
      shapes: {
        $aRef$: 'ref',
        $bRef$: 'ref',
      },
      rels: {
        'aRef->bRef': [C.alignBottom, C.hSpace(10)],
      },
    }),
    $twoRef$: createShape({
      shapes: {
        $aRefRef$a: 'ref',
        $bRefRef$b: 'ref',
      },
      rels: {
        'a->b': [C.alignBottom, C.hSpace(10)],
      },
    }),
  },
})

const refrefShapeDoubleConstrained: Shape<typeof refrefData> = createShape({
  shapes: {
    $original$: createShape({
      shapes: {
        $a$: (color: string) => M.rect({ width: 20, height: 20, fill: color }),
        $b$: (color: string) => M.rect({ width: 20, height: 20, fill: color }),
      },
    }),
    $oneRef$: createShape({
      shapes: {
        $aRef$a: 'ref',
        $bRef$b: 'ref',
      },
      rels: {
        'a->b': [C.alignBottom, C.hSpace(5)],
      },
    }),
    $twoRef$: createShape({
      shapes: {
        $aRefRef$a: 'ref',
        $bRefRef$b: 'ref',
      },
      rels: {
        'a->b': [C.alignBottom, C.hSpace(10)],
      },
    }),
  },
})

export const refrefTest1 = render(refrefData, refrefShape);
// export const refrefTest2 = render(refrefData, refrefShapeDoubleConstrained);
