import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom, alignRight, alignTop, Gestalt, containsShrinkWrap, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong } from '../gestalt';
import { debug, ellipse, line, nil, rect, text } from '../mark';
import { Glyph, GlyphFn, compileGlyphFn, MyList, mkMyRef, lowerGlyphFn, glyphFnToHostGlyphFn } from './glyphExistentialAPI';
import _, { split } from 'lodash';
import { zipWith } from 'lodash';
import { MaybeBBoxValues, BBoxValues } from '../kiwiBBoxTransform';
import { emitKeypressEvents } from 'readline';
import { GlyphNoRef } from '../compileWithRef';

type Marks = {
  strong?: { active: boolean },
  em?: { active: boolean },
  comment?: { active: boolean },
};

type TextData = {
  char: string,
  marks: Marks,
  spanBoundary?: boolean,
};

const splitTextData = (textData: TextData): TextData[] =>
  textData.char.split('')
    .map((char) => ({
      char,
      marks: textData.marks,
    }));

const splitTextDataArray = (textData: TextData[]): TextData[] => textData.flatMap((td) => {
  const splitTD = splitTextData(td);
  splitTD[0].spanBoundary = true;
  return splitTD;
});

// input: split array of chars
// output: indices of spanBoundaries
const computeSpanBoundaries = (textData: TextData[]): number[] => textData.flatMap((d, i) => d.spanBoundary ? [i] : []);

// input: array of boundary indices
// output: array of array of indices for each span
const computeSpanRanges = (spanBoundaries: number[], end: number) => zipWith(
  spanBoundaries,
  [...spanBoundaries.slice(1), end],
  (curr, next) => _.range(curr, next),
);

const textData: TextData[] = [
  {
    char: "Intro. ",
    marks: {
      em: { active: true },
    },
  },
  {
    char: "The ",
    marks: {},
  },
  {
    char: "RMS ",
    marks: {
      strong: { active: true },
    },
  },
  {
    char: "Titanic",
    marks: {
      strong: { active: true },
      em: { active: true },
    },
  },
  {
    char: " was",
    marks: {},
  },
];

const update = {
  // inclusive, exclusive
  span: [9, 19],
  marks: {
    comment: { active: true },
  }
};

const newTextData: TextData[] = [
  {
    char: "Intro. ",
    marks: {
      em: { active: true },
    },
  },
  {
    char: "Th",
    marks: {},
  },
  {
    char: "e ",
    marks: {
      comment: { active: true },
    },
  },
  {
    char: "RMS ",
    marks: {
      strong: { active: true },
      comment: { active: true },
    },
  },
  {
    char: "Tita",
    marks: {
      strong: { active: true },
      em: { active: true },
      comment: { active: true },
    },
  },
  {
    char: "nic",
    marks: {
      strong: { active: true },
      em: { active: true },
    },
  },
  {
    char: " was",
    marks: {},
  },
]

const charData = splitTextDataArray(textData);
const spanBoundaries = computeSpanBoundaries(charData);
const spanRanges = computeSpanRanges(spanBoundaries, charData.length);
const newCharData = splitTextDataArray(newTextData);
const newSpanBoundaries = computeSpanBoundaries(newCharData);
const newSpanRanges = computeSpanRanges(newSpanBoundaries, newCharData.length);
console.log("charData", charData);
console.log("newSpanRanges", newSpanRanges, newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1]);

const charNumber: GlyphFn<{ value: number, spanBoundary: boolean }> = GlyphFn.mk(({ value, spanBoundary }) => Glyph.mk(text({ contents: value.toString(), fontSize: "12px", fill: "rgb(127,223,255)", fontWeight: (spanBoundary ? "bold" : "") })));

// TODO: hack using _ instead of <space> so height is correct. not sure what a better solution is
const styledChar: GlyphFn<TextData> = GlyphFn.mk(({ char, marks }) => Glyph.mk(text({ contents: char === " " ? "_" : char, fontSize: "24px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" })));

const mkList = <T>(elements: T[]): MyList<T> => ({
  elements,
  neighbors:
    zipWith(
      _.range(elements.length - 1),
      _.range(1, elements.length),
      (curr, next) => ({ curr: mkMyRef(`../../elements/${curr}`), next: mkMyRef(`../../elements/${next}`) })
    ),
});

const marksToList = (marks: Marks): MyList<string> => {
  const strong = marks.strong ? ["strong"] : [];
  const em = marks.em ? ["em"] : [];
  const comment = marks.comment ? ["comment"] : [];

  return mkList([...strong, ...em, ...comment]);
}

const spanDescriptionList: GlyphFn<MyList<string>> = GlyphFn.mk({
  fieldGlyphs: {
    "elements": GlyphFn.mk((d: string) => {
      switch (d) {
        case "strong":
          return Glyph.mk(text({ contents: "B", fontSize: "16px", fontWeight: "bold", fill: "black" }));
        case "em":
          return Glyph.mk(text({ contents: "I", fontSize: "16px", fontStyle: "italic", fontFamily: "serif", fill: "black" }));
        case "comment":
          return Glyph.mk(text({ contents: "C", fontSize: "16px", fontWeight: "bold", fill: "rgb(248,208,56)" }));
        default:
          throw "unreachable"
      }
    }),
    neighbors: GlyphFn.mk({
      relations: [{ fields: ["curr", "next"], constraints: [alignCenterY, hSpace(5.)] }]
    })
  }
});

const nonEmptySpanDescription: GlyphFn<MyList<string>> = GlyphFn.mk({
  glyphs: {
    "{": Glyph.mk(text({ contents: "{", fontSize: "16px", fill: "gray" })),
    "}": Glyph.mk(text({ contents: "}", fontSize: "16px", fill: "gray" })),
  },
  objectGlyph: spanDescriptionList,
  relations: [
    {
      fields: ["{", "$object"],
      constraints: [alignCenterY, hSpace(2.)],
    },
    {
      fields: ["$object", "}"],
      constraints: [alignCenterY, hSpace(2.)],
    },
  ]
});

const spanDescription: GlyphFn<MyList<string>> =
  GlyphFn.mk(
    (marks: MyList<string>) =>
      Object.keys(marks).length !== 0 ?
        // TODO: not sure how to make this work. can't track down the problem yet
        Glyph.mk(nil()) /* glyphFnToHostGlyphFn(nonEmptySpanDescription)(marks) */ :
        Glyph.mk(nil()));

const charBlock: GlyphFn<{ idx: { value: number, spanBoundary: boolean }, data: TextData }> = GlyphFn.mk({
  fieldGlyphs: {
    "idx": charNumber,
    "data": styledChar,
  },
  relations: [
    {
      fields: ["idx", "data"],
      constraints: [alignCenterX, vSpace(5.)],
    },
  ]
});

const styledTextArray: GlyphFn<MyList<{
  idx: {
    value: number;
    spanBoundary: boolean;
  };
  data: TextData;
}>> = GlyphFn.mk({
  fieldGlyphs: {
    elements: charBlock,
    neighbors: GlyphFn.mk({
      relations: [{ fields: ["curr", "next"], constraints: [alignTop, hSpace(5.)] }]
    })
  }
});

const span: GlyphFn<MyList<string>> = GlyphFn.mk({
  glyphs: {
    "tick": Glyph.mk(rect({ height: 10., width: 1, fill: "gray" })),
    "axis": Glyph.mk(rect({ height: 1, fill: "gray" })),
  },
  objectGlyph: spanDescription,
  relations: [
    {
      fields: ["tick", "axis"],
      constraints: [alignLeft, vSpace(0.)],
    },
    {
      fields: ["axis", "$object"],
      constraints: [alignLeft, vSpace(5.)],
    }
  ]
})

const spanHighlight: GlyphFn<boolean> = GlyphFn.mk((highlight: boolean) => Glyph.mk(rect({ fill: highlight ? "rgb(248,208,56)" : "none" })));

const spanArray: GlyphFn<MyList<MyList<string>>> = GlyphFn.mk({
  fieldGlyphs: {
    elements: span,
    neighbors: GlyphFn.mk({
      relations: [{ fields: ["curr", "next"], constraints: [hSpace(0.)] }]
    })
  }
})

const spanHighlightArray: GlyphFn<MyList<boolean>> = GlyphFn.mk({
  fieldGlyphs: {
    elements: spanHighlight,
    neighbors: GlyphFn.mk({
      // closes up gaps between spans, but not sure how to deterministically pick a direction
      relations: [{ fields: ["curr", "next"], constraints: [hSpace(0.)] }]
    })
  }
})

type Data = {
  spanHighlights: MyList<boolean>,
  text: MyList<{ idx: { value: number; spanBoundary: boolean; }; data: TextData; }>,
  spans: MyList<MyList<string>>,
  newSpans: MyList<MyList<string>>,
}

export const textspans: GlyphFn<Data> = GlyphFn.mk({
  fieldGlyphs: {
    "spanHighlights": spanHighlightArray,
    "text": styledTextArray,
    "spans": spanArray,
    "newSpans": spanArray,
  },
  relations:
    [
      {
        fields: ["text", `spans/elements/${spanBoundaries.length - 1}`],
        constraints: [alignRight],
      },
      ...spanBoundaries.map((d, i) => ({
        fields: [`text/elements/${d}`, `spans/elements/${i}`],
        constraints: [alignLeft, vSpace(5.)],
      })),
      {
        fields: ["text", `newSpans/elements/${newSpanBoundaries.length - 1}`],
        constraints: [alignRight],
      },
      ...newSpanBoundaries.map((d, i) => ({
        fields: [`text/elements/${d}`, `newSpans/elements/${i}`],
        constraints: [alignLeft, vSpace(85.)],
      })),
      ...newSpanRanges.flatMap((spanRange, i) => spanRange.map((span) => {
        console.log("spanRanges", i, span);
        return {
          fields: [`spanHighlights/elements/${i}`, `text/elements/${span}/data`],
          constraints: [...contains, alignLeftStrong, alignTopStrong, alignBottomStrong],
        }
      })),
      {
        fields: [`spanHighlights/elements/${newSpanRanges.length - 1}`, `text/elements/${newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1]}/data`],
        constraints: [alignRightStrong],
      }
    ],
})

export const textspansLoweredApplied = compileGlyphFn(textspans)({
  spanHighlights: mkList(newTextData.map(({ marks }) => marks.comment ? true : false)),
  text: mkList(newCharData.map(({ char, marks, spanBoundary }, i) => ({
    idx: {
      value: i,
      spanBoundary: spanBoundary ?? false,
    },
    data: { char, marks, spanBoundary }
  }))),
  spans: mkList(textData.map(({ marks }) => marksToList(marks))),
  newSpans: mkList(newTextData.map(({ marks }) => marksToList(marks))),
});
