import React, {useEffect, useState} from 'react';
import Navigation from "./Navigation";
import Section from "./Section";
import QuestionModal from "./QuestionModal";
import Login from "./Login";
import axios from "axios";

const Quizzes2 = () => {
    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState(3);

    const [quizTitle, setQuizTitle] = useState("");
    const [randomOrder, setRandomOrder] = useState(false);
    const [numberOfCorrections, setNumberOfCorrections] = useState(0);
    const [minutesToFinish, setMinutesToFinish] = useState(1);
    const [dateOpen, setDateOpen] = useState("");
    const [dateClose, setDateClose] = useState("");
    const [dateCheck, setDateCheck] = useState("");
    const [shuffleSections, setShuffleSections] = useState(false);

    const [categorySelect, setCategorySelect] = useState("");

     const [copyOfSection, setCopyOfSection] = useState([{
         sectionId: 1,
            shuffle: false,
            categoryId: 1,
            categoryName: "supercategory",
            includeSubCategories: false,
            randomQuestions: "random",
            questionsCount: 1,
            questions: [],
            show : false
     }]);

    const [sections, setSections] = useState([{
        sectionId: 1,
        shuffle:false,
        questions:[],
        categoryId: 1,
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
                                            id="randomOrder"
                                            checked={randomOrder}
                                            onChange={(e) => setRandomOrder(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="randomOrder">
                                            Randomize questions order
                                        </label>
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
                                        <label htmlFor="dateCheck" className="form-label">Check the quiz</label>
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
                                    <h2>Section {pageNum - 1}</h2>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value=""
                                               checked={sections[pageNum - 2]["shuffle"]} onChange={toggleShuffle}
                                               id="shuffleSection"/>
                                        <label className="form-check-label" htmlFor="shuffleSection">
                                            Shuffle
                                        </label>
                                    </div>
                                    {sections[pageNum-2]["show"] === true && (
                                        <div>
                                            {sections[pageNum-2]["randomQuestions"] === "random" && (
                                                <div>
                                                    <strong>Shuffle
                                                        questions: </strong>{sections[pageNum - 2]["shuffle"] ? 'true' : 'false'}<br/>
                                                    <strong>Category: </strong>{sections[pageNum - 2]["categoryName"]}<br/>
                                                    <strong>Include
                                                        subcategories: </strong>{sections[pageNum - 2]["categoryId"] ? 'true' : 'false'}<br/>
                                                    <strong>Number of questions: </strong>{sections[pageNum - 2]["questionsCount"]}<br/>
                                                </div>
                                            )}

                                            {sections[pageNum-2]["randomQuestions"] === "questions" && (
                                                <p>questions</p>
                                            )}
                                        </div>
                                    )}
                                    <button type="button" className="btn btn-primary mb-1" data-bs-toggle="modal"
                                            data-bs-target="#staticBackdrop"
                                            onClick={()=>{
                                                setCopyOfSection(sections[pageNum-2]);
                                                console.log(copyOfSection);

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
                                                        value={sections[pageNum - 2]["categoryId"] || ""}
                                                        onChange={(e) => {
                                                            const selectedOption = categorySelect.find(
                                                                (cat) => cat.id === parseInt(e.target.value)
                                                            );
                                                            const updatedSections = [...sections];
                                                            updatedSections[pageNum - 2] = {
                                                                ...updatedSections[pageNum - 2],
                                                                categoryId: selectedOption.id,
                                                                categoryName: selectedOption.title,
                                                            };
                                                            setSections(updatedSections);

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
                                                            checked={sections[pageNum - 2]["includeSubCategories"]}
                                                            onChange={(e) => {
                                                                const updatedSections = [...sections];
                                                                updatedSections[pageNum - 2] = {
                                                                    ...updatedSections[pageNum - 2],
                                                                    includeSubCategories: e.target.checked
                                                                };
                                                                setSections(updatedSections);
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
                                                               checked={sections[pageNum-2]["randomQuestions"] === "random"}
                                                               onChange={(e) => {
                                                                   const updatedSections = [...sections];
                                                                    updatedSections[pageNum - 2] = {
                                                                        ...updatedSections[pageNum - 2],
                                                                        randomQuestions: "random"
                                                                    };
                                                                    setSections(updatedSections);
                                                               }}/>
                                                        <label className="form-check-label" htmlFor="exampleRadios1">
                                                            Random Questions
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="radio"
                                                               name="randomOrSelectQuestions"
                                                               id="exampleRadios2" value="option2"
                                                               checked={sections[pageNum-2]["randomQuestions"] === "questions"}
                                                               onChange={(e) => {
                                                                   const updatedSections = [...sections];
                                                                    updatedSections[pageNum - 2] = {
                                                                        ...updatedSections[pageNum - 2],
                                                                        randomQuestions: "questions"
                                                                    };
                                                                    setSections(updatedSections);
                                                               }}/>
                                                        <label className="form-check-label" htmlFor="exampleRadios2">
                                                            Select Questions
                                                        </label>
                                                    </div>

                                                    {sections[pageNum-2]["randomQuestions"] === "random" && (
                                                        <div className="mb-3">
                                                            <label htmlFor="randomQuestionsCount" className="form-label">
                                                                Random questions count
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control w-25"
                                                                id="randomQuestionsCount"
                                                                placeholder="Enter count"
                                                                min="1"
                                                                max="500"
                                                                value={sections[pageNum-2]["questionsCount"]}
                                                                onChange={(e) => {
                                                                    const updatedSections = [...sections];
                                                                    updatedSections[pageNum - 2] = {
                                                                        ...updatedSections[pageNum - 2],
                                                                        questionsCount: parseInt(e.target.value)
                                                                    };
                                                                    setSections(updatedSections);
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {sections[pageNum-2]["randomQuestions"] === "questions" && (
                                                        <div>

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
                                                                const updatedSections = [...sections];
                                                                    updatedSections[pageNum - 2] = {
                                                                        ...updatedSections[pageNum - 2],
                                                                        show: true
                                                                    };
                                                                    setSections(updatedSections);
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
                                    <h2>Posledna</h2>
                                    <button className="btn btn-outline-primary"
                                            onClick={() => {
                                                setPageCount(pageCount + 1);
                                                addPage(pageCount);
                                            }}>Pridaj sekciu
                                    </button>
                                </div>
                            )}

                            <ul className="pagination">
                                {Array.from({length: pageCount}, (_, index) => (
                                    <li className={`page-item ${pageNum === index + 1 ? 'active' : ''}`} key={index}>
                                        <button
                                            className="page-link"
                                            onClick={() => setPageNum(index+1)}
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