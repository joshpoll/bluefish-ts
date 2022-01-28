import { constraints as C, marks as M } from '@bfjs/core';
import { Shape, HostShapeFn, MyList, ref, createShapeFn, createShape, render } from '@bfjs/core';
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

export const randomSetShapeFn: HostShapeFn<MyList<number>> = createShapeFn({
  shapes: {
    "box": M.rect({ /* width: 100, height: 50,  */fill: "coral", fillOpacity: 0.3, }),
    "circle": M.circle({ cx: 0, cy: 100, r: 10 }),
    "circle2": M.circle({ r: 5 }),
  },
  fields: {
    elements: (_) => createShape({
      bbox: {
        left: Math.random() * 100,
        top: Math.random() * 100,
      },
      shapes: {
        "circle": M.circle({ cx: 0, cy: 0, r: 5, fill: "cornflowerblue" })
      }
    }),
    neighbors: (_) => M.nil(),
  },
  rels: {
    "box->elements": C.containsShrinkWrap,
    "circle2->box": [C.hSpace(20), C.alignMiddle],
  }
})

export const randomSet = render(data, randomSetShapeFn);
