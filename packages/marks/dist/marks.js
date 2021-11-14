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
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Glyph } from '@bluefish/core';
import { measureText } from './measureText';
// TODO: incorporate stroke and strokeWidth into bounding box computations
export var rect = function (_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
    return Glyph.mk({
        // return the positioning parameters the user gave us
        bbox: { left: x, top: y, width: width, height: height },
        // and the rendering function itself
        renderFn: function (canvas, index) {
            return _jsx("rect", { x: canvas.left, y: canvas.top, width: canvas.width, height: canvas.height, fill: fill, stroke: stroke, strokeWidth: strokeWidth }, index);
        }
    });
};
export var ellipse = function (_a) {
    var cx = _a.cx, cy = _a.cy, rx = _a.rx, ry = _a.ry, fill = _a.fill;
    return Glyph.mk({
        // return the positioning parameters the user gave us
        bbox: { centerX: cx, centerY: cy, width: rx ? 2 * rx : undefined, height: ry ? 2 * ry : undefined },
        // and the rendering function itself
        renderFn: function (canvas, index) {
            return _jsx("ellipse", { cx: canvas.centerX, cy: canvas.centerY, rx: canvas.width / 2, ry: canvas.height / 2, fill: fill }, index);
        }
    });
};
// TODO: maybe use https://airbnb.io/visx/docs/text?
// TODO: maybe use alignmentBaseline="baseline" to measure the baseline as well?? need to add it as
// a guide
// TODO: very close to good alignment, but not quite there. Can I use more of the canvas
// measurements somehow?
export var text = function (_a) {
    var x = _a.x, y = _a.y, contents = _a.contents, fontFamily = _a.fontFamily, fontSize = _a.fontSize, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fill = _a.fill;
    var canvasMeasurements = measureText(contents, fontWeight + " " + fontStyle + " " + fontSize + " " + fontFamily);
    return Glyph.mk({
        // return the positioning parameters the user gave us
        bbox: { left: x, top: y, width: canvasMeasurements.width, height: canvasMeasurements.fontHeight },
        // and the rendering function itself
        renderFn: function (canvas, index) {
            return _jsx("text", __assign({ x: canvas.left, y: canvas.bottom - canvasMeasurements.fontDescent, fontFamily: fontFamily, fontSize: fontSize, fontStyle: fontStyle, fontWeight: fontWeight, fill: fill }, { children: contents }), index);
        }
    });
};
/*
const dir = ops.vnormalize(ops.vsub(s.end.contents, s.start.contents));
      const segmentWidth = absVal(sub(s.start.contents[0], s.end.contents[0]));
      const thicknessWidth = absVal(
        ops.vmul(s.thickness.contents, ops.rot90(dir))[0]
      );
      const segmentHeight = absVal(sub(s.start.contents[1], s.end.contents[1]));
      const thicknessHeight = absVal(
        ops.vmul(s.thickness.contents, ops.rot90(dir))[1]
      );
      w = add(segmentWidth, thicknessWidth);
      h = add(segmentHeight, thicknessHeight);
      center = ops.vdiv(
        ops.vadd(s.start.contents, s.end.contents),
        constOf(2)
      ) as Pt2;
      break;
*/
export var line = function (_a) {
    var x1 = _a.x1, y1 = _a.y1, x2 = _a.x2, y2 = _a.y2, stroke = _a.stroke, _b = _a.strokeWidth, strokeWidth = _b === void 0 ? 1 : _b;
    var segmentWidth, thicknessWidth, width;
    var segmentHeight, thicknessHeight, height;
    if (x1 !== undefined && x2 !== undefined && y1 !== undefined && y2 !== undefined) {
        var magnitude = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
        var dir = [(x2 - x1) / magnitude, y2 - y1 / magnitude];
        var rotDirThickness = [dir[1] * strokeWidth, -dir[0] * strokeWidth];
        segmentWidth = Math.abs(x2 - x1);
        thicknessWidth = rotDirThickness[0];
        width = segmentWidth + thicknessWidth;
        segmentHeight = Math.abs(y2 - y1);
        thicknessHeight = rotDirThickness[1];
        height = segmentHeight + thicknessHeight;
    }
    var centerX = (x1 !== undefined && x2 !== undefined) ? (x1 + x2) / 2 : undefined;
    var centerY = (y1 !== undefined && y2 !== undefined) ? (y1 + y2) / 2 : undefined;
    return Glyph.mk({
        // return the positioning parameters the user gave us
        bbox: { centerX: centerX, centerY: centerY, width: width, height: height },
        // and the rendering function itself
        renderFn: function (canvas, index) {
            // TODO: this is super wrong for multiple reasons. first the start and end could be flipped.
            // second, it doesn't take into account stroke width at all
            return _jsx("line", { x1: canvas.left, x2: canvas.right, y1: canvas.top, y2: canvas.bottom, stroke: stroke, strokeWidth: strokeWidth }, index);
        }
    });
};
export var nil = function () { return Glyph.mk({
    bbox: { width: 0., height: 0, },
    // and the rendering function itself
    renderFn: function (canvas, index) {
        return _jsx(_Fragment, {}, void 0);
    }
}); };
export var html = function (_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height, html = _a.html;
    return Glyph.mk({
        bbox: { left: x, top: y, width: width, height: height },
        renderFn: function (canvas, index) {
            return _jsx("foreignObject", __assign({ x: canvas.left, y: canvas.top, width: canvas.width, height: canvas.height }, { children: _jsx("html", __assign({ xmlns: "http://www.w3.org/1999/xhtml" }, { children: html }), void 0) }), index);
        }
    });
};
export var debug = function (canvas) {
    return (_jsx("rect", { x: canvas.left, y: canvas.top, width: canvas.width, height: canvas.height, fill: "none", stroke: "magenta" }, void 0));
};
//# sourceMappingURL=marks.js.map