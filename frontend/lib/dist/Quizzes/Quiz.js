import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "../components/Navigation";
const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateAt, setUpdateAt] = useState(null);
  const [userData, setUserData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(apiUrl + `get-quiz-templates`, {
        params: {
          "studentId": userData["id_user"],
          "userRole": userData["role"],
          "templateId": 0
        }
      });
      setQuizzes(response.data.result);
      setUpdateAt(response.data.update_at);
    } catch (error) {
      console.error(error);
      window.location.href = quizzesUrl + "/login";
    } finally {}
  };
  async function getUserLogged() {
    const data = JSON.parse(localStorage.getItem("data"));
    try {
      const response = await axios.get(apiUrl + `get-user-data_logged`, {
        params: {
          "userName": data["login"],
          "avatarUrl": data["avatar_url"]
        }
      });
      setUserData(response.data.result);
    } catch (error) {
      console.error(error);
    } finally {}
  }
  useEffect(() => {
    getUserLogged().then(() => {
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      fetchQuizzes();
    }
  }, [userData]);
  useEffect(() => {
    if (!updateAt) return;
    const interval = setInterval(() => {
      const updt = new Date(updateAt).getTime();
      if (Date.now() + 2 * 60 * 60000 >= updt) {
        fetchQuizzes();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [updateAt]);
  const handleUpdateQuiz = (e, quiz) => {
    e.preventDefault();
    navigate("/update-quiz-template?templateId=" + quiz.id);
  };
  const getDate = time => {
    const dt = new Date(time);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[dt.getUTCDay()]} ${months[dt.getUTCMonth()]} ${dt.getUTCDate()} ${dt.getUTCFullYear()} ${dt.getUTCHours()}:${dt.getUTCMinutes().toString().padStart(2, '0')}:00`;
  };
  const handleArchiveQuiz = (e, quiz) => {
    const updatedData = {
      quiz_template_id: quiz.id
    };
    axios.put(apiUrl + `archive-quiz`, updatedData).then(() => {
      window.location.href = quizzesUrl + '/quizzes';
    }).catch(error => {
      console.error('Error saving changes:', error);
    });
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "d-flex justify-content-center align-items-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Loading..."));
  }
  if (localStorage.getItem("data") === null || localStorage.getItem("data") === '{}') {
    window.location.href = quizzesUrl + "/login";
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Quizzes"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, "Quizzes"), userData["role"] !== "student" && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary mb-3",
    onClick: () => {
      navigate('/new-quiz-template', {
        state: {
          userRole: userData["role"]
        }
      });
    }
  }, "New Quiz"), quizzes.map((quiz, ind) => {
    return /*#__PURE__*/React.createElement("div", {
      className: `border p-3 mb-3 mt-3 ${quiz.actual_quiz ? 'border-success' : ''}`,
      key: ind
    }, /*#__PURE__*/React.createElement("div", {
      className: "d-flex justify-content-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "d-flex"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "h5"
    }, userData["role"] === "teacher" ? /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "text-decoration-none me-1",
      onClick: e => handleUpdateQuiz(e, quiz)
    }, quiz.title) : /*#__PURE__*/React.createElement("h5", null, quiz.title))), userData["role"] !== "student" && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-danger btn-xs p-0 px-1",
      style: {
        marginLeft: "25%"
      },
      onClick: e => {
        if (window.confirm("Are you sure you want to archive this quiz?")) {
          handleArchiveQuiz(e, quiz);
        }
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-trash"
    }))), quiz["shuffle_sections"] && /*#__PURE__*/React.createElement("p", null, "Sections will be shuffled."), !quiz["shuffle_sections"] && /*#__PURE__*/React.createElement("p", null, "Sections will ", /*#__PURE__*/React.createElement("strong", null, "not"), " be shuffled."), quiz["correction_of_attempts"] === "option1" && /*#__PURE__*/React.createElement("p", null, "Attempts are independent. "), quiz["correction_of_attempts"] === "option2" && /*#__PURE__*/React.createElement("p", null, "Attempts are corrections of previous attempt."), /*#__PURE__*/React.createElement("p", null, quiz.number_of_questions, " questions, ", quiz.sections.length, " sections"), /*#__PURE__*/React.createElement("div", {
      className: "mb-3 text-truncate"
    }, /*#__PURE__*/React.createElement("span", {
      className: "m-0"
    }, "Time to finish (Minutes): ", quiz["time_to_finish"]), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "m-0"
    }, "Opened from ", getDate(quiz["date_time_open"]), " to ", getDate(quiz["date_time_close"])), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "m-0"
    }, "Check from ", getDate(quiz["datetime_check"])), /*#__PURE__*/React.createElement("br", null)), /*#__PURE__*/React.createElement("div", {
      className: "d-flex flex-column flex-md-row justify-content-between gap-2"
    }, quiz.time_limit_end && !quiz.first_generation && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-primary me-1",
      disabled: quiz.can_be_checked === false,
      onClick: e => {
        e.preventDefault();
        navigate("/review-quiz?quiz_template_id=" + quiz.id.toString() + "&user_id=" + userData["id_user"].toString() + "&actualQuiz=" + quiz.quizzes.length.toString() + "&correctMode=false");
      }
    }, /*#__PURE__*/React.createElement("span", null, "Review quiz after close")), !quiz.time_limit_end && /*#__PURE__*/React.createElement("div", {
      className: "d-flex flex-column flex-md-row gap-2"
    }, quiz.is_finished ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-primary me-1",
      disabled: quiz.is_opened === false || quiz.quizzes.length + 1 > quiz["number_of_corrections"],
      onClick: e => {
        e.preventDefault();
        navigate("/generated-quiz", {
          state: {
            quiz: quiz,
            refreshQuiz: true,
            userId: userData["id_user"],
            userRole: userData["role"]
          }
        });
      }
    }, "Attempt the quiz"), !quiz.first_generation && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-primary me-1",
      disabled: quiz.can_be_checked === false,
      onClick: e => {
        e.preventDefault();
        navigate("/review-quiz?quiz_template_id=" + quiz.id.toString() + "&user_id=" + userData["id_user"].toString() + "&actualQuiz=" + quiz.quizzes.length.toString() + "&correctMode=false");
      }
    }, /*#__PURE__*/React.createElement("span", null, "Review previous attempt"))) : /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-primary me-1",
      onClick: e => {
        e.preventDefault();
        navigate("/generated-quiz", {
          state: {
            quiz: quiz,
            userId: userData["id_user"],
            userRole: userData["role"]
          }
        });
      }
    }, "Continue current attempt")), /*#__PURE__*/React.createElement("div", null, userData["role"] === "teacher" && /*#__PURE__*/React.createElement("div", {
      className: "d-flex flex-column flex-md-row"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-outline-primary me-1   ",
      onClick: e => {
        e.preventDefault();
        navigate("/quiz-all-users?quiz_template_id=" + quiz.id);
      }
    }, "Results"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-outline-primary",
      onClick: e => {
        e.preventDefault();
        navigate("/quiz-analysis-show?quiz_template_id=" + quiz.id);
      }
    }, "Analysis")))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-2"
  }))));
};
export default Quiz;