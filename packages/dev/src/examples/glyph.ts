import { createShapeFn, HostShapeFn } from "@bfjs/core";
import { nil, text } from "@bfjs/marks";

const glyphV3Example: HostShapeFn<{}> = createShapeFn(
  {
    shapes: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    rels: {
      "$canvas->$canvas": [],
    }
  }
);

const objectGlyphExample: HostShapeFn<number> = createShapeFn(
  {
    shapes: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    object: createShapeFn((d: number) => text({ contents: "hello world!", fontSize: "24px" })),
    rels: {
      "$canvas->text": [],
    }
  }
);

// const fieldsGlyphExample_: GlyphFn_<number, "text"> = {
//   glyphs: {
//     "text": text({ contents: "hello world!", fontSize: "24px" }),
//   },
//   relations: [{
//     fields: ["$canvas", "$canvas"],
//     constraints: [],
//   }]
// }

// const fieldsGlyphExample: GlyphFn<number> = {
//   [KONT]: (kont) => kont({
//     glyphs: {
//       "text": text({ contents: "hello world!", fontSize: "24px" }),
//     },
//     relations: [{
//       fields: ["$canvas", "$canvas"],
//       constraints: [],
//     }]
//   })
// }

const fieldsGlyphExample: HostShapeFn<{ item: number }> = createShapeFn({
  shapes: {
    foo: nil(),
  },
  fields: {
    item: createShapeFn((d: number) => nil()),
  },
  rels: {
    "$canvas->$canvas": [],
    "foo->item": [],
  }
});

export { }
