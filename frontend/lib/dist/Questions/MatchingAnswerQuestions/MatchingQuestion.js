import React, { useState, useEffect } from "react";
import FormattedTextRenderer from "../../components/FormattedTextRenderer";
const MatchingQuestion = ({
  setAnswers,
  answers,
  distractors,
  isDisabled,
  setDistractors,
  selectedVersion,
  versions
}) => {
  const [questions, setQuestions] = useState([{
    left: "",
    right: "",
    positive: "",
    negative: ""
  }]);
  const [distractorsPom, setDistractorsPom] = useState([{
    distractorV: ""
  }]);
  useEffect(() => {
    if (versions && versions.length > 0) {
      try {
        const updatedQuestions = versions[selectedVersion]["answers"].map(answerPair => ({
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
      } catch {}
    }
  }, [selectedVersion, versions]);
  useEffect(() => {
    if (distractors && distractors.length > 0) {
      const updatedDist = distractors.map(distr => ({
        distractorV: distr["distractorV"]
      }));
      setDistractorsPom([...updatedDist, {
        distractorV: ""
      }]);
    }
  }, [distractors]);
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
  const handleChangeDistractros = (index, value) => {
    const updatedDistractors = [...distractorsPom];
    updatedDistractors[index].distractorV = value;
    setDistractorsPom(updatedDistractors);
    if (value !== "" && index === distractorsPom.length - 1) {
      if (distractorsPom[index] !== "") {
        setDistractorsPom([...updatedDistractors, {
          distractorV: ""
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
  useEffect(() => {
    const filteredDist = distractorsPom.filter(q => q.distractorV.trim() !== "");
    setDistractors(prevDist => {
      if (JSON.stringify(prevDist) !== JSON.stringify(filteredDist)) {
        return filteredDist;
      }
      return prevDist;
    });
  }, [distractorsPom]);
  return /*#__PURE__*/React.createElement("div", null, questions.map((question, index) => /*#__PURE__*/React.createElement("div", {
    key: 'qv-' + index
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group mt-3",
    key: index
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    value: question.left,
    placeholder: "Left Side",
    disabled: isDisabled,
    onChange: e => handleInputChange(index, 'left', e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control me-3",
    value: question.right,
    placeholder: "Right Side",
    disabled: isDisabled,
    onChange: e => handleInputChange(index, 'right', e.target.value)
  })), /*#__PURE__*/React.createElement("details", {
    className: "mt-1 mb-3",
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("summary", null, "Feedback"), /*#__PURE__*/React.createElement("form", {
    className: "w-auto"
  }, /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: `matching-option-pos-${index}`
  }, "Positive Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: `matching-option-pos-${index}`,
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: question["positive"],
    onChange: e => handleFeedbackChange(index, e.target.value, "positive"),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question["positive"]
  }))), /*#__PURE__*/React.createElement("label", {
    className: "form-label",
    htmlFor: `matching-option-neg-${index}`
  }, "Negative Feedback"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    id: `matching-option-neg-${index}`,
    className: "form-control w-50 me-2",
    disabled: isDisabled,
    value: question["negative"],
    onChange: e => handleFeedbackChange(index, e.target.value, "negative"),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: question["negative"]
  }))))))), /*#__PURE__*/React.createElement("h3", null, "Right sides distractors"), distractorsPom.map((distractor, index) => /*#__PURE__*/React.createElement("div", {
    key: index
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control mb-1",
    value: distractor.distractorV,
    placeholder: "Add Distractor",
    disabled: isDisabled,
    onChange: e => handleChangeDistractros(index, e.target.value)
  }))));
};
export default MatchingQuestion;