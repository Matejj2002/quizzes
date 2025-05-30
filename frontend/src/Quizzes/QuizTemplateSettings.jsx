import React from "react";

const QuizTemplateSettings =({quizTitle, setQuizTitle, shuffleSections, setShuffleSections, numberOfCorrections, setNumberOfCorrections, selectedOption, setSelectedOption, minutesToFinish, setMinutesToFinish, dateOpen, handleDateOpenChange, dateClose, handleDateCloseChange, dateCheck, handleDateCheck, selectedFeedback, handleSelectedFeedbackChange, selectedFeedbackAfterClose, handleSelectedFeedbackAfterCloseChange}) =>{
    return (
        <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel"
                 aria-labelledby="home-tab" tabIndex="0">
                <div>
                    <form className="was-validated">
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
                                required
                            />
                            <div className="invalid-feedback">Please enter a title for the quiz.
                            </div>
                        </div>
                    </form>

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
                            onChange={(e) => setNumberOfCorrections(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="form-check mb-3">
                        <input className="form-check-input" type="radio"
                               name="attemptsIndependentLabel"
                               id="attemptsIndependent" value="indepedentAttempts"
                               checked={selectedOption === "indepedentAttempts"}
                               onChange={(e) => setSelectedOption(e.target.value)}/>
                        <label className="form-check-label" htmlFor="attemptsIndependent">
                            Attempts are independent
                        </label>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="radio"
                               name="attemptsCorrectLabel"
                               id="attemptsCorrect" value="correctionAttempts"
                               checked={selectedOption === "correctionAttempts"}
                               onChange={(e) => setSelectedOption(e.target.value)}/>
                        <label className="form-check-label" htmlFor="attemptsCorrect">
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

                    <form>
                        <div className="mb-3">

                            <label htmlFor="dateOpen" className="form-label">Open the quiz</label>
                            <div className="input-group has-validation w-25">
                                <input
                                    type="datetime-local"
                                    className={`form-control form-control-sm w-25 ${dateOpen < dateClose ? "is-valid" : "is-invalid"}`}
                                    id="dateOpen"
                                    value={dateOpen}
                                    onChange={handleDateOpenChange}
                                />
                                <div className="invalid-feedback">
                                    Open date must be before Close date.
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="dateClose" className="form-label">Close the quiz</label>
                            <div className="input-group has-validation w-25">
                                <input
                                    type="datetime-local"
                                    className={`form-control form-control-sm w-25 ${dateOpen < dateClose ? "is-valid" : "is-invalid"}`}
                                    id="dateClose"
                                    value={dateClose}
                                    onChange={handleDateCloseChange}
                                />
                                <div className="invalid-feedback">
                                    Close date must be after open date.
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="dateCheck" className="form-label">The quiz can be
                                reviewed
                                from</label>
                            <div className="input-group has-validation w-25">
                                <input
                                    type="datetime-local"
                                    className={`form-control form-control-sm ${dateCheck > dateOpen ? "is-valid" : "is-invalid"}`}
                                    id="dateCheck"
                                    value={dateCheck}
                                    onChange={handleDateCheck}
                                />
                                <div className="invalid-feedback">
                                    Check date must be after open date.
                                </div>
                            </div>
                            </div>
                    </form>

                    <h2>Show in review</h2>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="points"
                            value="pointsReview"
                            checked={selectedFeedback.includes("pointsReview")}
                            onChange={handleSelectedFeedbackChange}
                        />
                        <label className="form-check-label" htmlFor="points">
                            Marks
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="questionFeedback"
                            value="questionFeedback"
                            checked={selectedFeedback.includes("questionFeedback")}
                            onChange={handleSelectedFeedbackChange}
                        />
                        <label className="form-check-label" htmlFor="questionFeedback">
                            Questions feedback
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="optionFeedback"
                            value="optionsFeedback"
                            checked={selectedFeedback.includes("optionsFeedback")}
                            onChange={handleSelectedFeedbackChange}
                        />
                        <label className="form-check-label" htmlFor="optionFeedback">
                            Options feedback
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="correctAnswer"
                            value="correctAnswers"
                            checked={selectedFeedback.includes("correctAnswers")}
                            onChange={handleSelectedFeedbackChange}
                        />
                        <label className="form-check-label" htmlFor="correctAnswer">
                            Correct answers
                        </label>
                    </div>

                    <h2>Show when closed</h2>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="points"
                            value="pointsReview"
                            checked={selectedFeedbackAfterClose.includes("pointsReview")}
                            onChange={handleSelectedFeedbackAfterCloseChange}
                        />
                        <label className="form-check-label" htmlFor="points">
                            Marks
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="questionFeedback"
                            value="questionFeedback"
                            checked={selectedFeedbackAfterClose.includes("questionFeedback")}
                            onChange={handleSelectedFeedbackAfterCloseChange}
                        />
                        <label className="form-check-label" htmlFor="questionFeedback">
                            Questions feedback
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="optionFeedback"
                            value="optionsFeedback"
                            checked={selectedFeedbackAfterClose.includes("optionsFeedback")}
                            onChange={handleSelectedFeedbackAfterCloseChange}
                        />
                        <label className="form-check-label" htmlFor="optionFeedback">
                            Options feedback
                        </label>
                    </div>

                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="correctAnswer"
                            value="correctAnswers"
                            checked={selectedFeedbackAfterClose.includes("correctAnswers")}
                            onChange={handleSelectedFeedbackAfterCloseChange}
                        />
                        <label className="form-check-label" htmlFor="correctAnswer">
                            Correct answers
                        </label>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default QuizTemplateSettings