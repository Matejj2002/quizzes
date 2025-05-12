import Navigation from "../components/Navigation";
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [sort, setSort] = useState("github_name");
  const [userData, setUserData] = useState([]);
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterForName, setFilterForName] = useState("");
  const name = useRef();
  const githubName = useRef();
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchUsers = async () => {
    try {
      const response = await axios.get(apiUrl + `get-users`, {
        params: {
          "sort": sort,
          "sortDirection": sortDirection,
          "filterName": filterForName
        }
      });
      setUsers(response.data.result);
    } catch (error) {} finally {}
  };
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
      if (data["role"] !== "teacher") {
        navigate("/quizzes");
      }
    });
  }
  useEffect(() => {
    getUserData().then(() => {});
  }, []);
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      fetchUsers();
    }
  }, [userData]);
  useEffect(() => {
    fetchUsers().then(() => {});
  }, [sort, sortDirection, filterForName]);
  const handleAddTeacher = () => {
    const updatedData = {
      name: name.current.value,
      githubName: githubName.current.value
    };
    axios.put(apiUrl + `create-teacher`, updatedData).then(() => {
      window.location.href = '/users';
    }).catch(error => {
      console.error('Error saving changes:', error);
    });
  };
  const sortUsers = (sortVal, filterName) => {
    setFilterForName(filterName);
    setSort(sortVal);
    if (filterName === filterForName) {
      const newDirection = sort === sortVal && sortDirection === "asc" ? "desc" : "asc";
      setSortDirection(newDirection);
    }
  };
  const showStudentStatistics = studentId => {
    navigate("/user-statistics", {
      state: {
        studentId: studentId,
        userRole: userData["role"],
        userId: userData["id_user"]
      }
    });
  };
  const exportData = async () => {
    try {
      const options = {
        types: [{
          description: "CSV Files",
          accept: {
            "text/csv": [".csv"]
          }
        }]
      };
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      const response = await axios.get(apiUrl + `get-results-students`);
      await writable.write(response.data.result);
      await writable.close();
      alert("Súbor bol uložený!");
    } catch (error) {
      console.error("Chyba pri ukladaní:", error);
    }
  };
  const changeType = (userId, selectedType) => {
    const data = {
      userId: userId,
      selectedType: selectedType
    };
    axios.put(apiUrl + "change-user-type", data).then(() => {
      fetchUsers();
      alert("User type changed");
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navigation, {
    active: "Users"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }), /*#__PURE__*/React.createElement("div", {
    className: "col-8"
  }, /*#__PURE__*/React.createElement("h1", null, "Users"), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "search",
    className: "form-label"
  }, "Filter by Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "search",
    className: "form-control",
    placeholder: "Search for a user",
    onChange: e => sortUsers("github_name", e.target.value)
  })), /*#__PURE__*/React.createElement("table", {
    className: "table table-striped table-hover table-fixed"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25",
    onClick: () => sortUsers("github_name", filterForName),
    style: {
      cursor: "pointer"
    }
  }, "Name ", sort === "github_name" ? sortDirection === "asc" ? " 🔼" : " 🔽" : ""), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "text-end w-25",
    onClick: () => sortUsers("user_type", filterForName),
    style: {
      cursor: "pointer"
    }
  }, "Type ", sort === "user_type" ? sortDirection === "asc" ? " 🔼" : " 🔽" : ""), /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "w-25 text-end"
  }, "Statistics"))), /*#__PURE__*/React.createElement("tbody", null, users.map((user, ind) => /*#__PURE__*/React.createElement("tr", {
    key: ind
  }, /*#__PURE__*/React.createElement("td", null, user.github_name), /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("div", {
    className: "d-flex gap-2 text-align-center justify-content-end"
  }, /*#__PURE__*/React.createElement("select", {
    id: `select-${user.id}`,
    value: user.user_type,
    disabled: user.id.toString() === userData["user-id"] || user.id === 1,
    onChange: e => changeType(user.id, e.target.value),
    className: "form-select w-auto"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Teacher"
  }, "Teacher"), /*#__PURE__*/React.createElement("option", {
    value: "Student"
  }, "Student")))), /*#__PURE__*/React.createElement("td", {
    className: "text-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-primary",
    onClick: () => {
      showStudentStatistics(user.id);
    }
  }, "Statistics")))))), /*#__PURE__*/React.createElement("div", {
    className: "d-flex flex-wrap justify-content-between"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-outline-secondary mb-3 mb-sm-0",
    onClick: () => {
      window.location.href = "/quizzes";
    }
  }, "Back to Quizzes"), /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary me-3",
    "data-bs-toggle": "modal",
    "data-bs-target": "#exampleModal"
  }, "Pre-register teacher"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-success",
    onClick: exportData
  }, "Export Data"))), /*#__PURE__*/React.createElement("div", {
    className: "modal fade",
    id: "exampleModal",
    tabIndex: "-1",
    "aria-labelledby": "exampleModalLabel",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-dialog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "modal-title fs-5",
    id: "exampleModalLabel"
  }, "New Teacher"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close",
    "data-bs-dismiss": "modal",
    "aria-label": "Close"
  })), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, /*#__PURE__*/React.createElement("form", null, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "name",
    className: "col-form-label"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    id: "name",
    ref: name
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "github-name",
    className: "col-form-label"
  }, "Github Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-control",
    id: "github-name",
    ref: githubName
  })))), /*#__PURE__*/React.createElement("div", {
    className: "modal-footer"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    "data-bs-dismiss": "modal"
  }, "Close"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-primary",
    onClick: e => {
      e.preventDefault();
      handleAddTeacher();
    }
  }, "Create")))))), /*#__PURE__*/React.createElement("div", {
    className: "col-2 sidebar"
  }))));
};
export default Users;