export declare type TextMeasurement = {
    width: number;
    fontHeight: number;
    baseline: number;
    fontDescent: number;
    actualDescent: number;
};
export declare function measureText(text: string, font: string): TextMeasurement;
export declare namespace measureText {
    const element: HTMLCanvasElement;
    const context: CanvasRenderingContext2D;
}
//# sourceMappingURL=measureText.d.ts.map