import React from "react";

const QuizTemplateSettings =({quizTitle, setQuizTitle, shuffleSections, setShuffleSections, numberOfCorrections, setNumberOfCorrections, selectedOption, setSelectedOption, minutesToFinish, setMinutesToFinish, dateOpen, handleDateOpenChange, dateClose, handleDateCloseChange, dateCheck, handleDateCheck}) =>{
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
                               name="independentAttempts"
                               id="exampleRadios1" value="option1"
                               checked={selectedOption === "option1"}
                               onChange={(e) => setSelectedOption(e.target.value)}/>
                        <label className="form-check-label" htmlFor="exampleRadios1">
                            Attempts are independent
                        </label>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="radio"
                               name="independentAttempts"
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
                        <label htmlFor="dateCheck" className="form-label">The quiz can be
                            reviewed
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
    )
}

export default QuizTemplateSettings