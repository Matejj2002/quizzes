import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from "./Navigation";
import Login from "./Login";
import Categories from "./CategoriesTree/Categories";

const Quizzes = () => {
    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
                </header>
                <div className="container-fluid" style={{marginTop: "50px"}}>
                    <div className="row">
                        <div className="col-2 sidebar">
                        </div>
                        <div className="col-8">
                            <h1>Quizzes</h1>
                            <div className="mb-3">
                                <label htmlFor="QuizTitle" className="form-label">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="QuizTitle"
                                    placeholder="Quiz title"
                                />
                            </div>

                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="randomOrder"/>
                                <label className="form-check-label" htmlFor="randomOrder">
                                    Random of questions for Student
                                </label>
                            </div>

                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="Ordered"/>
                                <label className="form-check-label" htmlFor="Ordered">
                                    Ordered for revision for Teacher
                                </label>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="exampleNumber" className="form-label">Number of Attempts</label>
                                <input type="number" className="form-control w-25" id="exampleNumber"
                                       placeholder="Enter Number" min="1" max="10"/>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="correctionsNum" className="form-label">Number of Corrections</label>
                                <input type="number" className="form-control w-25" id="correctionsNum"
                                       placeholder="Enter Number" min="1" max="10"/>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="timeFinish" className="form-label">Minutes to Finish</label>
                                <input type="number" className="form-control w-25" id="timeFinish"
                                       placeholder="Enter Minutes" min="1" max="500"/>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateOpen" className="form-label">Date Open</label>
                                <input type="date" className="form-control form-control-sm w-25" id="dateOpen"
                                       placeholder="Select a date"/>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateClose" className="form-label">Date Close</label>
                                <input type="date" className="form-control form-control-sm w-25" id="dateClose"
                                       placeholder="Select a date"/>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="dateCheck" className="form-label">Date to Check</label>
                                <input type="date" className="form-control form-control-sm w-25" id="dateCheck"
                                       placeholder="Select a date"/>
                            </div>

                        </div>
                        <div className="col-2">
                        </div>

                    </div>
                </div>


            </div>
        )
    } else {
        return (
            <div>
                <Login path={"/quizzes"}></Login>
            </div>
        )
    }
}

export default Quizzes;