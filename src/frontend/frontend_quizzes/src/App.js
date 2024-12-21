import React from 'react';
import {BrowserRouter as Router , Routes, Route, Navigate} from 'react-router-dom';
import QuestionDetail from './QuestionDetail'
import NewQuestion from './NewQuestion'
import Questions from "./Questions";
import NewCategory from "./NewCategory";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Home = () => <h1>Domovska stranka</h1>;

function App() {
  return (
      <div>
              <Routes>
                  <Route path="/" element={<Home/>}/>
                  <Route path="/questions" element={<Navigate to="/questions/1?limit=10&offset=0" />} />
                  <Route path="/question/:id" element={<QuestionDetail />} />
                  <Route path="/question/new-question" element={<NewQuestion />} />
                  <Route path="/questions/:page" element={<Questions />} />
                  <Route path="/category/new-category" element={<NewCategory />} />
              </Routes>
      </div>
  );
}

export default App;
