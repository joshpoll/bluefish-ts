import './App.css';
import { barChart } from './examples/barchartExistential';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';
import { boundingBox } from './examples/boundingboxexample';
import { constraintExample } from './examples/constraintexample';
import { testMarblesListReduced, testTwoMarbleSets } from './examples/glyphFnCompile';
import { arrowExample } from './examples/arrowExample';
import { randomSet } from './examples/randomSet';
import { randomGraph } from './examples/randomGraph';
// import { geoffreyDiagram } from './examples/geoffreyDiagram';
import { ref, makePathsAbsolute } from '@bfjs/core';
// import { geoffreyDiagramTranslationBugReduced } from './examples/geoffreyDiagramTranslationBugReduced';
// import { geoffreyDiagramTranslationBugReducedGrowing } from './examples/geoffreyDiagramTranslationBugReducedGrowing';
import { geoffreyDiagramTranslationBugReducedGrowingTransposed } from './examples/geoffreyDiagramTranslationBugReducedGrowingTransposed';
import { geoffreyDiagramTranslationBugReducedGrowingTransposedUnified } from './examples/geoffreyDiagramTranslationBugReducedGrowingTransposedUnified';
import { treeSplatTest } from './examples/treeSplatTest';
import { refrefTest1 } from './examples/refref';
import { treeExample } from './examples/treeExample';
import { treeSplatTestBugMin } from './examples/treeSplatTestBugMinimization';
import { treeSplatTestGrowing } from './examples/treeSplatTestGrowing';
import { subtreeTest, subtreeTest3 } from './examples/subtreeTest';

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
  // console.log(makePathsAbsolute(listTestTooHigh));
  // console.log(makePathsAbsolute(listTestTooLow));
  // console.log("loweredGlyphTest", loweredGlyphTest);
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {arrowExample}
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
        {/* {constraintExample} */}
        {/* {barChart} */}
        {/* {constraintExample}
        {testTwoMarbleSets}
        {testMarblesListReduced} */}
        {/* {geoffreyDiagram} */}
        {/* {geoffreyDiagramTranslationBugReducedGrowing} */}
        {/* {geoffreyDiagramTranslationBugReducedGrowingTransposed} */}
        {geoffreyDiagramTranslationBugReducedGrowingTransposedUnified}
        <br />
        <br />
        <br />
        {/* {treeSplatTestBugMin} */}
        {/* {treeSplatTest} */}
        {treeSplatTestGrowing}
        <br />
        <br />
        <br />
        {refrefTest1}
        {treeExample}
        {subtreeTest}
        {subtreeTest3}
      </header>
    </div>
  );
}

export default App;
