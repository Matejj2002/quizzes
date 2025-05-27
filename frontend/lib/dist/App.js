import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(Navigate, {
      to: "/quizzes"
    })
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/login",
    element: /*#__PURE__*/React.createElement(Login, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/questions",
    element: /*#__PURE__*/React.createElement(Navigate, {
      to: "/questions/supercategory?limit=10&offset=0"
    })
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/question/:id",
    element: /*#__PURE__*/React.createElement(QuestionDetail, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/question/new-question",
    element: /*#__PURE__*/React.createElement(NewQuestion, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/question/copy-question/:id",
    element: /*#__PURE__*/React.createElement(QuestionCopy, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/:questions/*",
    element: /*#__PURE__*/React.createElement(Questions, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/category/new-category",
    element: /*#__PURE__*/React.createElement(NewCategory, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/new-quiz-template",
    element: /*#__PURE__*/React.createElement(NewQuiz, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/update-quiz-template",
    element: /*#__PURE__*/React.createElement(NewQuiz, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/quizzes",
    element: /*#__PURE__*/React.createElement(Quiz, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/users",
    element: /*#__PURE__*/React.createElement(Users, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/user-statistics",
    element: /*#__PURE__*/React.createElement(UserStatistics, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/quiz-analysis",
    element: /*#__PURE__*/React.createElement(QuizzesTableAnalysis, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/generated-quiz",
    element: /*#__PURE__*/React.createElement(GeneratedQuiz, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/review-quiz",
    element: /*#__PURE__*/React.createElement(QuizReview, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/quiz-analysis-show",
    element: /*#__PURE__*/React.createElement(QuizAnalysis, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/quiz-statistics-table",
    element: /*#__PURE__*/React.createElement(QuizStatistics, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/quiz-all-users",
    element: /*#__PURE__*/React.createElement(QuizAllUsersEvals, null)
  })));
}
export default App;