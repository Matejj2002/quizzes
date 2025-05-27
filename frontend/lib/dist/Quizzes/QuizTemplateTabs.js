import React from "react";
const QuizTemplateTabs = ({
  setPageNum,
  pageCount,
  pageNum,
  sections,
  setPageCount,
  addPage,
  newUpdateQuiz,
  saveChanges,
  quizTitle,
  numberOfCorrections,
  minutesToFinish,
  checkSections
}) => {
  return /*#__PURE__*/React.createElement("ul", {
    className: "nav nav-tabs",
    id: "myTab",
    role: "tablist"
  }, /*#__PURE__*/React.createElement("li", {
    className: "nav-item",
    role: "presentation"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-link active",
    id: "home-tab",
    "data-bs-toggle": "tab",
    "data-bs-target": "#home-tab-pane",
    type: "button",
    role: "tab",
    "aria-controls": "home-tab-pane",
    "aria-selected": "true",
    onClick: () => setPageNum(1)
  }, "Quiz Settings")), Array.from({
    length: pageCount - 2
  }, (_, index) => /*#__PURE__*/React.createElement("li", {
    className: "nav-item",
    role: "presentation",
    key: index + 2
  }, /*#__PURE__*/React.createElement("button", {
    className: `nav-link ${index + 2 === pageNum ? "active" : ""}`,
    id: `tab-${index + 2}`,
    "data-bs-toggle": "tab",
    "data-bs-target": `#tab-pane-${index + 2}`,
    type: "button",
    role: "tab",
    "aria-controls": `tab-pane-${index + 2}`,
    "aria-selected": index + 2 === pageNum,
    onClick: () => {
      setPageNum(index + 2);
    }
  }, sections[index]?.title || "Section " + (index + 1)))), /*#__PURE__*/React.createElement("li", {
    className: "nav-item",
    role: "presentation"
  }, /*#__PURE__*/React.createElement("button", {
    className: "nav-link",
    id: "disabled-tab",
    "data-bs-toggle": "tab",
    type: "button",
    role: "tab",
    "aria-controls": "disabled-tab-pane",
    onClick: event => {
      event.preventDefault();
      setPageCount(pageCount + 1);
      addPage(pageCount);
      event.target["classList"].remove("active");
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "bi bi-plus-circle-fill",
    style: {
      color: "green"
    }
  }))), /*#__PURE__*/React.createElement("li", {
    className: "nav-item ms-auto",
    role: "presentation"
  }, /*#__PURE__*/React.createElement("button", {
    className: `btn ${newUpdateQuiz === "Create new quiz" ? "btn-success" : "btn-primary"}`,
    id: "disabled-tab",
    "data-bs-toggle": "tab",
    type: "button",
    role: "tab",
    "aria-controls": "disabled-tab-pane",
    onClick: event => {
      event.preventDefault();
      saveChanges();
    },
    disabled: !quizTitle.trim() || numberOfCorrections <= 0 || isNaN(numberOfCorrections) || minutesToFinish <= 0 || isNaN(minutesToFinish) || checkSections()
  }, newUpdateQuiz)));
};
export default QuizTemplateTabs;