import { constraints as C, marks as M, ref, RelativeBFRef, ShapeValue, } from '@bfjs/core';
import { Shape, createShape, render } from '@bfjs/core';
import * as _ from "lodash";
import { zipWith } from 'lodash';
import * as scale from "d3-scale";
import { summarize, tidy, min, max } from '@tidyjs/tidy';

const mkList = <T>(xs: T[]) => ({
  elements: xs,
  neighbors: xs.length < 2 ? [] :
    _.zipWith(_.range(xs.length - 1), _.range(1, xs.length), (curr, next) => (
      {
        curr: ref(`../../elements/${curr}`),
        next: ref(`../../elements/${next}`),
      }
    ))
})

type MyList<T> = {
  elements: Array<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
}

type ArrowParams = {
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number,
  stroke?: string,
  strokeWidth?: number,
}


const myArrow = ({ x1, y1, x2, y2, stroke, strokeWidth = 1 }: ArrowParams): ShapeValue => {
  return createShape({
    shapes: {
      "start": createShape({
        renderFn: M.debug,
        shapes: {
          "circle": M.circle({ r: 3, fill: "black" }),
        }
      }),
      "line": M.line({ x1, y1, x2, y2, stroke, strokeWidth }),
      "end": createShape({
        renderFn: M.debug,
        shapes: {
          "circle": M.circle({ r: 3, fill: "green" }),
        }
      }),
    },
    rels: {
      "start->line": [C.alignLeft, C.alignTop],
      "line->end": [C.alignRight, C.alignBottom],
    }
  });
}

// const data = mkList([1, 2, 3, 4, 5]);
const data = mkList([1, 2, 3]);
// const data = mkList([0, 75, 150]);

export const randomGraphShapeFn: Shape<MyList<number>> = createShape({
  shapes: {
    // "box": M.rect({ /* width: 100, height: 50,  */fill: "coral", fillOpacity: 0.3, }),
    // "circle": M.circle({ cx: 0, cy: 100, r: 10 }),
    // "circle2": M.circle({ r: 5 }),
    // "arrow": M.arrow({ stroke: "steelblue", strokeWidth: 3 }),
    // "arrow2": M.arrow({ stroke: "coral", strokeWidth: 3 }),
    $elements$: (pos: any) => createShape({
      renderFn: M.debug,
      bbox: {
        left: Math.random() * 300,
        top: Math.random() * 300,
        // left: pos,
        // top: 1.5 * pos,
        // centerX,
        // top: 0,
      },
      shapes: {
        "circle": M.circle({ cx: 0, cy: 0, r: 10, fill: "cornflowerblue" })
      },
      rels: {
        /* TODO: why do I need this??!?!?!? */
        /* I think I relaxed this constraint when others some things were specified, but that
        shouldn't need to be the case?  */
        // "$canvas->circle": [...C.containsShrinkWrap, ...C.containsShrinkWrap],
      }
    }),
    $neighbors$: createShape({
      shapes: {
        // "arrow": myArrow({ stroke: "coral", strokeWidth: 3, }),
        // "box": M.rect({ width: 10, stroke: "magenta", fill: "none" }),
        // "arrow": M.arrow({ stroke: "coral", strokeWidth: 3, }),
        "arrow": M.line({ stroke: "coral", strokeWidth: 3, }),
        // "arrow": createShape({
        //   renderFn: M.debug,
        //   shapes: {
        //     // "start": M.nil(),
        //     "line": M.line({ stroke: "coral", strokeWidth: 3, }),
        //     // "end": M.nil(),
        //   },
        //   rels: {
        //     // "start->line": [C.alignLeft, C.alignTop],
        //     // "line->end": [C.alignRight, C.alignBottom],
        //   }
        // }),
      },
      rels: {
        // "curr->arrow/start": [C.alignCenter, C.alignMiddle],
        // "arrow/end->next": [C.alignCenter, C.alignMiddle],
        "curr->arrow": [C.makeEqual('centerX', 'left'), C.makeEqual('centerY', 'top')],
        "arrow->next": [C.makeEqual('right', 'centerX'), C.makeEqual('bottom', 'centerY')],
        // "box->arrow": [C.alignBottom, C.alignTop, /* C.alignLeft, C.alignRight */],
      },
    }),
  } as any,
})

// export const randomGraphShapeFn: Shape = createShape({
//   shapes: {
//     "neighbors": createShape({
//       shapes: {
//         "arrow": M.arrow({ stroke: "coral", strokeWidth: 3, }),
//         "elements": createShape({
//           shapes: {
//             "circle1": M.circle({ cx: 0, cy: 0, r: 5, fill: "cornflowerblue" }),
//             "circle2": M.circle({ cx: 0, cy: 100, r: 5, fill: "cornflowerblue" }),
//           }
//         }),
//       },
//       rels: {
//         "elements/circle1->arrow/start": [C.alignCenter, C.alignMiddle],
//         "arrow/end->elements/circle2": [C.alignCenter, C.alignMiddle],
//       },
//     })
//   },
// })

// export const randomGraphShapeFn: Shape<MyList<number>> = createShape({
//   shapes: {
//     // "box": M.rect({ /* width: 100, height: 50,  */fill: "coral", fillOpacity: 0.3, }),
//     // "circle": M.circle({ cx: 0, cy: 100, r: 10 }),
//     // "circle2": M.circle({ r: 5 }),
//     // "arrow": M.arrow({ stroke: "steelblue", strokeWidth: 3 }),
//     // "arrow2": M.arrow({ stroke: "coral", strokeWidth: 3 }),
//   },
//   fields: {
//     elements: (_) => createShape({
//       shapes: {
//         "circle1": M.circle({ cx: 0, cy: 0, r: 5, fill: "cornflowerblue" }),
//         "circle2": M.circle({ cx: 0, cy: 100, r: 5, fill: "cornflowerblue" })
//       }
//     }),
//     neighbors: createShape({
//       shapes: {
//         "arrow": M.arrow({ stroke: "coral", strokeWidth: 3, }),
//       },
//       rels: {
//         "curr->arrow/start": [C.alignCenter, C.alignMiddle],
//         "arrow/end->next": [C.alignCenter, C.alignMiddle],
//       },
//     }),
//   },
// })

export const randomGraph = render(data, randomGraphShapeFn);
