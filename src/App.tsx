import './App.css';
import { course } from './examples/courses';
import { example } from './examples/example';
import render from './render';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {render(example)}
        <br />
        <br />
        <br />
        {render(course)}
      </header>
    </div>
  );
}

export default App;
