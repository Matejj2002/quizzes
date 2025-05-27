import Navigation from "../components/Navigation";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import WrongAnswersTable from "../components/WrongAnswersTable";
const QuizAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizTemplateId = searchParams.get("quiz_template_id");
  const [data, setData] = useState([]);
  const [evals, setEvals] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [userData, setUserData] = useState([]);
  const [page, setPage] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  const questionTypes = {
    "matching_answer_question": "Matching Question",
    "short_answer_question": "Short Question",
    "multiple_answer_question": "Multiple Choice"
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
      if (response.data.result.role !== "teacher") {
        navigate("/quizzes");
      }
    } catch (error) {
      console.error(error);
    } finally {}
  }
  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl + `quiz-statistics`, {
        params: {
          "template_id": quizTemplateId
        }
      });
      setData(response.data.result);
      setEvals(response.data.evals);
      setAttendance(response.data.attendance);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    getUserLogged().then(() => {
      fetchData();
    });
  }, []);
  function getProgressWidth(attendance, question, ans) {
    const item = attendance?.[question["item_id"]];
    const total = item?.attendance;
    const wrong = item?.wrong_answers?.[ans[0]]?.[1];
    if (!total || typeof total !== "number") return "0%";
    const correct = wrong != null ? total - wrong : total;
    const percentage = Math.round(correct / total * 100);
    return percentage;
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
  }, question.questionAnswerType)), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question?.text
  }), question.type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
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
    style: {
      pointerEvents: 'none'
    },
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
      width: `${getProgressWidth(attendance, question, ans)}%`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar bg-success"
  }, getProgressWidth(attendance, question, ans), "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress",
    role: "progressbar",
    "aria-label": "Segment two",
    "aria-valuenow": "30",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    style: {
      width: `${100 - getProgressWidth(attendance, question, ans)}%`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar bg-danger"
  }, 100 - getProgressWidth(attendance, question, ans), "%"))))))), question.type === "matching_answer_question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("table", {
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
  }, "Success")))), /*#__PURE__*/React.createElement("tbody", null, evals[question["item_id"]]?.correct_answer.map((ans, ind) => /*#__PURE__*/React.createElement("tr", {
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
  })))), Object.keys(attendance[question["item_id"]]?.wrong_answers || {}).length > 0 ? /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, attendance[question["item_id"]]?.attendance - attendance[question["item_id"]]?.wrong_answers[ans[2]][2] + "/" + attendance[question["item_id"]]?.attendance) : /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, attendance[question["item_id"]]?.attendance)))))), /*#__PURE__*/React.createElement("span", null, "Average points: ", attendance[question["item_id"]]?.average, "/ ", attendance[question["item_id"]]?.item_max_points), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, attendance[question["item_id"]]?.num_correct_answers, " / ", data.attendance, " students has this question correct."), question.type === "short_answer_question" && attendance[question["item_id"]]?.wrong_answers_show.length > 0 && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "List of wrong answers"), /*#__PURE__*/React.createElement(WrongAnswersTable, {
    wrongAnswers: attendance[question["item_id"]]?.wrong_answers_show || [],
    tableCols: ["Answer", "Occurencies"],
    colsSize: ["w-75", "w-50 text-center"],
    colsType: ["string", "int"],
    title: "AA"
  })), question.type === "matching_answer_question" && attendance[question["item_id"]]?.wrong_answers_show.length > 0 && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "List of wrong answers"), /*#__PURE__*/React.createElement(WrongAnswersTable, {
    wrongAnswers: attendance[question["item_id"]]?.wrong_answers_show,
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
  }, comment[1]))))))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary mb-3 mb-sm-0",
    onClick: () => {
      navigate(-1);
    }
  }, "Back to Quiz Analysis table")), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default QuizAnalysis;