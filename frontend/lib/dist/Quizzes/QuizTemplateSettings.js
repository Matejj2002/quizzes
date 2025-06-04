import React from "react";
const QuizTemplateSettings = ({
  quizTitle,
  setQuizTitle,
  shuffleSections,
  setShuffleSections,
  numberOfCorrections,
  setNumberOfCorrections,
  selectedOption,
  setSelectedOption,
  minutesToFinish,
  setMinutesToFinish,
  dateOpen,
  handleDateOpenChange,
  dateClose,
  handleDateCloseChange,
  dateCheck,
  handleDateCheck,
  selectedFeedback,
  handleSelectedFeedbackChange,
  selectedFeedbackAfterClose,
  handleSelectedFeedbackAfterCloseChange
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-content",
    id: "myTabContent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-pane fade show active",
    id: "home-tab-pane",
    role: "tabpanel",
    "aria-labelledby": "home-tab",
    tabIndex: "0"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
    className: "was-validated"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "QuizTitle",
    className: "form-label"
  }, "Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    id: "QuizTitle",
    placeholder: "New Quiz",
    value: quizTitle,
    onChange: e => setQuizTitle(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Please enter a title for the quiz."))), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "shuffleSections",
    checked: shuffleSections,
    onChange: e => setShuffleSections(e.target.checked)
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "shuffleSections"
  }, "Shuffle sections")), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "correctionsNum",
    className: "form-label"
  }, "Number of attempts"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-control w-25",
    id: "correctionsNum",
    placeholder: "Enter Number",
    min: "1",
    max: "10",
    value: numberOfCorrections,
    onChange: e => setNumberOfCorrections(parseInt(e.target.value))
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "radio",
    name: "attemptsIndependentLabel",
    id: "attemptsIndependent",
    value: "indepedentAttempts",
    checked: selectedOption === "indepedentAttempts",
    onChange: e => setSelectedOption(e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "attemptsIndependent"
  }, "Attempts are independent")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "radio",
    name: "attemptsCorrectLabel",
    id: "attemptsCorrect",
    value: "correctionAttempts",
    checked: selectedOption === "correctionAttempts",
    onChange: e => setSelectedOption(e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "attemptsCorrect"
  }, "Attempts are corrections of previous attempt")), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "timeFinish",
    className: "form-label"
  }, "Time limit (Minutes)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-control w-25",
    id: "timeFinish",
    placeholder: "Enter Minutes",
    min: "1",
    max: "500",
    value: minutesToFinish,
    onChange: e => setMinutesToFinish(parseInt(e.target.value))
  })), /*#__PURE__*/React.createElement("form", null, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "dateOpen",
    className: "form-label"
  }, "Open the quiz"), /*#__PURE__*/React.createElement("div", {
    className: "input-group has-validation w-25"
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    className: `form-control form-control-sm w-25 ${dateOpen < dateClose ? "is-valid" : "is-invalid"}`,
    id: "dateOpen",
    value: dateOpen,
    onChange: handleDateOpenChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Open date must be before Close date."))), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "dateClose",
    className: "form-label"
  }, "Close the quiz"), /*#__PURE__*/React.createElement("div", {
    className: "input-group has-validation w-25"
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    className: `form-control form-control-sm w-25 ${dateOpen < dateClose ? "is-valid" : "is-invalid"}`,
    id: "dateClose",
    value: dateClose,
    onChange: handleDateCloseChange
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Close date must be after open date."))), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "dateCheck",
    className: "form-label"
  }, "The quiz can be reviewed from"), /*#__PURE__*/React.createElement("div", {
    className: "input-group has-validation w-25"
  }, /*#__PURE__*/React.createElement("input", {
    type: "datetime-local",
    className: `form-control form-control-sm ${dateCheck > dateOpen ? "is-valid" : "is-invalid"}`,
    id: "dateCheck",
    value: dateCheck,
    onChange: handleDateCheck
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Check date must be after open date.")))), /*#__PURE__*/React.createElement("h2", null, "Show in review"), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "points",
    value: "pointsReview",
    checked: selectedFeedback.includes("pointsReview"),
    onChange: handleSelectedFeedbackChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "points"
  }, "Marks")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "questionFeedback",
    value: "questionFeedback",
    checked: selectedFeedback.includes("questionFeedback"),
    onChange: handleSelectedFeedbackChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "questionFeedback"
  }, "Questions feedback")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "optionFeedback",
    value: "optionsFeedback",
    checked: selectedFeedback.includes("optionsFeedback"),
    onChange: handleSelectedFeedbackChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "optionFeedback"
  }, "Options feedback")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "correctAnswer",
    value: "correctAnswers",
    checked: selectedFeedback.includes("correctAnswers"),
    onChange: handleSelectedFeedbackChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "correctAnswer"
  }, "Correct answers")), /*#__PURE__*/React.createElement("h2", null, "Show when closed"), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "points",
    value: "pointsReview",
    checked: selectedFeedbackAfterClose.includes("pointsReview"),
    onChange: handleSelectedFeedbackAfterCloseChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "points"
  }, "Marks")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "questionFeedback",
    value: "questionFeedback",
    checked: selectedFeedbackAfterClose.includes("questionFeedback"),
    onChange: handleSelectedFeedbackAfterCloseChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "questionFeedback"
  }, "Questions feedback")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "optionFeedback",
    value: "optionsFeedback",
    checked: selectedFeedbackAfterClose.includes("optionsFeedback"),
    onChange: handleSelectedFeedbackAfterCloseChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "optionFeedback"
  }, "Options feedback")), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "correctAnswer",
    value: "correctAnswers",
    checked: selectedFeedbackAfterClose.includes("correctAnswers"),
    onChange: handleSelectedFeedbackAfterCloseChange
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "correctAnswer"
  }, "Correct answers")))));
};
export default QuizTemplateSettings;