import { alignCenterX, alignCenterY, alignLeft, hSpace, vSpace } from "@bluefish/constraints";
import { GlyphFn, lowerGlyphFn, Relation } from "@bluefish/core";
import { ellipse, rect, text } from "@bluefish/marks";

type myDataE2 = { color1: string, color2: string, color3: string };
const dataE2: myDataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };

export const exampleRelationInterface2: GlyphFn<myDataE2> = GlyphFn.mk({
  glyphs: {
    "text": text({ contents: "hello world!", fontSize: "24px" }),
  },
  fieldGlyphs: {
    "color1": GlyphFn.mk((color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 })),
    "color2": GlyphFn.mk((color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 })),
    "color3": GlyphFn.mk((color3) => ellipse({ rx: 50, ry: 50, fill: color3 })),
    // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    { fields: ["color1", "color2"], constraints: [vSpace(50.), alignCenterX] },
    { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
    { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
    { fields: ["$canvas", "color1"], constraints: [alignLeft] },
  ]
})

type MarblesData = {
  elements: Relation<number>,
};

const marblesData: MarblesData = {
  elements: [1, 2, 3, 4],
};

const element: GlyphFn<number> = GlyphFn.mk({
  glyphs: {
    "circle": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
  },
  objectGlyph: GlyphFn.mk((n) => text({ contents: n.toString(), fontSize: "24px" })),
  relations: [
    // uh oh! no way to write constraints since dataGlyphs is anonymous!!!
  ]
});

export const marbles: GlyphFn<MarblesData> = GlyphFn.mk({
  glyphs: {
    // "text": text({ text: "hello world!", fontSize: "24px" }),
  },
  fieldGlyphs: {
    elements: element,
    // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
    // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
    // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
    // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
  },
  relations: [
    // e.g. "color1" refers to the bbox of the "color1" glyph defined above
    // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
    // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
    // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
    // // this works b/c canvas can have negative coordinates I think? not really sure
    // { fields: ["canvas", "color1"], constraints: [alignLeft] },
    // { fields: ["color1", "color2"], constraints: [alignCenterX] },
  ]
})

export const testLoweredGlyphExample = lowerGlyphFn(exampleRelationInterface2)(dataE2);
export const testLoweredGlyphMarbles = lowerGlyphFn(marbles)(marblesData);