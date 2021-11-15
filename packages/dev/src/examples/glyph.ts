import { GlyphFn } from "@bluefish/core";
import { nil, text } from "@bluefish/marks";

const glyphV3Example: GlyphFn<{}> = GlyphFn.mk(
  {
    glyphs: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    relations: [{
      fields: ["$canvas", "$canvas"],
      constraints: [],
    }]
  }
);

const objectGlyphExample: GlyphFn<number> = GlyphFn.mk(
  {
    glyphs: {
      "text": text({ contents: "hello world!", fontSize: "24px" }),
    },
    objectGlyph: GlyphFn.mk((d: number) => text({ contents: "hello world!", fontSize: "24px" })),
    relations: [{
      fields: ["$canvas", "text"],
      constraints: [],
    }]
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

const fieldsGlyphExample: GlyphFn<{ item: number }> = GlyphFn.mk({
  glyphs: {
    foo: nil(),
  },
  fieldGlyphs: {
    item: GlyphFn.mk((d: number) => nil()),
  },
  relations: [
    {
      fields: ["$canvas", "$canvas"],
      constraints: []
    },
    {
      fields: ["foo", "item"],
      constraints: []
    },
  ]
});

export { }
