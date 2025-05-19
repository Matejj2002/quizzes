import Navigation from "../components/Navigation";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const QuizAllUsersEvals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz] = useState(location.state?.quiz);
  const apiUrl = process.env.REACT_APP_API_URL;
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  const [studentsData, setStudentsData] = useState([]);
  const [data, setData] = useState([]);
  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl + `get-quiz-template-students-results`, {
        params: {
          "template_id": quiz.quiz_template_id
        }
      });
      setStudentsData(response.data.result.students);
      setData(response.data.result.data);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    fetchData();
  }, []);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Results"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, "Quiz ", quiz.title, " statistics"), /*#__PURE__*/React.createElement("p", null, "Attendance ", data.attendance, " out of ", data.num_students, " students (", data.attendance_perc, " %)"), /*#__PURE__*/React.createElement("p", null, "Average points ", data.average_points, "pts. out of ", data.max_points, "pts. (", data.average_points_perc, "%)"), /*#__PURE__*/React.createElement("table", {
    className: "table table-striped table-hover table-fixed"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25"
  }, "Github Name"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "text-center w-25"
  }, " Attempts"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "text-center w-25"
  }, " Score"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-center"
  }, "Max Score"))), /*#__PURE__*/React.createElement("tbody", null, studentsData.map((data, ind) => /*#__PURE__*/React.createElement("tr", {
    key: ind
  }, /*#__PURE__*/React.createElement("td", null, data.github_name), /*#__PURE__*/React.createElement("td", {
    className: "text-center"
  }, data.num_quizzes), /*#__PURE__*/React.createElement("td", {
    className: "text-center"
  }, data.quizzes[0]?.points), /*#__PURE__*/React.createElement("td", {
    className: "text-center"
  }, data.quizzes[0]?.max_points))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary mb-3 mb-sm-0",
    onClick: () => {
      navigate(-1);
    }
  }, "Back to Quiz table")))));
};
export default QuizAllUsersEvals;