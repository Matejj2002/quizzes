import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Navigation = ({orderNav}) => {
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
            setUserData(data);
        })
    }

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    };

    useEffect(() => {
        getUserData().then(() => {
        });
    }, []);

    return (
        <nav className="navbar fixed-top bg-body-tertiary">
            <div className="container-fluid">
                {orderNav[0]}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarScroll">
                    <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                        {orderNav.slice(1).map((link) => (
                            <li className="nav-item">{link}</li>
                        ))}
                    </ul>
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
                    <p data-bs-toggle="dropdown" className="me-1" style={{cursor: "pointer"}}>{userData.login}</p>
                    <div className="dropdown-toggle"></div>

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