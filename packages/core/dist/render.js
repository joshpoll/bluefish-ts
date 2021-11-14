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
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var renderAux = function (index, name, _a) {
    var bboxValues = _a.bboxValues, encoding = _a.encoding;
    // TODO: render is messed up when doing translations
    // console.log("name", name, "bboxValues", bboxValues);
    console.log("encoding", encoding);
    var childKeys = Object.keys(encoding.children);
    if (childKeys.length == 0) {
        // render bbox directly, no need for <g> transform
        console.log("name", name, "bboxValues", bboxValues, "branch 0");
        return encoding.renderFn !== undefined ? encoding.renderFn(bboxValues.bbox, index) : _jsx(_Fragment, {}, void 0);
    }
    else if (childKeys.length == 1 && encoding.renderFn === undefined) {
        // pass translation through to child
        console.log("name", name, "bboxValues", bboxValues, "branch 1");
        var glyphKey = childKeys[0];
        var transform = bboxValues.transform;
        var childBBox = bboxValues.children[glyphKey].bbox;
        var bbox = {
            left: childBBox.left + transform.translate.x,
            right: childBBox.right + transform.translate.x,
            top: childBBox.top + transform.translate.y,
            bottom: childBBox.bottom + transform.translate.y,
            width: childBBox.width,
            height: childBBox.height,
            centerX: childBBox.centerX + transform.translate.x,
            centerY: childBBox.centerY + transform.translate.y,
        };
        var childTransform = bboxValues.children[glyphKey].transform;
        var newTransform = {
            translate: {
                x: childTransform.translate.x + transform.translate.x,
                y: childTransform.translate.y + transform.translate.y,
            }
        };
        return renderAux(0, glyphKey, { bboxValues: __assign(__assign({}, bboxValues.children[glyphKey]), { bbox: bbox, transform: newTransform }), encoding: encoding.children[glyphKey] });
    }
    else {
        console.log("name", name, "bboxValues", bboxValues, "branch 2");
        return (_jsxs("g", __assign({ transform: "translate(" + bboxValues.transform.translate.x + " " + bboxValues.transform.translate.y + ")" }, { children: [Object.keys(encoding.children).map(function (glyphKey, index) { return (renderAux(index, glyphKey, { bboxValues: bboxValues.children[glyphKey], encoding: encoding.children[glyphKey] })); }), encoding.renderFn !== undefined ? encoding.renderFn(bboxValues.canvas) : _jsx(_Fragment, {}, void 0)] }), index));
    }
};
export default (function (_a) {
    var bboxValues = _a.bboxValues, encoding = _a.encoding;
    return (_jsx("svg", __assign({ width: Math.max(bboxValues.bbox.width, 0), height: Math.max(bboxValues.bbox.height, 0) }, { children: renderAux(0, "canvas", { bboxValues: bboxValues, encoding: encoding }) }), void 0));
});
//# sourceMappingURL=render.js.map