var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignRight, alignTop, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong } from '../gestalt';
import { nil, rect, text } from '../mark';
import { Glyph, GlyphFn, compileGlyphFn, mkMyRef } from './glyphExistentialAPI';
import _ from 'lodash';
import { zipWith } from 'lodash';
var splitTextData = function (textData) {
    return textData.char.split('')
        .map(function (char) { return ({
        char: char,
        marks: textData.marks,
    }); });
};
var splitTextDataArray = function (textData) { return textData.flatMap(function (td) {
    var splitTD = splitTextData(td);
    splitTD[0].spanBoundary = true;
    return splitTD;
}); };
// input: split array of chars
// output: indices of spanBoundaries
var computeSpanBoundaries = function (textData) { return textData.flatMap(function (d, i) { return d.spanBoundary ? [i] : []; }); };
// input: array of boundary indices
// output: array of array of indices for each span
var computeSpanRanges = function (spanBoundaries, end) { return zipWith(spanBoundaries, __spreadArray(__spreadArray([], spanBoundaries.slice(1), true), [end], false), function (curr, next) { return _.range(curr, next); }); };
var textData = [
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
var update = {
    // inclusive, exclusive
    span: [9, 19],
    marks: {
        comment: { active: true },
    }
};
var newTextData = [
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
];
var charData = splitTextDataArray(textData);
var spanBoundaries = computeSpanBoundaries(charData);
var spanRanges = computeSpanRanges(spanBoundaries, charData.length);
var newCharData = splitTextDataArray(newTextData);
var newSpanBoundaries = computeSpanBoundaries(newCharData);
var newSpanRanges = computeSpanRanges(newSpanBoundaries, newCharData.length);
console.log("charData", charData);
console.log("newSpanRanges", newSpanRanges, newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1]);
var charNumber = GlyphFn.mk(function (_a) {
    var value = _a.value, spanBoundary = _a.spanBoundary;
    return Glyph.mk(text({ contents: value.toString(), fontSize: "12px", fill: "rgb(127,223,255)", fontWeight: (spanBoundary ? "bold" : "") }));
});
// TODO: hack using _ instead of <space> so height is correct. not sure what a better solution is
var styledChar = GlyphFn.mk(function (_a) {
    var char = _a.char, marks = _a.marks;
    return Glyph.mk(text({ contents: char === " " ? "_" : char, fontSize: "24px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" }));
});
var mkList = function (elements) { return ({
    elements: elements,
    neighbors: zipWith(_.range(elements.length - 1), _.range(1, elements.length), function (curr, next) { return ({ curr: mkMyRef("../../elements/" + curr), next: mkMyRef("../../elements/" + next) }); }),
}); };
var marksToList = function (marks) {
    var strong = marks.strong ? ["strong"] : [];
    var em = marks.em ? ["em"] : [];
    var comment = marks.comment ? ["comment"] : [];
    return mkList(__spreadArray(__spreadArray(__spreadArray([], strong, true), em, true), comment, true));
};
var spanDescriptionList = GlyphFn.mk({
    fieldGlyphs: {
        "elements": GlyphFn.mk(function (d) {
            switch (d) {
                case "strong":
                    return Glyph.mk(text({ contents: "B", fontSize: "16px", fontWeight: "bold", fill: "black" }));
                case "em":
                    return Glyph.mk(text({ contents: "I", fontSize: "16px", fontStyle: "italic", fontFamily: "serif", fill: "black" }));
                case "comment":
                    return Glyph.mk(text({ contents: "C", fontSize: "16px", fontWeight: "bold", fill: "rgb(248,208,56)" }));
                default:
                    throw "unreachable";
            }
        }),
        neighbors: GlyphFn.mk({
            relations: [{ fields: ["curr", "next"], constraints: [alignCenterY, hSpace(5.)] }]
        })
    }
});
var nonEmptySpanDescription = GlyphFn.mk({
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
var spanDescription = GlyphFn.mk(function (marks) {
    return Object.keys(marks).length !== 0 ?
        // TODO: not sure how to make this work. can't track down the problem yet
        Glyph.mk(nil()) /* glyphFnToHostGlyphFn(nonEmptySpanDescription)(marks) */ :
        Glyph.mk(nil());
});
var charBlock = GlyphFn.mk({
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
var styledTextArray = GlyphFn.mk({
    fieldGlyphs: {
        elements: charBlock,
        neighbors: GlyphFn.mk({
            relations: [{ fields: ["curr", "next"], constraints: [alignTop, hSpace(5.)] }]
        })
    }
});
var span = GlyphFn.mk({
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
});
var spanHighlight = GlyphFn.mk(function (highlight) { return Glyph.mk(rect({ fill: highlight ? "rgb(248,208,56)" : "none" })); });
var spanArray = GlyphFn.mk({
    fieldGlyphs: {
        elements: span,
        neighbors: GlyphFn.mk({
            relations: [{ fields: ["curr", "next"], constraints: [hSpace(0.)] }]
        })
    }
});
var spanHighlightArray = GlyphFn.mk({
    fieldGlyphs: {
        elements: spanHighlight,
        neighbors: GlyphFn.mk({
            // closes up gaps between spans, but not sure how to deterministically pick a direction
            relations: [{ fields: ["curr", "next"], constraints: [hSpace(0.)] }]
        })
    }
});
export var textspans = GlyphFn.mk({
    fieldGlyphs: {
        "spanHighlights": spanHighlightArray,
        "text": styledTextArray,
        "spans": spanArray,
        "newSpans": spanArray,
    },
    relations: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        {
            fields: ["text", "spans/elements/" + (spanBoundaries.length - 1)],
            constraints: [alignRight],
        }
    ], spanBoundaries.map(function (d, i) { return ({
        fields: ["text/elements/" + d, "spans/elements/" + i],
        constraints: [alignLeft, vSpace(5.)],
    }); }), true), [
        {
            fields: ["text", "newSpans/elements/" + (newSpanBoundaries.length - 1)],
            constraints: [alignRight],
        }
    ], false), newSpanBoundaries.map(function (d, i) { return ({
        fields: ["text/elements/" + d, "newSpans/elements/" + i],
        constraints: [alignLeft, vSpace(85.)],
    }); }), true), newSpanRanges.flatMap(function (spanRange, i) { return spanRange.map(function (span) {
        console.log("spanRanges", i, span);
        return {
            fields: ["spanHighlights/elements/" + i, "text/elements/" + span + "/data"],
            constraints: __spreadArray(__spreadArray([], contains, true), [alignLeftStrong, alignTopStrong, alignBottomStrong], false),
        };
    }); }), true), [
        {
            fields: ["spanHighlights/elements/" + (newSpanRanges.length - 1), "text/elements/" + newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1] + "/data"],
            constraints: [alignRightStrong],
        }
    ], false),
});
export var textspansLoweredApplied = compileGlyphFn(textspans)({
    spanHighlights: mkList(newTextData.map(function (_a) {
        var marks = _a.marks;
        return marks.comment ? true : false;
    })),
    text: mkList(newCharData.map(function (_a, i) {
        var char = _a.char, marks = _a.marks, spanBoundary = _a.spanBoundary;
        return ({
            idx: {
                value: i,
                spanBoundary: spanBoundary !== null && spanBoundary !== void 0 ? spanBoundary : false,
            },
            data: { char: char, marks: marks, spanBoundary: spanBoundary }
        });
    })),
    spans: mkList(textData.map(function (_a) {
        var marks = _a.marks;
        return marksToList(marks);
    })),
    newSpans: mkList(newTextData.map(function (_a) {
        var marks = _a.marks;
        return marksToList(marks);
    })),
});
//# sourceMappingURL=textspansExistential.js.map