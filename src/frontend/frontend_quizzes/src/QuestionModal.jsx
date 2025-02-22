import React, {useEffect, useState} from "react";
import axios from "axios";

const QuestionModal = ({
    pageNum,
    copyOfSections,
    categorySelect,
    setCopyOfSections,
    setSections
}) => {
    const [addedQuestions, setAddedQuestions] = useState({categoryId: 1, type: "random", includeSubCategories: true});
    const [questions, setQuestions] = useState([]);
    console.log(addedQuestions);

    useEffect(() => {
    if (addedQuestions.type === "random") {
        setAddedQuestions((prevState) => ({
            ...prevState,
            questions: {
                count: 1,
            }
        }));
    }else{
        setAddedQuestions((prevState) => ({
            ...prevState,
            questions: []
        }));
    }
}, [addedQuestions.type]);

    useEffect(() => {
    if (pageNum - 2 >= 0) {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:5000/api/get_questions_category/${addedQuestions.categoryId}`,
                    { params: { includeSubCat: addedQuestions.includeSubCategories } }
                );
                setQuestions(response.data.questions);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchQuestions();
    }
}, [pageNum, addedQuestions.categoryId, addedQuestions.includeSubCategories]);

    const handleCheckBoxQuestions = (question) => {
    setAddedQuestions((prevState) => {
        // Uistíme sa, že questions je pole pred použitím .some()
        const questionsArray = Array.isArray(prevState.questions) ? prevState.questions : [];

        const isAlreadySelected = questionsArray.some(q => q.id === question.id);

        return {
            ...prevState,
            questions: isAlreadySelected
                ? questionsArray.filter(q => q.id !== question.id) // Ak už je zaškrtnutá, odstránime ju
                : [
                    ...questionsArray, // Inak ju pridáme
                    {
                        id: question.id,
                        title: question.title,
                        type: question.type,
                        evaluation: 1,
                        dateCreated: question.dateCreated,
                        author: question.authorName
                    }
                ]
        };
    });
};

        console.log(questions);
    return (
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static"
             data-bs-keyboard="false" tabIndex="-1"
             aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5"
                            id="staticBackdropLabel">{pageNum - 1}</h1>
                        <button type="button" className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <label htmlFor="select-category">Category</label>
                        <select
                            id="select-category"
                            className="form-select"
                            value={addedQuestions.categoryId || ""}
                            onChange={(e) => {
                                const selectedOption = categorySelect.find(
                                    (cat) => cat.id === parseInt(e.target.value)
                                );

                                setAddedQuestions((prevState) => ({
                                    ...prevState,
                                    categoryId: selectedOption.id
                                }));

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
                                checked={addedQuestions.includeSubCategories || addedQuestions.categoryId === 1}
                                disabled={addedQuestions.categoryId === 1}
                                onChange={(e) => {
                                    setAddedQuestions((prevState) => ({
                                            ...prevState,
                                            includeSubCategories: e.target.checked
                                        }));
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
                                   checked={addedQuestions.type === "random"}
                                   onChange={(e) => {
                                       setAddedQuestions((prevState) => ({
                                            ...prevState,
                                            type: "random"
                                        }));
                                   }}/>
                            <label className="form-check-label"
                                   htmlFor="exampleRadios1">
                                Random Questions
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio"
                                   name="randomOrSelectQuestions"
                                   id="exampleRadios2" value="option2"
                                   checked={addedQuestions.type === "questions"}
                                   onChange={(e) => {
                                       setAddedQuestions((prevState) => ({
                                            ...prevState,
                                            type: "questions"
                                        }));
                                   }}/>
                            <label className="form-check-label"
                                   htmlFor="exampleRadios2">
                                Select Questions
                            </label>
                        </div>

                        {addedQuestions.type === "random" && (
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
                                    value={addedQuestions.questions?.count}
                                    onChange={(e) => {
                                        setAddedQuestions((prevState) => ({
                                            ...prevState,
                                            questions: {
                                                ...prevState.questions || {},
                                                count: e.target.value
                                            }
                                        }));
                                    }}
                                />
                            </div>
                        )}

                        {addedQuestions.type === "questions" && (
                            <div>
                                <details>
                                    <summary>Questions</summary>
                                    <div>
                                        <label>Questions</label>
                                        {Array.isArray(questions) && questions.length > 0 ? (
                                            <div>
                                                {questions.map((question) => (
                                                    <div key={question.id} className="input-group mb-3">
                                                        <div className="input-group-text">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input mt-0"
                                                                id={`question-${question.id}`}
                                                                value={question.id}
                                                                onChange={() => {
                                                                    handleCheckBoxQuestions(question);
                                                                }}
                                                                checked={Array.isArray(addedQuestions.questions) && addedQuestions.questions.some(q => q.id === question.id)}
                                                                aria-label="Checkbox for following text input"
                                                            />
                                                        </div>
                                                        <div
                                                            className="form-control bg-light d-flex align-items-center justify-content-between">
                                                            <a className="text-truncate" href = "#">{question.title}</a>

                                                            <span
                                                                className="input-group-text badge text-bg-primary rounded-pill flex-shrink-0">
                                                                {question.type}
                                                              </span>
                                                        </div>

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
                                disabled={addedQuestions.length === 0 && copyOfSections[pageNum - 2]?.randomQuestions === "questions"}
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
    );
};

export default QuestionModal;
