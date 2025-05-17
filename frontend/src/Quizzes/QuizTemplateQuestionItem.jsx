import React from "react";

const QuizTemplateQuestionItem = ({ type ,indexQuestion, handleOrderChangeItem, sections, pageNum, item, handleEvaluateChange, handleRemoveItem}) => {

        const questionTypesHuman = {"matching_answer_question": "Matching Question", "short_answer_question" : "Short Question", "multiple_answer_question": "Multiple Choice"};

        if (type === "header"){
            return (
                <li className="list-group-item fw-bold">
                    <div className="row text-center w-100">
                        <div className="col-3 col-md-1">Order</div>
                        <div className="col-5 col-md-5">Question</div>
                        <div className="col-3 col-md-5">Weight</div>
                        <div className="col-1 col-md-1 text-end">Remove</div>
                    </div>
                </li>
            )
        }

    if (type === "question") {
        return (
            <li key={indexQuestion} className="list-group-item">
                <div className="row align-items-center w-100">
                    <div className="col-auto d-flex flex-column align-items-center">
                        <button
                            className="btn btn-outline-secondary btn-sm p-0"
                            onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                            disabled={indexQuestion === 0}
                            style={{width: "30px", height: "25px"}}
                        >
                            <i className="bi bi-arrow-up"></i>
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm p-0 mt-1"
                            onClick={() => handleOrderChangeItem(indexQuestion, "down")}
                            disabled={indexQuestion === sections[pageNum - 2].questions.length - 1}
                            style={{width: "30px", height: "25px"}}
                        >
                            <i className="bi bi-arrow-down"></i>
                        </button>
                    </div>

                    <div className="col w-100">
                        <div className="row align-items-center">
                            <div className="col-md-6 d-flex align-items-center">
                                <h2 className="h5 text-start text-truncate mb-0">
                                    <a href="#" className="text-decoration-none me-1">
                                        {item.title || "No title available"}
                                    </a>
                                </h2>
                                <span className="badge text-bg-primary rounded-pill flex-shrink-0">
                        {questionTypesHuman[item.type] || item.type}
                    </span>
                            </div>

                            <div className="col-md-1 offset-md-2">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="1"
                                    value={item.evaluation}
                                    onChange={(e) => handleEvaluateChange(indexQuestion, e.target.value)}
                                />
                            </div>


                            <div className="col-md-3 text-end">
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveItem(indexQuestion)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div className="row" style={{maxWidth: "390px"}}>
                            <div className="col">
                                <p className="m-0 text-truncate">{item.text}</p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                    <span className="text-secondary text-truncate">
                        Last updated {item.dateCreated} by {item.author}
                    </span>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        )
    } else {

        return (
            <li key={indexQuestion}
                className="list-group-item">
                <div className="row w-100">
                    <div className="col-auto d-flex flex-column align-items-center">
                        <button
                            className="btn btn-outline-secondary btn-sm p-0"
                            onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                            disabled={indexQuestion === 0}
                            style={{width: "30px", height: "25px"}}
                        >
                            <i className="bi bi-arrow-up"></i>
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm p-0 mt-1"
                            onClick={() => handleOrderChangeItem(indexQuestion, "down")}
                            disabled={indexQuestion === sections[pageNum - 2].questions.length - 1}
                            style={{width: "30px", height: "25px"}}
                        >
                            <i className="bi bi-arrow-down"></i>
                        </button>
                    </div>

                    <div className="col w-100">
                        <div className="row align-items-center">
                            <div className="col-md-6 d-flex align-items-center">
                                <h2 className="h5 text-start text-truncate mb-0">
                                    <a href="#" className="text-decoration-none me-1">
                                        Random Question
                                    </a>
                                </h2>
                                <span className="badge text-bg-primary rounded-pill flex-shrink-0">
                        {item.questionAnswerType}
                    </span>
                            </div>


                            <div className="col-md-1 offset-md-2">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="1"
                                    value={item.evaluation}
                                    onChange={(e) => handleEvaluateChange(indexQuestion, e.target.value)}
                                />
                            </div>

                            <div className="col-md-3 text-end">
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveItem(indexQuestion)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>

                            <div className="row">
                                <div className="col">
                    <span className="text-secondary text-truncate">
                        Question from {item.categoryName} {item.includeSubCategories ? '' : 'not'} including subcategories
                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            )
    }
}

export default QuizTemplateQuestionItem;