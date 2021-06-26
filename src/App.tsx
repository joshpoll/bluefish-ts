import './App.css';
import compile from './compile';
import { course } from './examples/courses';
import { example } from './examples/example';
import render from './render';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {render(compile(example))}
        <br />
        <br />
        <br />
        {render(compile(course))}
      </header>
    </div>
  );
}

export default App;
