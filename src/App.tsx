import './App.css';
import compile from './compile';
import { course, courses, data } from './examples/courses';
import { example } from './examples/example';
import render from './render';
import { dataGlyph } from './examples/barchart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {render(compile(example))}
        <br />
        <br />
        <br />
        {/* TODO: this _doesn't_ work properly, because text measurement happens too late */}
        {render(compile(course(data)))}
        <br />
        <br />
        <br />
        {render(compile(courses))}
        <br />
        <br />
        <br />
        {render(compile(dataGlyph))}
      </header>
    </div>
  );
}

export default App;
