import React, {useEffect, useState} from 'react';
import Navigation from "./Navigation";
import Section from "./Section";
import QuestionModal from "./QuestionModal";
import Login from "./Login";
import axios from "axios";

const Quizzes2 = () => {
    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState(3);

    const [questions, setQuestions] = useState([]);

    const [quizTitle, setQuizTitle] = useState("");
    const [randomOrder, setRandomOrder] = useState(false);
    const [numberOfCorrections, setNumberOfCorrections] = useState(0);
    const [minutesToFinish, setMinutesToFinish] = useState(1);
    const [dateOpen, setDateOpen] = useState("");
    const [dateClose, setDateClose] = useState("");
    const [dateCheck, setDateCheck] = useState("");
    const [shuffleSections, setShuffleSections] = useState(false);

    const [categorySelect, setCategorySelect] = useState("");

     const [copyOfSections, setCopyOfSections] = useState([{
        sectionId: 1,
        shuffle:false,
        questions:[],
        categoryId: 1,
        categoryName: "supercategory",
        includeSubCategories: false,
        randomQuestions: "random",
         title: "Section 1",
        questionsCount: 1,
        show : false
    }]);

    const [sections, setSections] = useState([{
        sectionId: 1,
        shuffle:false,
        questions:[],
        categoryId: 1,
        title: "Section 1",
        categoryName: "supercategory",
        includeSubCategories: false,
        randomQuestions: "random",
        questionsCount: 1,
        show : false
    }]);


    const [selectedOption, setSelectedOption] = useState("option1");

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

    const addPage = (index) =>{
        setPageNum(index + 1);
        setSections((prevSections) => [
        ...prevSections,
        {
            sectionId: prevSections.length + 1,
            shuffle: false,
            categoryId: 1,
            categoryName: "supercategory",
            includeSubCategories: false,
            randomQuestions: "random",
            title: "Section " + (prevSections.length + 1),
            questionsCount: 1,
            questions: [],
            show : false
        }])

        setCopyOfSections((prevSections) => [
        ...prevSections,
        {
            sectionId: prevSections.length + 1,
            shuffle: false,
            categoryId: 1,
            categoryName: "supercategory",
            includeSubCategories: false,
            randomQuestions: "random",
            title: "Section "+ (prevSections.length + 1),
            questionsCount: 1,
            questions: [],
            show : false
        }
    ]);
    }

    const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-category-tree-array`)
            setCategorySelect(response.data);
      }catch (error){}
       finally {}
    }

    const handleCheckBoxQuestions = (question) => {
    setCopyOfSections((prevSections) => {
        return prevSections.map((section, index) => {
            if (index === pageNum - 2) {
                const isAlreadySelected = section.questions.some(q => q.id === question.id);

                return {
                    ...section,
                    questions: isAlreadySelected
                        ? section.questions.filter(q => q.id !== question.id)
                        : [...section.questions, { id: question.id, title: question.title, type: question.type, dateCreated: question.dateCreated, author: question.authorName }]
                };
            }
            return section;
        });
    });
};

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

    useEffect(() => {
    if (pageNum - 2 >= 0 && sections[pageNum - 2]) {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/api/get_questions_category/${copyOfSections[pageNum - 2].categoryId}`,
                    { params: { includeSubCat: copyOfSections[pageNum - 2].includeSubCategories } }
                );
                setQuestions(response.data.questions);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchQuestions();
    }
}, [sections, pageNum, copyOfSections[pageNum-2]?.categoryId, copyOfSections[pageNum-2]?.includeSubCategories]);

    function handleRemoveQuestion(index) {
        sections[pageNum - 2].questions.splice(index, 1);
        setSections([...sections]);
    }
    function handleOrderChange(index, newValue) {
        const updatedSections = [...sections];
        updatedSections[pageNum - 2].questions[index].order = parseInt(newValue, 10);
        setSections(updatedSections);
    }

    function handleEvaluateChange(index, newValue) {
        const updatedSections = [...sections];
        updatedSections[pageNum - 2].questions[index].evaluation = parseInt(newValue, 10);
        setSections(updatedSections);
    }

    // console.log(sections);

    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
                </header>
                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    <div className="row">
                        <div className="col-2 sidebar">
                        </div>
                        <div className="col-8">
                            {pageNum === 1 && (
                                <div>
                                    <h1>Quiz Settings</h1>
                                    <div className="mb-3">
                                        <label htmlFor="QuizTitle" className="form-label">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="QuizTitle"
                                            placeholder="Quiz title"
                                            value={quizTitle}
                                            onChange={(e) => setQuizTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-check">
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
                                            Number of corrections per attempt
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
                                            onChange={(e) => setDateOpen(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="dateClose" className="form-label">Close the quiz</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control form-control-sm w-25"
                                            id="dateClose"
                                            value={dateClose}
                                            onChange={(e) => setDateClose(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="dateCheck" className="form-label">The quiz can be reviewed from</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control form-control-sm w-25"
                                            id="dateCheck"
                                            value={dateCheck}
                                            onChange={(e) => setDateCheck(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="independentAttempts"
                                               id="exampleRadios1" value="option1"
                                               checked={selectedOption === "option1"}
                                               onChange={(e) => setSelectedOption(e.target.value)}/>
                                        <label className="form-check-label" htmlFor="exampleRadios1">
                                            Attempts are independent
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="independentAttempts"
                                               id="exampleRadios2" value="option2"
                                               checked={selectedOption === "option2"}
                                               onChange={(e) => setSelectedOption(e.target.value)}/>
                                        <label className="form-check-label" htmlFor="exampleRadios2">
                                            Attempts are corrections of previous attempt
                                        </label>
                                    </div>
                                </div>
                            )}

                            {(pageNum > 1 && pageNum < pageCount) && (
                                <div>
                                    <h2>{sections[pageNum - 2]["title"]}</h2>
                                    <input
                                        type="text"
                                        placeholder="Enter section title..."
                                        value={sections[pageNum-2]["title"]}
                                        onChange={
                                            handleTitle
                                        }
                                        className="form-control mt-2"
                                    />
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value=""
                                               checked={sections[pageNum - 2]["shuffle"]} onChange={toggleShuffle}
                                               id="shuffleSection"/>
                                        <label className="form-check-label" htmlFor="shuffleSection">
                                            Shuffle
                                        </label>
                                    </div>
                                    {sections[pageNum - 2]["show"] === true && (
                                        <div>
                                            {sections[pageNum - 2]["randomQuestions"] === "random" && (
                                                <div>
                                                    <strong>Shuffle
                                                        questions: </strong>{sections[pageNum - 2]["shuffle"] ? 'true' : 'false'}<br/>
                                                    <strong>Category: </strong>{sections[pageNum - 2]["categoryName"]}<br/>
                                                    <strong>Include
                                                        subcategories: </strong>{sections[pageNum - 2]["includeSubCategories"] ? 'true' : 'false'}<br/>
                                                    <strong>Number of
                                                        questions: </strong>{sections[pageNum - 2]["questionsCount"]}<br/>
                                                </div>
                                            )}

                                            {sections[pageNum - 2]["randomQuestions"] === "questions" && (
                                                <div>
                                                    <ol className="list-group">
                                                        {
                                                            sections[pageNum - 2]?.questions.map((question, index) => (

                                                                <li key={index}
                                                                    className="list-group-item d-flex justify-content-between align-items-start">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm me-2"
                                                                        max={copyOfSections[pageNum - 2].questions.length}
                                                                        style={{width: "50px"}}
                                                                        value={question.order || index + 1}
                                                                        onChange={(e) => handleOrderChange(index, e.target.value)}
                                                                    />
                                                                    <div
                                                                        className="ms-2 me-auto text-truncate text-start w-100">
                                                                        <div
                                                                            className="d-flex justify-content-between align-items-center w-100">
                                                                            <h2 className="h5 text-start text-truncate">
                                                                                <a href="#"
                                                                                   className="text-decoration-none">
                                                                                    {question.title || "No title available"}
                                                                                </a>
                                                                            </h2>
                                                                            <span
                                                                                className="badge text-bg-primary rounded-pill flex-shrink-0">{question.type}
                                                        </span>
                                                                        </div>
                                                                        <div
                                                                            className="d-flex justify-content-between align-items-center w-100">
                                                                            <p className="m-0 text-truncate">{question.text}</p>
                                                                        </div>
                                                                        <div
                                                                            className="d-flex justify-content-between align-items-center w-100">
                                                        <span
                                                            className="m-0 text-secondary text-truncate">Last updated {question.dateCreated} by {question.author}</span><br/>
                                                                            <button
                                                                                className="btn btn-outline-danger btn-xs p-0 px-1 ms-1"
                                                                                style={{fontSize: "0.75rem"}}
                                                                                onClick={() => handleRemoveQuestion(index)}>
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))
                                                        }
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <button type="button" className="btn btn-primary mb-1" data-bs-toggle="modal"
                                            data-bs-target="#staticBackdrop"
                                            onClick={() => {
                                                setCopyOfSections(sections);
                                            }}

                                    >Add Question
                                    </button>
                                    <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static"
                                         data-bs-keyboard="false" tabIndex="-1"
                                         aria-labelledby="staticBackdropLabel" aria-hidden="true">
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h1 className="modal-title fs-5"
                                                        id="staticBackdropLabel">{pageNum - 1}</h1>
                                                    <button type="button" className="btn-close" data-bs-dismiss="modal"
                                                            aria-label="Close"></button>
                                                </div>
                                                <div className="modal-body">
                                                    <label htmlFor="select-category">Category</label>
                                                    <select
                                                        id="select-category"
                                                        className="form-select"
                                                        value={copyOfSections[pageNum - 2]["categoryId"] || ""}
                                                        onChange={(e) => {
                                                            const selectedOption = categorySelect.find(
                                                                (cat) => cat.id === parseInt(e.target.value)
                                                            );
                                                            const updatedSections = [...copyOfSections];
                                                            updatedSections[pageNum - 2] = {
                                                                ...updatedSections[pageNum - 2],
                                                                categoryId: selectedOption.id,
                                                                categoryName: selectedOption.title,
                                                            };
                                                            setCopyOfSections(updatedSections);

                                                        }}
                                                    >
                                                        <option value="" disabled>
                                                            Select a category
                                                        </option>
                                                        {Array.isArray(categorySelect) &&
                                                            categorySelect.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.title}
                                                                </option>
                                                            ))}
                                                    </select>

                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="includeSubcategories"
                                                            checked={copyOfSections[pageNum - 2]["includeSubCategories"]}
                                                            onChange={(e) => {
                                                                const updatedSections = [...copyOfSections];
                                                                updatedSections[pageNum - 2] = {
                                                                    ...updatedSections[pageNum - 2],
                                                                    includeSubCategories: e.target.checked
                                                                };
                                                                setCopyOfSections(updatedSections);
                                                            }
                                                            }
                                                        />
                                                        <label className="form-check-label"
                                                               htmlFor="includeSubcategories">
                                                            Include subcategories
                                                        </label>
                                                    </div>

                                                    <div className="form-check">
                                                        <input className="form-check-input" type="radio"
                                                               name="randomOrSelectQuestions"
                                                               id="exampleRadios1" value="option1"
                                                               checked={copyOfSections[pageNum - 2]["randomQuestions"] === "random"}
                                                               onChange={(e) => {
                                                                   const updatedSections = [...copyOfSections];
                                                                   updatedSections[pageNum - 2] = {
                                                                       ...updatedSections[pageNum - 2],
                                                                       randomQuestions: "random"
                                                                   };
                                                                   setCopyOfSections(updatedSections);
                                                               }}/>
                                                        <label className="form-check-label" htmlFor="exampleRadios1">
                                                            Random Questions
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="radio"
                                                               name="randomOrSelectQuestions"
                                                               id="exampleRadios2" value="option2"
                                                               checked={copyOfSections[pageNum - 2]["randomQuestions"] === "questions"}
                                                               onChange={(e) => {
                                                                   const updatedSections = [...copyOfSections];
                                                                   updatedSections[pageNum - 2] = {
                                                                       ...updatedSections[pageNum - 2],
                                                                       randomQuestions: "questions"
                                                                   };
                                                                   setCopyOfSections(updatedSections);
                                                               }}/>
                                                        <label className="form-check-label" htmlFor="exampleRadios2">
                                                            Select Questions
                                                        </label>
                                                    </div>

                                                    {copyOfSections[pageNum - 2]["randomQuestions"] === "random" && (
                                                        <div className="mb-3">
                                                            <label htmlFor="randomQuestionsCount"
                                                                   className="form-label">
                                                                Random questions count
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control w-25"
                                                                id="randomQuestionsCount"
                                                                placeholder="Enter count"
                                                                min="1"
                                                                max="500"
                                                                value={copyOfSections[pageNum - 2]["questionsCount"]}
                                                                onChange={(e) => {
                                                                    const updatedSections = [...copyOfSections];
                                                                    updatedSections[pageNum - 2] = {
                                                                        ...updatedSections[pageNum - 2],
                                                                        questionsCount: parseInt(e.target.value)
                                                                    };
                                                                    setCopyOfSections(updatedSections);
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {copyOfSections[pageNum - 2]["randomQuestions"] === "questions" && (
                                                        <div>
                                                            <details>
                                                                <summary>Questions</summary>
                                                                <div>
                                                                    <label>Questions</label>
                                                                    {Array.isArray(questions) && questions.length > 0 ? (
                                                                        <div>
                                                                            {questions.map((question) => (
                                                                                <div key={question.id}
                                                                                     className="flex items-center space-x-2 border border-2 border-primary p-3 mb-3">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        id={`question-${question.id}`}
                                                                                        value={question.id}
                                                                                        className="form-checkbox"
                                                                                        onChange={() => handleCheckBoxQuestions(question)}
                                                                                        checked={copyOfSections[pageNum - 2]?.questions.some(q => q.id === question.id)}

                                                                                    />
                                                                                    <label
                                                                                        htmlFor={`question-${question.id}`}>
                                                                                        <div
                                                                                            className="ms-2 me-auto text-start">
                                                                                            <div
                                                                                                className="d-flex align-items-center">
                                                                                                <h2 className="h5 text-start m-0"
                                                                                                    style={{minWidth: "200px"}}>
                                                                                                    <a href="#"
                                                                                                       className="text-decoration-none">
                                                                                                        {
                                                                                                            question.title?.length < 20
                                                                                                                ? question.title?.padEnd(20, ' ')
                                                                                                                : question.title?.substring(0, 20)
                                                                                                        }
                                                                                                    </a>
                                                                                                </h2>
                                                                                                <span
                                                                                                    className="badge text-bg-primary rounded-pill flex-shrink-0"
                                                                                                    style= {{marginLeft: "4rem"}}>
                                                                                                    {question.type}
                                                                                                </span>
                                                                                            </div>

                                                                                            <div
                                                                                                className="d-flex justify-content-between align-items-center w-100 mt-2">
                                                                                                <p className="m-0 text-truncate"
                                                                                                   style={{flexGrow: "1"}}>{question.text?.length < 40
                                                                                                                ? question.text?.padEnd(40, ' ')
                                                                                                                : question.text?.substring(0, 40)}
                                                                                                </p>
                                                                                            </div>

                                                                                            <div
                                                                                                className="d-flex justify-content-between align-items-center w-100 mt-2">
                                                                                                <span
                                                                                                    className="m-0 text-secondary text-truncate">Last updated {question.dateCreated} by {question.author}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p>No questions available</p>
                                                                    )}
                                                                </div>
                                                            </details>
                                                        </div>
                                                    )
                                                    }

                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-secondary"
                                                            data-bs-dismiss="modal">Close
                                                    </button>
                                                    <button type="button" className="btn btn-primary"
                                                            data-bs-dismiss="modal"
                                                            onClick={() => {
                                                                const updatedSections = [...copyOfSections];
                                                                updatedSections[pageNum - 2] = {
                                                                    ...updatedSections[pageNum - 2],
                                                                    show: true
                                                                };

                                                                setCopyOfSections(updatedSections);

                                                                setTimeout(() => {
                                                                    setSections(updatedSections);
                                                                }, 0);
                                                            }}
                                                    >Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {pageNum === pageCount && (
                                <div>
                                    <h2>Last Page</h2>
                                    <button className="btn btn-outline-primary"
                                            onClick={() => {
                                                setPageCount(pageCount + 1);
                                                addPage(pageCount);
                                            }}>Pridaj sekciu
                                    </button>
                                    <br/>
                                    <button className="btn btn-outline-success"
                                            onClick={() => {
                                            }}>Submit
                                    </button>
                                </div>
                            )}

                            <ul className="pagination">
                                {Array.from({length: pageCount}, (_, index) => (
                                    <li className={`page-item ${pageNum === index + 1 ? 'active' : ''}`} key={index}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPageNum(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>

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
                <Login path={"/quizzes"}></Login>
            </div>
        );
    }
}

export default Quizzes2;