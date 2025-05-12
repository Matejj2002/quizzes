import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const Navigation = ({
  active
}) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;
  const host = process.env.REACT_APP_HOST;
  const port = process.env.REACT_APP_PORT;
  const quizzesUrl = `http://${host}:${port}`;
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  async function getUserData() {
    await fetch(apiUrl + "getUserData", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    }).then(response => {
      return response.json();
    }).then(data => {
      setUserData(data);
    });
  }
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  useEffect(() => {
    getUserData().then(() => {});
  }, []);
  return /*#__PURE__*/React.createElement("nav", {
    className: "navbar navbar-expand-sm bg-primary w-100",
    "data-bs-theme": "dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("a", {
    className: "navbar-brand",
    href: "#"
  }, "Quizzes"), /*#__PURE__*/React.createElement("button", {
    className: "navbar-toggler",
    type: "button",
    "data-bs-toggle": "collapse",
    "data-bs-target": "#navbarNavAltMarkup",
    "aria-controls": "navbarNavAltMarkup",
    "aria-expanded": "false",
    "aria-label": "Toggle navigation"
  }, /*#__PURE__*/React.createElement("span", {
    className: "navbar-toggler-icon"
  })), /*#__PURE__*/React.createElement("div", {
    className: "collapse navbar-collapse",
    id: "navbarNavAltMarkup"
  }, /*#__PURE__*/React.createElement("div", {
    className: "navbar-nav"
  }, /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${active === "Quizzes" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`,
    href: `${quizzesUrl}/quizzes`
  }, "Quizzes"), /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${active === "Questions" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`,
    "aria-disabled": userData["role"] !== "teacher",
    href: `${quizzesUrl}/questions/supercategory?limit=10&offset=0`
  }, "Questions"), /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${active === "Analysis" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`,
    "aria-disabled": userData["role"] !== "teacher",
    href: `${quizzesUrl}/quiz-analysis`
  }, "Analysis"), /*#__PURE__*/React.createElement("a", {
    className: `nav-link ${active === "Users" ? "active" : ""} ${userData["role"] !== "teacher" ? "disabled" : ""}`,
    "aria-disabled": userData["role"] !== "teacher",
    href: `${quizzesUrl}/users`
  }, "Users"))), active !== "Login" ? /*#__PURE__*/React.createElement("div", {
    className: "d-flex"
  }, /*#__PURE__*/React.createElement("img", {
    src: userData.avatar_url,
    alt: `${userData.name}'s profile`,
    style: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      cursor: "pointer",
      marginRight: "5px"
    },
    "data-bs-toggle": "dropdown"
  }), /*#__PURE__*/React.createElement("p", {
    "data-bs-toggle": "dropdown",
    className: "me-1",
    style: {
      cursor: "pointer",
      color: "white"
    }
  }, userData.login), /*#__PURE__*/React.createElement("div", {
    className: "dropdown-toggle"
  }), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-menu dropdown-menu-end bg-primary"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    className: "dropdown-item",
    onClick: handleLogout
  }, "Logout")))) : /*#__PURE__*/React.createElement("div", {
    className: "d-flex"
  }, /*#__PURE__*/React.createElement("a", {
    role: "button",
    tabIndex: "0",
    onClick: () => {
      window.location.assign("https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID);
    },
    className: "w-100 btn"
  }, "Login "))));
};
export default Navigation;