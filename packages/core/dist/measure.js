import ReactDOM from "react-dom";
export default (function (id, e) {
    var _a;
    // https://stackoverflow.com/a/63984284
    // https://stackoverflow.com/a/3492557
    var xmlns = "http://www.w3.org/2000/svg";
    var width = "1000";
    var height = "1000";
    /* create svg */
    var newSVG = document.createElementNS(xmlns, "svg");
    newSVG.setAttribute("id", id + "-svg");
    newSVG.setAttributeNS(null, "viewBox", "0 0 " + width + " " + height);
    newSVG.setAttributeNS(null, "width", width);
    newSVG.setAttributeNS(null, "height", height);
    /* create g */
    var newG = document.createElementNS(xmlns, "g");
    newG.setAttribute("id", id + "-g");
    newSVG.appendChild(newG);
    /* append svg to DOM */
    document.body.appendChild(newSVG);
    /* render e */
    var domG = document.getElementById(id + "-g");
    if (domG === null) {
        throw Error("Fatal error when measuring element! <g> not found");
    }
    ReactDOM.render(e, domG);
    /* measure g */
    var boundingClientRect = domG.getBoundingClientRect();
    /* clean up */
    var domSVG = document.getElementById(id + "-svg");
    if (domSVG === null) {
        throw Error("Fatal error when measuring element! <svg> not found");
    }
    // TODO: this produces a warning, though we may be fine with ignoring it.
    ReactDOM.unmountComponentAtNode(domSVG); // Clean up React
    (_a = domSVG.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(domSVG); // Clean up DOM
    return boundingClientRect;
});
//# sourceMappingURL=measure.js.map