import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Questions from "./Questions/Questions";
import NewCategory from "./Categories/NewCategory";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import NewQuestion from "./Questions/NewQuestion";
import QuestionDetail from "./Questions/QuestionDetail";
import Login from "./components/Login";
import QuestionCopy from "./Questions/QuestionCopy";
import NewQuiz from "./Quizzes/NewQuiz";
import Quiz from "./Quizzes/Quiz";
import GeneratedQuiz from "./Quizzes/GeneratedQuiz";
import QuizReview from "./Quizzes/QuizReview";
import Users from "./Users/Users";
import UserStatistics from "./Users/UserStatistics";
import QuizzesTableAnalysis from "./Quizzes/QuizzesTableAnalysis";
import QuizAnalysis from "./Quizzes/QuizAnalysis";
import QuizStatistics from "./Quizzes/QuizStatistics";
import QuizAllUsersEvals from "./Quizzes/QuizAllUsersEvals";


console.log('BASENAME:', process.env.REACT_APP_BASENAME);
console.log('HOST URL:', process.env.REACT_APP_HOST_URL);
function App() {
  return (
      <div>
              <Routes>
                  <Route path="/" element={<Navigate to="/quizzes" />}/>
                  <Route path="/login" element={<Login/>}></Route>
                  <Route path="/questions" element={<Navigate to="/questions/supercategory?limit=10&offset=0" />} />
                  <Route path="/question/:id" element={<QuestionDetail />} />
                  <Route path="/question/new-question" element={<NewQuestion />} />
                  <Route path="/question/copy-question/:id" element={<QuestionCopy />} />

                  <Route path="/:questions/*" element={<Questions />} />
                  <Route path="/category/new-category" element={<NewCategory />} />
                  <Route path="/new-quiz" element={<NewQuiz />} />
                  <Route path="/quizzes" element={<Quiz />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/user-statistics" element={<UserStatistics />} />
                  <Route path="/quiz-analysis" element={<QuizzesTableAnalysis />} />
                  <Route path="/generated-quiz" element={<GeneratedQuiz />} />
                  <Route path="/review-quiz" element={<QuizReview/>}></Route>
                  <Route path="/quiz-analysis-show" element={<QuizAnalysis/>}></Route>
                  <Route path="/quiz-statistics-table" element={<QuizStatistics/>}></Route>
                  <Route path="/quiz-all-users" element={<QuizAllUsersEvals/>}></Route>

              </Routes>
      </div>
  );
}

export default App;
