import React, { useEffect, useState } from "react";
import axios from "axios";
const QuestionModal = ({
  pageNum,
  categorySelect,
  handleAddItem
}) => {
  const [addedQuestions, setAddedQuestions] = useState({
    categoryId: 1,
    categoryName: "supercategory",
    type: "random",
    questionType: "Any Type",
    includeSubCategories: true,
    questions: []
  });
  const [questions, setQuestions] = useState([]);
  const [typeQuestionSelected, setTypeQuestionSelected] = useState(1);
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    if (addedQuestions.type === "random") {
      setAddedQuestions(prevState => ({
        ...prevState,
        questions: {
          count: 1,
          evaluation: 1
        }
      }));
    } else {
      setAddedQuestions(prevState => ({
        ...prevState,
        questions: []
      }));
    }
  }, [addedQuestions.type]);
  useEffect(() => {
    if (pageNum - 2 >= 0) {
      const fetchQuestions = async () => {
        try {
          const response = await axios.get(apiUrl + `get_questions_category/${addedQuestions.categoryId}`, {
            params: {
              includeSubCat: addedQuestions.includeSubCategories,
              typeQuestionSelected: typeQuestionSelected
            }
          });
          setQuestions(response.data.questions);
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };
      fetchQuestions();
    }
  }, [pageNum, addedQuestions.categoryId, addedQuestions.includeSubCategories, typeQuestionSelected]);
  const handleCheckBoxQuestions = question => {
    setAddedQuestions(prevState => {
      const questionsArray = Array.isArray(prevState.questions) ? prevState.questions : [];
      const isAlreadySelected = questionsArray.some(q => q.id === question.id);
      return {
        ...prevState,
        questions: isAlreadySelected ? questionsArray.filter(q => q.id !== question.id) : [...questionsArray, {
          id: question.id,
          title: question.title,
          type: question.type,
          evaluation: 1,
          dateCreated: question.dateCreated,
          author: question.authorName
        }]
      };
    });
  };
  const questionTypes = ["", "Any Type", "Matching Question", "Short Question", "Multiple Choice"];
  const questionTypesHuman = {
    "matching_answer_question": "Matching Question",
    "short_answer_question": "Short Question",
    "multiple_answer_question": "Multiple Choice"
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal fade",
    id: "staticBackdrop",
    "data-bs-backdrop": "static",
    "data-bs-keyboard": "false",
    tabIndex: "-1",
    "aria-labelledby": "staticBackdropLabel",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog modal-dialog-scrollable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    "data-bs-dismiss": "modal",
    disabled: addedQuestions.questions?.length === 0 && addedQuestions.type === "questions",
    onClick: () => {
      setTimeout(() => {
        handleAddItem(addedQuestions);
        setAddedQuestions({
          categoryId: 1,
          categoryName: "supercategory",
          type: "random",
          includeSubCategories: true,
          questionType: "Any Type",
          questions: {
            count: 1
          }
        });
      }, 0);
    }
  }, "Add"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close",
    "data-bs-dismiss": "modal",
    "aria-label": "Close"
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "select-category"
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    id: "select-category",
    className: "form-select mb-3",
    value: addedQuestions.categoryId || "",
    onChange: e => {
      const selectedOption = categorySelect.find(cat => cat.id === parseInt(e.target.value));
      setAddedQuestions(prevState => ({
        ...prevState,
        categoryId: selectedOption.id,
        categoryName: selectedOption.title
      }));
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Select a category"), Array.isArray(categorySelect) && categorySelect.map(cat => /*#__PURE__*/React.createElement("option", {
    key: cat.id,
    value: cat.id || ""
  }, cat.title))), /*#__PURE__*/React.createElement("label", {
    htmlFor: "select-type"
  }, "Type of question"), /*#__PURE__*/React.createElement("select", {
    id: "select-type",
    className: "form-select mb-3",
    value: typeQuestionSelected,
    onChange: e => {
      const selectedIndex = e.target.selectedIndex;
      const selectedType = questionTypes[selectedIndex];
      setAddedQuestions(prevState => ({
        ...prevState,
        questionType: selectedType
      }));
      setTypeQuestionSelected(e.target.value);
    }
  }, questionTypes.map((type, index) => {
    if (index === 0) {
      return /*#__PURE__*/React.createElement("option", {
        value: "",
        disabled: true
      }, "Select type of question");
    } else {
      return /*#__PURE__*/React.createElement("option", {
        key: "questionType" + index,
        value: index || ""
      }, type);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-check"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    id: "includeSubcategories",
    checked: addedQuestions.includeSubCategories || addedQuestions.categoryId === 1,
    disabled: addedQuestions.categoryId === 1,
    onChange: e => {
      setAddedQuestions(prevState => ({
        ...prevState,
        includeSubCategories: e.target.checked
      }));
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "includeSubcategories"
  }, "Include subcategories")), /*#__PURE__*/React.createElement("div", {
    className: "form-check"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "radio",
    name: "randomOrSelectQuestions",
    id: "exampleRadios1",
    value: "option1",
    checked: addedQuestions.type === "random",
    onChange: () => {
      setAddedQuestions(prevState => ({
        ...prevState,
        type: "random"
      }));
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "exampleRadios1"
  }, "Random Questions")), /*#__PURE__*/React.createElement("div", {
    className: "form-check"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "radio",
    name: "randomOrSelectQuestions",
    id: "exampleRadios2",
    value: "option2",
    checked: addedQuestions.type === "questions",
    onChange: () => {
      setAddedQuestions(prevState => ({
        ...prevState,
        type: "questions"
      }));
    }
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "exampleRadios2"
  }, "Select Questions")), addedQuestions.type === "random" && /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "randomQuestionsCount",
    className: "form-label"
  }, "Random questions count"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "form-control w-25",
    id: "randomQuestionsCount",
    placeholder: "Enter count",
    min: "1",
    max: "500",
    value: addedQuestions.questions?.count || "1",
    onChange: e => {
      setAddedQuestions(prevState => ({
        ...prevState,
        questions: {
          ...(prevState.questions || {}),
          count: e.target.value
        }
      }));
    }
  })), addedQuestions.type === "questions" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("details", null, /*#__PURE__*/React.createElement("summary", null, "Questions"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Questions"), Array.isArray(questions) && questions.length > 0 ? /*#__PURE__*/React.createElement("div", null, questions.map(question => /*#__PURE__*/React.createElement("div", {
    key: question.id,
    className: "input-group mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "input-group-text"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    className: "form-check-input mt-0",
    id: `question-${question.id}`,
    value: question.id || "",
    onChange: () => {
      handleCheckBoxQuestions(question);
    },
    checked: Array.isArray(addedQuestions.questions) && addedQuestions.questions.some(q => q.id === question.id),
    "aria-label": "Checkbox for following text input"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-control bg-light d-flex align-items-center justify-content-between"
  }, /*#__PURE__*/React.createElement("a", {
    className: "text-truncate",
    href: "#"
  }, question.title), /*#__PURE__*/React.createElement("span", {
    className: "input-group-text badge text-bg-primary rounded-pill flex-shrink-0"
  }, questionTypesHuman[question.type]))))) : /*#__PURE__*/React.createElement("p", null, "No questions available"))))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    "data-bs-dismiss": "modal"
  }, "Close"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    "data-bs-dismiss": "modal",
    disabled: addedQuestions.questions?.length === 0 && addedQuestions.type === "questions",
    onClick: () => {
      setTimeout(() => {
        handleAddItem(addedQuestions);
        setAddedQuestions({
          categoryId: 1,
          categoryName: "supercategory",
          type: "random",
          questionType: "Any Type",
          includeSubCategories: true,
          questions: {
            count: 1
          }
        });
      }, 0);
    }
  }, "Add")))));
};
export default QuestionModal;