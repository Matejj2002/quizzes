import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './Styles/App.css';
import Questions from './Questions';
import QuestionDetail from './QuestionDetail'
import NewQuestion from './NewQuestion'

const Home = () => <h1>Domovska stranka</h1>;

function App() {
  return (
      <div>
          <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/questions" element={<Questions/>}/>
              <Route path="/question/:id" element={<QuestionDetail />} />
              <Route path="/question/new-question" element={<NewQuestion />} />
          </Routes>
      </div>
  );
}

export default App;
