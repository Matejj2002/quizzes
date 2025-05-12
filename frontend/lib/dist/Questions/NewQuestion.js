import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useLocation } from 'react-router-dom';
import MatchingQuestion from "./MatchingAnswerQuestions/MatchingQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion/ShortAnswerQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestions/MultipleChoiceQuestion";
import Categories from "../Categories/CategoriesTree/Categories";
import Navigation from "../components/Navigation";
import FormattedTextRenderer from "../components/FormattedTextRenderer";
import FormattedTextInput from "../components/FormattedTextInput";
const NewQuestion = ({
  subButText = "Submit"
}) => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // const subButText = location.state.subButText;

  const apiUrl = process.env.REACT_APP_API_URL;
  let titleText = "";
  if (subButText === "Submit") {
    titleText = "New Question";
  }
  if (subButText === "Copy") {
    titleText = "Copy of " + location.state["questionTitle"];
  }
  if (subButText === "Update") {
    titleText = "Update Question";
  }
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const catPath = location.state['catPath'];
  const page = location.state['page'];
  const limit = location.state['limit'];
  const offset = location.state['offset'];
  const sort = location.state['sort'];
  const selectedCategory1 = location.state['selectedCategory'];
  const userId = location.state.userId;
  const userRole = location.state.userRole;
  const idQ = location.state['id'];
  const filters = location.state['filterType'];
  const authorFilter = location.state['authorFilter'];
  const newQuestions = location.state["newQuestions"];
  const back = location.state["back"];
  const [questionType, setQuestionType] = useState("Matching Question");
  const [answers, setAnswers] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(idQ);
  const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);
  const [categorySelect, setCategorySelect] = useState("");
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState('');
  const [questionPositiveFeedback, setQuestionPositiveFeedback] = useState('');
  const [checkSubmit, setCheckSubmit] = useState("");
  const [createMoreQuestions, setCreateMoreQuestions] = useState(newQuestions || false);
  const saveChanges = () => {
    let answersSel = [];
    if (questionType === "Matching Question") {
      answersSel = {
        "MatchingQuestion": answers
      };
    }
    if (questionType === "Short Question") {
      answersSel = {
        "ShortAnswerQuestion": answers
      };
    }
    if (questionType === "Multiple Choice Question") {
      answersSel = {
        "MultipleChoiceQuestion": answers
      };
    }
    const updatedData = {
      title: title,
      text: text,
      category_id: selectedCategoryId,
      questionType: questionType,
      answers: answersSel,
      author: userId,
      feedback: questionFeedback,
      positiveFeedback: questionPositiveFeedback
    };
    if (subButText === "Submit" || subButText === "Copy") {
      if (title !== "" && text !== "") {
        axios.put(apiUrl + `questions/new-question`, updatedData).then(response => {
          if (createMoreQuestions) {
            setTitle("");
            setText("");
            setQuestionType("Matching Question");
            setSelectedCategoryId(idQ);
            setSelectedCategory(selectedCategory1);
            setCategorySelect("");
            setAnswers({});
            setQuestionFeedback("");
            setQuestionPositiveFeedback("");
            setCheckSubmit([]);
            navigate(`/question/new-question`, {
              state: {
                catPath: category,
                id: idQ,
                selectedCategory: selectedCategory1,
                limit: limit,
                offset: offset,
                sort: sort,
                page: page,
                filterType: filters,
                authorFilter: authorFilter,
                newQuestions: createMoreQuestions
              }
            });
            window.location.reload();
          } else {
            window.location.href = '/questions';
          }
        }).catch(error => {
          console.error('Error saving changes:', error);
        });
      } else {
        if (title === "") {
          setCheckSubmit("Title must be provided");
        } else if (text === "") {
          setCheckSubmit("Text must be provided");
        }
      }
    } else {
      if (title !== "" && text !== "") {
        axios.put(apiUrl + `questions/versions/${id}`, updatedData).then(response => {
          window.location.href = '/questions';
        }).catch(error => {
          console.error('Error saving changes:', error);
        });
      } else {
        if (title === "") {
          setCheckSubmit("Title must be provided");
        } else if (text === "") {
          setCheckSubmit("Text must be provided");
        }
      }
    }
  };
  const fetchCategory = async () => {
    try {
      const response = await axios.get(apiUrl + `categories`);
      setCategory(response.data);
    } catch (error) {} finally {
      setLoading(false);
    }
  };
  const fetchCategorySelect = async () => {
    try {
      const response = await axios.get(apiUrl + `get-category-tree-array`);
      setCategorySelect(response.data);
    } catch (error) {} finally {
      setLoading(false);
    }
  };
  const fetchData = async () => {
    try {
      const response = await axios.get(apiUrl + `question-version-choice/${id}`);
      setSelectedCategory(response.data["category_name"]);
      setSelectedCategoryId(response.data["category_id"]);
      setTitle(response.data["title"]);
      setText(response.data["text"]);
      setQuestionFeedback(response.data["question_feedback"]);
      setQuestionPositiveFeedback(response.data["question_positive_feedback"]);
      if (response.data["type"] === "matching_answer_question") {
        setQuestionType("Matching Question");
        setAnswers(response.data["answers"]);
      }
      if (response.data["type"] === "multiple_answer_question") {
        setQuestionType("Multiple Choice Question");
        setAnswers(response.data["answers"]);
      }
      if (response.data["type"] === "short_answer_question") {
        setQuestionType("Short Question");
        setAnswers(response.data["answers"]);
      }
    } catch (error) {} finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        fetchCategory();
        fetchCategorySelect();
        if (subButText !== "Submit") {
          fetchData();
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
    fetchAllData();
  }, []);
  const AnswerSetter = async newAnswers => {
    setAnswers(newAnswers);
  };
  if (userRole !== "teacher") {
    navigate("/quizzes");
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Questions"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar",
    style: {
      position: "sticky",
      textAlign: "left",
      top: "50px",
      height: "calc(100vh - 60px)"
    }
  }, /*#__PURE__*/React.createElement(Categories, {
    catPath: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, titleText), checkSubmit.length !== 0 && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-danger",
    role: "alert"
  }, checkSubmit), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "select-category"
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    id: "select-category",
    className: "form-select",
    value: selectedCategoryId,
    onChange: e => {
      const selectedOption = categorySelect.find(cat => cat.id === parseInt(e.target.value));
      setSelectedCategory(selectedOption.title);
      setSelectedCategoryId(selectedOption.id);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Select a category"), Array.isArray(categorySelect) && categorySelect.map(cat => /*#__PURE__*/React.createElement("option", {
    key: cat.id,
    value: cat.id
  }, cat.title)))), /*#__PURE__*/React.createElement("div", {
    className: "mb-3 mt-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionType",
    className: "form-label"
  }, "Question Type"), /*#__PURE__*/React.createElement("select", {
    id: "questionType",
    className: "form-select",
    value: questionType,
    onChange: e => setQuestionType(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "Matching Question"
  }, "Matching Question"), /*#__PURE__*/React.createElement("option", {
    value: "Multiple Choice Question"
  }, "Multiple Choice Question"), /*#__PURE__*/React.createElement("option", {
    value: "Short Question"
  }, "Short Question"))), /*#__PURE__*/React.createElement("form", {
    className: "was-validated"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionTitle",
    className: "form-label"
  }, "Title"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    id: "questionTitle",
    value: title,
    placeholder: "Question title",
    onChange: e => setTitle(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Please enter title")), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionText",
    className: "form-label"
  }, "Question Text"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: text,
    handleFunction: setText
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Please enter text of question"))), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionFeedback",
    className: "form-label"
  }, "Question negative feedback"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: questionFeedback,
    handleFunction: setQuestionFeedback
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionPositiveFeedback",
    className: "form-label"
  }, "Question positive feedback"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: questionPositiveFeedback,
    handleFunction: setQuestionPositiveFeedback
  })), questionType === "Matching Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(MatchingQuestion, {
    setAnswers: AnswerSetter,
    answers: answers
  })), questionType === "Short Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(ShortAnswerQuestion, {
    setAnswers: AnswerSetter,
    answers: answers
  })), questionType === "Multiple Choice Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(MultipleChoiceQuestion, {
    setAnswers: AnswerSetter,
    answers: answers
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, subButText === "Submit" && /*#__PURE__*/React.createElement("div", {
    className: "form-check me-3 mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    name: "independentAttempts",
    id: "exampleRadios2",
    value: "option2",
    checked: createMoreQuestions,
    onChange: e => setCreateMoreQuestions(e.target.checked)
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "exampleRadios2"
  }, "Create more questions")), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-primary mb-3",
    onClick: () => {
      if (back) {
        navigate(-1);
      } else {
        navigate(`/questions/${catPath}?page=${page}&limit=${limit}&offset=${offset}&category=${selectedCategory1}&category_id=${idQ}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
      }
    }
  }, "Back"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success mb-3",
    disabled: title.length === 0 || text.length === 0 || back,
    onClick: () => {
      saveChanges();
    }
  }, subButText)))), /*#__PURE__*/React.createElement("div", {
    className: "col-2"
  }))));
};
export default NewQuestion;