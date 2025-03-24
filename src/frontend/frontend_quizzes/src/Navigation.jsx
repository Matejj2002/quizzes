import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Navigation = ({active}) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});

    async function getUserData() {
        await fetch("http://127.0.0.1:5000/getUserData", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("accessToken")
                }
            }
        ).then((response) => {
            return response.json();
        }).then((data) => {
            localStorage.setItem("role", data["role"]);
            localStorage.setItem("idUser", data["id_user"]);
            setUserData(data);
        })
    }

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("idUser");
        navigate("/login");
    };

    useEffect(() => {
        getUserData().then(() => {
        });
    }, []);

    return (
        <nav className="navbar bg-primary fixed-top" data-bs-theme="dark">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Navbar</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <a className={`nav-link ${active === "Quizzes" ? "active" : ""}`}
                           href="http://localhost:3000/quizzes">Quizzes</a>

                        <a className={`nav-link ${active === "Questions" ? "active" : ""}`}
                           href="http://localhost:3000/questions/supercategory?limit=10&offset=0">Questions</a>

                        <a className={`nav-link ${active === "Admin" ? "active" : ""}`} aria-current="page"
                           href="http://127.0.0.1:5000/admin/">Admin</a>

                    </div>
                </div>
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
                       style={{cursor: "pointer",  color:"white"}}>{userData.login}</p>
                    <div className="dropdown-toggle"></div>

                    <ul className="dropdown-menu dropdown-menu-end" style={{ backgroundColor: "white" }}>
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