import Navigation from "./Navigation";
import axios from "axios";
import React, {useEffect, useState} from 'react';
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';

const Users = () =>{
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [sort, setSort] = useState("id");
    const [sortDirection, setSortDirection] = useState("desc");
    const [filterForName,setFilterForName] = useState("");
    const name = useRef();
    const githubName=  useRef();
    const fetchUsers = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-users`, {
                params: {
                    "sort": sort,
                    "sortDirection": sortDirection,
                    "filterName": filterForName
                }
            })
            setUsers(response.data.result);
      }catch (error){
      }
       finally {}
    }
    useEffect(() => {
        fetchUsers().then(() => {});
    }, [sort, sortDirection, filterForName]);

    const handleAddTeacher = () => {
        const updatedData = {
            name: name.current.value,
            githubName: githubName.current.value
        }
        axios.put(`http://127.0.0.1:5000/api/create-teacher`, updatedData)
            .then(
                () => {
                    window.location.href = '/users';
                }
            )
            .catch(error => {
                console.error('Error saving changes:', error);
            });
    }

    const sortUsers = (sortVal, filterName) =>{
        setFilterForName(filterName);
        setSort(sortVal);
        if (filterName === filterForName) {
            const newDirection = sort === sortVal && sortDirection === "asc" ? "desc" : "asc";
            setSortDirection(newDirection);
        }
    }

    const showStudentStatistics = (studentId) =>{
        navigate("/user-statistics", {
            state: {
                studentId: studentId
            }
        })
    }

    const exportData = async () =>{
        try {
        const options = {
            types: [
                {
                    description: "CSV Files",
                    accept: { "text/csv": [".csv"] },
                },
            ],
        };

        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();

        const response = await axios.get(`http://127.0.0.1:5000/api/get-results-students`)

        await writable.write(response.data.result);
        await writable.close();

        alert("Súbor bol uložený!");
    } catch (error) {
        console.error("Chyba pri ukladaní:", error);
    }
    }

    if (localStorage.getItem("role") !=="teacher"){
        navigate("/quizzes");
    }

    return (
        <div>
                    <Navigation active = {"Users"}></Navigation>

                <div className="container-fluid" style={{ marginTop: "50px" }}>
                    <div className="row">
                        <div className="col-2 sidebar"></div>

                        <div className="col-8">
                            <h1>Users</h1>

                            <div className="mb-3">
                                <label htmlFor="search" className="form-label">Filter by Name</label>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="Search for a user"
                                    onChange={(e) => sortUsers("github_name", e.target.value)}
                                />
                            </div>

                            <table className="table table-striped table-hover table-fixed">
                                <thead>
                                <tr>
                                    <th scope="col" className="w-25"
                                        onClick={() => sortUsers("id",filterForName)} style={{cursor: "pointer"}}
                                    ># {sort === "id" ? (sortDirection === "asc" ? " 🔼" : " 🔽") : ""}</th>
                                    <th scope="col" className="w-25"
                                        onClick={() => sortUsers("github_name", filterForName)}
                                        style={{cursor: "pointer"}}>Name {sort === "github_name" ? (sortDirection === "asc" ? " 🔼" : " 🔽") : ""}</th>

                                    <th scope="col" className="w-25 text-end" onClick={() => sortUsers("user_type",filterForName)}
                                        style={{cursor: "pointer"}}>Type {sort === "user_type" ? (sortDirection === "asc" ? " 🔼" : " 🔽") : ""}</th>

                                    <th scope="col" className="w-25 text-end">Statistics</th>

                                </tr>
                                </thead>
                                <tbody>
                                {

                                    users.map((user) => (
                                            <tr>
                                                <th scope="row">{user.id}</th>
                                                <td>{user.github_name}</td>
                                                <td className="text-end">{user.user_type}</td>
                                                <td className="text-end">
                                                    <button type="button" className="btn btn-outline-primary"
                                                            onClick={() => {
                                                                showStudentStatistics(user.id)
                                                            }
                                                            }
                                                    >
                                                        Statistics
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )

                                }
                                </tbody>
                            </table>

                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-outline-secondary"
                                        onClick={() => {
                                            window.location.href = "/quizzes";
                                        }
                                        }
                                >
                                    Back to Quizzes
                                </button>

                                <div>
                                    <button type="button" className="btn btn-primary me-3" data-bs-toggle="modal"
                                            data-bs-target="#exampleModal">
                                        Create Teacher
                                    </button>
                                    <button type="button" className="btn btn-success" onClick={exportData}>
                                        Export Data
                                    </button>
                                </div>
                            </div>


                            <div className="modal fade" id="exampleModal" tabIndex="-1"
                                 aria-labelledby="exampleModalLabel"
                                 aria-hidden="true">
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h1 className="modal-title fs-5" id="exampleModalLabel">New Teacher</h1>
                                            <button type="button" className="btn-close" data-bs-dismiss="modal"
                                                    aria-label="Close"></button>
                                        </div>
                                        <div className="modal-body">
                                            <form>
                                                <div className="mb-3">
                                                    <label htmlFor="name"
                                                           className="col-form-label">Name</label>
                                                    <input type="text" className="form-control" id="name" ref={name}/>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="github-name"
                                                           className="col-form-label">Github Name</label>
                                                    <input type="text" className="form-control" id="github-name"
                                                           ref={githubName}/>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary"
                                                    data-bs-dismiss="modal">Close
                                            </button>
                                            <button type="button" className="btn btn-primary"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddTeacher();
                                                    }
                                                    }

                                            >Create
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-2 sidebar"></div>
                    </div>
                </div>
        </div>
    )
}

export default Users;