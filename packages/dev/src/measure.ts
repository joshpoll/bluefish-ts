import ReactDOM from "react-dom";

export default (id: string, e: JSX.Element): DOMRect => {
  // https://stackoverflow.com/a/63984284
  // https://stackoverflow.com/a/3492557
  const xmlns = "http://www.w3.org/2000/svg";
  const width = "1000";
  const height = "1000";

  /* create svg */
  const newSVG = document.createElementNS(xmlns, "svg");
  newSVG.setAttribute("id", id + "-svg");
  newSVG.setAttributeNS(null, "viewBox", `0 0 ${width} ${height}`);
  newSVG.setAttributeNS(null, "width", width);
  newSVG.setAttributeNS(null, "height", height);

  /* create g */
  const newG = document.createElementNS(xmlns, "g");
  newG.setAttribute("id", id + "-g");
  newSVG.appendChild(newG);

  /* append svg to DOM */
  document.body.appendChild(newSVG);

  /* render e */
  const domG = document.getElementById(id + "-g");
  if (domG === null) {
    throw Error("Fatal error when measuring element! <g> not found");
  }
  ReactDOM.render(e, domG);

  /* measure g */
  const boundingClientRect = domG.getBoundingClientRect();

  /* clean up */
  const domSVG = document.getElementById(id + "-svg");
  if (domSVG === null) {
    throw Error("Fatal error when measuring element! <svg> not found");
  }
  // TODO: this produces a warning, though we may be fine with ignoring it.
  ReactDOM.unmountComponentAtNode(domSVG); // Clean up React
  domSVG.parentNode?.removeChild(domSVG); // Clean up DOM

  return boundingClientRect;
};