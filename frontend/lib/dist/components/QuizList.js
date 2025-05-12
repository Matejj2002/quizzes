import React, { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
const QuizList = ({
  chooseId,
  chooseQuiz,
  userName,
  backendUrl
}) => {
  const [quizzes, setQuizzes] = useState([]);
  const fetchStudent = async () => {
    try {
      const response = await axios.get(backendUrl + 'get-user-id', {
        params: {
          "userName": userName
        }
      });
      fetchQuizzes(response.data.result);
    } catch (error) {
      console.error(error);
    } finally {}
  };
  const fetchQuizzes = async studentId => {
    try {
      console.log(studentId);
      const response = await axios.get(backendUrl + `get-quiz-templates`, {
        params: {
          "studentId": studentId
        }
      });
      setQuizzes(response.data.result);
    } catch (error) {
      console.error(error);
    } finally {}
  };
  useEffect(() => {
    fetchStudent();
  }, []);
  let content = null;
  let quiz_list = quizzes.map((quiz, ind) => /*#__PURE__*/React.createElement(ListGroup.Item, {
    as: "button",
    to: `/solve/1`,
    key: ind,
    action: true,
    onClick: () => {
      chooseId(quiz.id);
      chooseQuiz(quiz);
    }
  }, quiz.title));
  content = /*#__PURE__*/React.createElement(ListGroup, null, quiz_list);
  return /*#__PURE__*/React.createElement(React.Fragment, null, content);
};
export default QuizList;