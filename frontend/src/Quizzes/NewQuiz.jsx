import React, {useEffect, useState} from 'react';
import Navigation from "../Navigation";
import QuestionModal from "./QuestionModal";
import axios from "axios";

import {useLocation, useNavigate} from "react-router-dom";
import QuizTemplateQuestionItem from "./QuizTemplateQuestionItem";
import QuizTemplateTabs from "./QuizTemplateTabs";
import QuizTemplateSettings from "./QuizTemplateSettings";

const formatDate = (actDate) => {
    if (!actDate) return "";

    const date = new Date(actDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");


    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const NewQuiz = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState( location.state?.sections.length+2 || 3);
    const [newUpdateQuiz] = useState(location.state?.newUpdateQuiz || "Submit")

    const [quizTitle, setQuizTitle] = useState(location.state?.title ?? "");
    const [numberOfCorrections, setNumberOfCorrections] = useState(parseInt(location.state?.numberOfCorrections) || 1);
    const [minutesToFinish, setMinutesToFinish] = useState(parseInt(location.state?.minutesToFinish) || 1);
    const [dateOpen, setDateOpen] = useState(formatDate(location.state?.dateOpen) || "");
    const [dateClose, setDateClose] = useState(formatDate(location.state?.dateClose) || "");
    const [dateCheck, setDateCheck] = useState(formatDate(location.state?.dateCheck) || "");
    const [shuffleSections, setShuffleSections] = useState(Boolean(location.state?.shuffleSections) || false);
    const [checkSubmit, setCheckSubmit] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState(location.state?.selectedFeedback || ["pointsReview"]);
    const [selectedFeedbackAfterClose, setSelectedFeedbackAfterClose] = useState(location.state?.feedbackTypeAfterClose || ["pointsReview"]);

    const [categorySelect, setCategorySelect] = useState([{id: "1", title: "All"}]);

    const [quizId] = useState(location.state?.quizId || 0);

    const [changeData, setChangeData] = useState(false);

    const [sections, setSections] = useState( location.state?.sections || [{
        sectionId: 1,
        shuffle: false,
        questions: [],
        title: "Section 1",
    }]);


    const [selectedOption, setSelectedOption] = useState(location.state?.selectedOption ?? "indepedentAttempts");

    const apiUrl = process.env.REACT_APP_API_URL;

    const handleSelectedFeedbackChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFeedback((prev) =>
            checked ? [...prev, value] : prev.filter((item) => item !== value)
        );
    };

    const handleSelectedFeedbackAfterCloseChange = (e) => {
        const { value, checked } = e.target;
        setSelectedFeedbackAfterClose((prev) =>
            checked ? [...prev, value] : prev.filter((item) => item !== value)
        );
    }

    const updateShuffle = () => {
        setSections((prevSections) => {
            const updatedSections = [...prevSections];
            updatedSections[pageNum - 2] = {
                ...updatedSections[pageNum - 2],
                shuffle: !updatedSections[pageNum - 2].shuffle,
            };
            return updatedSections;
        });
    };

    const handleTitle = (e) => {
        const newTitle = e.target.value;
        const updatedSections = [...sections];
        updatedSections[pageNum - 2]["title"] = newTitle;
        setSections(updatedSections);
    };

    const addPage = (index) => {
        setChangeData(true);
        setPageNum(index);
        setSections((prevSections) => [
            ...prevSections,
            {
                sectionId: prevSections.length + 1,
                shuffle: false,
                title: "Section " + (prevSections.length + 1),
                questions: [],
            }])
    }

    const fetchCategorySelect = async () => {
        try {
            const response = await axios.get(apiUrl+`get-category-tree-array`)
            setCategorySelect(() => [
                {id: 1, title: "All"},
                ...response.data
            ]);
        } catch (error) {
        } finally {
        }
    }


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await fetchCategorySelect();
            } catch (error) {
                console.error("Error during fetch:", error);
            }
        };

        fetchAllData().then(() => {});

    }, []);
    const handleEvaluateChange = (questionIndex, newValue) => {
        setChangeData(true);
        setSections((prevSections) =>
            prevSections.map((section, sectionIndex) => {
                if (sectionIndex === pageNum - 2) {
                    return {
                        ...section,
                        questions: section.questions.map((question, qIndex) =>
                            qIndex === questionIndex
                                ? {...question, evaluation: parseInt(newValue, 10)}
                                : question
                        ),
                    };
                }
                return section;
            })
        );
    };

    const handleAddItemToSection = (newQuestions) => {
        setChangeData(true);
        setSections((prevSections) =>
            prevSections.map((section) => {
                if (section?.sectionId === pageNum - 1) {
                    const updatedQuestions = Array.isArray(section.questions) ? [...section.questions] : [];

                    if (newQuestions.type === "questions") {
                        for (const question of newQuestions.questions) {
                            updatedQuestions.push({...question, questionType: "questions"});
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
            })
        );
    };

    const handleRemoveItem = (itemIndex) => {
        setChangeData(true);
        setSections((prevSections) =>
            prevSections.map((section, sectionIndex) => {
                if (sectionIndex === pageNum - 2) {
                    return {
                        ...section,
                        questions: section.questions.filter((_, i) => i !== itemIndex),
                    };
                }
                return section;
            })
        );
    };
    const handleOrderChangeItem = (itemIndex, direction) => {
        setChangeData(true);
        setSections((prevSections) =>
            prevSections.map((section, secIndex) => {
                if (secIndex === pageNum - 2) {
                    const updatedQuestions = [...section.questions];

                    if (direction === "up" && itemIndex > 0) {
                        [updatedQuestions[itemIndex], updatedQuestions[itemIndex - 1]] =
                            [updatedQuestions[itemIndex - 1], updatedQuestions[itemIndex]];

                    } else if (direction === "down" && itemIndex < updatedQuestions.length - 1) {
                        [updatedQuestions[itemIndex], updatedQuestions[itemIndex + 1]] =
                            [updatedQuestions[itemIndex + 1], updatedQuestions[itemIndex]];
                    }

                    return {...section, questions: updatedQuestions};
                }
                return section;
            })
        );
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
            quizId: quizId,
            feedbackType: selectedFeedback,
            changeData: changeData,
            feedbackTypeAfterClose: selectedFeedbackAfterClose,
        }

        if (quizTitle === "") {
            setCheckSubmit("Please fill quiz title")
            return;
        }
        if (dateOpen === "") {
            setCheckSubmit("Open the quiz is not filled correctly")
            return;
        }
        if (dateClose === "") {
            setCheckSubmit("Close the quiz is not filled correctly")
            return;
        }
        if (dateCheck === "") {
            setCheckSubmit("The quiz can be reviewed from is not filled correctly")
            return;
        }

         axios.post(apiUrl+`new-quiz-template-check`, sections)
            .then(response => {
                if (response.data["message"]){
                    axios.put(apiUrl+`new-quiz-template`, updatedData)
                    .then(
                        () => {
                            window.location.href = '/quizzes';
                        }
                    )
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });
                }else{
                    setCheckSubmit(response.data["error"]);
                }
            })
            .catch(error => console.error('Chyba:', error));
    }

    const handleDateOpenChange = (e) => {
        const newDate = e.target.value;

        if (newDate < dateClose || dateClose === ""){
            setDateOpen(newDate);
        }else{
            alert("Open date cannot be later than close date!");
        }
    }

    const handleDateCloseChange = (e) => {
        const newDate = e.target.value;

        if (dateOpen < newDate){
            setDateClose(newDate);
        }else{
            alert("Close date cannot sooner than open date!");
        }
    }

    const handleDateCheck = (e) => {
        const newDate = e.target.value;

        if ( newDate >= dateOpen){
            setDateCheck(newDate);
        }else{
            alert("Check date must be between open and close date!");
        }
    }

    const handleDeleteSection = (sectionId) => {
            setChangeData(true);
          const updatedSections = sections.filter((section) => section.sectionId !== sectionId);
          setSections(updatedSections);
          setPageCount(pageCount-1);
          setPageNum(pageNum-1);
        };

    const checkSections = () =>{
        let isValid = false;
        sections.forEach(section => {
            if (section.title === "") {
                isValid = true;
            }

            if (section.questions.length === 0){
                isValid = true;
            }
          });
        return isValid;
    }

    if (localStorage.getItem("role") !=="teacher"){
        navigate("/quizzes");
    }

    return (
            <div>
                    <Navigation active="Quizzes"></Navigation>

                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    <div className="row">
                        <div className="col-2 sidebar">
                        </div>
                        <div className="col-8">
                            <h1>{quizTitle}</h1>
                            {
                                checkSubmit.length !== 0 && (
                                    <div className="alert alert-danger" role="alert">
                                        {checkSubmit}
                                    </div>
                                )
                            }

                            <QuizTemplateTabs
                                setPageNum={setPageNum}
                                pageCount = {pageCount}
                                pageNum={pageNum}
                                sections={sections}
                                setPageCount={setPageCount}
                                addPage ={addPage}
                                newUpdateQuiz={newUpdateQuiz}
                                saveChanges={saveChanges}
                                quizTitle={quizTitle}
                                numberOfCorrections={numberOfCorrections}
                                minutesToFinish={minutesToFinish}
                                checkSections={checkSections}
                            ></QuizTemplateTabs>

                            <QuizTemplateSettings
                                quizTitle={quizTitle}
                                setQuizTitle={setQuizTitle}
                                shuffleSections={shuffleSections}
                                setShuffleSections={setShuffleSections}
                                numberOfCorrections={numberOfCorrections}
                                setNumberOfCorrections={setNumberOfCorrections}
                                selectedOption={selectedOption}
                                setSelectedOption={setSelectedOption}
                                minutesToFinish={minutesToFinish}
                                setMinutesToFinish={setMinutesToFinish}
                                dateOpen={dateOpen}
                                handleDateOpenChange={handleDateOpenChange}
                                dateClose={dateClose}
                                handleDateCloseChange={handleDateCloseChange}
                                dateCheck={dateCheck}
                                handleDateCheck={handleDateCheck}
                                selectedFeedback = {selectedFeedback}
                                handleSelectedFeedbackChange = {handleSelectedFeedbackChange}
                                selectedFeedbackAfterClose={selectedFeedbackAfterClose}
                                handleSelectedFeedbackAfterCloseChange={handleSelectedFeedbackAfterCloseChange}

                            ></QuizTemplateSettings>

                            {(pageNum > 1 && pageNum < pageCount) && (
                                <div className="tab-content mt-3" id={`tab-content-${pageNum}`}>
                                    {sections[pageNum-2].questions.length === 0 && (
                                        <div className="alert alert-danger" role="alert">
                                            Section must include at least one question
                                        </div>
                                    )}
                                    <div
                                        key={pageNum}
                                        className={`tab-pane fade show active`}
                                        id={`tab-pane-${pageNum}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${pageNum}`}
                                    >
                                        {/*<h2>{sections[pageNum - 2]?.title}</h2>*/}
                                        <form className="was-validated">
                                            <div className="mb-3">
                                                <label htmlFor={`section-title-${pageNum}`}
                                                       className="form-label">Title:</label>
                                                <input
                                                    id={`section-title-${pageNum}`}
                                                    type="text"
                                                    placeholder="Enter section title..."
                                                    value={sections[pageNum - 2]?.title || ""}
                                                    onChange={handleTitle}
                                                    className="form-control"
                                                    required
                                                />
                                                <div className="invalid-feedback">Please enter a section title.</div>
                                            </div>
                                        </form>
                                        <div className="form-check mb-3">
                                            <input className="form-check-input" type="checkbox" value=""
                                                   checked={sections[pageNum - 2]?.shuffle} onChange={updateShuffle}
                                                   id="shuffleSection"/>
                                            <label className="form-check-label" htmlFor="shuffleSection">
                                                Shuffle
                                            </label>
                                        </div>

                                        <ol className="list-group">
                                            <QuizTemplateQuestionItem type={"header"}></QuizTemplateQuestionItem>
                                        {
                                            // eslint-disable-next-line array-callback-return
                                            sections[pageNum - 2].questions.map((item, indexQuestion) => {
                                                if (item.questionType === "questions") {
                                                    return (
                                                        <QuizTemplateQuestionItem type ={"question"} indexQuestion={indexQuestion} sections={sections} item={item} pageNum={pageNum} handleEvaluateChange={handleEvaluateChange} handleOrderChangeItem={handleOrderChangeItem} handleRemoveItem={handleRemoveItem}></QuizTemplateQuestionItem>


                                                    )
                                                } else if (item.questionType === "random") {
                                                    return (
                                                        <QuizTemplateQuestionItem type ={"random"} indexQuestion={indexQuestion} sections={sections} item={item} pageNum={pageNum} handleEvaluateChange={handleEvaluateChange} handleOrderChangeItem={handleOrderChangeItem} handleRemoveItem={handleRemoveItem}></QuizTemplateQuestionItem>
                                                    )
                                                }
                                            })
                                        }
                                            <QuizTemplateQuestionItem type={"header"}></QuizTemplateQuestionItem>
                                        </ol>

                                        <div className="d-flex justify-content-between">
                                            <button type="button" className="btn btn-success mb-1"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#staticBackdrop"
                                            >Add Question
                                            </button>

                                            <button type="button" className="btn btn-outline-danger mb-1"
                                                    disabled={pageNum - 1 === 1}
                                                    onClick={() => handleDeleteSection(pageNum - 1)}
                                            >Delete Section
                                            </button>
                                        </div>
                                        <QuestionModal
                                            pageNum={pageNum}
                                            categorySelect={categorySelect}
                                            handleAddItem={handleAddItemToSection}
                                            setSections={setSections}
                                        />
                                    </div>

                                </div>
                            )}


                        </div>
                        <div className="col-2">
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default NewQuiz;