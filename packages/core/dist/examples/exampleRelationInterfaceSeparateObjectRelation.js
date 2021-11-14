import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft } from '../gestalt';
import { ellipse, rect, text } from '../mark';
export var exampleRelationInterface2 = ({
    glyphs: {
        "color1": function (color1) { return rect({ width: 500 / 3, height: 200 / 3, fill: color1 }); },
        "color2": function (color2) { return ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }); },
        "color3": function (color3) { return ellipse({ rx: 50, ry: 50, fill: color3 }); },
        "text": function (textData) { return text({ contents: textData, fontSize: "calc(10px + 2vmin)" }); },
    },
    gestalt: [
        // e.g. "color1" refers to the bbox of the "color1" glyph defined above
        { left: "color1", right: "color2", rels: [vSpace(50.)] },
        { left: "color1", right: "color3", rels: [hSpace(50.), alignCenterY] },
        { left: "color3", right: "text", rels: [vSpace(50.), alignCenterX] },
        { left: "canvas", right: "color1", rels: [alignLeft] },
    ]
});
export var MyListGlyphE2 = ({
    glyphs: {
        "elements": function (element) { return rect({ width: element, height: 200 / 3, fill: "black" }); },
        "neighbors": ({
            /* TODO: not sure if/how refs should be rendered */
            /* for now we will say it shouldn't be rendered */
            glyphs: {},
            gestalt: [{
                    left: "curr",
                    right: "next",
                    rels: [vSpace(10.)]
                }]
        }),
    }
});
export var label = ({
    glyphs: {
        "text": function (textData) { return text({ contents: textData, fontSize: "calc(10px + 2vmin)" }); },
    },
    gestalt: [{
            left: "object",
            right: "text",
            rels: [vSpace(5.)]
        }]
});
//# sourceMappingURL=exampleRelationInterfaceSeparateObjectRelation.js.map