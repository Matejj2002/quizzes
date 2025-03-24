import React, {useEffect} from "react";
import {useState} from "react";
import Navigation from "./Navigation";
const Login = ({path = "/login"}) =>{
    const [rerender, setReRender] = useState(false);
    const [userData, setUserData] = useState({});

    const CLIENT_ID = "Ov23likPzKaEmFtQM7kn";

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const codeParam = urlParams.get("code");

        if (codeParam && (localStorage.getItem("accessToken") === null)) {
            async function getAccessToken() {
                await fetch("http://127.0.0.1:5000/getAccessToken?code=" + codeParam)
                    .then((response) => {return response.json()})
                    .then((data) => {
                        if (data.access_token){
                            localStorage.setItem("accessToken", data.access_token);
                            setReRender(!rerender);
                            window.location.assign(path);
                        }
                    });
            }

            getAccessToken().then((response) => {});
        }
    }, [])

    function loginWithGithub(){
        window.location.assign("https://github.com/login/oauth/authorize?client_id="+ CLIENT_ID);
    }
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

    useEffect(() => {
        getUserData().then(() => {
        });
    }, [userData]);

    return (
        <div>
            <h1>Login</h1>
            {
                localStorage.getItem("accessToken") ?
                    <>
                        <h3>Access Token here</h3>
                        <button onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("role");
                            localStorage.removeItem("idUser");
                            window.location.href = "https://github.com/logout";
                            setReRender(!rerender);
                        }}>
                            Log Out
                        </button>

                        {
                            Object.keys(userData).length !== 0 ?
                                <>
                                    <h4>Hello {userData.login}</h4>
                                </>
                                :
                                <>
                                </>
                        }
                    </>
                    :
                    <>
                        <h3>User Not logged In</h3>
                        <button onClick={loginWithGithub}>Login</button>
                    </>
            }
        </div>
    )
}

export default Login;