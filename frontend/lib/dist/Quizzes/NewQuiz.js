import React, { useEffect, useState } from 'react';
import Navigation from "../components/Navigation";
import QuestionModal from "./QuestionModal";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import QuizTemplateQuestionItem from "./QuizTemplateQuestionItem";
import QuizTemplateTabs from "./QuizTemplateTabs";
import QuizTemplateSettings from "./QuizTemplateSettings";
const formatDate = actDate => {
  if (!actDate) return "";
  const date = new Date(actDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
const NewQuiz = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const quizTemplateId = searchParams.get("templateId") ?? 0;
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(3);
  const [newUpdateQuiz, setNewUpdateQuiz] = useState("Create new quiz");
  const [quizTitle, setQuizTitle] = useState("");
  const [numberOfCorrections, setNumberOfCorrections] = useState(1);
  const [minutesToFinish, setMinutesToFinish] = useState(1);
  const [dateOpen, setDateOpen] = useState("");
  const [dateClose, setDateClose] = useState("");
  const [dateCheck, setDateCheck] = useState("");
  const [shuffleSections, setShuffleSections] = useState(false);
  const [checkSubmit, setCheckSubmit] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(["pointsReview"]);
  const [selectedFeedbackAfterClose, setSelectedFeedbackAfterClose] = useState(["pointsReview"]);
  const [categorySelect, setCategorySelect] = useState([{
    id: "1",
    title: "All"
  }]);
  const [userData, setUserData] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [changeData, setChangeData] = useState(false);
  const [sections, setSections] = useState(location.state?.sections || [{
    sectionId: 1,
    shuffle: false,
    questions: [],
    title: "Section 1"
  }]);
  const [selectedOption, setSelectedOption] = useState(location.state?.selectedOption ?? "indepedentAttempts");
  const apiUrl = process.env.REACT_APP_API_URL;
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(apiUrl + `get-quiz-templates`, {
        params: {
          "studentId": 0,
          "templateId": quizTemplateId
        }
      });
      setQuiz(response.data.result);
      const data = response.data.result[0];
      setPageCount(data.sections.length + 2);
      setNumberOfCorrections(parseInt(data.number_of_corrections));
      setMinutesToFinish(parseInt(data.time_to_finish));
      setDateOpen(formatDate(data.date_time_open));
      setDateClose(formatDate(data.date_time_close));
      setDateCheck(formatDate(data.datetime_check));
      setQuizTitle(data.title);
      setShuffleSections(data.shuffle_sections);
      setNewUpdateQuiz("Update");
      setSections(data.sections);
      setSelectedOption(data.correction_of_attempts);
      setSelectedFeedback(data.feedbackType);
      setSelectedFeedbackAfterClose(data.feedbackTypeAfterClose);
    } catch (error) {
      console.error(error);
      // window.location.href=quizzesUrl+"/login";
    } finally {}
  };
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
    } catch (error) {
      console.error(error);
    } finally {}
  }
  const handleSelectedFeedbackChange = e => {
    const {
      value,
      checked
    } = e.target;
    setSelectedFeedback(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };
  const handleSelectedFeedbackAfterCloseChange = e => {
    const {
      value,
      checked
    } = e.target;
    setSelectedFeedbackAfterClose(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };
  const updateShuffle = () => {
    setChangeData(true);
    setSections(prevSections => {
      const updatedSections = [...prevSections];
      updatedSections[pageNum - 2] = {
        ...updatedSections[pageNum - 2],
        shuffle: !updatedSections[pageNum - 2].shuffle
      };
      return updatedSections;
    });
  };
  const handleTitle = e => {
    setChangeData(true);
    const newTitle = e.target.value;
    const updatedSections = [...sections];
    updatedSections[pageNum - 2]["title"] = newTitle;
    setSections(updatedSections);
  };
  const addPage = index => {
    setChangeData(true);
    setPageNum(index);
    setSections(prevSections => [...prevSections, {
      sectionId: prevSections.length + 1,
      shuffle: false,
      title: "Section " + (prevSections.length + 1),
      questions: []
    }]);
  };
  const fetchCategorySelect = async () => {
    try {
      const response = await axios.get(apiUrl + `get-category-tree-array`);
      setCategorySelect(() => [{
        id: 1,
        title: "All"
      }, ...response.data]);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchCategorySelect();
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
    getUserLogged().then(() => {
      fetchAllData().then(() => {});
      if (quizTemplateId !== null) {
        fetchQuizzes();
      }
    });
  }, []);
  const handleEvaluateChange = (questionIndex, newValue) => {
    setChangeData(true);
    setSections(prevSections => prevSections.map((section, sectionIndex) => {
      if (sectionIndex === pageNum - 2) {
        return {
          ...section,
          questions: section.questions.map((question, qIndex) => qIndex === questionIndex ? {
            ...question,
            evaluation: parseInt(newValue, 10)
          } : question)
        };
      }
      return section;
    }));
  };
  const handleAddItemToSection = newQuestions => {
    setChangeData(true);
    setSections(prevSections => prevSections.map(section => {
      if (section?.sectionId === pageNum - 1) {
        const updatedQuestions = Array.isArray(section.questions) ? [...section.questions] : [];
        if (newQuestions.type === "questions") {
          for (const question of newQuestions.questions) {
            updatedQuestions.push({
              ...question,
              questionType: "questions"
            });
          }
        } else {
          const count = newQuestions.questions.count;
          for (let i = 0; i < count; i++) {
            updatedQuestions.push({
              categoryName: newQuestions.categoryName,
              includeSubCategories: newQuestions.includeSubCategories,
              categoryId: newQuestions.categoryId,
              questionType: newQuestions.type,
              questionAnswerType: newQuestions.questionType,
              evaluation: 1
            });
          }
        }
        return {
          ...section,
          questions: updatedQuestions
        };
      }
      return section;
    }));
  };
  const handleRemoveItem = itemIndex => {
    setChangeData(true);
    setSections(prevSections => prevSections.map((section, sectionIndex) => {
      if (sectionIndex === pageNum - 2) {
        return {
          ...section,
          questions: section.questions.filter((_, i) => i !== itemIndex)
        };
      }
      return section;
    }));
  };
  const handleOrderChangeItem = (itemIndex, direction) => {
    setChangeData(true);
    setSections(prevSections => prevSections.map((section, secIndex) => {
      if (secIndex === pageNum - 2) {
        const updatedQuestions = [...section.questions];
        if (direction === "up" && itemIndex > 0) {
          [updatedQuestions[itemIndex], updatedQuestions[itemIndex - 1]] = [updatedQuestions[itemIndex - 1], updatedQuestions[itemIndex]];
        } else if (direction === "down" && itemIndex < updatedQuestions.length - 1) {
          [updatedQuestions[itemIndex], updatedQuestions[itemIndex + 1]] = [updatedQuestions[itemIndex + 1], updatedQuestions[itemIndex]];
        }
        return {
          ...section,
          questions: updatedQuestions
        };
      }
      return section;
    }));
  };
  const saveChanges = () => {
    const updatedData = {
      sections: sections,
      quizTitle: quizTitle,
      numberOfCorrections: numberOfCorrections,
      minutesToFinish: minutesToFinish,
      dateOpen: dateOpen,
      dateClose: dateClose,
      dateCheck: dateCheck,
      typeOfAttempts: selectedOption,
      shuffleSections: shuffleSections,
      quizId: quizTemplateId,
      feedbackType: selectedFeedback,
      changeData: changeData,
      feedbackTypeAfterClose: selectedFeedbackAfterClose
    };
    if (quizTitle === "") {
      setCheckSubmit("Please fill quiz title");
      return;
    }
    if (dateOpen === "") {
      setCheckSubmit("Open the quiz is not filled correctly");
      return;
    }
    if (dateClose === "") {
      setCheckSubmit("Close the quiz is not filled correctly");
      return;
    }
    if (dateCheck === "") {
      setCheckSubmit("The quiz can be reviewed from is not filled correctly");
      return;
    }
    axios.post(apiUrl + `new-quiz-template-check`, sections).then(response => {
      if (response.data["message"]) {
        axios.put(apiUrl + `new-quiz-template`, updatedData).then(() => {
          window.location.href = quizzesUrl + '/quizzes';
        }).catch(error => {
          console.error('Error saving changes:', error);
        });
      } else {
        setCheckSubmit(response.data["error"]);
      }
    }).catch(error => console.error('Chyba:', error));
  };
  const handleDateOpenChange = e => {
    setDateOpen(e.target.value);
  };
  const handleDateCloseChange = e => {
    setDateClose(e.target.value);
  };
  const handleDateCheck = e => {
    setDateCheck(e.target.value);
  };
  const handleDeleteSection = sectionId => {
    setChangeData(true);
    const updatedSections = sections.filter(section => section.sectionId !== sectionId);
    setSections(updatedSections);
    setPageCount(pageCount - 1);
    setPageNum(pageNum - 1);
  };
  const checkSections = () => {
    let isValid = false;
    sections.forEach(section => {
      if (section.title === "") {
        isValid = true;
      }
      if (section.questions.length === 0) {
        isValid = true;
      }
    });
    return isValid;
  };
  const changeSubBut = () => {
    if (newUpdateQuiz === "Update quiz" && changeData) {
      return "Create new version of quiz";
    }
    return newUpdateQuiz;
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Quizzes"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid",
    style: {
      marginTop: "50px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, quizTitle), checkSubmit.length !== 0 && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-danger",
    role: "alert"
  }, checkSubmit), /*#__PURE__*/React.createElement(QuizTemplateTabs, {
    setPageNum: setPageNum,
    pageCount: pageCount,
    pageNum: pageNum,
    sections: sections,
    setPageCount: setPageCount,
    addPage: addPage,
    newUpdateQuiz: changeSubBut(),
    saveChanges: saveChanges,
    quizTitle: quizTitle,
    numberOfCorrections: numberOfCorrections,
    minutesToFinish: minutesToFinish,
    checkSections: checkSections
  }), /*#__PURE__*/React.createElement(QuizTemplateSettings, {
    quizTitle: quizTitle,
    setQuizTitle: setQuizTitle,
    shuffleSections: shuffleSections,
    setShuffleSections: setShuffleSections,
    numberOfCorrections: numberOfCorrections,
    setNumberOfCorrections: setNumberOfCorrections,
    selectedOption: selectedOption,
    setSelectedOption: setSelectedOption,
    minutesToFinish: minutesToFinish,
    setMinutesToFinish: setMinutesToFinish,
    dateOpen: dateOpen,
    handleDateOpenChange: handleDateOpenChange,
    dateClose: dateClose,
    handleDateCloseChange: handleDateCloseChange,
    dateCheck: dateCheck,
    handleDateCheck: handleDateCheck,
    selectedFeedback: selectedFeedback,
    handleSelectedFeedbackChange: handleSelectedFeedbackChange,
    selectedFeedbackAfterClose: selectedFeedbackAfterClose,
    handleSelectedFeedbackAfterCloseChange: handleSelectedFeedbackAfterCloseChange
  }), pageNum > 1 && pageNum < pageCount && /*#__PURE__*/React.createElement("div", {
    className: "tab-content mt-3",
    id: `tab-content-${pageNum}`
  }, sections[pageNum - 2]?.questions.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "alert alert-danger",
    role: "alert"
  }, "Section must include at least one question"), /*#__PURE__*/React.createElement("div", {
    key: pageNum,
    className: `tab-pane fade show active`,
    id: `tab-pane-${pageNum}`,
    role: "tabpanel",
    "aria-labelledby": `tab-${pageNum}`
  }, /*#__PURE__*/React.createElement("form", {
    className: "was-validated"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: `section-title-${pageNum}`,
    className: "form-label"
  }, "Title:"), /*#__PURE__*/React.createElement("input", {
    id: `section-title-${pageNum}`,
    type: "text",
    placeholder: "Enter section title...",
    value: sections[pageNum - 2]?.title || "",
    onChange: handleTitle,
    className: "form-control",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "invalid-feedback"
  }, "Please enter a section title."))), /*#__PURE__*/React.createElement("div", {
    className: "form-check mb-3"
  }, /*#__PURE__*/React.createElement("input", {
    className: "form-check-input",
    type: "checkbox",
    value: "",
    checked: sections[pageNum - 2]?.shuffle,
    onChange: updateShuffle,
    id: "shuffleSection"
  }), /*#__PURE__*/React.createElement("label", {
    className: "form-check-label",
    htmlFor: "shuffleSection"
  }, "Shuffle")), /*#__PURE__*/React.createElement("ol", {
    className: "list-group"
  }, /*#__PURE__*/React.createElement(QuizTemplateQuestionItem, {
    type: "header"
  }),
  // eslint-disable-next-line array-callback-return
  sections[pageNum - 2].questions.map((item, indexQuestion) => {
    if (item.questionType === "questions") {
      return /*#__PURE__*/React.createElement(QuizTemplateQuestionItem, {
        type: "question",
        indexQuestion: indexQuestion,
        sections: sections,
        item: item,
        pageNum: pageNum,
        handleEvaluateChange: handleEvaluateChange,
        handleOrderChangeItem: handleOrderChangeItem,
        handleRemoveItem: handleRemoveItem
      });
    } else if (item.questionType === "random") {
      return /*#__PURE__*/React.createElement(QuizTemplateQuestionItem, {
        type: "random",
        indexQuestion: indexQuestion,
        sections: sections,
        item: item,
        pageNum: pageNum,
        handleEvaluateChange: handleEvaluateChange,
        handleOrderChangeItem: handleOrderChangeItem,
        handleRemoveItem: handleRemoveItem
      });
    }
  }), /*#__PURE__*/React.createElement(QuizTemplateQuestionItem, {
    type: "header"
  })), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success mb-1",
    "data-bs-toggle": "modal",
    "data-bs-target": "#staticBackdrop"
  }, "Add Question"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-danger mb-1",
    disabled: pageNum - 1 === 1,
    onClick: () => handleDeleteSection(pageNum - 1)
  }, "Delete Section")), /*#__PURE__*/React.createElement(QuestionModal, {
    pageNum: pageNum,
    categorySelect: categorySelect,
    handleAddItem: handleAddItemToSection,
    setSections: setSections
  })))), /*#__PURE__*/React.createElement("div", {
    className: "col-2"
  }))));
};
export default NewQuiz;