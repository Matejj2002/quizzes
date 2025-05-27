import React, { useState, useEffect } from "react";
import FormattedTextRenderer from "../../components/FormattedTextRenderer";
const MultipleChoiceQuestion = ({
  setAnswers,
  answers,
  isDisabled
}) => {
  const [questions, setQuestions] = useState([""]);
  const [isChecked, setIsChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([false]);
  const [feedback, setFeedback] = useState([{
    "positive": "",
    "negative": ""
  }]);
  useEffect(() => {
    if (answers["texts"] && answers["texts"].length > 0) {
      setQuestions([...answers["texts"], ""]);
      setCorrectAnswers([...answers["correct_ans"], false]);
      setFeedback([...answers["feedback"], {
        "positive": "",
        "negative": ""
      }]);
    }
  }, [answers]);
  const handleInputChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
    if (value !== "" && index === questions.length - 1) {
      setQuestions([...updatedQuestions, ""]);
      setCorrectAnswers([...correctAnswers, false]);
      setFeedback([...feedback, {
        "positive": "",
        "negative": ""
      }]);
    }
  };
  const handleFeedbackChange = (index, value, typeFeedback) => {
    const updatedFeedback = [...feedback];
    updatedFeedback[index][typeFeedback] = value;
    setFeedback(updatedFeedback);
  };
  const handleCheckboxChange = (index, checked) => {
    const updatedAnswers = [...correctAnswers];
    updatedAnswers[index] = checked;
    setCorrectAnswers(updatedAnswers);
  };
  useEffect(() => {
    setAnswers({
      "text": questions.filter(q => q.trim() !== ""),
      "is_single": isChecked,
      "correct_answers": correctAnswers,
      "feedback": feedback
    });
  }, [questions, correctAnswers, feedback]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "form-check form-check-inline mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "inlineCheckbox1",
    value: "option1",
    disabled: isDisabled,
    onChange: e => setIsChecked(e.target.checked)
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "inlineCheckbox1"
  }, "Is single answer")), questions.map((question, index) => /*#__PURE__*/React.createElement("div", {
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group-text"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input mt-0",
    type: "checkbox",
    checked: correctAnswers[index],
    key: index,
    disabled: isDisabled,
    onChange: e => handleCheckboxChange(index, e.target.checked)
  })), /*#__PURE__*/React.createElement("input", {
    className: "form-control me-3",
    key: index,
    type: "text",
    disabled: isDisabled,
    value: question,
    onChange: e => handleInputChange(index, e.target.value),
    placeholder: `Option`
  })), /*#__PURE__*/React.createElement("details", {
    className: "mb-2 mt-1",
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("summary", null, "Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "p-4 w-auto"
  }, /*#__PURE__*/React.createElement("form", null, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: `multiple-option-pos-${index}`
  }, "Positive Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: `multiple-option-pos-${index}`,
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: feedback[index]["positive"],
    onChange: e => handleFeedbackChange(index, e.target.value, "positive"),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: feedback[index]["positive"]
  }))), /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: `multiple-option-neg-${index}`
  }, "Negative Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: `multiple-option-neg-${index}`,
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: feedback[index]["negative"],
    onChange: e => handleFeedbackChange(index, e.target.value, "negative"),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: feedback[index]["negative"]
  })))))))));
};
export default MultipleChoiceQuestion;