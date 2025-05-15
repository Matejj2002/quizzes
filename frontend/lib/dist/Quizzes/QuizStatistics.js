import Navigation from "../components/Navigation";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import WrongAnswersTable from "../components/WrongAnswersTable";
const QuizStatistics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz] = useState(location.state?.quiz);
  const [userRole] = useState(location.state?.userRole || undefined);
  const [data, setData] = useState([]);
  const [evals, setEvals] = useState([]);
  const [studentsCorrect, setStudentsCorrect] = useState([]);
  const [page, setPage] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  const questionTypes = {
    "matching_answer_question": "Matching Question",
    "short_answer_question": "Short Question",
    "multiple_answer_question": "Multiple Choice"
  };
  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl + `quiz-statistics`, {
        params: {
          "template_id": quiz.quiz_template_id
        }
      });
      setData(response.data.result);
      setEvals(response.data.evals);
      setStudentsCorrect(response.data.correct_students);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    fetchData();
  }, []);
  if (userRole !== "teacher" || userRole === undefined) {
    navigate("/quizzes");
  }
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
  }, /*#__PURE__*/React.createElement("h1", {
    className: "mb-3"
  }, "Analysis ", data.title), /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs",
    id: "myTab",
    role: "tablist"
  }, data.sections && data.sections.map((sect, index) => /*#__PURE__*/React.createElement("li", {
    className: "nav-item",
    role: "presentation",
    key: "section-" + index.toString()
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
  }, data.sections && data.sections[page]?.questions.map((question, index) => /*#__PURE__*/React.createElement("li", {
    className: "list-group-item",
    key: index
  }, question.questionType === "questions" ? /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/React.createElement("h2", null, question.title), /*#__PURE__*/React.createElement("span", {
    className: "badge text-bg-primary rounded-pill flex-shrink-0"
  }, questionTypes[question.type])) : /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/React.createElement("h2", null, "Random question"), /*#__PURE__*/React.createElement("span", {
    className: "badge text-bg-primary rounded-pill flex-shrink-0"
  }, question.questionAnswerType)), question.type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Correct Answer"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: evals[question["item_id"]]?.correct_answer
  })), question.type === "multiple_answer_question" && /*#__PURE__*/React.createElement("div", null, evals[question["item_id"]]?.correct_answer.map((ans, ind) => /*#__PURE__*/React.createElement("div", {
    className: "form-check",
    key: ind
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    defaultChecked: ans[2] === true
  }), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-check-label w-50"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans[1]
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-50 progress-stacked"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress",
    role: "progressbar",
    "aria-label": "Segment one",
    "aria-valuenow": "0",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    style: {
      width: `${Math.round(evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum * 100)}%`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar bg-success"
  }, Math.round(evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum * 100), "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress",
    role: "progressbar",
    "aria-label": "Segment two",
    "aria-valuenow": "30",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    style: {
      width: `${100 - Math.round(evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum * 100)}%`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar bg-danger"
  }, 100 - Math.round(evals[question["item_id"]].wrong_answers[ans[0]].correct / evals[question["item_id"]].wrong_answers[ans[0]].sum * 100), "%"))))))), question.type === "matching_answer_question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("table", {
    className: "table table-striped"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, "Left Side")), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-center"
  }, "Right Side")), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end text-end"
  }, "Success")))), /*#__PURE__*/React.createElement("tbody", null, evals[question["item_id"]].correct_answer.map((ans, ind) => /*#__PURE__*/React.createElement("tr", {
    key: "match-q-" + ind.toString()
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      borderRight: "1px solid black",
      paddingBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start w-100"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans[0]
  }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between w-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "me-1"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: ans[1]
  })))), /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, ans[2] + "/" + ans[4])))))), /*#__PURE__*/React.createElement("span", null, evals[question["item_id"]]?.item_score, "/ ", evals[question["item_id"]]?.item_max_score), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "Average points: ", evals[question["item_id"]]?.item_average_score, "/ ", evals[question["item_id"]]?.item_full_score), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, studentsCorrect[question["item_id"]]?.length, " / ", quiz.attendance, " students has this question correct."), question.type === "short_answer_question" && evals[question["item_id"]]?.wrong_answers.length > 0 && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "List of wrong answers"), /*#__PURE__*/React.createElement(WrongAnswersTable, {
    wrongAnswers: evals[question["item_id"]]?.wrong_answers,
    tableCols: ["Answer", "Occurencies"],
    colsSize: ["w-75", "w-50 text-center"],
    colsType: ["string", "int"],
    title: "AA"
  })), question.type === "matching_answer_question" && evals[question["item_id"]]?.wrong_answers.length > 0 && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "List of wrong answers"), /*#__PURE__*/React.createElement(WrongAnswersTable, {
    wrongAnswers: evals[question["item_id"]]?.wrong_answers,
    tableCols: ["Left Side", "Right Side", "Occurencies"],
    colsSize: ["w-50", "w-50", "w-25"],
    colsType: ["string", "string", "int"],
    title: "BB"
  })), question.questionType === "random" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "List of questions"), /*#__PURE__*/React.createElement("ol", {
    className: "list-group"
  }, evals[question["item_id"]]?.questions.map((question, index) => /*#__PURE__*/React.createElement("li", {
    className: "list-group-item",
    key: "random-" + index.toString()
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center w-100"
  }, /*#__PURE__*/React.createElement("p", {
    className: "h5 text-start text-truncate flex-grow-1"
  }, /*#__PURE__*/React.createElement("a", {
    href: "",
    onClick: e => {
      e.preventDefault();
      navigate(`/question/${question.question_version_id}`, {
        state: {
          catPath: "",
          id: "",
          selectedCategory: "",
          limit: "",
          offset: "",
          sort: "",
          page: "",
          filterType: "",
          authorFilter: "",
          back: true,
          userRole: "teacher"
        }
      });
    },
    className: "text-decoration-none"
  }, question.question_title || "No title available")), /*#__PURE__*/React.createElement("span", {
    className: "badge text-bg-primary rounded-pill flex-shrink-0"
  }, questionTypes[question.question_type])), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, /*#__PURE__*/React.createElement("span", null, "Item score ", question.item_score, " / ", question.item_max_score)), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, /*#__PURE__*/React.createElement("span", null, "Average score ", question.sum_points / (question.item_max_score * question.number_attempts), " / ", question.item_max_score)), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start"
  }, /*#__PURE__*/React.createElement("span", null, "Times in quiz: ", question.number_attempts))))))), evals[question["item_id"]]?.comments.length > 0 && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Feedbacks"), /*#__PURE__*/React.createElement("table", {
    className: "table table-striped"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25"
  }, "Type"), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-75"
  }, "Text"))), /*#__PURE__*/React.createElement("tbody", null, evals[question["item_id"]].comments.map(comment => /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "w-25"
  }, comment[0], " "), /*#__PURE__*/React.createElement("td", {
    className: "w-75"
  }, comment[1])))))))))), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default QuizStatistics;