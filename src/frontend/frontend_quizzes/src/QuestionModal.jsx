import React, {useState} from "react";

const QuestionModal = ({
    pageNum,
    copyOfSections,
    categorySelect,
    questions,
    handleCheckBoxQuestions,
    setCopyOfSections,
    setSections
}) => {
    const [addedQuestions, setAddedQuestions] = useState([]);


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
                            value={copyOfSections[pageNum - 2]?.categoryId || ""}
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
                                checked={copyOfSections[pageNum - 2]?.includeSubCategories || copyOfSections[pageNum - 2]?.categoryId === 1}
                                disabled={copyOfSections[pageNum - 2]?.categoryId === 1}
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
                                   checked={copyOfSections[pageNum - 2]?.randomQuestions === "random"}
                                   onChange={(e) => {
                                       const updatedSections = [...copyOfSections];
                                       updatedSections[pageNum - 2] = {
                                           ...updatedSections[pageNum - 2],
                                           randomQuestions: "random"
                                       };
                                       setCopyOfSections(updatedSections);
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
                                   checked={copyOfSections[pageNum - 2]?.randomQuestions === "questions"}
                                   onChange={(e) => {
                                       const updatedSections = [...copyOfSections];
                                       updatedSections[pageNum - 2] = {
                                           ...updatedSections[pageNum - 2],
                                           randomQuestions: "questions"
                                       };
                                       setCopyOfSections(updatedSections);
                                   }}/>
                            <label className="form-check-label"
                                   htmlFor="exampleRadios2">
                                Select Questions
                            </label>
                        </div>

                        {copyOfSections[pageNum - 2]?.randomQuestions === "random" && (
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
                                    value={copyOfSections[pageNum - 2]?.questionsCount}
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

                        {copyOfSections[pageNum - 2]?.randomQuestions === "questions" && (
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
                                                                    setAddedQuestions(prevQuestions => [
                                                                        ...prevQuestions,
                                                                        {title: question.title, id: question.id}
                                                                    ]);
                                                                }}
                                                                checked={copyOfSections[pageNum - 2]?.questions.some(q => q.id === question.id)}
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
