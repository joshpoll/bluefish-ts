export function measureText(text, font) {
    measureText.context.textBaseline = 'alphabetic';
    measureText.context.font = font;
    var measurements = measureText.context.measureText(text);
    return {
        // width: Math.abs(measurements.actualBoundingBoxLeft) +
        // Math.abs(measurements.actualBoundingBoxRight),
        width: measurements.width,
        fontHeight: Math.abs(measurements.fontBoundingBoxAscent) + Math.abs(measurements.fontBoundingBoxDescent),
        baseline: Math.abs(measurements.fontBoundingBoxAscent),
        fontDescent: Math.abs(measurements.fontBoundingBoxDescent),
        actualDescent: Math.abs(measurements.actualBoundingBoxDescent),
    };
}
// static variable
(function (measureText) {
    measureText.element = document.createElement('canvas');
    measureText.context = measureText.element.getContext("2d");
})(measureText || (measureText = {}));
//# sourceMappingURL=measureText.js.map