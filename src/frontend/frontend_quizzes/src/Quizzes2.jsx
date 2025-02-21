import React, {useEffect, useState} from 'react';
import Navigation from "./Navigation";
import QuestionModal from "./QuestionModal";
import Login from "./Login";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

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

    const [categorySelect, setCategorySelect] = useState([{id: "1", title:"All"}]);

     const [copyOfSections, setCopyOfSections] = useState([{
        sectionId: 1,
        shuffle:false,
        questions:[],
        categoryId: 1,
        categoryName: "supercategory",
        includeSubCategories: true,
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
        includeSubCategories: true,
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
        setPageNum(index);
        setSections((prevSections) => [
        ...prevSections,
        {
            sectionId: prevSections.length + 1,
            shuffle: false,
            categoryId: 1,
            categoryName: "supercategory",
            includeSubCategories: true,
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
            includeSubCategories: true,
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
            setCategorySelect(prevCategories => [
                  { id: 1, title: "All" },
                  ...response.data
                ]);
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
                        : [...section.questions, { id: question.id, title: question.title, type: question.type, evaluation:1, dateCreated: question.dateCreated, author: question.authorName }]
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
    const handleOrderChange = (index, direction) => {
        const updatedQuestions = [...copyOfSections[pageNum - 2].questions];

          if (updatedQuestions.length <= 1) {
              return;
          }

          const currentQuestion = updatedQuestions[index];

          if (direction === "up" && index > 0) {
              updatedQuestions[index] = updatedQuestions[index - 1];
            updatedQuestions[index - 1] = currentQuestion;
          }
          else if (direction === "down" && index < updatedQuestions.length - 1) {
              updatedQuestions[index] = updatedQuestions[index + 1];
            updatedQuestions[index + 1] = currentQuestion;
          }

          setCopyOfSections(prevSections => {
            const newSections = [...prevSections];
            newSections[pageNum - 2].questions = updatedQuestions;
            return newSections;
          });
        };

    function handleEvaluateChange(index, newValue) {
        const updatedSections = [...sections];
        updatedSections[pageNum - 2].questions[index].evaluation = parseInt(newValue, 10);
        setSections(updatedSections);
    }


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
                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                <li className="nav-item" role="presentation">
                                    <button className="nav-link active" id="home-tab" data-bs-toggle="tab"
                                            data-bs-target="#home-tab-pane" type="button" role="tab"
                                            aria-controls="home-tab-pane" aria-selected="true"
                                            onClick={() => setPageNum(1)}>Quiz Settings
                                    </button>
                                </li>
                                {Array.from({length: pageCount - 2}, (_, index) => (
                                    <li className="nav-item" role="presentation" key={index+2}>
                                        <button
                                            className={`nav-link ${index+2 === pageNum ? "active" : ""}`}
                                            id={`tab-${index+2}`}
                                            data-bs-toggle="tab"
                                            data-bs-target={`#tab-pane-${index+2}`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`tab-pane-${index+2}`}
                                            aria-selected={index+2 === pageNum}
                                            onClick={() => {
                                                setPageNum(index + 2)
                                            }}
                                        >
                                            Section {index + 1}
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
                            </ul>

                            <div className="tab-content" id="myTabContent">
                                <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel"
                                     aria-labelledby="home-tab" tabIndex="0">
                                    <div>
                                        <h1 className="mb-3">Quiz Settings</h1>
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
                                            <label htmlFor="dateCheck" className="form-label">The quiz can be reviewed
                                                from</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control form-control-sm w-25"
                                                id="dateCheck"
                                                value={dateCheck}
                                                onChange={(e) => setDateCheck(e.target.value)}
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
                                </div>

                            </div>

                            {(pageNum > 1 && pageNum < pageCount) && (
                            <div className="tab-content mt-3">
                                    <div
                                        key={pageNum}
                                        className={`tab-pane fade show active`}
                                        id={`tab-pane-${pageNum}`}
                                        role="tabpanel"
                                        aria-labelledby={`tab-${pageNum}`}
                                    >
                                        <h2>{sections[pageNum - 2]?.title}</h2>
                                        <input
                                            type="text"
                                            placeholder="Enter section title..."
                                            value={sections[pageNum - 2]?.title}
                                            onChange={
                                                handleTitle
                                            }
                                            className="form-control mt-2"
                                        />
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" value=""
                                                   checked={sections[pageNum - 2]?.shuffle} onChange={toggleShuffle}
                                                   id="shuffleSection"/>
                                            <label className="form-check-label" htmlFor="shuffleSection">
                                                Shuffle
                                            </label>
                                        </div>
                                        {sections[pageNum - 2]?.show === true && (
                                            <div>
                                                {sections[pageNum - 2]?.randomQuestions === "random" && (
                                                    <ul className="list-group list-group-flush">
                                                      <li className="list-group-item">{sections[pageNum - 2]?.shuffle ? (
                                                        <p>Section is shuffled</p>
                                                      ) : (
                                                        <p>Section is not shuffled</p>
                                                      )}</li>
                                                        <li className="list-group-item">
                                                            <p>Name of category is {sections[pageNum - 2]?.categoryName}</p>
                                                        </li>
                                                        <li className="list-group-item">{sections[pageNum - 2]?.includeSubCategories ? (
                                                        <p>Questions are included from subcategories</p>
                                                      ) : (
                                                        <p>Questions are not included from subcategories</p>
                                                      )}</li>
                                                      <li className="list-group-item"><p>Number of questions is {sections[pageNum - 2]?.questionsCount}</p></li>

                                                    </ul>
                                                )}

                                                {sections[pageNum - 2]?.randomQuestions === "questions" && (
                                                    <div>
                                                        <ol className="list-group">
                                                            <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                                                                <div className="d-flex" style={{width: "80px"}}>Order
                                                                </div>
                                                                <div className="d-flex"
                                                                     style={{width: "200px"}}>Question
                                                                </div>
                                                                <div className="d-flex" style={{width: "80px"}}>Weight
                                                                </div>
                                                                <div className="d-flex justify-content-end"
                                                                     style={{width: "50px"}}>Remove
                                                                </div>
                                                            </li>
                                                            {
                                                                sections[pageNum - 2]?.questions.map((question, index) => (

                                                                    <li key={index}
                                                                        className="list-group-item d-flex justify-content-between align-items-start">
                                                                        <div className="d-flex flex-column">
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm p-0"
                                                                                onClick={() => handleOrderChange(index, "up")}
                                                                                style={{width: "30px", height: "25px"}}
                                                                            >
                                                                                <i className="bi bi-arrow-up"></i>
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-outline-secondary btn-sm p-0 mt-1"
                                                                                onClick={() => handleOrderChange(index, "down")}
                                                                                style={{width: "30px", height: "25px"}}
                                                                            >
                                                                                <i className="bi bi-arrow-down"></i>
                                                                            </button>
                                                                        </div>
                                                                        <div
                                                                            className="ms-2 me-auto text-truncate text-start w-100 ">
                                                                            <div
                                                                                className="d-flex">
                                                                                <div
                                                                                    className="d-flex align-items-center" style={{width:"600px"}}>
                                                                                    <h2 className="h5 text-start text-truncate">
                                                                                        <a href="#"
                                                                                           className="text-decoration-none me-1">
                                                                                            {question.title || "No title available"}
                                                                                        </a>
                                                                                    </h2>
                                                                                    <span
                                                                                        className="badge text-bg-primary rounded-pill flex-shrink-0 align-self-start">{question.type}
                                                                                </span>
                                                                                </div>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm "
                                                                                    style={{ width: "50px"}}
                                                                                    min="1"
                                                                                    value={question.evaluation}
                                                                                    onChange={(e) => handleEvaluateChange(index, e.target.value)}
                                                                                />

                                                                                <button
                                                                                    className="btn btn-outline-danger btn-xs p-0 px-1"
                                                                                    style={{marginLeft:"220px"}}
                                                                                    onClick={() => handleRemoveQuestion(index)}
                                                                                >
                                                                                    <i className="bi bi-trash"></i>
                                                                                </button>
                                                                            </div>
                                                                            <div
                                                                                className="d-flex justify-content-between align-items-center w-100">
                                                                                <p className="m-0 text-truncate">{question.text}</p>
                                                                            </div>
                                                                            <div
                                                                                className="d-flex justify-content-between align-items-center w-100">
                                                                            <span
                                                                                className="m-0 text-secondary text-truncate">Last updated {question.dateCreated} by {question.author}
                                                                            </span>
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
                                        <QuestionModal
                                            pageNum={pageNum}
                                            copyOfSections={copyOfSections}
                                            categorySelect={categorySelect}
                                            questions={questions}
                                            handleCheckBoxQuestions={handleCheckBoxQuestions}
                                            setCopyOfSections={setCopyOfSections}
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
                <Login path={"/quizzes"}></Login>
            </div>
        );
    }
}

export default Quizzes2;