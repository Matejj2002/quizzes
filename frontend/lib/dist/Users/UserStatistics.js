import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import axios from "axios";
const UserStatistics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [studentId] = useState(location.state?.studentId);
  const [userRole] = useState(location.state?.userRole);
  const [userId] = useState(location.state?.userId);
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchUserData = async () => {
    try {
      const response = await axios.get(apiUrl + `get-user-data`, {
        params: {
          "studentId": studentId
        }
      });
      setUserData(response.data.result);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  if (userRole !== "teacher") {
    navigate("/quizzes");
  }
  console.log(userData);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Users"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, userData["github_name"], " (", userData["user_type"], ") statistics"), /*#__PURE__*/React.createElement("h2", null, "Attended ", userData["quizzes_attended"]?.length, " out of ", userData["all_quizzes"], " Quizzes"), /*#__PURE__*/React.createElement("table", {
    className: "table table-striped table-hover table-fixed align-middle"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25"
  }, "Title"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-end"
  }, "Attempts"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-end"
  }, "Points"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-end"
  }, "Review"))), /*#__PURE__*/React.createElement("tbody", null, userData["quizzes_attended"]?.map((quiz, ind) => /*#__PURE__*/React.createElement("tr", {
    key: ind
  }, /*#__PURE__*/React.createElement("td", {
    className: "w-25"
  }, quiz.title), /*#__PURE__*/React.createElement("td", {
    className: "w-25 text-end"
  }, quiz.attempts), /*#__PURE__*/React.createElement("td", {
    className: "w-25 text-end"
  }, quiz.achieved, "/", quiz.max_points), /*#__PURE__*/React.createElement("td", {
    className: "w-25 text-end"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline-primary",
    onClick: e => {
      e.preventDefault();
      navigate("/review-quiz", {
        state: {
          quiz: quiz.quizzes[0],
          quizId: quiz.id,
          feedback: ['optionsFeedback', 'questionFeedback', 'pointsReview', 'correctAnswers'],
          correctMode: true,
          userId: studentId,
          userName: userData["github_name"],
          userRole: "teacher"
        }
      });
    }
  }, "Review")))))), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, userData["all_achieved_points"], "/", userData["all_max_points"], " b"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, userData["percentage"], " %"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary",
    onClick: () => {
      navigate("/users");
    }
  }, "Back to Users")), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default UserStatistics;