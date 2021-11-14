export type TextMeasurement = {
  width: number,
  fontHeight: number,
  // position of text's alphabetic baseline assuming top is the origin
  baseline: number,
  fontDescent: number,
  actualDescent: number,
};

export function measureText(text: string, font: string): TextMeasurement {
  measureText.context.textBaseline = 'alphabetic';
  measureText.context.font = font;
  const measurements = measureText.context.measureText(text);
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
export namespace measureText {
  export const element = document.createElement('canvas');
  export const context = element.getContext("2d")!;
}
