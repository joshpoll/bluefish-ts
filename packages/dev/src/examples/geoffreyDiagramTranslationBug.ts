import { createShape, ref, constraints as C, marks as M, render, Shape, ShapeFn } from "@bfjs/core";
import * as _ from 'lodash';

const mkList = (name: string, xs: any) => ({
  [name]: xs,
  neighbors: xs.length < 2 ? [] :
    _.zipWith(_.range(xs.length - 1), _.range(1, xs.length), (curr, next) => (
      {
        curr: ref(`../../${name}/${curr}`),
        next: ref(`../../${name}/${next}`),
      }
    ))
})

const characters = [
  { value: 'T', opId: '1@A', deleted: false },
  { value: 'h', opId: '2@A', deleted: true },
  { value: 'e', opId: '5@B', deleted: false },
  { value: ' ', opId: '6@B', deleted: false },
  { value: 'f', opId: '7@A', deleted: false },
  { value: 'o', opId: '8@A', deleted: true },
  { value: 'x', opId: '9@A', deleted: false },
]

const charsList = mkList("charsList", characters)

const markOps = [
  {
    action: "addMark",
    opId: "18@A",
    start: { opId: "1@A" },
    end: { opId: "7@A" },
    markType: "bold"
  }
]

const markOpsWithIndex = markOps.map(op => {
  const startIndex = characters.findIndex(c => c.opId === op.start.opId)
  const endIndex = characters.findIndex(c => c.opId === op.end.opId)

  return {
    ...op,
    start: { ...op.start, index: startIndex, charRef: ref(`../../../../charsList/charsList/${startIndex}`) },
    end: { ...op.end, index: endIndex, charRef: ref(`../../../../charsList/charsList/${endIndex}`) },
  }
})

const diagramData = ({
  charsList,
  markOps: mkList("markOps", markOpsWithIndex),
  markOpsToChars: markOpsWithIndex.map((op, index) => ({
    op: ref("..", "..", "markOps", "markOps", index.toString()),
    start: ref("..", "..", "charsList", "charsList", op.start.index.toString()),
    // end: ref(makePath("..", "..", "charsList", "charsList", op.end.index))
  }))
})

const relations = Object.fromEntries([
  ["charsList->markOps", [C.vSpace(10)]],
  ...diagramData.markOps.markOps.flatMap((op: any, opIndex: any) => [
    [`charsList/charsList/${op.start.index}->markOps/markOps/${opIndex}`, [C.alignLeft]],
    [`charsList/charsList/${op.end.index}->markOps/markOps/${opIndex}`, [C.alignRight]],
  ]),
  // ["charsList/charsList/1->markOps/markOps/0", [C.alignLeft] ],
  // ["charsList/charsList/4->markOps/markOps/0", [C.alignRight] ],
])

const markOpGlyph: Shape<{ action: string, markType: string }> = createShape({
  shapes: {
    "rect": M.rect({ fill: "pink", height: 20 }),
    "$$object": (op: { action: string, markType: string }) => { console.log("DEBUG", op); return M.text({ contents: `${op.action} ${op.markType}`, fontSize: "18px" }) },
  },
  // fields: {
  //   "start": createShapeFn({ fields: {} }),
  //   "end": createShapeFn({ fields: {} }),
  // },
  rels: {
    "rect->object": [C.alignCenterX, C.alignCenterY],
    // "startCharRef->rect": [C.alignLeft],
    // "endCharRef->rect": [C.alignRight],
  },
})

const characterShape: Shape<{ value: string }> = createShape({
  shapes: {
    "tile": M.rect({ height: 60, width: 50, fill: "#eee" }),
    "leftHandle": M.rect({ height: 30, width: 10, fill: "#fff", stroke: "#ddd" }),
    "rightHandle": M.rect({ height: 30, width: 10, fill: "#fff", stroke: "#ddd" }),
    $$char: (charObj: { value: string }) => M.text({ contents: charObj.value.toString(), fontSize: "30px" }
    ),
  },
  rels: {
    "char->tile": [C.alignCenterX, C.alignCenterY],
    "leftHandle->tile": [C.alignLeft, C.alignCenterY],
    "rightHandle->tile": [C.alignRight, C.alignCenterY]
  },
});

const listOfCharactersShape: Shape<{ markOps: any, charsList: any, markOpsToChars: any }> = createShape({
  shapes: {
    "$markOps$": createShape({
      shapes: {
        $markOps$: markOpGlyph,
      },
    }),
    "$charsList$": createShape({
      shapes: {
        $charsList$: characterShape, // renders _every_ marble in the set using marbleGlyph
        $neighbors$: createShape({
          rels: { "curr->next": [C.hSpace(10), C.alignCenterY] }
        })
      },
    }),
    "$markOpsToChars$": createShape({
      shapes: {
        // "leftLine": M.rect({ fill: "#000", width: 2 }),
        // "rightLine": M.rect({ fill: "#000", width: 2 }),
        "box": M.rect({ fill: "red" })
      },
      rels: {
        // "leftLine->start": [C.alignLeft, C.alignTop],
        // "rightLine->end": [C.alignRight, C.alignTop],
        // "leftLine->op": [C.alignBottom],
        // "rightLine->op": [C.alignBottom],
        "box->op": [C.alignTop, C.alignBottom, C.alignLeft, C.alignRight]
      }
    })
  },
  rels: relations
})

export const geoffreyDiagramTranslationBug = render(diagramData, listOfCharactersShape);
