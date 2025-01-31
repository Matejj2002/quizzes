import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Navigation = () =>{
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    async function getUserData() {
        await fetch("http://127.0.0.1:5000/getUserData", {
                method: "GET",
                headers: {
                    "Authorization" : "Bearer " + localStorage.getItem("accessToken")
                }
            }

        ).then((response) => {
            return response.json();
        }).then((data) => {
            setUserData(data);
        })
    }

    const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

    useEffect(() => {
    getUserData();
  }, []);

    return (
        <nav className="navbar fixed-top bg-body-tertiary">
            <div className="container-fluid">
                <a className="navbar-brand" href="http://localhost:3000/questions/1?limit=10&offset=0">Questions</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarScroll">
                    <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="http://127.0.0.1:5000/admin/">Admin</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="http://localhost:3000/quizzes">Quizzes</a>
                        </li>
                    </ul>
                </div>
                <div className="d-flex">
                    <p className="me-3">{userData.login}</p>

                    <img
                        src={userData.avatar_url}
                        alt={`${userData.name}'s profile`}
                        style={{width: "30px", height: "30px", borderRadius: "50%", cursor:"pointer"}}
                        data-bs-toggle="dropdown"
                    />

                    <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navigation;