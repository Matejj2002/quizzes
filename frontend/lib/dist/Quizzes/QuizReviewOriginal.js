import React, { useEffect, useState } from "react";
import FormattedTextRenderer from "../components/FormattedTextRenderer";
const QuizReviewOriginal = ({
  quizData
}) => {
  const [quiz] = useState(quizData);
  const [page, setPage] = useState(0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs mt-3",
    id: "myTab",
    role: "tablist"
  }, quiz.map((sect, index) => /*#__PURE__*/React.createElement("li", {
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
  }, sect?.title || "Section " + (index + 1))))), console.log(quiz[page]["questions"]), /*#__PURE__*/React.createElement("ul", {
    className: "list-group mb-3"
  }, Object.entries(quiz[page]["questions"]).map(([id, question]) => /*#__PURE__*/React.createElement("li", {
    className: "list-group-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between align-items-center"
  }, /*#__PURE__*/React.createElement("h2", null, question?.question_title), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "badge bg-primary fs-5 ms-2 mb-0"
  }, question?.points, " ", Number(question?.points) === 1 ? ' pt.' : ' pts.'))), /*#__PURE__*/React.createElement("div", {
    className: "mb-1"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question?.question_text
  })), quiz[page]["questions"][id]?.question_type === "matching_answer_question" && /*#__PURE__*/React.createElement("div", {
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
  }, "Right Side")))), /*#__PURE__*/React.createElement("tbody", null, question.sides.map((side, idx) => /*#__PURE__*/React.createElement("tr", {
    key: "table-" + idx.toString()
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      borderRight: "1px solid black",
      paddingBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start w-100"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: side[0]
  }))), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-start w-100"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: side[1]
  }), (side[2] !== "" || side[3] !== "") && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Option Feedback"), side[2] !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Negative Option Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: side[2]
  })), side[3] !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Positive Option Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: side[3]
  })))))))))), quiz[page]["questions"][id]?.question_type === "multiple_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, question.choices.map((choice, idx) => /*#__PURE__*/React.createElement("div", {
    className: "form-check",
    key: idx
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    style: {
      pointerEvents: 'none'
    },
    defaultChecked: choice[1] === true
  }), /*#__PURE__*/React.createElement("span", {
    className: "d-flex w-100 form-check-label"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: choice[0]
  })), (choice[2] !== "" || choice[3] !== "") && /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Option Feedback"), choice[2] !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Negative Option Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: choice[2]
  })), choice[3] !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Positive Option Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: choice[3]
  })))))), quiz[page]["questions"][id]?.question_type === "short_answer_question" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3 mt-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "me-2 mt-3 fw-bold"
  }, "Answer: "), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: question?.answer_text,
    disabled: true,
    required: true,
    className: "form-control"
  })), quiz[page]["questions"][id]?.type === "random" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1"
  }, /*#__PURE__*/React.createElement("h2", null, "Random question"), /*#__PURE__*/React.createElement("p", {
    className: "h4"
  }, question?.question_type), /*#__PURE__*/React.createElement("p", {
    className: "h4"
  }, "From category ", question?.question_category, " "), question.include_sub_categories ? /*#__PURE__*/React.createElement("p", {
    className: "h4"
  }, "Include subcategories") : /*#__PURE__*/React.createElement("p", {
    className: "h4"
  }, "Don't include subcategories")), /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Question Feedback"), question?.question_negative_feedback !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded mb-1",
    style: {
      background: "rgba(255, 0, 0, 0.3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Negative Question Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question?.question_negative_feedback
  })), question?.question_positive_feedback !== "" && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded",
    style: {
      background: "rgba(155,236,137,0.15)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fw-bold"
  }, "Positive Question Feedback"), /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question?.question_negative_feedback
  })))))));
};
export default QuizReviewOriginal;