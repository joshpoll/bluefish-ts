import './App.css';
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
        {barChart}
      </header>
    </div>
  );
}

export default App;
