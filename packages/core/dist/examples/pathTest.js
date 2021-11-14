import { hSpace, vSpace, alignCenterX, alignTop } from '../gestalt';
import { rect } from '../mark';
var data = { color1: "firebrick", color2: "steelblue", color3: "black" };
var top = {
    children: {
        "leftRect": rect({ width: 200, height: 100, fill: data.color1 }),
        "rightRect": rect({ width: 500 / 3, height: 100 / 3, fill: data.color2 }),
    },
    relations: [
        {
            left: "leftRect",
            right: "rightRect",
            gestalt: [alignTop, hSpace(50.)],
        }
    ]
};
var bottom = {
    children: {
        "rect": rect({ width: 100, height: 100, fill: data.color3 }),
    },
};
export var pathTest = {
    children: {
        "top": top,
        "bottom": bottom,
    },
    relations: [
        {
            left: "top/rightRect",
            right: "bottom/rect",
            gestalt: [alignCenterX, vSpace(30.)],
        }
    ]
};
//# sourceMappingURL=pathTest.js.map