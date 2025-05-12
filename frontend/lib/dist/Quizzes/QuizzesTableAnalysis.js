import Navigation from "../components/Navigation";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const QuizzesTableAnalysis = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filterForName, setFilterForName] = useState("");
  const [userData, setUserData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(apiUrl + `get-quizzes-analysis`, {
        params: {
          "filterName": filterForName
        }
      });
      setQuizzes(response.data.result);
    } catch (error) {} finally {}
  };
  async function getUserData() {
    await fetch(apiUrl + "getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    }).then(response => {
      return response.json();
    }).then(data => {
      setUserData(data);
      if (data["role"] !== "teacher") {
        navigate("/quizzes");
      }
    });
  }
  useEffect(() => {
    getUserData().then(() => {});
  }, []);
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      fetchQuizzes();
    }
  }, [userData]);
  useEffect(() => {
    fetchQuizzes().then(() => {});
  }, [filterForName]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Analysis"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, "Quiz Analysis"), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "search",
    className: "form-label"
  }, "Filter by Quiz Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "search",
    className: "form-control",
    placeholder: "Search for quiz",
    onChange: e => setFilterForName(e.target.value)
  })), /*#__PURE__*/React.createElement("table", {
    className: "table table-striped table-hover table-fixed"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25"
  }, "Name"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "text-end w-25"
  }, " Attendance"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-end"
  }, "Statistics"))), /*#__PURE__*/React.createElement("tbody", null, quizzes.map((quiz, ind) => /*#__PURE__*/React.createElement("tr", {
    key: ind
  }, /*#__PURE__*/React.createElement("td", null, quiz.title), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end align-items-center"
  }, /*#__PURE__*/React.createElement("span", null, quiz.attendance, "/", quiz.number_of_students), quiz.attendance === quiz.number_of_students && /*#__PURE__*/React.createElement("i", {
    className: "bi bi-check-circle text-success fs-4 ms-2"
  }))), /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-primary",
    onClick: e => {
      e.preventDefault();
      navigate("/quiz-statistics", {
        state: {
          quiz: quiz,
          userRole: userData["role"]
        }
      });
    }
  }, "Statistics")))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary mb-3 mb-sm-0",
    onClick: () => {
      window.location.href = "/quizzes";
    }
  }, "Back to Quizzes")), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default QuizzesTableAnalysis;