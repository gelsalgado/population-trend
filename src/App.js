import React from 'react';
import './App.css';
import PrefectureComponent from "./PrefectureComponent"

function App() {
  return (
    <div className="App">
      <header className="App-header">
      	<h1>都道府県</h1>
      </header>
      <div className="App-body">
      	<PrefectureComponent displaytext="Population Trend By Prefecture"/>
      </div>
    </div>
  );
}

export default App;
