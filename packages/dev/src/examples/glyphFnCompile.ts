import { alignCenterX, alignCenterY, alignLeft, hSpace, vAlignCenter, vSpace } from "@bfjs/constraints";
import { RelativeBFRef, Relation, render, ref, Shape, createShape, marks } from '@bfjs/core';
// import { ellipse, rect, text, nil } from "@bfjs/marks";
import { BFRef } from '../../../core/src/absoluteDataPaths';

const { ellipse, rect, text, nil } = marks;

type myDataE2 = { color1: string, color2: string, color3: string };
const dataE2: myDataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };

export const exampleRelationInterface2: Shape<myDataE2> = createShape({
  shapes: {
    "text": text({ contents: "hello world!", fontSize: "24px" }),
    "$color1$": (color1: string) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
    "$color2$": (color2: string) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
    "$color3$": (color3: string) => ellipse({ rx: 50, ry: 50, fill: color3 }),
  },
  rels: {
    "color1->color2": [vSpace(50.), alignCenterX],
    "color1->color3": [hSpace(50.), alignCenterY],
    "color3->text": [vSpace(50.), alignCenterX],
    "$canvas->color1": [alignLeft],
  }
})

type MarblesData = {
  elements: Relation<number>,
};

const marblesData: MarblesData = {
  elements: [1, 2, 3, 4],
};

const element: Shape<number> = createShape({
  shapes: {
    "circle": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
    "$$object": (n: number) => text({ contents: n.toString(), fontSize: "24px" }),
  },
  rels: {
    "object->circle": [alignCenterX, alignCenterY]
  }
});

export const marbles: Shape<MarblesData> = createShape({
  shapes: {
    // "text": text({ text: "hello world!", fontSize: "24px" }),
    $elements$: element,
    // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
    // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
    // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
    // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
  },
  rels: {
    // e.g. "color1" refers to the bbox of the "color1" glyph defined above
    // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
    // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
    // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
    // // this works b/c canvas can have negative coordinates I think? not really sure
    // { fields: ["canvas", "color1"], constraints: [alignLeft] },
    // { fields: ["color1", "color2"], constraints: [alignCenterX] },
  }
})

export const testCompiledGlyphFnExample = render(dataE2, exampleRelationInterface2);
export const testCompiledGlyphFnMarbles = render(marblesData, marbles);

type MarblesList = {
  elements: number[],
  neighbors: Array<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>
};

const marblesList: MarblesList = {
  elements: [1, 2, 3, 4],
  neighbors: [
    { curr: ref("../../elements/0"), next: ref("../../elements/1") },
    { curr: ref("../../elements/1"), next: ref("../../elements/2") },
    { curr: ref("../../elements/2"), next: ref("../../elements/3") },
  ]
};

export const marblesListGlyphFn: Shape<MarblesList> = createShape({
  shapes: {
    // "text": text({ text: "hello world!", fontSize: "24px" }),
    "$elements$": element,
    "$neighbors$": createShape({
      shapes: {
        '$curr$': 'ref',
        '$next$': 'ref',
      },
      rels: { "curr->next": [hSpace(5), alignCenterY] }
    })
  },
})

export const testMarblesList = render(marblesList, marblesListGlyphFn);

type MarblesListReduced = {
  marble1: number,
  marble2: number,
  marble1Ref: RelativeBFRef,
};

const marblesListReduced: MarblesListReduced = {
  marble1: 1,
  marble2: 2,
  marble1Ref: ref("marble1"),
};

export const marblesListReducedGlyphFn: Shape<MarblesListReduced> = createShape({
  shapes: {
    "$marble1$": () => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
    "$marble2$": () => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
    "$marble1Ref$": 'ref',
  },
  rels: {
    "marble1Ref->marble2": [hSpace(5), alignCenterY],
  }
})

export const testMarblesListReduced = render(marblesListReduced, marblesListReducedGlyphFn);

type MarblesListMoreComplex = {
  marbles: Relation<number>,
  // marble1: number,
  // marble2: number,
  neighbor: Relation<{
    curr: RelativeBFRef,
    next: RelativeBFRef,
  }>,
};

const marblesListMoreComplex: MarblesListMoreComplex = {
  marbles: [1, 2, 3],
  neighbor: [
    {
      curr: ref("../../marbles/0"),
      next: ref("../../marbles/1"),
    },
    {
      curr: ref("../../marbles/1"),
      next: ref("../../marbles/2"),
    }
  ]
};

export const marblesListMoreComplexGlyphFn: Shape<MarblesListMoreComplex> = createShape({
  shapes: {
    $marbles$: element,
    $neighbor$: createShape({
      shapes: {
        '$curr$': 'ref',
        '$next$': 'ref',
      },
      rels: {
        "curr->next": [hSpace(5.) /* TODO: not sure how to remove the specific value here and instead control the size of the entire thing */, alignCenterY],
      }
    })
  },
})

export const testMarblesListMoreComplex = render(marblesListMoreComplex, marblesListMoreComplexGlyphFn);

export const twoSetsOfMarbles: Shape<{
  one: MarblesListMoreComplex,
  two: MarblesListMoreComplex
}> = createShape({
  shapes: {
    $one$: marblesListMoreComplexGlyphFn,
    $two$: marblesListMoreComplexGlyphFn,
  },
  rels: {
    "one->two": [vAlignCenter, vSpace(20)],
  }
})

const twoSetsOfMarblesData: {
  one: MarblesListMoreComplex,
  two: MarblesListMoreComplex
} = {
  one: {
    marbles: [1, 2, 3],
    neighbor: [
      {
        curr: ref("../../marbles/0"),
        next: ref("../../marbles/1"),
      },
      {
        curr: ref("../../marbles/1"),
        next: ref("../../marbles/2"),
      }
    ]
  },
  two: {
    marbles: [10, 20, 30],
    neighbor: [
      {
        curr: ref("../../marbles/0"),
        next: ref("../../marbles/1"),
      },
      {
        curr: ref("../../marbles/1"),
        next: ref("../../marbles/2"),
      }
    ]
  },
};

export const testTwoMarbleSets = render(twoSetsOfMarblesData, twoSetsOfMarbles);
