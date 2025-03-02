import React, {useEffect, useState} from 'react';
import Navigation from "../Navigation";
import QuestionModal from "../QuestionModal";
import Login from "../Login";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import {useLocation} from "react-router-dom";

const formatDateTimeLocal = (rfcDate) => {
    if (!rfcDate) return "";

    const date = new Date(rfcDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const NewQuiz = () => {
    const location = useLocation();

    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState( location.state?.sections.length+1 || 3);
    const [newUpdateQuiz, setNewUpdateQuiz] = useState(location.state?.newUpdateQuiz || "Submit")

    const [quizTitle, setQuizTitle] = useState(location.state?.title ?? "");
    const [numberOfCorrections, setNumberOfCorrections] = useState(location.state?.numberOfCorrections || 0);
    const [minutesToFinish, setMinutesToFinish] = useState(location.state?.minutesToFinish || 1);
    const [dateOpen, setDateOpen] = useState(formatDateTimeLocal(location.state?.dateOpen) || "");
    const [dateClose, setDateClose] = useState(formatDateTimeLocal(location.state?.dateClose) || "");
    const [dateCheck, setDateCheck] = useState(formatDateTimeLocal(location.state?.dateCheck) || "");
    const [shuffleSections, setShuffleSections] = useState(location.state?.shuffleSections || false);
    const [checkSubmit, setCheckSubmit] = useState("");

    const [categorySelect, setCategorySelect] = useState([{id: "1", title: "All"}]);

    const [quizId, setQuizId] = useState(location.state?.quizId || 0)

    const [sections, setSections] = useState( location.state?.sections || [{
        sectionId: 1,
        shuffle: false,
        questions: [],
        title: "Section 1",
    }]);

    console.log(sections);

    const [selectedOption, setSelectedOption] = useState(location.state?.selectedOption ?? "option1");

    const toggleShuffle = () => {
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
            const response = await axios.get(`http://127.0.0.1:5000/api/get-category-tree-array`)
            setCategorySelect(prevCategories => [
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

        fetchAllData();

    }, []);
    const handleEvaluateChange = (questionIndex, newValue) => {
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
            quizId: quizId

        }
        console.log(quizTitle);
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

        axios.put(`http://127.0.0.1:5000/api/new-quiz-template`, updatedData)
            .then(
                response => {
                    window.location.href = '/quizzes';
                }
            )
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    const handleDateOpenChange = (e) => {
        const newDate = e.target.value;

        if (newDate < dateClose){
            setDateOpen(newDate);
        }else{
            alert("Open date cannot be later than close date!");
        }
    }

    const handleDateCloseChange = (e) => {
        const newDate = e.target.value;

        if (newDate > dateClose){
            setDateClose(newDate);
        }else{
            alert("Close date cannot sooner than open date!");
        }
    }

    const handleDateCheck = (e) => {
        const newDate = e.target.value;

        if ( newDate > dateOpen && newDate < dateClose){
            setDateCheck(newDate);
        }else{
            alert("Check date must be between open and close date!");
        }
    }

    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
                </header>

                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    {
                                checkSubmit.length !== 0 && (
                                    <div className="alert alert-danger" role="alert">
                                        {checkSubmit}
                                    </div>
                                )
                    }
                    <div className="row">
                        <div className="col-2 sidebar">
                        </div>
                        <div className="col-8">
                            {
                                pageNum === 1 ? (
                                    <h1>Quiz Settings</h1>
                                ) :
                                (
                                <h1>Sections</h1>
                                )
                            }
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab"
                                            data-bs-target="#home-tab-pane" type="button" role="tab"
                                            aria-controls="home-tab-pane" aria-selected="true"
                                            onClick={() => setPageNum(1)}>Quiz Settings
                                    </button>
                                </li>
                                {Array.from({length: pageCount - 2}, (_, index) => (
                                    <li className="nav-item" role="presentation" key={index + 2}>
                                        <button
                                            className={`nav-link ${index + 2 === pageNum ? "active" : ""}`}
                                            id={`tab-${index + 2}`}
                                            data-bs-toggle="tab"
                                            data-bs-target={`#tab-pane-${index + 2}`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`tab-pane-${index + 2}`}
                                            aria-selected={index + 2 === pageNum}
                                            onClick={() => {
                                                setPageNum(index + 2)
                                            }}
                                        >
                                            {sections[index].title || "Section " + (index+1)}
                                        </button>
                                    </li>
                                ))}

                                <li className="nav-item" role="presentation">
                                    <button className="nav-link" id="disabled-tab" data-bs-toggle="tab"
                                            type="button" role="tab"
                                            aria-controls="disabled-tab-pane"

                                            onClick={(event) => {
                                                event.preventDefault();
                                                setPageCount(pageCount + 1);
                                                addPage(pageCount);
                                                event.target.classList.remove("active");
                                            }}
                                    >+
                                    </button>
                                </li>

                                <li className="nav-item ms-auto" role="presentation">
                                    <button className="btn btn-success" id="disabled-tab" data-bs-toggle="tab"
                                            type="button" role="tab"
                                            aria-controls="disabled-tab-pane"

                                            onClick={(event) => {
                                                event.preventDefault();
                                                saveChanges();
                                            }}
                                    >{newUpdateQuiz}
                                    </button>
                                </li>

                            </ul>

                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel"
                                     aria-labelledby="home-tab" tabIndex="0">
                                    <div>
                                        {/*<h1 className="mb-3">Quiz Settings</h1>*/}
                                        <div className="mb-3">
                                            <label htmlFor="QuizTitle" className="form-label">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="QuizTitle"
                                                placeholder="New Quiz"
                                                value={quizTitle}
                                                onChange={(e) => setQuizTitle(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="shuffleSections"
                                                checked={shuffleSections}
                                                onChange={(e) => setShuffleSections(e.target.checked)}
                                            />
                                            <label className="form-check-label" htmlFor="shuffleSections">
                                                Shuffle sections
                                            </label>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="correctionsNum" className="form-label">
                                                Number of attempts
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control w-25"
                                                id="correctionsNum"
                                                placeholder="Enter Number"
                                                min="1"
                                                max="10"
                                                value={numberOfCorrections}
                                                onChange={(e) => setNumberOfCorrections(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-check mb-3">
                                            <input className="form-check-input" type="radio" name="independentAttempts"
                                                   id="exampleRadios1" value="option1"
                                                   checked={selectedOption === "option1"}
                                                   onChange={(e) => setSelectedOption(e.target.value)}/>
                                            <label className="form-check-label" htmlFor="exampleRadios1">
                                                Attempts are independent
                                            </label>
                                        </div>
                                        <div className="form-check mb-3">
                                            <input className="form-check-input" type="radio" name="independentAttempts"
                                                   id="exampleRadios2" value="option2"
                                                   checked={selectedOption === "option2"}
                                                   onChange={(e) => setSelectedOption(e.target.value)}/>
                                            <label className="form-check-label" htmlFor="exampleRadios2">
                                                Attempts are corrections of previous attempt
                                            </label>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="timeFinish" className="form-label">
                                                Time limit (Minutes)
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control w-25"
                                                id="timeFinish"
                                                placeholder="Enter Minutes"
                                                min="1"
                                                max="500"
                                                value={minutesToFinish}
                                                onChange={(e) => setMinutesToFinish(parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="dateOpen" className="form-label">Open the quiz</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-control-sm w-25"
                                                id="dateOpen"
                                                value={dateOpen}
                                                onChange={handleDateOpenChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="dateClose" className="form-label">Close the quiz</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-control-sm w-25"
                                                id="dateClose"
                                                value={dateClose}
                                                onChange={handleDateCloseChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="dateCheck" className="form-label">The quiz can be reviewed
                                                from</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-control-sm w-25"
                                                id="dateCheck"
                                                value={dateCheck}
                                                onChange={handleDateCheck}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {(pageNum > 1 && pageNum < pageCount) && (
                                <div className="tab-content mt-3" id={`tab-content-${pageNum}`}>
                                    <div
                                        key={pageNum}
                                        className={`tab-pane fade show active`}
                                        id={`tab-pane-${pageNum}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${pageNum}`}
                                    >
                                        {/*<h2>{sections[pageNum - 2]?.title}</h2>*/}
                                        <label htmlFor={`section-title-${pageNum}`} className="form-label">
                                            Title:
                                        </label>
                                        <input
                                            id={`section-title-${pageNum}`}
                                            type="text"
                                            placeholder="Enter section title..."
                                            value={sections[pageNum - 2]?.title}
                                            onChange={handleTitle}
                                            className="form-control"
                                        />
                                        <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value=""
                                                   checked={sections[pageNum - 2]?.shuffle} onChange={toggleShuffle}
                                                   id="shuffleSection"/>
                                            <label className="form-check-label" htmlFor="shuffleSection">
                                                Shuffle
                                            </label>
                                        </div>
                                        {
                                            sections[pageNum - 2].questions.map((item, indexQuestion) => {
                                                if (item.questionType === "questions") {
                                                    return (
                                                    <div className="mb-3">
                                                        <ol className="list-group">
                                                            <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                                                                <div className="d-flex"
                                                                     style={{width: "10%"}}>Order
                                                                </div>
                                                                <div className="d-flex"
                                                                     style={{width: "25%"}}>Question
                                                                </div>
                                                                <div className="d-flex"
                                                                     style={{width: "10%"}}>Weight
                                                                </div>
                                                                <div className="d-flex justify-content-end"
                                                                     style={{width: "5%"}}>Remove
                                                                </div>
                                                            </li>
                                                            {
                                                                <li key={indexQuestion}
                                                                    className="list-group-item d-flex justify-content-between align-items-start">
                                                                    <div className="d-flex flex-column"
                                                                         style={{width: "5%"}}>
                                                                        <button
                                                                            className="btn btn-outline-secondary btn-sm p-0"
                                                                            onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                                                                            style={{
                                                                                width: "80%",
                                                                                height: "25px"
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-arrow-up"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-secondary btn-sm p-0 mt-1"
                                                                            onClick={() => handleOrderChangeItem(indexQuestion, "down")}
                                                                            style={{
                                                                                width: "80%",
                                                                                height: "25px"
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-arrow-down"></i>
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        className="ms-2 me-auto text-truncate text-start w-100 ">
                                                                        <div
                                                                            className="d-flex">
                                                                            <div
                                                                                className="d-flex align-items-center"
                                                                                style={{width: "66%"}}>
                                                                                <h2 className="h5 text-start text-truncate">
                                                                                    <a href="#"
                                                                                       className="text-decoration-none me-1">
                                                                                        {item.title || "No title available"}
                                                                                    </a>
                                                                                </h2>
                                                                                <span
                                                                                    className="badge text-bg-primary rounded-pill flex-shrink-0 align-self-start">{item.type}
                                                                                </span>
                                                                            </div>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control form-control-sm "
                                                                                style={{width: "5%"}}
                                                                                min="1"
                                                                                value={item.evaluation}
                                                                                onChange={(e) => handleEvaluateChange(indexQuestion, e.target.value)}
                                                                            />

                                                                            <button
                                                                                className="btn btn-outline-danger btn-xs p-0 px-1"
                                                                                style={{marginLeft: "25%"}}
                                                                                onClick={() => handleRemoveItem(indexQuestion)}
                                                                            >
                                                                                <i className="bi bi-trash"></i>
                                                                            </button>
                                                                        </div>
                                                                        <div
                                                                            className="d-flex justify-content-between align-items-center w-100">
                                                                            <p className="m-0 text-truncate">{item.text}</p>
                                                                        </div>
                                                                        <div
                                                                            className="d-flex justify-content-between align-items-center w-100">
                                                                            <span
                                                                                className="m-0 text-secondary text-truncate">Last updated {item.dateCreated} by {item.author}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </li>

                                                            }
                                                        </ol>
                                                    </div>
                                                    )
                                                } else if (item.questionType === "random") {
                                                    return (
                                                        <div className="mb-3">
                                                            <ol className="list-group">
                                                                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                                                                    <div className="d-flex"
                                                                         style={{width: "10%"}}>Order
                                                                    </div>
                                                                    <div className="d-flex"
                                                                         style={{width: "25%"}}>Question
                                                                    </div>
                                                                    <div className="d-flex"
                                                                         style={{width: "10%"}}>Weight
                                                                    </div>
                                                                    <div className="d-flex justify-content-end"
                                                                         style={{width: "5%"}}>Remove
                                                                    </div>
                                                                </li>
                                                                {
                                                                    <li key={indexQuestion}
                                                                        className="list-group-item d-flex justify-content-between align-items-start">
                                                                        <div className="d-flex flex-column"
                                                                             style={{width: "5%"}}>
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm p-0"
                                                                                onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                                                                                style={{
                                                                                    width: "80%",
                                                                                    height: "25px"
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-arrow-up"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm p-0 mt-1"
                                                                                onClick={() => handleOrderChangeItem(indexQuestion, "down")}
                                                                                style={{
                                                                                    width: "80%",
                                                                                    height: "25px"
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-arrow-down"></i>
                                                                            </button>
                                                                        </div>
                                                                        <div
                                                                            className="ms-2 me-auto text-truncate text-start w-100 ">
                                                                            <div
                                                                                className="d-flex">
                                                                                <div
                                                                                    className="d-flex align-items-center"
                                                                                    style={{width: "66%"}}>
                                                                                    <h2 className="h5 text-start text-truncate">
                                                                                        <a href="#"
                                                                                           className="text-decoration-none me-1">
                                                                                            Random Question
                                                                                        </a>
                                                                                    </h2>
                                                                                    <span
                                                                                        className="badge text-bg-primary rounded-pill flex-shrink-0 align-self-start">{item.questionAnswerType}
                                                                                </span>
                                                                                </div>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm "
                                                                                    style={{width: "5%"}}
                                                                                    min="1"
                                                                                    value={item.evaluation}
                                                                                    onChange={(e) => handleEvaluateChange(indexQuestion, e.target.value)}
                                                                                />

                                                                                <button
                                                                                    className="btn btn-outline-danger btn-xs p-0 px-1"
                                                                                    style={{marginLeft: "25%"}}
                                                                                    onClick={() => handleRemoveItem(indexQuestion)}
                                                                                >
                                                                                    <i className="bi bi-trash"></i>
                                                                                </button>
                                                                            </div>

                                                                            <div
                                                                                className="d-flex justify-content-between align-items-center w-100">
                                                                            <span
                                                                                className="m-0 text-secondary text-truncate">Question from {item.categoryName} and {item.includeSubCategories ? '' : 'not'} include sub categories
                                                                            </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>

                                                                }
                                                            </ol>
                                                        </div>

                                                    )
                                                }
                                            })
                                        }
                                        <button type="button" className="btn btn-primary mb-1" data-bs-toggle="modal"
                                                data-bs-target="#staticBackdrop"
                                        >Add Question
                                        </button>
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
        );
    } else {
        return (
            <div>
                <Login path={"/new-quiz"}></Login>
            </div>
        );
    }
}

export default NewQuiz;