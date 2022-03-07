import { constraints as C, makePathsAbsolute, marks as M, RelativeBFRef, ShapeValue } from '@bfjs/core';
import { Shape, ref, createShape, render } from '@bfjs/core';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';

const mkList = <T>(elements: T[]): MyList<T> => ({
  elements,
  neighbors:
    zipWith(
      _.range(elements.length - 1),
      _.range(1, elements.length),
      (curr, next) => ({ curr: ref(`../../elements/${curr}`), next: ref(`../../elements/${next}`) })
    ),
});

type MyList<T> = {
  elements: Array<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
}

const listData = mkList([1, 2, 3]);

const charShape: Shape<number> = createShape({
  shapes: {
    node: M.rect({ width: 60, height: 60, fill: "rgb(249, 135, 120)", stroke: /* "rgb(117, 116, 107)" */"rgb(125, 124, 111)", strokeWidth: 5, rx: 20, ry: 20 }),
    $$char: (c) => M.text({ contents: c.toString(), fontSize: '24px' }),
  },
  rels: {
    'node->char': [C.alignCenter, C.alignMiddle],
  }
})

const marblesListShape: Shape<MyList<number>> = createShape({
  shapes: {
    $elements$: charShape, // renders _every_ marble in the set using marbleGlyph
    $neighbors$: createShape({
      shapes: {
        $curr$: 'ref',
        $next$: 'ref',
      },
      rels: { "curr->next": [C.hSpace(20.), C.alignMiddle] }
    })
  },
})

// TODO: the type system is unhappy because refs are not handled properly
// TODO: not sure why the type system is unhappy about the bg though
const paddingBackground = <T>(s: Shape<T>): any => createShape({
  shapes: {
    bg: M.rect({ fill: "rgb(235, 231, 213)" }),
    ...(typeof s === 'function' ? { $$fg: s } : { fg: s }),
  } as any,
  rels: {
    'bg->fg': [C.alignTopSpace(-20), C.alignLeftSpace(20), C.alignBottomSpace(-20), C.alignRightSpace(20)]
  }
})

console.log('output before compiling', (paddingBackground(marblesListShape) as any)(makePathsAbsolute(listData as any) as any))

export const combinatorTest = render(listData, paddingBackground(marblesListShape));
// export const combinatorTest = render(listData, marblesListShape);
