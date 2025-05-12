import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navigation = ({active}) => {
    const [userData, setUserData] = useState({});
    const apiUrl = process.env.REACT_APP_API_URL;
    const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
    const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

    async function getUserData() {
        await fetch(apiUrl+"getUserData", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("accessToken")
                }
            }
        ).then((response) => {
            return response.json();
        }).then((data) => {
            setUserData(data);
        })
    }

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login"
    };

    useEffect(() => {
        getUserData().then(() => {
        });
    }, []);


    return (
        <nav className="navbar navbar-expand-sm bg-primary w-100" data-bs-theme="dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Quizzes</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <a className={`nav-link ${active === "Quizzes" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`}
                           href={`${quizzesUrl}/quizzes`}>Quizzes</a>
                        <a className={`nav-link ${active === "Questions" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`}
                           aria-disabled={userData["role"] !== "teacher"}
                           href={`${quizzesUrl}/questions/supercategory?limit=10&offset=0`}>Questions</a>


                        <a className={`nav-link ${active === "Analysis" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`}
                           aria-disabled={userData["role"] !== "teacher"}
                           href={`${quizzesUrl}/quiz-analysis`}>Analysis</a>

                        <a className={`nav-link ${active === "Users" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`}
                           aria-disabled={userData["role"] !== "teacher"}
                           href={`${quizzesUrl}/users`}>Users</a>


                    </div>
                </div>
                {active !== "Login" ? (
                    <div className="d-flex">
                        <img
                            src={userData.avatar_url}
                            alt={`${userData.name}'s profile`}
                            style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                cursor: "pointer",
                                marginRight: "5px"
                            }}
                            data-bs-toggle="dropdown"
                        />
                        <p data-bs-toggle="dropdown" className="me-1"
                           style={{cursor: "pointer", color: "white"}}>{userData.login}</p>
                        <div className="dropdown-toggle"></div>

                        <ul className="dropdown-menu dropdown-menu-end bg-primary">
                            <li>
                                <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="d-flex">
                    <a role="button" tabIndex="0"
                       onClick={() => {window.location.assign("https://github.com/login/oauth/authorize?client_id="+CLIENT_ID)}}
                       className="w-100 btn">
                        Login </a>
                    </div>
                )}

            </div>
        </nav>
    )
}

export default Navigation;