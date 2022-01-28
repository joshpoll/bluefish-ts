import './App.css';
import { barChart } from './examples/barchartExistential';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';
import { boundingBox } from './examples/boundingboxexample';
import { constraintExample } from './examples/constraintexample';
import { testTwoMarbleSets } from './examples/glyphFnCompile';
import { arrowExample } from './examples/arrowExample';
import { randomSet } from './examples/randomSet';
import { randomGraph } from './examples/randomGraph';
import { ref, makePathsAbsolute } from '@bfjs/core';

const data = { "a": 1, "b": null };

const listTest = {
  elements: [1, 2, 3],
  neighbors: [
    { curr: ref("..", "..", "elements", "0"), next: ref("..", "..", "elements", "1") }
  ]
}

const listTestTooHigh = {
  elements: [1, 2, 3],
  neighbors: [
    { curr: ref("..", "..", "..", "elements", "0"), next: ref("..", "..", "elements", "1") }
  ]
}

const listTestTooLow = {
  elements: [1, 2, 3],
  neighbors: [
    { curr: ref("..", "elements", "0"), next: ref("..", "..", "elements", "1") }
  ]
}

function App() {
  console.log(makePathsAbsolute(data));
  console.log(makePathsAbsolute(listTest));
  console.log(makePathsAbsolute(listTestTooHigh));
  // console.log(makePathsAbsolute(listTestTooLow));
  // console.log("loweredGlyphTest", loweredGlyphTest);
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {/* {randomGraph} */}
        {/* <br />
        <br />
        <br />
        {randomSet}
        <br />
        <br />
        <br />
        {arrowExample}
        <br />
        <br />
        <br />
        {testTwoMarbleSets}
        <br />
        <br />
        <br />
        {boundingBox}
        <br />
        <br />
        <br />
        {constraintExample}
        <br />
        <br />
        <br />
        {barChart} */}
      </header>
    </div>
  );
}

export default App;
