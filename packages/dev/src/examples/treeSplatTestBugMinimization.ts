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

const data = { elements: 1 };

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
  children: { elements: number }
}

const splatTestData: SplatTest = {
  node: 20,
  children: data,
}

export const treeSplatTestShape: Shape<SplatTest> = createShape({
  shapes: {
    $node$: (_) => M.rect({ width: 50, height: 50, fill: 'red', opacity: 0.5 }),
    $children$: createShape({
      shapes: {
        $elements$: (_: any) => M.rect({ width: 20, height: 30, fill: 'blue', opacity: 0.5 }),
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

export const treeSplatTestBugMin = render(splatTestData, treeSplatTestShape);
