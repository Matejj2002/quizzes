import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Toast, ToastContainer, Button } from 'react-bootstrap';
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const catPath = searchParams.get('category');
  const page = parseInt(searchParams.get('page'), 10) || 1;
  const limit = parseInt(searchParams.get('limit'), 10) || 10;
  const offset = parseInt(searchParams.get('offset'), 10) || 0;
  const sort = searchParams.get('sort');
  const selectedCategory1 = searchParams.get('selectedCategory');
  const idQ = parseInt(searchParams.get('id') === '1' ? '2' : searchParams.get('id'));
  const filters = searchParams.get('filterType');
  const authorFilter = searchParams.get('authorFilter');
  const newQuestions = searchParams.get('newQuestions');
  const back = searchParams.get('back') === 'true';
  const [questionType, setQuestionType] = useState("Matching Question");
  const [answers, setAnswers] = useState({});
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(idQ);
  const [categorySelect, setCategorySelect] = useState("");
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [questionFeedback, setQuestionFeedback] = useState('');
  const [questionPositiveFeedback, setQuestionPositiveFeedback] = useState('');
  const [checkSubmit, setCheckSubmit] = useState("");
  const [createMoreQuestions, setCreateMoreQuestions] = useState(newQuestions || false);
  const [showToast, setShowToast] = useState(false);
  let titleText = "";
  let buttonText = "";
  if (subButText === "Submit") {
    titleText = "New Question";
    buttonText = "Create Question";
  }
  if (subButText === "Copy") {
    titleText = "Copy of " + versions[selectedVersion]?.title;
    buttonText = "Copy Question";
  }
  if (subButText === "Update") {
    if (selectedVersion !== 0) {
      titleText = "Retrieve Question";
      buttonText = "Retrieve Question";
    } else {
      titleText = "Update Question";
      buttonText = "Update Question";
    }
  }
  async function getUserLogged() {
    const data = JSON.parse(localStorage.getItem("data"));
    try {
      const response = await axios.get(apiUrl + `get-user-data_logged`, {
        params: {
          "userName": data["login"],
          "avatarUrl": data["avatar_url"]
        }
      });
      setUserData(response.data.result);
      if (response.data.result.role !== "teacher") {
        navigate("/quizzes");
      }
    } catch (error) {
      console.error(error);
    } finally {}
  }
  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };
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
      author: userData["id_user"],
      feedback: questionFeedback,
      positiveFeedback: questionPositiveFeedback
    };
    if (subButText === "Submit" || subButText === "Copy") {
      if (title !== "" && text !== "") {
        axios.put(apiUrl + `questions/new-question`, updatedData).then(response => {
          if (createMoreQuestions) {
            sessionStorage.setItem("scrollToTop", "true");
            // window.location.reload();
            handleShowToast();
            window.scrollTo(0, 0);
          } else {
            window.location.href = quizzesUrl + '/questions';
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
          window.location.href = quizzesUrl + '/questions';
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
      setVersions(response.data);
      setSelectedCategoryId(response.data[0]["category_id"]);
      setTitle(response.data[0]["title"]);
      setText(response.data[0]["text"]);
      setQuestionFeedback(response.data[0]["question_feedback"]);
      setQuestionPositiveFeedback(response.data[0]["question_positive_feedback"]);
      if (response.data[0]["type"] === "matching_answer_question") {
        setQuestionType("Matching Question");
      }
      if (response.data[0]["type"] === "multiple_answer_question") {
        setQuestionType("Multiple Choice Question");
      }
      if (response.data[0]["type"] === "short_answer_question") {
        setQuestionType("Short Question");
      }
      await AnswerSetter(response.data[0]["answers"]);
      setAnswers(response.data[0]["answers"]);
    } catch (error) {} finally {
      setLoading(false);
    }
  };
  const fetchAllData = async () => {
    setLoading(true);
    try {
      fetchCategory();
      fetchCategorySelect();
      if (subButText !== "Submit") {
        await fetchData().then(() => {
          setLoading(false);
        });
      }
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };
  useEffect(() => {
    getUserLogged().then(() => {
      if (sessionStorage.getItem("scrollToTop") === "true") {
        setTimeout(() => {
          window.scrollTo(0, 0);
          sessionStorage.removeItem("scrollToTop");
        }, 50);
      }
      fetchAllData();
    });
  }, []);
  useEffect(() => {
    if (versions.length === 0) {
      return;
    }
    const fetchDataWait = async () => {
      setSelectedCategoryId(versions[selectedVersion]["category_id"]);
      setTitle(versions[selectedVersion]["title"]);
      setText(versions[selectedVersion]["text"]);
      setQuestionFeedback(versions[selectedVersion]["question_feedback"]);
      setQuestionPositiveFeedback(versions[selectedVersion]["question_positive_feedback"]);
      if (versions[selectedVersion]["type"] === "matching_answer_question") {
        setQuestionType("Matching Question");
      }
      if (versions[selectedVersion]["type"] === "multiple_answer_question") {
        setQuestionType("Multiple Choice Question");
      }
      if (versions[selectedVersion]["type"] === "short_answer_question") {
        setQuestionType("Short Question");
      }
      await AnswerSetter(versions[selectedVersion]["answers"]);
      setAnswers(versions[selectedVersion]["answers"]);
    };
    fetchDataWait();
  }, [selectedVersion]);
  const AnswerSetter = async newAnswers => {
    setAnswers(newAnswers);
  };
  const saveTeacherFeedback = () => {
    const updatedData = {
      "feedback": teacherFeedback,
      "versionId": versions[selectedVersion].version_id,
      "teacher_id": userData["id_user"]
    };
    setVersions(prevVersions => {
      const updatedVersions = [...prevVersions];
      const updatedVersion = {
        ...updatedVersions[selectedVersion]
      };
      if (!Array.isArray(updatedVersion.comments[0])) {
        updatedVersion.comments[0] = [];
      }
      updatedVersion.comments[0] = [...updatedVersion.comments[0], {
        "name": "You",
        "text": teacherFeedback,
        "role": "teacher"
      }];
      updatedVersions[selectedVersion] = updatedVersion;
      return updatedVersions;
    });
    axios.put(apiUrl + `save-feedback-to-version`, updatedData).then(() => {}).catch(() => {});
  };
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
  }, checkSubmit), titleText !== "New Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "select-version"
  }, "Question Version"), /*#__PURE__*/React.createElement("select", {
    id: "select-version",
    className: "form-select",
    onChange: e => {
      setSelectedVersion(Number(e.target.value));
    }
  }, versions.map((version, index) => /*#__PURE__*/React.createElement("option", {
    key: index,
    value: index
  }, "Version ", versions.length - index)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "select-category"
  }, "Category"), /*#__PURE__*/React.createElement("select", {
    id: "select-category",
    className: "form-select",
    disabled: selectedVersion !== 0,
    value: selectedCategoryId,
    onChange: e => {
      const selectedOption = categorySelect.find(cat => cat.id === parseInt(e.target.value));
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
    disabled: selectedVersion !== 0,
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
    disabled: selectedVersion !== 0,
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
    handleFunction: setText,
    isDisabled: selectedVersion !== 0,
    idVal: "questionText"
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Please enter text of question"))), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionNegativeFeedback",
    className: "form-label"
  }, "Question negative feedback"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: questionFeedback,
    handleFunction: setQuestionFeedback,
    isDisabled: selectedVersion !== 0,
    idVal: "questionNegativeFeedback"
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "questionPositiveFeedback",
    className: "form-label"
  }, "Question positive feedback"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: questionPositiveFeedback,
    handleFunction: setQuestionPositiveFeedback,
    isDisabled: selectedVersion !== 0,
    idVal: "questionPositiveFeedback"
  })), questionType === "Matching Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(MatchingQuestion, {
    setAnswers: AnswerSetter,
    answers: answers,
    isDisabled: selectedVersion !== 0
  })), questionType === "Short Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(ShortAnswerQuestion, {
    setAnswers: AnswerSetter,
    answers: answers,
    isDisabled: selectedVersion !== 0
  })), questionType === "Multiple Choice Question" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, questionType), /*#__PURE__*/React.createElement(MultipleChoiceQuestion, {
    setAnswers: AnswerSetter,
    answers: answers,
    isDisabled: selectedVersion !== 0
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
    className: "d-flex justify-content-between mt-3"
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
  }, buttonText))), titleText !== "New Question" && /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement("h2", null, "Feedbacks"), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "teacher-feedback",
    className: "form-label"
  }, "Teacher feedback"), /*#__PURE__*/React.createElement(FormattedTextInput, {
    text: teacherFeedback,
    handleFunction: setTeacherFeedback,
    idVal: "teacher-feedback"
  }), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success mb-3 mt-3 align-content-end",
    onClick: () => {
      saveTeacherFeedback();
    }
  }, "Save Feedback")), versions[selectedVersion]?.comments[0].length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Teacher comments"), /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Github Name"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Comment"))), /*#__PURE__*/React.createElement("tbody", null, versions[selectedVersion]?.comments[0].map((cmt, ind) => /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, cmt.name), /*#__PURE__*/React.createElement("td", null, cmt.text)))))), versions[selectedVersion]?.comments[1].length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Student comments"), /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Github Name"), /*#__PURE__*/React.createElement("th", {
    scope: "col"
  }, "Comment"))), /*#__PURE__*/React.createElement("tbody", null, versions[selectedVersion]?.comments[1].map((cmt, ind) => /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, cmt.name), /*#__PURE__*/React.createElement("td", null, cmt.text))))))))), /*#__PURE__*/React.createElement("div", {
    className: "col-2"
  }))), /*#__PURE__*/React.createElement(ToastContainer, {
    position: "bottom-end",
    className: "p-3"
  }, /*#__PURE__*/React.createElement(Toast, {
    show: showToast,
    onClose: () => setShowToast(false),
    bg: "success"
  }, /*#__PURE__*/React.createElement(Toast.Header, {
    closeButton: true
  }, /*#__PURE__*/React.createElement("strong", {
    className: "me-auto"
  }, "Question ", title, " was created.")), /*#__PURE__*/React.createElement(Toast.Body, {
    className: "text-white"
  }, "Created sucesfully."))));
};
export default NewQuestion;