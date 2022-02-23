import { createShape, Shape, ShapeValue, marks } from "@bfjs/core";
const { nil, text } = marks;

const glyphV3Example: ShapeValue = createShape(
  {
    shapes: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    rels: {
      "$canvas->$canvas": [],
    }
  }
);

const objectGlyphExample: Shape<number> = createShape(
  {
    shapes: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
      "$$object": (d: number) => text({ contents: "hello world!", fontSize: "24px" }),
    },
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

const fieldsGlyphExample: Shape<{ item: number }> = createShape({
  shapes: {
    foo: nil(),
    $item$: (d: number) => nil(),
  },
  rels: {
    "$canvas->$canvas": [],
    "foo->item": [],
  }
});

export { }
