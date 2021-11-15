import './App.css';
import { compileWithRef, render } from '@bluefish/core';
import { barChart } from './examples/barchartExistential';
// import { loweredGlyphTest, loweredGlyphMarbles } from './examples/exampleRelationInterfaceExistential';
import { boundingBox } from './examples/boundingboxexample';
import { constraintExample } from './examples/constraintexample';
import { testTwoMarbleSets } from './examples/glyphFnCompile';

function App() {
  // console.log("loweredGlyphTest", loweredGlyphTest);
  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        {render(compileWithRef(testTwoMarbleSets))}
        {/* {render(compile(htmlTest))} */}
        <br />
        <br />
        <br />
        {/* {render(compileWithRef(textspansLoweredApplied))} */}
        {render(compileWithRef(boundingBox))}
        <br />
        <br />
        <br />
        {render(compileWithRef(constraintExample))}
        <br />
        <br />
        <br />
        {/* {render(compileWithRef(textspansLoweredApplied))} */}
        {render(compileWithRef(barChart))}
      </header>
    </div>
  );
}

export default App;
