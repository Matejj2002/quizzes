import React, { useState, useEffect } from "react";
import FormattedTextRenderer from "../../components/FormattedTextRenderer";
const ShortAnswerQuestion = ({
  setAnswers,
  answers,
  isDisabled
}) => {
  const [newAnswer, setNewAnswer] = useState({
    text: "",
    is_regex: false,
    positive_feedback: "",
    negative_feedback: ""
  });
  const [isValid, setIsValid] = useState(true);
  useEffect(() => {
    if (newAnswer.is_regex) {
      try {
        new RegExp(newAnswer.text);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      }
    }
    setAnswers(newAnswer);
  }, [newAnswer]);
  useEffect(() => {
    if (answers && answers.length > 0) {
      try {
        const [text, is_regex, positive_feedback, negative_feedback] = answers[0];
        setNewAnswer({
          text,
          is_regex,
          positive_feedback,
          negative_feedback
        });
      } catch {}
    }
  }, [answers]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "input-group-text",
    id: "inputGroup-sizing-default"
  }, "Answer"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: `form-control ${newAnswer.is_regex ? isValid ? 'is-valid' : 'is-invalid' : ''}`,
    value: answers["text"],
    "aria-label": "Sizing example input",
    "aria-describedby": "inputGroup-sizing-default",
    disabled: isDisabled,
    onChange: e => setNewAnswer({
      ...newAnswer,
      text: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Not a valid regex"), /*#__PURE__*/React.createElement("details", {
    className: "mt-3 mb-3",
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("summary", null, "Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "p-4 w-auto mb-3"
  }, /*#__PURE__*/React.createElement("form", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "short-option-pos"
  }, "Positive Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: "short-option-pos",
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: answers["positive_feedback"],
    onChange: e => setNewAnswer({
      ...newAnswer,
      positive_feedback: e.target.value
    }),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: answers["positive_feedback"]
  }))), /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: "short-option-neg"
  }, "Negative Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: "short-option-neg",
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: answers["negative_feedback"],
    onChange: e => setNewAnswer({
      ...newAnswer,
      negative_feedback: e.target.value
    }),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: answers["negative_feedback"]
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "form-check form-check-inline mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    checked: answers["is_regex"],
    type: "checkbox",
    id: "inlineCheckbox1",
    disabled: isDisabled,
    value: "option1",
    onChange: e => setNewAnswer({
      ...newAnswer,
      is_regex: e.target.checked
    })
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "inlineCheckbox1"
  }, "Is regex")));
};
export default ShortAnswerQuestion;