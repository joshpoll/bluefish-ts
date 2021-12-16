import { alignCenterX, alignCenterY, alignLeft, hSpace, vSpace } from "@bfjs/constraints";
import { createShapeFn, HostShapeFn, Relation, render } from "@bfjs/core";
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
  // TODO: no longer sure what this comment is referring to...
  rels: {} // uh oh! no way to write constraints since dataGlyphs is anonymous!!!
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

export const testLoweredGlyphExample = render(dataE2, exampleRelationInterface2);
export const testLoweredGlyphMarbles = render(marblesData, marbles);