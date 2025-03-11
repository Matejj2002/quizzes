import React from "react";

const QuizTemplateQuestionItem = ({ type ,indexQuestion, handleOrderChangeItem, sections, pageNum, item, handleEvaluateChange, handleRemoveItem}) => {

        const questionTypesHuman = {"matching_answer_question": "Matching Question", "short_answer_question" : "Short Question", "multiple_answer_question": "Multiple Choice"};

        if (type === "header"){
            return (
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
            )
        }

    if (type === "question") {
        return (
            <li key={indexQuestion}
                className="list-group-item d-flex justify-content-between align-items-start">
                <div className="d-flex flex-column"
                     style={{width: "5%"}}>
                    <button
                        className="btn btn-outline-secondary btn-sm p-0"
                        onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                        disabled={indexQuestion === 0}
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
                            disabled={indexQuestion === sections[pageNum - 2].questions.length - 1}
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
                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                    <a href="#"
                                       className="text-decoration-none me-1">
                                        {item.title || "No title available"}
                                    </a>
                                </h2>
                                <span
                                    className="badge text-bg-primary rounded-pill flex-shrink-0 align-self-start">{questionTypesHuman[item.type] || item.type}
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
            )
        }else {

            return (
                <li key={indexQuestion}
                    className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="d-flex flex-column"
                         style={{width: "5%"}}>
                        <button
                            className="btn btn-outline-secondary btn-sm p-0"
                            onClick={() => handleOrderChangeItem(indexQuestion, "up")}
                            disabled={indexQuestion === 0}
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
                            disabled={indexQuestion === sections[pageNum - 2].questions.length - 1}
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
                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
            )
        }
}

export default QuizTemplateQuestionItem;