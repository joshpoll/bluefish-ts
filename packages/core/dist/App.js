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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css';
import compile from './compile';
import compileWithRef from './compileWithRef';
import render from './render';
import groupedbarchart from './examples/groupedbarchart';
import { textspans } from './examples/textspans';
// import { exampleRelationInterface } from './examples/exampleRelationInterface';
import { GlyphFnCompileTest } from './examples/glyphExistentialAPI';
import { barChart } from './examples/barchartExistential';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';
import { boundingBox } from './examples/boundingboxexample';
import { constraintExample } from './examples/constraintexample';
function App() {
    // console.log("loweredGlyphTest", loweredGlyphTest);
    return (_jsx("div", __assign({ className: "App" }, { children: _jsxs("header", __assign({ className: "App-header" }, { children: [_jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compileWithRef(GlyphFnCompileTest.testTwoMarbleSets)), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compileWithRef(boundingBox)), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compileWithRef(constraintExample)), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compileWithRef(barChart)), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compile(textspans)), _jsx("br", {}, void 0), _jsx("br", {}, void 0), _jsx("br", {}, void 0), render(compile(groupedbarchart))] }), void 0) }), void 0));
}
export default App;
//# sourceMappingURL=App.js.map