import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import FormattedTextRenderer from "../components/FormattedTextRenderer";
const GeneratedQuiz = () => {
  const location = useLocation();
  const [quiz, setQuiz] = useState(location.state?.quiz);
  const [userId] = useState(location.state?.userId);
  const [userRole] = useState(location.state?.userRole);
  const [refreshQuiz] = useState(location.state?.refreshQuiz || false);
  const [questionsData, setQuestionsData] = useState({});
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [dateStart] = useState(0);
  const [count, setCount] = useState(-1);
  const [minutesToFinish] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loadQuestions, setLoadQuestions] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);
  const [countMax, setCountMax] = useState(0);
  const [feedbackQuestion, setFeedbackQuestion] = useState([]);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  useEffect(() => {
    if (!quiz?.sections) {
      return;
    }
    axios.post(apiUrl + `new-quiz-template-check`, quiz).then(response => {
      setRandomQuestions(response.data.result[0]);
      setNumberOfQuestions(response.data.number_of_questions);
    }).catch(error => {
      console.error('Error fetching random questions:', error);
    });
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => Math.max(-1, Math.floor(prev - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [dateStart, minutesToFinish]);
  useEffect(() => {
    if (count % 60 === 0 && count !== -1 && count !== countMax) {
      handleSaveQuiz(false);
      setLoadQuestions(true);
    }
    if (count === 0) {
      const updatedData = {
        quiz_template_id: quiz.id,
        student_id: 3
      };
      const setDateFinish = async () => {
        axios.put(apiUrl + `quiz-finish`, updatedData).then(() => {
          window.location.href = quizzesUrl + "/quizzes";
        });
      };
      setCount(-1);
      setDateFinish();
    }
  }, [count]);
  const fetchQuestion = async (questionId, itemId) => {
    try {
      const response = await axios.get(apiUrl + `questions-quiz/${questionId}`, {
        params: {
          item_id: itemId,
          review: false
        }
      });
      setQuestionsData(prevData => ({
        ...prevData,
        [questionId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };
  useEffect(() => {
    if (!quiz?.sections) {
      return;
    }
    let cnt = 0;
    const fetchQuestions = [];
    if (quiz?.sections) {
      quiz.sections.forEach(section => {
        section.questions.forEach(question => {
          if (!questionsData[question.id] && question.questionType === "questions") {
            fetchQuestions.push(fetchQuestion(question.id, question.item_id));
          } else {
            if (!question.id) {
              question.id = randomQuestions[cnt];
              cnt += 1;
              if (question.id !== undefined) {
                fetchQuestions.push(fetchQuestion(question.id));
              }
            }
          }
        });
      });
      Promise.all(fetchQuestions).then(() => {
        setQuiz({
          ...quiz
        });
      });
    }
  }, [randomQuestions, questionsData, loadQuestions]);
  useEffect(() => {
    if (quizGenerated || Object.keys(questionsData).length !== numberOfQuestions || numberOfQuestions === 0) {
      return;
    }
    if (quiz.correction_of_attempts !== "correctionAttempts" && refreshQuiz) {
      const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setQuizGenerated(true);
      };
      generateQuizWait().then(() => {});
    } else {
      const generateQuizWait = async () => {
        setLoading(true);
        await generateQuiz();
        setQuizGenerated(true);
      };
      generateQuizWait().then(() => {});
    }
  }, [questionsData]);
  const handleSaveQuiz = async finalSave => {
    setIsSaving(true);
    const updatedData = {
      "quiz": quiz,
      "data": questionsData,
      "finalSave": finalSave,
      "studentId": userId
    };
    setDisableButtons(true);
    axios.put(apiUrl + `quiz_set_answers`, updatedData).then(() => {
      if (finalSave) {
        window.location.href = quizzesUrl + "/quizzes";
      }
      setTimeout(() => {
        setIsSaving(false);
        setDisableButtons(false);
      }, 3000);
    }).catch(() => {
      setTimeout(() => {
        setIsSaving(false);
        setDisableButtons(false);
      }, 3000);
    });
    return false;
  };
  const generateQuiz = () => {
    const updatedData = {
      "quiz": quiz,
      "questions": questionsData,
      "student_id": userId,
      "refreshQuiz": refreshQuiz
    };
    axios.put(apiUrl + `new-quiz-student`, updatedData).then(async response => {
      if (!response.data["created"] || response.data["created"]) {
        const result = await axios.get(apiUrl + "quiz-student-load", {
          params: {
            student_id: userId,
            quiz_id: response.data["quiz_id"],
            load_type: "attempt"
          }
        });
        setQuiz(prevQuiz => ({
          ...prevQuiz,
          sections: result.data.sections,
          answers: []
        }));
        const startTime = new Date(result.data.start_time);
        const finishTime = new Date(result.data.end_time).getTime();
        const startMilis = startTime.getTime();
        const timeToFinish = result.data.minutes_to_finish * 60 * 1000;
        const endTime = startMilis + timeToFinish;
        const nowDate = new Date(result.data.now_check);
        const endDate = new Date(endTime);
        const differenceInMilliseconds = endDate.getTime() - nowDate.getTime();
        const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
        if (nowDate > endTime || result.data.end_time !== null && nowDate < finishTime) {
          setCount(-1);
        } else {
          setCountMax(differenceInSeconds);
          setCount(differenceInSeconds);
        }
        setRandomQuestions([]);
        setQuestionsData([]);
        setLoading(false);
      } else {
        window.location.reload();
        setCountMax(response.data.time_to_finish * 60);
        setCount(response.data.time_to_finish * 60);
      }
      setLoading(false);
    }).catch(error => {
      console.error('Error saving changes:', error);
    });
  };
  const saveFeedback = (feedback, itemId) => {
    const updatedData = {
      "feedback": feedback,
      "itemId": itemId,
      "student_id": userId,
      "role": userRole
    };
    axios.put(apiUrl + `save-feedback-to-item`, updatedData).then(() => {
      setFeedbackQuestion([...feedbackQuestion, itemId]);
    }).catch(() => {});
  };
  function getTime() {
    const hours = Math.floor(count / 3600);
    const minutes = Math.floor(count % 3600 / 60);
    const seconds = count % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: "d-flex justify-content-center align-items-center"
    }, /*#__PURE__*/React.createElement("h2", null, "Loading..."));
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
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, quiz.title)), /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-clock text-primary",
    style: {
      fontSize: '2rem',
      marginRight: "2px"
    }
  }), count < 300 ? /*#__PURE__*/React.createElement("span", {
    className: "text-xl font-bold text-danger"
  }, getTime()) : /*#__PURE__*/React.createElement("span", {
    className: "text-xl font-bold"
  }, getTime()))), /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs",
    id: "myTab",
    role: "tablist"
  }, quiz.sections.map((sect, index) => /*#__PURE__*/React.createElement("li", {
    className: "nav-item",
    role: "presentation",
    key: index
  }, /*#__PURE__*/React.createElement("button", {
    className: `nav-link ${index === page ? 'active' : ''}`,
    id: `tab-${index}`,
    "data-bs-toggle": "tab",
    "data-bs-target": `#tab-pane-${index}`,
    type: "button",
    role: "tab",
    "aria-controls": `tab-pane-${index}`,
    "aria-selected": index === page,
    onClick: () => {
      setPage(index);
    }
  }, sect.title || "Section " + (index + 1)))), /*#__PURE__*/React.createElement("li", {
    className: "nav-item ms-auto",
    role: "presentation"
  }, isSaving && /*#__PURE__*/React.createElement("span", {
    id: "disabled-tab",
    "data-bs-toggle": "tab",
    "aria-controls": "disabled-tab-pane"
  }, "Saving ..."))), /*#__PURE__*/React.createElement("ul", {
    className: "list-group mb-3"
  }, quiz.sections[page]?.questions.map((question, index) => /*#__PURE__*/React.createElement("li", {
    className: "list-group-item",
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("h2", null, questionsData[question.id]?.title), /*#__PURE__*/React.createElement("div", {
    className: "dropdown-center"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn  dropdown-toggle",
    type: "button",
    "data-bs-toggle": "dropdown",
    "aria-expanded": "false"
  }, /*#__PURE__*/React.createElement("i", {
    className: `bi ${feedbackQuestion.includes(question.item_id) ? "bi-flag-fill" : "bi-flag"}`,
    style: {
      color: feedbackQuestion.includes(question.item_id) ? 'red' : ''
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "dropdown-menu p-3",
    style: {
      minWidth: "300px"
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "feedback",
    className: "form-label"
  }, "Feedback"), /*#__PURE__*/React.createElement("textarea", {
    id: `feedback-${question.id}`,
    className: "form-control",
    rows: "3",
    placeholder: "Why you flagged this question?"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary w-100 mt-2",
    onClick: () => {
      const feedbackValue = document.getElementById("feedback-" + question.id.toString()).value;
      saveFeedback(feedbackValue, question.item_id);
    }
  }, !feedbackQuestion.includes(question.item_id) ? /*#__PURE__*/React.createElement("span", null, "Send feedback") : /*#__PURE__*/React.createElement("span", null, "Update feedback"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: questionsData[question.id]?.text
  })), questionsData[question.id]?.type === "matching_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("table", {
    className: "table table-striped"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, "Left Side")), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, "Right Side")))), /*#__PURE__*/React.createElement("tbody", null, questionsData[question.id].answers.map((ans, idx) => /*#__PURE__*/React.createElement("tr", {
    key: "tr-" + idx.toString()
  }, /*#__PURE__*/React.createElement("td", {
    className: "w-50",
    style: {
      borderRight: "1px solid black",
      paddingBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans["leftSide"]
  }))), /*#__PURE__*/React.createElement("td", {
    style: {
      borderLeft: "1px solid black",
      paddingBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, ans.answer.length === 0 ? "Select Answer" : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans.answer
  })), /*#__PURE__*/React.createElement("div", {
    className: "dropdown"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    id: `dropdown-${idx}`,
    "data-bs-toggle": "dropdown",
    "aria-expanded": "false"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-chevron-down",
    style: {
      fontSize: '24px'
    }
  })), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-menu",
    style: {
      width: "25rem",
      wordWrap: "break-word"
    },
    "aria-labelledby": `dropdown-${idx}`
  }, questionsData[question.id].rightSidesAnswers.map((answ, optionIdx) => /*#__PURE__*/React.createElement("li", {
    key: optionIdx
  }, /*#__PURE__*/React.createElement("a", {
    className: "dropdown-item",
    style: {
      whiteSpace: "normal"
    },
    href: "#",
    onClick: e => {
      e.preventDefault();
      setQuestionsData(prevData => ({
        ...prevData,
        [question.id]: {
          ...prevData[question.id],
          answers: prevData[question.id].answers.map((item, index) => index === idx ? {
            ...item,
            answer: answ
          } : item)
        }
      }));
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: answ
  }))))))))))))))), questionsData[question.id]?.type === "multiple_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, questionsData[question.id].answers.map((ans, idx) => /*#__PURE__*/React.createElement("div", {
    className: "form-check",
    key: idx
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    checked: ans.answer === true,
    onChange: e => {
      const isChecked = e.target.checked;
      setQuestionsData(prevData => ({
        ...prevData,
        [question.id]: {
          ...prevData[question.id],
          answers: prevData[question.id].answers.map((item, index) => index === idx ? {
            ...item,
            answer: isChecked
          } : item)
        }
      }));
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans.text
  }))))), questionsData[question.id]?.type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mt-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-6"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-control h-100",
    placeholder: "Answer",
    value: questionsData[question.id]?.answers[0]["answer"],
    rows: 4,
    onChange: e => {
      const newAnswer = e.target.value;
      setQuestionsData(prevData => ({
        ...prevData,
        [question.id]: {
          ...prevData[question.id],
          answers: [{
            answer: newAnswer
          }]
        }
      }));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-6 d-flex"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: questionsData[question.id]?.answers[0]["answer"]
  }))))))))), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary",
    disabled: disableButtons,
    onClick: () => {
      if (count !== -1) {
        handleSaveQuiz(false);
      }
      window.location.href = quizzesUrl + "/quizzes";
    }
  }, "Back to Quizzes"), /*#__PURE__*/React.createElement("div", null, page === 0 ? /*#__PURE__*/React.createElement("div", null) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: page === 0,
    style: {
      marginRight: '3px'
    },
    onClick: () => setPage(prev => prev - 1)
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-caret-left"
  }), " Back to ", quiz.sections[page - 1].title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success",
    style: {
      marginRight: '3px'
    },
    disabled: count === -1 || disableButtons,
    onClick: () => handleSaveQuiz(false)
  }, "Save"), page + 1 >= quiz.sections.length ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    style: {
      marginRight: '3px'
    },
    disabled: count === -1,
    onClick: () => handleSaveQuiz(true)
  }, "Save & Finish") : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: page + 1 >= quiz.sections.length,
    onClick: () => setPage(prev => prev + 1)
  }, "Next ", quiz.sections[page + 1].title, " ", /*#__PURE__*/React.createElement("i", {
    className: "bi bi-caret-right"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "col-2"
  }))));
};
export default GeneratedQuiz;