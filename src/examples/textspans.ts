import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom, alignRight, alignTop, Gestalt } from '../gestalt';
import { ellipse, line, nil, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';
import _, { split } from 'lodash';
import { zipWith } from 'lodash';
import { MaybeBBoxValues, BBoxValues } from '../kiwiBBoxTransform';

// export type GlyphData<T> = {
//   data: T,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children?: { [key: string]: (data: T) => Glyph },
//   relations?: Relation[]
// }

export type GlyphArray<T> = {
  data: T[],
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  childGlyphs: (d: T, i: number) => Glyph,
  listGestalt: Gestalt[],
  relations?: Relation[]
}

const glyphArrayToGlyph = <T>(glyphArray: GlyphArray<T>): Glyph => ({
  bbox: glyphArray.bbox,
  renderFn: glyphArray.renderFn,
  children: glyphArray.data
    .reduce((o: { [key: string]: Glyph }, data: T, i) => ({ ...o, [i]: glyphArray.childGlyphs(data, i) }),
      {}),
  relations: [
    ...zipWith(
      _.range(glyphArray.data.length - 1),
      _.range(1, glyphArray.data.length),
      (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: glyphArray.listGestalt })
    ),
    ...glyphArray.relations ?? [],
  ]
})

// const glyphDataToGlyph = <T>(glyphData: GlyphData<T>): Glyph => {
//   const glyphDataChildren = glyphData.children ?? {};
//   const keys = Object.keys(glyphDataChildren);
//   const children = keys.reduce((o: { [key: string]: Glyph }, key) => ({
//     ...o, [key]: glyphDataChildren[key](glyphData.data)
//   }), {});
//   return {
//     bbox: glyphData.bbox,
//     renderFn: glyphData.renderFn,
//     children,
//     relations: glyphData.relations,
//   };
// }

type TextData = {
  char: string,
  marks: {
    strong?: { active: boolean },
    em?: { active: boolean },
  },
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

// TODO: hack using _ instead of <space> so height is correct. not sure what a better solution is
const textData = [
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

const charData = splitTextDataArray(textData);
console.log("charData", charData);

const charNumber = (i: number, strong: boolean): Glyph => (text({ text: i.toString(), fontSize: "12px", fill: "rgb(127,223,255)", fontWeight: (strong ? "bold" : "") }))

const styledChar = ({ char, marks }: TextData): Glyph => text({ text: char === " " ? "_" : char, fontSize: "18px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" });

const spanDescription = (marks: {
  strong?: { active: boolean },
  em?: { active: boolean },
}): Glyph => {
  if (marks.strong || marks.em) {
    return {
      children: {
        "{": text({ text: "{", fontSize: "16px", fill: "gray" }),
        "B": marks.strong ? text({ text: "B", fontSize: "16px", fontWeight: "bold", fill: "black" }) : nil(),
        "I": marks.em ? text({ text: "I", fontSize: "16px", fontStyle: "italic", fontFamily: "serif", fill: "black" }) : nil(),
        "}": text({ text: "}", fontSize: "16px", fill: "gray" }),
      },
      relations: [
        {
          left: "{",
          right: "B",
          gestalt: [alignCenterY, hSpace(2.)],
        },
        {
          left: "B",
          right: "I",
          gestalt: (marks.strong && marks.em) ? [alignCenterY, hSpace(5.)] : [alignCenterY, hSpace(0.)],
        },
        {
          left: "I",
          right: "}",
          gestalt: [alignCenterY, hSpace(2.)],
        },
      ]
    }
  } else {
    return nil();
  }
};

const charBlock = (i: number, data: TextData): Glyph => ({
  children: {
    "idx": charNumber(i, data.spanBoundary || false),
    "char": styledChar(data),
  },
  relations: [
    {
      left: "idx",
      right: "char",
      gestalt: [alignLeft, vSpace(5.)],
    },
  ]
});

const styledTextArray = (data: TextData[]): GlyphArray<TextData> => ({
  data,
  childGlyphs: (d, i) => charBlock(i, d),
  listGestalt: [alignTop, hSpace(5.)],
})

const span = (data: TextData): Glyph => ({
  children: {
    "tick": rect({ height: 10., width: 1, fill: "gray" }),
    "axis": rect({ height: 1, fill: "gray" }),
    "spanDescription": spanDescription(data.marks),
  },
  relations: [
    {
      left: "tick",
      right: "axis",
      gestalt: [alignLeft, vSpace(0.)],
    },
    {
      left: "axis",
      right: "spanDescription",
      gestalt: [alignLeft, vSpace(5.)],
    }
  ]
})

const spanArray = (data: TextData[]): GlyphArray<TextData> => ({
  data,
  childGlyphs: (d) => span(d),
  listGestalt: [hSpace(0.)],
})

export const textspans: Glyph = {
  children: {
    "text": glyphArrayToGlyph(styledTextArray(charData)),
    "spans": glyphArrayToGlyph(spanArray(textData)),
  },
  relations: [
    {
      left: "text/0",
      right: "spans/0",
      gestalt: [alignLeft, vSpace(5.)],
    },
    {
      left: "text/7",
      right: "spans/1",
      gestalt: [alignLeft, vSpace(5)],
    },
    {
      left: "text/11",
      right: "spans/2",
      gestalt: [alignLeft, vSpace(5)],
    },
    {
      left: "text/15",
      right: "spans/3",
      gestalt: [alignLeft, vSpace(5)],
    },
    {
      left: "text/22",
      right: "spans/4",
      gestalt: [alignLeft, vSpace(5)],
    },
    {
      left: "text",
      right: "spans/4",
      gestalt: [alignRight],
    },
  ]
}
