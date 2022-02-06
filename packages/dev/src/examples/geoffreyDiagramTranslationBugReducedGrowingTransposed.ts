import { createShapeFn, ref, constraints as C, marks as M, render } from "@bfjs/core";
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
    // startCharRef: ref(`../../../charsList/charsList/${startIndex}`),
    // endCharRef: ref(`../../../charsList/charsList/${endIndex}`),
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
])

const markOpGlyph = createShapeFn({
  shapes: {
    "rect": M.rect({ fill: "pink", height: 20 }),
  },
  object: (op: any) => { console.log("DEBUG", op); return M.text({ contents: `${op.action} ${op.markType}`, fontSize: "18px" }) },
  // fields: {
  //   "start": createShapeFn({ fields: {} }),
  //   "end": createShapeFn({ fields: {} }),
  // },
  rels: {
    "rect->$object": [C.alignCenterX, C.alignCenterY],
    // "startCharRef->rect": [C.alignLeft],
    // "endCharRef->rect": [C.alignRight],
  },
})

const characterShape = createShapeFn({
  renderFn: M.debug,
  shapes: {
    "tile": M.rect({ height: 60, width: 50, fill: "#eee", rx: 3, }),
    "leftHandle": M.rect({ height: 30, width: 10, fill: "#fff", stroke: "#ddd", rx: 3, }),
    "rightHandle": M.rect({ height: 30, width: 10, fill: "#fff", stroke: "#ddd", rx: 3, })
  },
  object: (charObj: any) => M.text({ contents: charObj.value.toString(), fontSize: "30px" }
  ),
  rels: {
    "$object->tile": [C.alignCenterX, C.alignCenterY],
    "leftHandle->tile": [C.alignLeft, C.alignCenterY],
    "rightHandle->tile": [C.alignRight, C.alignCenterY]
  },
});

const listOfCharactersShape = createShapeFn({
  fields: {
    "markOps": createShapeFn({
      fields: {
        markOps: markOpGlyph,
      },
    } as any),
    "charsList": createShapeFn({
      fields: {
        charsList: characterShape,
        neighbors: createShapeFn({
          rels: { "curr->next": [C.vSpace(5), C.hSpace(5)] }
        })
      },
    } as any),
    "markOpsToChars": createShapeFn({
      shapes: {
        "box": M.rect({ fill: "red" })
      },
      rels: {
        "box->op": [C.alignTop, C.alignBottom, C.alignLeft, C.alignRight]
      }
    })
  },
  rels: relations
} as any)

export const geoffreyDiagramTranslationBugReducedGrowingTransposed = render(diagramData, listOfCharactersShape);
