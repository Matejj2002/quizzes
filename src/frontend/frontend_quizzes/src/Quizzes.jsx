import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from "./Navigation";

const Quizzes = () => {
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
}

export default Quizzes;