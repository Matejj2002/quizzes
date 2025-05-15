import React, { useEffect } from "react";
import { useState } from "react";
import Navigation from "./Navigation";
const Login = ({
  path = "/login"
}) => {
  const [rerender, setReRender] = useState(false);
  const [userData, setUserData] = useState({});
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const apiUrl = process.env.REACT_APP_API_URL;
  const quizzesUrl = process.env.REACT_APP_HOST_URL + process.env.REACT_APP_BASENAME;
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    if (codeParam && localStorage.getItem("accessToken") === null) {
      async function getAccessToken() {
        await fetch(apiUrl + "getAccessToken?code=" + codeParam).then(response => {
          return response.json();
        }).then(data => {
          if (data.access_token) {
            localStorage.setItem("accessToken", data.access_token);
            setReRender(!rerender);
            window.location.assign(quizzesUrl + path);
          }
        });
      }
      getAccessToken().then(response => {});
    }
  }, []);
  function loginWithGithub() {
    window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
  }
  async function getUserData() {
    await fetch(apiUrl + "getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    }).then(response => {
      return response.json();
    }).then(data => {
      console.log(data);
      const lcl = {
        "avatar_url": data["avatar_url"],
        "login": data["login"]
      };
      localStorage.setItem("data", JSON.stringify(lcl));
      setUserData(data);
    });
  }
  useEffect(() => {
    getUserData().then(() => {});
  }, []);
  if (userData["error"] === "no error") {
    window.location.href = quizzesUrl + "/quizzes";
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Login"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid",
    style: {
      marginTop: "50px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, localStorage.getItem("accessToken") ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", null, "Welcome to quizzes")) : /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-center align-items-center vh-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex flex-column justify-content-center align-items-center w-50"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-center"
  }, "You have to be logged in to continue"), /*#__PURE__*/React.createElement("hr", {
    className: "w-100",
    style: {
      height: "5px"
    }
  }), /*#__PURE__*/React.createElement("a", {
    role: "button",
    tabIndex: "0",
    onClick: loginWithGithub,
    className: "w-100 btn btn-dark"
  }, /*#__PURE__*/React.createElement("svg", {
    stroke: "currentColor",
    fill: "currentColor",
    strokeWidth: "0",
    viewBox: "0 0 16 16",
    color: "white",
    height: "1em",
    width: "1em",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      color: "white"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
  })), "Login via Github")))), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default Login;