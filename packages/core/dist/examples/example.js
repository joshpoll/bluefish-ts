import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft } from '../gestalt';
import { ellipse, rect, text } from '../mark';
var data = { color1: "firebrick", color2: "steelblue", color3: "black" };
export var example = {
    /* bbox: {
      width: 800,
      height: 700,
    }, */
    children: {
        /* TODO: maybe make RHS a _list_ of glyphs? */
        "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
        "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
        "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
        "some text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
        // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
        { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.), alignCenterX] },
        { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
        { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
        { left: "canvas", right: "topRect", gestalt: [alignLeft] },
    ]
};
export var data2 = { color1: "firebrick", color2: "steelblue", color3: "black", textData: { text: "hello world!", fontSize: "calc(10px + 2vmin)" } };
export var example2 = ({
    /* canvas: {
      width: 800,
      height: 700,
    }, */
    encodings: {
        /* TODO: maybe make RHS a _list_ of glyphs? */
        "color1": function (data) { return rect({ width: 500 / 3, height: 200 / 3, fill: data }); },
        "color2": function (data) { return ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data }); },
        "color3": function (data) { return ellipse({ rx: 50, ry: 50, fill: data }); },
        "textData": function (data) { return text({ contents: data.text, fontSize: data.fontSize }); },
    },
    relations: [
        { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
        { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
        { left: "color3", right: "textData", gestalt: [vSpace(50.), alignCenterX] },
        { left: "canvas", right: "color1", gestalt: [alignLeft] },
    ]
});
//# sourceMappingURL=example.js.map