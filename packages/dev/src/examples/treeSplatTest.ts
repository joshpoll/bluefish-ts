import { constraints as C, marks as M, RelativeBFRef } from '@bfjs/core';
import { Shape, ref, createShape, render } from '@bfjs/core';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';

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

export const treeSplatTestShape: Shape<SplatTest> = createShape({
  shapes: {
    $node$: (n) => M.text({ contents: n.toString(), fontSize: "18px" }),
    $children$: createShape({
      shapes: {
        $elements$: (n: number) => M.text({ contents: n.toString(), fontSize: "18px" }),
        $neighbors$: createShape({
          shapes: {
            $curr$: 'ref',
            $next$: 'ref',
          },
          rels: { "curr->next": [C.hSpace(20), C.alignMiddle] },
        })
      },
    }),
  },
  rels: {
    /* TODO: this constraint doesn't seem to be enforced properly... */
    // "node->children/elements": [C.vSpace(5)],
    "node->children/elements": [C.vSpace(5)],
    // "node->children": [C.vSpace(5)],
    // "node->children/neighbors": [C.vSpace(5)],
  }
})

export const treeSplatTest = render(splatTestData, treeSplatTestShape);
