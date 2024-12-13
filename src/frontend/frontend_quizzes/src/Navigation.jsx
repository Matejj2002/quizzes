import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


const Navigation = ({page, limit, offset, actualCategory, setSort}) =>{
    const navigate = useNavigate();

    return (
        <header className='navbar navbar-expand-lg bd-navbar sticky-top'>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Questions</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Link</a>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                   aria-expanded="false">
                                    Filter
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Type</a></li>
                                    <li><a className="dropdown-item" href="#">Author</a></li>
                                </ul>
                            </li>

                            <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                                   aria-expanded="false">
                                    Sort
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#"
                                        onClick={(e) => {
                                                e.preventDefault();
                                                setSort("date-asc");
                                                 navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategory}&sort=date-asc`);
                                                }
                                             }
                                    >Date Ascending</a></li>
                                    <li><a className="dropdown-item" href=""
                                    onClick={(e) => {
                                    e.preventDefault();
                                    setSort("date-desc")
                                     navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategory}&sort=date-desc`);
                                    }
                                 }

                                    >Date Descending</a></li>
                                    <li><hr className="dropdown-divider"/></li>
                                    <li><a className="dropdown-item" href=""
                                    onClick={(e) => {
                                        e.preventDefault();
                                    setSort("alphabetic");
                                     navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategory}&sort=alphabetic`);
                                    }
                                 }
                                    >Alphabetic</a></li>
                                    <li><a className="dropdown-item" href=""
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSort("alphabetic-rev");
                                     navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategory}&sort=alphabetic-rev`);
                                    }
                                 }
                                    >Alphabetic reverse</a></li>
                                </ul>
                            </li>
                        </ul>
                        <form className="d-flex" role="search">
                            <input className="form-control me-2" type="search" placeholder="Search"
                                   aria-label="Search"/>
                            <button className="btn btn-outline-success" type="submit">Search</button>
                        </form>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navigation;