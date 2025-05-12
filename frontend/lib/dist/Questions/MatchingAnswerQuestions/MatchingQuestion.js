import React, { useState, useEffect } from "react";
const MatchingQuestion = ({
  setAnswers,
  answers
}) => {
  const [questions, setQuestions] = useState([{
    left: "",
    right: "",
    positive: "",
    negative: ""
  }]);
  useEffect(() => {
    if (answers && answers.length > 0) {
      const updatedQuestions = answers.map(answerPair => ({
        left: answerPair["left"],
        right: answerPair["right"],
        positive: answerPair["positive"],
        negative: answerPair["negative"]
      }));
      setQuestions([...updatedQuestions, {
        left: "",
        right: "",
        positive: "",
        negative: ""
      }]);
    }
  }, [answers]);
  const handleInputChange = (index, side, value) => {
    const updatedQuestions = [...questions];
    if (side === "left") {
      updatedQuestions[index].left = value;
      setQuestions(updatedQuestions);
    } else {
      updatedQuestions[index].right = value;
      setQuestions(updatedQuestions);
    }
    if (value !== "" && index === questions.length - 1) {
      if (questions[index].left !== "" && questions[index].right !== "") {
        setQuestions([...updatedQuestions, {
          left: "",
          right: ""
        }]);
      }
    }
  };
  const handleFeedbackChange = (index, value, typeFeed) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][typeFeed] = value;
    setQuestions(updatedQuestions);
  };
  useEffect(() => {
    const filteredAnswers = questions.filter(q => q.left.trim() !== "" && q.right.trim() !== "");
    setAnswers(prevAnswers => {
      if (JSON.stringify(prevAnswers) !== JSON.stringify(filteredAnswers)) {
        return filteredAnswers;
      }
      return prevAnswers;
    });
  }, [questions, setAnswers]);
  return /*#__PURE__*/React.createElement("div", null, questions.map((question, index) => /*#__PURE__*/React.createElement("div", {
    key: index
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group mt-3",
    key: index
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    value: question.left,
    placeholder: "Left Side",
    onChange: e => handleInputChange(index, 'left', e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control me-3",
    value: question.right,
    placeholder: "Right Side",
    onChange: e => handleInputChange(index, 'right', e.target.value)
  })), /*#__PURE__*/React.createElement("details", {
    className: "mt-1",
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("summary", null, "Feedback"), /*#__PURE__*/React.createElement("form", {
    className: "w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Positive\xA0\xA0"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    value: question["positive"],
    placeholder: "Feedback",
    onChange: e => handleFeedbackChange(index, e.target.value, "positive")
  })), /*#__PURE__*/React.createElement("div", {
    className: "d-flex align-items-center"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label"
  }, "Negative"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    value: question["negative"],
    placeholder: "Feedback",
    onChange: e => handleFeedbackChange(index, e.target.value, "negative")
  })))))));
};
export default MatchingQuestion;