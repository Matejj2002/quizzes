import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "../components/Navigation";
import QuizReviewPoints from "../Quizzes/QuizReviewPoints";
import 'katex/dist/katex.min.css';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import QuizAttempt from "./QuizAttempt";
const QuizReviewEmbedded = ({
  handleAttempt,
  quizRew,
  userIdRew,
  quizIdRew,
  feedbackRew,
  backendUrl,
  handleReviewData,
  keyAtt
}) => {
  const [quiz, setQuiz] = useState(quizRew);
  const [userId] = useState(userIdRew);
  const [quizId, setQuizId] = useState(quizIdRew);
  const [feedback] = useState(feedbackRew);
  const [data, setData] = useState([]);
  const [questionsData, setQuestionsData] = useState({});
  const [page, setPage] = useState(0);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  useEffect(() => {
    setQuiz(JSON.parse(JSON.stringify(quizRew || {})));
    setData([]);
    setQuizId(quizIdRew);
    setQuestionsData({});
    setPage(0);
    setQuestionsLoaded(false);
  }, [keyAtt, JSON.stringify(quizRew?.quizzes)]);
  const fetchQuestion = async (questionId, itemId) => {
    try {
      const response = await axios.get(backendUrl + `questions-quiz/${questionId}`, {
        params: {
          item_id: itemId,
          quiz_id: quiz.id,
          review: true,
          correctMode: false
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
    if (quiz.quizzes.length === 0) {
      return;
    }
    const getData = async () => {
      const userString = localStorage.getItem("user");
      const user = JSON.parse(userString);
      const response = await axios.get(backendUrl + `get-user-data_logged`, {
        params: {
          "userName": user["login"],
          "avatarUrl": user["avatar_url"]
        }
      });
      const result = await axios.get(backendUrl + "quiz-student-load", {
        params: {
          student_id: response.data.result["id_user"],
          quiz_id: quizId,
          load_type: "attempt"
        }
      });
      await setData(result.data);
    };
    getData().then(() => {});
  }, [quizId, quiz]);
  useEffect(() => {
    const fetchQuestions = [];
    if (data?.sections) {
      data.sections.forEach(section => {
        section.questions.forEach(question => {
          fetchQuestions.push(fetchQuestion(question.id, question.item_id));
        });
      });
      Promise.all(fetchQuestions).then(() => {
        setQuestionsLoaded(true);
      });
    }
  }, [data]);
  const handleChooseId = idQuiz => {
    setQuizId(idQuiz);
  };
  if (data.length === 0 || !questionsLoaded) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "container-fluid"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-2 sidebar"
    }), /*#__PURE__*/React.createElement("div", {
      className: "col-8"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "mb-3"
    }, quiz.title), /*#__PURE__*/React.createElement(QuizAttempt, {
      quizEmb: quiz,
      handleAttempt: handleAttempt,
      handleReviewData: handleReviewData
    })), /*#__PURE__*/React.createElement("div", {
      className: "col-2 sidebar"
    }))));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "mb-3"
  }, quiz.title), /*#__PURE__*/React.createElement("div", null, feedback.includes("pointsReview") && /*#__PURE__*/React.createElement(QuizReviewPoints, {
    questionsData: questionsData
  }))), /*#__PURE__*/React.createElement(QuizAttempt, {
    quizEmb: quiz,
    handleAttempt: handleAttempt,
    handleReviewData: handleReviewData,
    keyAtt: keyAtt
  }), !quiz.can_be_checked && /*#__PURE__*/React.createElement("h2", null, "Quiz can't be reviewed"), !quiz.is_finished && /*#__PURE__*/React.createElement("h2", null, "Can't review quiz. Quiz already opened."), quiz.can_be_checked && quiz.quizzes.length !== 0 && quiz.is_finished && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center gap-2 mb-3 mt-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-center",
    htmlFor: "quizAttempt"
  }, "Attempt"), /*#__PURE__*/React.createElement("select", {
    className: "form-select mb-3 mt-3",
    onChange: e => handleChooseId(e.target.value)
  }, quiz.quizzes.slice().reverse().map((q, index, arr) => /*#__PURE__*/React.createElement("option", {
    key: q.quiz_id,
    value: q.quiz_id
  }, q.started)))), /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs mt-3",
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
  }, sect?.title || "Section " + (index + 1))))), /*#__PURE__*/React.createElement("ul", {
    className: "list-group mb-3"
  }, data.sections[page]?.questions.map((question, index) => /*#__PURE__*/React.createElement("li", {
    className: `list-group-item ${parseFloat(questionsData[question.id]?.points) === 0 && feedback.includes("correctAnswers") ? 'border-danger' : ''} 
                                    ${parseFloat(questionsData[question.id]?.points) > 0 && feedback.includes("correctAnswers") ? 'border-success' : ''}`,
    style: feedback.includes("correctAnswers") ? {
      background: questionsData[question.id]?.points > 0 ? "rgba(155,236,137,0.15)" : "rgba(255, 0, 0, 0.04)"
    } : {},
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/React.createElement("h2", null, questionsData[question.id]?.title), feedback.includes("pointsReview") && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: `badge fs-5 ms-2 mb-0 ${Number(questionsData[question.id]?.points) === 0 ? 'bg-danger' : 'bg-success'}`
  }, Number(questionsData[question.id]?.points).toFixed(2), "/", questionsData[question.id]?.max_points, Number(questionsData[question.id]?.points) === 1 ? ' pt.' : ' pts.'))), /*#__PURE__*/React.createElement("div", {
    className: "mb-1"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
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
    key: "table-" + idx.toString()
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      borderRight: "1px solid black",
      paddingBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start w-100"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans["leftSide"]
  }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start w-100"
  }, feedback.includes("correctAnswers") ? ans.answer !== ans["rightSide"] ? /*#__PURE__*/React.createElement("div", {
    className: "w-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between w-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "me-1"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mb-0 fw-bold"
  }, "Your answer is"), ans.answer.length === 0 ? "No answer" : /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans.answer
  })), /*#__PURE__*/React.createElement("span", {
    className: "d-flex text-danger justify-content-end me-0"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-x-circle-fill fs-5"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "mb-0 fw-bold"
  }, "Correct answer is"), /*#__PURE__*/React.createElement("div", {
    className: " m-0"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans["rightSide"]
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between w-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ms-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans["rightSide"]
  })), /*#__PURE__*/React.createElement("span", {
    className: "d-flex text-success justify-content-end me-0"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-check-circle-fill fs-5"
  }))) : /*#__PURE__*/React.createElement("span", null, ans.answer), ans.answer !== ans["rightSide"] && feedback.includes("optionsFeedback") && ans?.negative_feedback !== "" ? /*#__PURE__*/React.createElement("p", {
    className: "border border-danger p-3 rounded",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, ans?.negative_feedback) : ans?.positive_feedback !== "" && /*#__PURE__*/React.createElement("p", {
    className: "border border-success p-3 rounded",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, ans?.positive_feedback)))))))), questionsData[question.id]?.type === "multiple_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, questionsData[question.id]?.answers.map((ans, idx) => /*#__PURE__*/React.createElement("div", {
    className: "form-check",
    key: idx
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    style: {
      pointerEvents: 'none'
    }
    // disabled="true"
    ,
    defaultChecked: ans.answer === true
  }), /*#__PURE__*/React.createElement("span", {
    className: "d-flex w-100 form-check-label"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans?.text
  }), feedback.includes("correctAnswers") && (!ans.isCorrectOption ? /*#__PURE__*/React.createElement("span", {
    className: "ms-2 text-danger"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-x-circle-fill fs-5"
  })) : /*#__PURE__*/React.createElement("span", {
    className: "ms-2 text-success"
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-check-circle-fill fs-5"
  })))), !ans.isCorrectOption && feedback.includes("optionsFeedback") && ans?.negative_feedback !== "" ? /*#__PURE__*/React.createElement("p", {
    className: "border border-danger p-3 rounded",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, ans?.negative_feedback) : ans?.positive_feedback !== "" && /*#__PURE__*/React.createElement("p", {
    className: "border border-success p-3 rounded",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, ans?.positive_feedback)))), questionsData[question.id]?.type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3 mt-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "me-2 mt-3 fw-bold"
  }, "Answer: "), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: questionsData[question.id]?.answers[0]["answer"],
    disabled: true,
    required: true,
    className: "form-control"
  }), parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("optionsFeedback") && questionsData[question.id]?.answers[0].feedback !== "" && /*#__PURE__*/React.createElement("p", {
    className: "border border-danger p-3 rounded",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, questionsData[question.id]?.answers[0].feedback)), parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("questionFeedback") && questionsData[question.id]?.negative_feedback !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: questionsData[question.id]?.negative_feedback
  })), parseFloat(questionsData[question.id]?.points) === parseFloat(questionsData[question.id]?.max_points) && feedback.includes("questionFeedback") && questionsData[question.id]?.positive_feedback !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: questionsData[question.id]?.positive_feedback
  })), parseFloat(questionsData[question.id]?.points) !== parseFloat(questionsData[question.id]?.max_points) && feedback.includes("correctAnswers") && questionsData[question.id]?.type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mt-3",
    style: {
      background: "rgba(255, 165, 0, 0.3)",
      whiteSpace: "pre-line"
    }
  }, "Correct answer is ", /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: questionsData[question.id]?.correct_answer
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
    className: "d-flex"
  }, page === 0 ? /*#__PURE__*/React.createElement("div", null) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: page === 0,
    style: {
      marginRight: '3px'
    },
    onClick: () => setPage(prev => prev - 1)
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-caret-left"
  }), " Back to ", quiz.sections[page - 1].title), page + 1 >= quiz.sections.length ? /*#__PURE__*/React.createElement("div", null) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    disabled: page + 1 >= quiz.sections.length,
    onClick: () => setPage(prev => prev + 1)
  }, "Next ", quiz.sections[page + 1].title, " ", /*#__PURE__*/React.createElement("i", {
    className: "bi bi-caret-right"
  }))))));
};
export default QuizReviewEmbedded;