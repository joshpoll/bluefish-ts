// @ts-nocheck
export const bar = GF.mk({
  glyphs: {
    // this tick mark might be a relation glyph in the future
    "tick": M.rect({ width: 1., height: 8., fill: "gray" })
  },
  fieldGlyphs: {
    "category": GF.mk((contents) => M.text({ contents, fontSize: "12px" })),
    "value": GF.mk((height) => M.rect({ width: 20, height, fill: "steelblue" })),
  },
  relations: [
    {
      fields: ["value", "tick"],
      constraints: [C.vSpace(5), C.vAlignCenter],
    },
    {
      fields: ["tick", "category"],
      constraints: [C.vSpace(1), C.vAlignCenter],
    },
  ]
})

export const newBar = GF.mk({
  objs: {
    "xAxis": M.nil(),
    "category": GF.mk((contents) => M.text({ contents, fontSize: "12px" })),
    "value": GF.mk((height) => M.rect({ width: 20, height, fill: "steelblue" })),
    "value->category": M.rect({ width: 1., height: 8., fill: "gray" }),
  },
  rels: {
    "value->(value->category)": [C.vSpace(5), C.vAlignCenter],
    "(value->category)->category": [C.vSpace(1), C.vAlignCenter],
  }
})