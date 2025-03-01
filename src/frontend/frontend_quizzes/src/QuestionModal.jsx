import React, {useEffect, useState} from "react";
import axios from "axios";

const QuestionModal = ({
    pageNum,
    categorySelect,
    handleAddItem
}) => {
    const [addedQuestions, setAddedQuestions] = useState({categoryId: 1, categoryName: "supercategory", type: "random", questionType:"All", includeSubCategories: true, questions: []});
    const [questions, setQuestions] = useState([]);
    const [typeQuestionSelected, setTypeQuestionSelected] = useState(1);

    useEffect(() => {
    if (addedQuestions.type === "random") {
        setAddedQuestions((prevState) => ({
            ...prevState,
            questions: {
                count: 1,
                evaluation: 1
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
                    { params: { includeSubCat: addedQuestions.includeSubCategories, typeQuestionSelected: typeQuestionSelected } }
                );
                setQuestions(response.data.questions);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchQuestions();
    }
}, [pageNum, addedQuestions.categoryId, addedQuestions.includeSubCategories, typeQuestionSelected]);

    const handleCheckBoxQuestions = (question) => {
    setAddedQuestions((prevState) => {
        const questionsArray = Array.isArray(prevState.questions) ? prevState.questions : [];

        const isAlreadySelected = questionsArray.some(q => q.id === question.id);

        return {
            ...prevState,
            questions: isAlreadySelected
                ? questionsArray.filter(q => q.id !== question.id)
                : [
                    ...questionsArray,
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
    const questionTypes = ["","All", "Matching Question", "Short Question", "Multiple Choice"]

    return (
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static"
             data-bs-keyboard="false" tabIndex="-1"
             aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="btn btn-primary"
                                data-bs-dismiss="modal"
                                disabled={addedQuestions.questions?.length === 0 && addedQuestions.type === "questions"}
                                onClick={() => {
                                    setTimeout(() => {
                                        handleAddItem(addedQuestions);
                                        setAddedQuestions({
                                            categoryId: 1,
                                            categoryName: "supercategory",
                                            type: "random",
                                            includeSubCategories: true,
                                            questionType: "All",
                                            questions: {count: 1}
                                        })
                                    }, 0);
                                }}
                        >Add
                        </button>
                        <button type="button" className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <label htmlFor="select-category">Category</label>
                        <select
                            id="select-category"
                            className="form-select mb-3"
                            value={addedQuestions.categoryId || ""}
                            onChange={(e) => {
                                const selectedOption = categorySelect.find(
                                    (cat) => cat.id === parseInt(e.target.value)
                                );

                                setAddedQuestions((prevState) => ({
                                    ...prevState,
                                    categoryId: selectedOption.id,
                                    categoryName: selectedOption.title
                                }));

                            }}
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {Array.isArray(categorySelect) &&
                                categorySelect.map((cat) => (
                                    <option key={cat.id} value={cat.id || ""}>
                                        {cat.title}
                                    </option>
                                ))}
                        </select>

                        <label htmlFor="select-type">Type of question</label>
                        <select
                            id="select-type"
                            className="form-select mb-3"
                            value={typeQuestionSelected}
                            onChange={(e) => {
                                const selectedIndex = e.target.selectedIndex;
                                const selectedType = questionTypes[selectedIndex];

                                setAddedQuestions((prevState) => ({
                                    ...prevState,
                                    questionType: selectedType
                                }));
                                setTypeQuestionSelected(e.target.value);
                            }
                            }
                        >
                            {
                             questionTypes.map((type, index) => {
                                 if (index === 0) {
                                     return (
                                     <option value="" disabled>
                                         Select type of question
                                     </option>
                                     )
                                 }else{
                                     return (
                                         <option key={"questionType" + index} value={index || ""}>
                                             {type}
                                         </option>
                                     )
                                 }
                                 }
                             )
                            }

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
                                    value={addedQuestions.questions?.count || "1"}
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
                                                                value={question.id || ""}
                                                                onChange={() => {
                                                                    handleCheckBoxQuestions(question);
                                                                }}
                                                                checked={Array.isArray(addedQuestions.questions) && addedQuestions.questions.some(q => q.id === question.id)}
                                                                aria-label="Checkbox for following text input"
                                                            />
                                                        </div>
                                                        <div
                                                            className="form-control bg-light d-flex align-items-center justify-content-between">
                                                            <a className="text-truncate" href="#">{question.title}</a>

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
                                disabled={addedQuestions.questions?.length === 0 && addedQuestions.type === "questions"}
                                onClick={() => {
                                    setTimeout(() => {
                                        handleAddItem(addedQuestions);
                                        setAddedQuestions({
                                            categoryId: 1,
                                            categoryName: "supercategory",
                                            type: "random",
                                            questionType: "All",
                                            includeSubCategories: true,
                                            questions: {count: 1}
                                        })
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
