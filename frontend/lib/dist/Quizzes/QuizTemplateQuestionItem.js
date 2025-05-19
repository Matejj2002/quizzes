import React from "react";
const QuizTemplateQuestionItem = ({
  type,
  indexQuestion,
  handleOrderChangeItem,
  sections,
  pageNum,
  item,
  handleEvaluateChange,
  handleRemoveItem
}) => {
  const questionTypesHuman = {
    "matching_answer_question": "Matching Question",
    "short_answer_question": "Short Question",
    "multiple_answer_question": "Multiple Choice"
  };
  if (type === "header") {
    return /*#__PURE__*/React.createElement("li", {
      className: "list-group-item fw-bold"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row text-center w-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-3 col-md-1"
    }, "Order"), /*#__PURE__*/React.createElement("div", {
      className: "col-5 col-md-5"
    }, "Question"), /*#__PURE__*/React.createElement("div", {
      className: "col-3 col-md-5"
    }, "Weight"), /*#__PURE__*/React.createElement("div", {
      className: "col-1 col-md-1 text-end"
    }, "Remove")));
  }
  if (type === "question") {
    return /*#__PURE__*/React.createElement("li", {
      key: indexQuestion,
      className: "list-group-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row align-items-center w-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-auto d-flex flex-column align-items-center"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-secondary btn-sm p-0",
      onClick: () => handleOrderChangeItem(indexQuestion, "up"),
      disabled: indexQuestion === 0,
      style: {
        width: "30px",
        height: "25px"
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-up"
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-secondary btn-sm p-0 mt-1",
      onClick: () => handleOrderChangeItem(indexQuestion, "down"),
      disabled: indexQuestion === sections[pageNum - 2].questions.length - 1,
      style: {
        width: "30px",
        height: "25px"
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-down"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "col w-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row align-items-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-6 d-flex align-items-center"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "h5 text-start text-truncate mb-0"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "text-decoration-none me-1"
    }, item.title || "No title available")), /*#__PURE__*/React.createElement("span", {
      className: "badge text-bg-primary rounded-pill flex-shrink-0"
    }, questionTypesHuman[item.type] || item.type)), /*#__PURE__*/React.createElement("div", {
      className: "col-md-1 offset-md-2"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-control form-control-sm",
      min: "1",
      value: item.evaluation,
      onChange: e => handleEvaluateChange(indexQuestion, e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "col-md-3 text-end"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-danger btn-sm",
      onClick: () => handleRemoveItem(indexQuestion)
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-trash"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        maxWidth: "390px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "col"
    }, /*#__PURE__*/React.createElement("p", {
      className: "m-0 text-truncate"
    }, item.text))), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-secondary text-truncate"
    }, "Last updated ", item.dateCreated, " by ", item.author))))));
  } else {
    return /*#__PURE__*/React.createElement("li", {
      key: indexQuestion,
      className: "list-group-item"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row w-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-auto d-flex flex-column align-items-center"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-secondary btn-sm p-0",
      onClick: () => handleOrderChangeItem(indexQuestion, "up"),
      disabled: indexQuestion === 0,
      style: {
        width: "30px",
        height: "25px"
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-up"
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-secondary btn-sm p-0 mt-1",
      onClick: () => handleOrderChangeItem(indexQuestion, "down"),
      disabled: indexQuestion === sections[pageNum - 2].questions.length - 1,
      style: {
        width: "30px",
        height: "25px"
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-arrow-down"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "col w-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "row align-items-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-md-6 d-flex align-items-center"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "h5 text-start text-truncate mb-0"
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      className: "text-decoration-none me-1"
    }, "Random Question")), /*#__PURE__*/React.createElement("span", {
      className: "badge text-bg-primary rounded-pill flex-shrink-0"
    }, item.questionAnswerType)), /*#__PURE__*/React.createElement("div", {
      className: "col-md-1 offset-md-2"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "form-control form-control-sm",
      min: "1",
      value: item.evaluation,
      onChange: e => handleEvaluateChange(indexQuestion, e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      className: "col-md-3 text-end"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-outline-danger btn-sm",
      onClick: () => handleRemoveItem(indexQuestion)
    }, /*#__PURE__*/React.createElement("i", {
      className: "bi bi-trash"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-secondary text-truncate"
    }, "Question from ", item.categoryName, " ", item.includeSubCategories ? '' : 'not', " including subcategories"))))));
  }
};
export default QuizTemplateQuestionItem;