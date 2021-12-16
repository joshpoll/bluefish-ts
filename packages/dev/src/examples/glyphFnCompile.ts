import { alignCenterX, alignCenterY, alignLeft, hSpace, vAlignCenter, vSpace } from "@bfjs/constraints";
import { createShapeFn, Shape, HostShapeFn, mkMyRef, MyList, MyRef, Relation, render } from '@bfjs/core';
import { ellipse, rect, text } from "@bfjs/marks";

type myDataE2 = { color1: string, color2: string, color3: string };
const dataE2: myDataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };

export const exampleRelationInterface2: HostShapeFn<myDataE2> = createShapeFn({
  shapes: {
    "text": text({ contents: "hello world!", fontSize: "24px" }),
  },
  fields: {
    "color1": createShapeFn((color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 })),
    "color2": createShapeFn((color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 })),
    "color3": createShapeFn((color3) => ellipse({ rx: 50, ry: 50, fill: color3 })),
    // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
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

const element: HostShapeFn<number> = createShapeFn({
  shapes: {
    "circle": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
  },
  object: createShapeFn((n) => text({ contents: n.toString(), fontSize: "24px" })),
  rels: {
    "$object->circle": [alignCenterX, alignCenterY]
  }
});

export const marbles: HostShapeFn<MarblesData> = createShapeFn({
  shapes: {
    // "text": text({ text: "hello world!", fontSize: "24px" }),
  },
  fields: {
    elements: element,
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

type MarblesList = MyList<number>;

const marblesList: MarblesList = {
  elements: [1, 2, 3, 4],
  neighbors: [
    { curr: mkMyRef("../../elements/0"), next: mkMyRef("../../elements/1") },
    { curr: mkMyRef("../../elements/1"), next: mkMyRef("../../elements/2") },
    { curr: mkMyRef("../../elements/2"), next: mkMyRef("../../elements/3") },
  ]
};

export const marblesListGlyphFn: HostShapeFn<MarblesList> = createShapeFn({
  shapes: {
    // "text": text({ text: "hello world!", fontSize: "24px" }),
  },
  fields: {
    elements: element,
    neighbors: createShapeFn({
      rels: { "curr->next": [hSpace(5), alignCenterY] }
    })
  },
})

export const testMarblesList = render(marblesList, marblesListGlyphFn);

type MarblesListReduced = {
  marble1: number,
  marble2: number,
  marble1Ref: MyRef,
};

const marblesListReduced: MarblesListReduced = {
  marble1: 1,
  marble2: 2,
  marble1Ref: mkMyRef("marble1"),
};

export const marblesListReducedGlyphFn: HostShapeFn<MarblesListReduced> = createShapeFn({
  fields: {
    marble1: () => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
    marble2: () => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
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
    curr: MyRef,
    next: MyRef,
  }>,
};

const marblesListMoreComplex: MarblesListMoreComplex = {
  marbles: [1, 2, 3],
  neighbor: [
    {
      curr: mkMyRef("../../marbles/0"),
      next: mkMyRef("../../marbles/1"),
    },
    {
      curr: mkMyRef("../../marbles/1"),
      next: mkMyRef("../../marbles/2"),
    }
  ]
};

export const marblesListMoreComplexGlyphFn: HostShapeFn<MarblesListMoreComplex> = createShapeFn({
  fields: {
    marbles: element,
    neighbor: createShapeFn({
      rels: {
        "curr->next": [hSpace(5.) /* TODO: not sure how to remove the specific value here and instead control the size of the entire thing */, alignCenterY],
      }
    })
  },
})

export const testMarblesListMoreComplex = render(marblesListMoreComplex, marblesListMoreComplexGlyphFn);

export const twoSetsOfMarbles: HostShapeFn<{
  one: MarblesListMoreComplex,
  two: MarblesListMoreComplex
}> = createShapeFn({
  fields: {
    one: marblesListMoreComplexGlyphFn,
    two: marblesListMoreComplexGlyphFn,
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
        curr: mkMyRef("../../marbles/0"),
        next: mkMyRef("../../marbles/1"),
      },
      {
        curr: mkMyRef("../../marbles/1"),
        next: mkMyRef("../../marbles/2"),
      }
    ]
  },
  two: {
    marbles: [10, 20, 30],
    neighbor: [
      {
        curr: mkMyRef("../../marbles/0"),
        next: mkMyRef("../../marbles/1"),
      },
      {
        curr: mkMyRef("../../marbles/1"),
        next: mkMyRef("../../marbles/2"),
      }
    ]
  },
};

export const testTwoMarbleSets = render(twoSetsOfMarblesData, twoSetsOfMarbles);
