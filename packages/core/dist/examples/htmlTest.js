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
import { html } from '../mark';
export var htmlTest = {
    children: {
        "html": html({
            width: 100,
            height: 300,
            html: _jsxs("div", { children: ["The quick brown fox ", _jsx("u", { children: "jumps" }, void 0), " over the lazy dog.", _jsx("br", {}, void 0), "Pack my box with ", _jsx("a", __assign({ href: "google.com" }, { children: "five" }), void 0), " dozen liquor jugs"] }, void 0)
        })
    },
};
//# sourceMappingURL=htmlTest.js.map