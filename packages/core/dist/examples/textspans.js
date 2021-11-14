var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import _ from 'lodash';
import { zipWith } from 'lodash';
// TODO: is there a nicer way to handle 0-length lists?
var glyphArrayToGlyph = function (glyphArray) {
    var _a;
    if (glyphArray.data.length === 0) {
        return nil();
    }
    else {
        return {
            bbox: glyphArray.bbox,
            renderFn: glyphArray.renderFn,
            children: glyphArray.data
                .reduce(function (o, data, i) {
                var _a;
                return (__assign(__assign({}, o), (_a = {}, _a[i] = glyphArray.childGlyphs(data, i), _a)));
            }, {}),
            relations: __spreadArray(__spreadArray([], zipWith(_.range(glyphArray.data.length - 1), _.range(1, glyphArray.data.length), function (curr, next) { return ({ left: curr.toString(), right: next.toString(), gestalt: glyphArray.listGestalt }); }), true), (_a = glyphArray.relations) !== null && _a !== void 0 ? _a : [], true)
        };
    }
};
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
        char: "R ",
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
        char: "R ",
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
var charNumber = function (i, strong) { return (text({ contents: i.toString(), fontSize: "12px", fill: "rgb(127,223,255)", fontWeight: (strong ? "bold" : "") })); };
// TODO: hack using _ instead of <space> so height is correct. not sure what a better solution is
var styledChar = function (_a) {
    var char = _a.char, marks = _a.marks;
    return text({ contents: char === " " ? "_" : char, fontSize: "24px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" });
};
var marksToList = function (marks) {
    var strong = marks.strong ? ["strong"] : [];
    var em = marks.em ? ["em"] : [];
    var comment = marks.comment ? ["comment"] : [];
    return __spreadArray(__spreadArray(__spreadArray([], strong, true), em, true), comment, true);
};
var spanDescriptionList = function (marks) { return ({
    data: marksToList(marks),
    childGlyphs: function (d) {
        switch (d) {
            case "strong":
                return text({ contents: "B", fontSize: "16px", fontWeight: "bold", fill: "black" });
            case "em":
                return text({ contents: "I", fontSize: "16px", fontStyle: "italic", fontFamily: "serif", fill: "black" });
            case "comment":
                return text({ contents: "C", fontSize: "16px", fontWeight: "bold", fill: "rgb(248,208,56)" });
            default:
                throw "unreachable";
        }
    },
    listGestalt: [alignCenterY, hSpace(5.)],
}); };
var spanDescription = function (marks) {
    if (Object.keys(marks).length !== 0) {
        return {
            // renderFn: debug,
            children: {
                "{": text({ contents: "{", fontSize: "16px", fill: "gray" }),
                "spanDescriptionList": glyphArrayToGlyph(spanDescriptionList(marks)),
                "}": text({ contents: "}", fontSize: "16px", fill: "gray" }),
            },
            relations: [
                {
                    left: "{",
                    right: "spanDescriptionList",
                    gestalt: [alignCenterY, hSpace(2.)],
                },
                {
                    left: "spanDescriptionList",
                    right: "}",
                    gestalt: [alignCenterY, hSpace(2.)],
                },
            ]
        };
    }
    else {
        return nil();
    }
};
var charBlock = function (i, data) { return ({
    children: {
        "idx": charNumber(i, data.spanBoundary || false),
        "char": styledChar(data),
    },
    relations: [
        {
            left: "idx",
            right: "char",
            gestalt: [alignCenterX, vSpace(5.)],
        },
    ]
}); };
var styledTextArray = function (data) { return ({
    data: data,
    childGlyphs: function (d, i) { return charBlock(i, d); },
    listGestalt: [alignTop, hSpace(5.)],
}); };
var span = function (data) { return ({
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
}); };
var spanHighlight = function (highlight) { return rect({ fill: highlight ? "rgb(248,208,56)" : "none" }); };
var spanArray = function (data) { return ({
    data: data,
    childGlyphs: function (d) { return span(d); },
    listGestalt: [hSpace(0.)],
}); };
var spanHighlightArray = function (data) { return ({
    data: data,
    childGlyphs: function (d) { return spanHighlight(d.marks.comment ? true : false); },
    listGestalt: [hSpace(0.)], // closes up gaps between spans, but not sure how to deterministically pick a direction
}); };
export var textspans = {
    children: {
        // "text": glyphArrayToGlyph(styledTextArray(charData)),
        // "spans": glyphArrayToGlyph(spanArray(textData)),
        "spanHighlights": glyphArrayToGlyph(spanHighlightArray(newTextData)),
        "text": glyphArrayToGlyph(styledTextArray(newCharData)),
        "spans": glyphArrayToGlyph(spanArray(textData)),
        "newSpans": glyphArrayToGlyph(spanArray(newTextData)),
    },
    relations: __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        {
            left: "text",
            right: "spans/" + (spanBoundaries.length - 1),
            gestalt: [alignRight],
        }
    ], spanBoundaries.map(function (d, i) { return ({
        left: "text/" + d,
        right: "spans/" + i,
        gestalt: [alignLeft, vSpace(5.)],
    }); }), true), [
        {
            left: "text",
            right: "newSpans/" + (newSpanBoundaries.length - 1),
            gestalt: [alignRight],
        }
    ], false), newSpanBoundaries.map(function (d, i) { return ({
        left: "text/" + d,
        right: "newSpans/" + i,
        gestalt: [alignLeft, vSpace(85.)],
    }); }), true), newSpanRanges.flatMap(function (spanRange, i) { return spanRange.map(function (span) {
        console.log("spanRanges", i, span);
        return {
            left: "spanHighlights/" + i,
            right: "text/" + span + "/char",
            gestalt: __spreadArray(__spreadArray([], contains, true), [alignLeftStrong, alignTopStrong, alignBottomStrong], false),
        };
    }); }), true), [
        {
            left: "spanHighlights/" + (newSpanRanges.length - 1),
            right: "text/" + newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1] + "/char",
            gestalt: [alignRightStrong],
        }
    ], false),
};
//# sourceMappingURL=textspans.js.map