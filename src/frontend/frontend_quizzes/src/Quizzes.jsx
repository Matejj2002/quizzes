import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from "./Navigation";
import Login from "./Login";

const Quizzes = () => {
    if (localStorage.getItem("accessToken")) {
        return (
            <div>
                <header className="navbar navbar-expand-lg bd-navbar sticky-top">
                    <Navigation></Navigation>
                </header>
                <div className="container-fluid" style ={{marginTop: "50px"}}>
                <h1>Quizzes</h1>
                </div>
            </div>
        )
    }else{
        return (
            <div>
                <Login path={"/quizzes"}></Login>
            </div>
        )
    }
}

export default Quizzes;