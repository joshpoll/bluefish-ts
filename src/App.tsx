import './App.css';
import render from './render';
import simple from './example';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {render(simple)};
      </header>
    </div>
  );
}

export default App;
