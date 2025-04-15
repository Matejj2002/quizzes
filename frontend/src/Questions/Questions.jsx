import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navigation from "../Navigation";
import Categories from "../CategoriesTree/Categories";
import ReactPaginate from "react-paginate";
import Login from "../Login";

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const Questions = () => {
    const { "*": category } = useParams();

    const sortTable = ["Newest", "Oldest", "Alphabetic", "Reverse Alphabetic"];
    const filterTypes = ["Matching Question", "Multiple Choice Question", "Short Question"];
    const showQuestionsFilter = ["Active", "Archived", "All"]

    const categoryList = category ? category.split("/") : [];

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [numberOfQuestions, setNumberOfQuestions ] = useState(0);
    const [questions , setQuestions] = useState([]);
    const [numberOfQuestionsFilter,setNumberOfQuestionsFilter] = useState(0);

    const [teachers, setTeachers] = useState([]);
    const [authorFilter, setAuthorFilter] = useState(searchParams.get("author-filter") || "");

    const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);

    const [sort, setSort] = useState(searchParams.get("sort") || "");

    const [filterType, setFilterType] = useState(searchParams.get("filter-type") || "");

    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const [actualCategory] = useState(parseInt(searchParams.get("category_id") || 1));
    const [actualCategoryString] = useState(searchParams.get("category") || categoryList.at(categoryList.length-1) || "supercategory");
    const [categoryPath , setCategoryPath] = useState([]);

    const currentPage = parseInt(page || "1", 10);

    const [questionFilter, setQuestionFilter] = useState("Active");

    const [showFeedback, setShowFeedback] = useState(false);

    const questionTypesHuman = {"matching_answer_question": "Matching Question", "short_answer_question" : "Short Question", "multiple_answer_question": "Multiple Choice"};

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        setPage(parseInt(searchParams.get("page") || "1", 10));
        }, [searchParams]);

    useEffect(() => {
        if (categoryPath.length > 0) {
            const catPathFull = categoryPath.map(item => item[0]).reverse().join('/');
            const newUrl = `/questions/${catPathFull}?page=${page}&limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`;

            navigate(newUrl, { replace: true });
            }
        }, [categoryPath, navigate]);


    const fetchCategory = async (index) => {
        try{
            const response = await axios.get(apiUrl+`questions/categories/get-path-to-supercategory/${index}`)
            setCategoryPath(response.data);

        }catch (error){}
        finally {}
    }

    const fetchAllTeachers = async () => {
        try{
            const response = await axios.get(apiUrl+'teachers');
            setTeachers(response.data);
        }catch(error){}
        finally {}
    }

  const fetchQuestions = async (limit) => {
      try {
            const offset = (currentPage - 1) * limit;
            const authorFilterDec = decodeURIComponent(authorFilter);
            const response = await axios.get(apiUrl+'questions/' , {
            params: { limit, offset, sort, actualCategory, filterType, authorFilterDec, questionFilter },
            });
            setNumberOfQuestions(response.data[0]["number_of_all_questions"]);
            setNumberOfQuestionsFilter(response.data[0]["number_of_questions"])
            setQuestions(response.data[2]);

      }catch (error){}
      finally {}
  }

    const fetchQuestionsChange = async () => {
            await fetchQuestions(limit);
    };

    useEffect(() => {
        fetchQuestionsChange().then(() => {});
        }, [page, authorFilter, sort, filterType, questionFilter]);

    useEffect(() => {
        fetchQuestionsChange().then(() => {});
        setCategoryPath([]);
        setPage(1);
        fetchCategory(actualCategory).then(() => {});

    }, [actualCategory]);


    useEffect(() => {
        fetchAllTeachers().then(() => {});
    }, []);

  const handlePageChange = (selectedPage) => {
        const newOffset = selectedPage.selected * limit;

        navigate(`/questions/${category}?page=${selectedPage.selected + 1}&limit=${limit}&offset=${newOffset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`);
    };

  const filtersShow = (name, typeFilter) => {
      if (typeFilter === ""){
          return name;
      }

      return name + ": " + typeFilter

  }

  const showQuestionsErr = () => {
      let errorMessage = "";
      if (numberOfQuestions === 0) {
          errorMessage = "No questions in this category";
      }
      if (numberOfQuestionsFilter === 0) {
          errorMessage = "No questions with those filters"
      }

      return errorMessage !== "" && (
          <div className="alert alert-danger" role="alert">
              {errorMessage}
          </div>
      )
  }
  const handleQuestionDeleteRestore = async (questionId, delRes, text) =>{
      const data = {
          "id" : questionId,
          "delete" : delRes,
      }
        await axios.put(apiUrl+`questions/delete`, data)
            .then(() => {
                    window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error saving changes:', error);
                    });

            alert(text);
    }
    const [actualFeedbacks, setActualFeedbacks]= useState([]);
    const showFeedbacks = (question) =>{
      setActualFeedbacks(question);
      setShowFeedback(true);
    }

    const closeModal = () =>{
      setShowFeedback(false);
    }

    if (localStorage.getItem("role") !=="teacher"){
        navigate("/quizzes");
    }

    return (
            <div>
                    <Navigation active="Questions"></Navigation>

                <div className="container-fluid text-center">
                <div className="row">
                        <div className="col-2 sidebar"
                             style={{position: "sticky", textAlign: "left", top: "50px", height: "calc(100vh - 60px)"}}>
                            <Categories catPath={categoryPath}/>
                        </div>
                    <div className="col-8">
                        <h2 className="mb-4">{actualCategoryString}</h2>

                        <div>
                            <div className='mb-3 d-flex justify-content-end'>
                                <div className="dropdown">
                                    <button className="btn btn-secondary text-decoration-none me-2 dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {questionFilter}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <span className="d-flex justify-content-center fw-bold mb-2">Active</span>
                                        {
                                            showQuestionsFilter.map((name, index) => (
                                                <li key={index}>
                                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                    <a className="dropdown-item fs-6" href=""
                                                       onClick={(e) => {
                                                           e.preventDefault();

                                                           setQuestionFilter(name);
                                                           navigate(`/questions/${category}?page=${page}&limit=${limit}&offset=${offset}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`);
                                                       }
                                                       }

                                                    >
                                                        {name}
                                                    </a>
                                                </li>

                                            ))
                                        }
                                    </ul>
                                </div>

                                <div className="dropdown">
                                    <button className="btn btn-secondary text-decoration-none me-2 dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {filtersShow("Author", authorFilter)}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <span className="d-flex justify-content-center fw-bold mb-2">Author</span>
                                        {
                                            teachers.map((teacher, index) => (
                                                <li key={index}>
                                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                    <a className="dropdown-item fs-6" href=""
                                                       onClick={(e) => {
                                                           e.preventDefault();
                                                           let teacher_name = teacher.name;
                                                           if (teacher_name === authorFilter) {
                                                               teacher_name = "";
                                                           }
                                                           setAuthorFilter(teacher_name);
                                                           navigate(`/questions/${category}?page=${page}&limit=${limit}&offset=${offset}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}author-filter=${teacher_name}`);
                                                       }
                                                       }

                                                    >
                                                        {authorFilter === teacher.name && (
                                                            <i className="bi bi-check"></i>)} {teacher.name}
                                                    </a>
                                                </li>

                                            ))
                                        }
                                    </ul>
                                </div>


                                <div className="dropdown">
                                    <button className="btn btn-secondary text-decoration-none me-2 dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {filtersShow("Type", filterType)}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <span className="d-flex justify-content-center fw-bold mb-2">Type</span>
                                        {
                                            filterTypes.map((name, index) => (
                                                <li key={index}>
                                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                    <a className="dropdown-item fs-6" href=""
                                                       onClick={(e) => {
                                                           e.preventDefault();

                                                           if (filterType === name) {
                                                               name = "";
                                                           }
                                                           setFilterType(name);
                                                           navigate(`/questions/${category}?page=${page}&limit=${limit}&offset=${offset}&sort=${sort}&filter-type=${name}&category_id=${actualCategory}&author-filter=${authorFilter}`);
                                                       }
                                                       }

                                                    >
                                                        {filterType === name && (
                                                            <i className="bi bi-check"></i>)} {name}
                                                    </a>
                                                </li>

                                            ))
                                        }
                                    </ul>
                                </div>


                                <div className="dropdown">
                                    <button className="btn btn-secondary text-decoration-none me-2 dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {filtersShow("Sort", sort)}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        {
                                            sortTable.map((name, index) => (
                                                <li key={index}>
                                                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                    <a className="dropdown-item fs-6" href=""
                                                       onClick={(e) => {
                                                           e.preventDefault();

                                                           if (sort === name) {
                                                               name = "";
                                                           }
                                                           setSort(name)
                                                           navigate(`/questions/${category}?page=${page}&limit=${limit}&offset=${offset}&sort=${name}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`);
                                                       }
                                                       }

                                                    >
                                                        {sort === name && (
                                                            <i className="bi bi-check"></i>)} {name}
                                                    </a>
                                                </li>

                                            ))
                                        }
                                    </ul>
                                </div>

                                <button type="button" className="btn btn-success me-1" onClick={() => {
                                    navigate(`/question/new-question`, {
                                        state: {
                                            catPath: category,
                                            id: actualCategory,
                                            selectedCategory: actualCategoryString,
                                            limit: limit,
                                            offset: offset,
                                            sort: sort,
                                            page: page,
                                            filterType: filterType,
                                            authorFilter: authorFilter,
                                            back:false,
                                        }
                                    });
                                }
                                }
                                >Add question
                                </button>

                                <button type="button" className="btn btn-success" onClick={() => {
                                    navigate(`/category/new-category`, {
                                        state: {
                                            catPath: category,
                                            id: actualCategory,
                                            selectedCategory: actualCategoryString,
                                            limit: limit,
                                            offset: offset,
                                            sort: sort,
                                            page: page,
                                            filterType: filterType,
                                            authorFilter: authorFilter,
                                        }
                                    });
                                }}>Add category
                                </button>
                            </div>
                        </div>

                        <div>
                            <ol className="list-group">
                                {
                                    questions.map((question, index) => (
                                        <li key={index}
                                            className="list-group-item d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto text-truncate text-start w-100">
                                                <div
                                                    className="d-flex justify-content-between align-items-center w-100">
                                                    <div className="d-flex align-items-start">
                                                        <p className="h5 text-start text-truncate flex-grow-1">
                                                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                            <a href="" onClick={(e) => {
                                                                e.preventDefault();
                                                                navigate(`/question/${question.id}`, {
                                                                    state: {
                                                                        catPath: category,
                                                                        id: actualCategory,
                                                                        selectedCategory: actualCategoryString,
                                                                        limit: limit,
                                                                        offset: offset,
                                                                        sort: sort,
                                                                        page: page,
                                                                        filterType: filterType,
                                                                        authorFilter: authorFilter,
                                                                        back:false,
                                                                    }
                                                                });
                                                            }
                                                            } className="text-decoration-none">
                                                                {question.versions.title || "No title available"}
                                                            </a>
                                                        </p>
                                                        <span
                                                            className="badge text-bg-primary rounded-pill flex-shrink-0"
                                                            style={{cursor: "pointer"}}
                                                            onClick={() => showFeedbacks(question)}>{question.comments.length}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className="badge text-bg-primary rounded-pill flex-shrink-0">{questionTypesHuman[question.versions.type]}
                                                        </span>
                                                </div>
                                                <div
                                                    className="d-flex justify-content-between align-items-center w-100">
                                                    <p
                                                        className="m-0 text-truncate"
                                                    >
                                                        {question.versions.text}
                                                    </p>
                                                    {questionFilter === "Active" && (
                                                        <button
                                                            className="btn btn-outline-danger btn-xs p-0 px-2 ms-1 mb-1"
                                                            onClick={() => {
                                                                if (window.confirm("Are you sure you want to delete this question?")) {
                                                                    handleQuestionDeleteRestore(question.id, true, "Question has been marked as archived").then(() => {
                                                                    });
                                                                }
                                                            }}>
                                                            Archive
                                                        </button>
                                                    )}

                                                    {questionFilter === "Archived" && (
                                                        <button
                                                            className="btn btn-outline-primary btn-xs p-0 px-1 ms-1 mb-1"
                                                            onClick={() => {
                                                                if (window.confirm("Are you sure you want to restore this question?")) {
                                                                    handleQuestionDeleteRestore(question.id, false, "Question has been marked as active").then(() => {
                                                                    });
                                                                }
                                                            }}>
                                                            Restore
                                                        </button>
                                                    )}

                                                    {(questionFilter === "All" && !question["is_deleted"]) && (
                                                        <button
                                                            className="btn btn-outline-danger btn-xs p-0 px-1 ms-1 mb-1"
                                                            onClick={() => {
                                                                if (window.confirm("Are you sure you want to delete this question?")) {
                                                                    handleQuestionDeleteRestore(question.id, true, "Question has been marked as archived").then(() => {
                                                                    });
                                                                }
                                                            }}>
                                                            Archive
                                                        </button>
                                                    )
                                                    }

                                                    {(questionFilter === "All" && question["is_deleted"]) && (
                                                        <button
                                                            className="btn btn-outline-primary btn-xs p-0 px-1 ms-1 mb-1"
                                                            onClick={() => {
                                                                if (window.confirm("Are you sure you want to restore this question?")) {
                                                                    handleQuestionDeleteRestore(question.id, false, "Question has been marked as active").then(() => {
                                                                    });
                                                                }
                                                            }}>
                                                            Restore
                                                        </button>
                                                    )
                                                    }

                                                </div>
                                                <div
                                                    className="d-flex justify-content-between align-items-center w-100">
                                                        <span
                                                            className="m-0 text-secondary text-truncate">Last updated {question.versions.dateCreated} by {question.versions.author_name}</span><br/>
                                                    <button className="btn btn-outline-success btn-xs p-0 px-1 ms-1"
                                                            onClick={() => {
                                                                navigate(`/question/copy-question/${question.id}`, {
                                                                    state: {
                                                                        questionTitle: question.versions.title,
                                                                        catPath: category,
                                                                        id: actualCategory,
                                                                        selectedCategory: actualCategoryString,
                                                                        limit: limit,
                                                                        offset: offset,
                                                                        sort: sort,
                                                                        page: page,
                                                                        filterType: filterType,
                                                                        authorFilter: authorFilter,
                                                                        back:false,
                                                                    }
                                                                });

                                                            }}>
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ol>
                            {showQuestionsErr()}
                        </div>

                        {questions.length !== 0 && (
                            <div className='col-4 mx-auto'>
                                <ReactPaginate
                                    pageCount={Math.ceil(numberOfQuestionsFilter / limit)}
                                    pageRangeDisplayed={2}
                                    marginPagesDisplayed={2}
                                    onPageChange={handlePageChange}
                                    containerClassName="pagination justify-content-center mt-4"
                                    activeClassName="active"
                                    pageClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousClassName="page-item"
                                    previousLinkClassName="page-link"
                                    nextClassName="page-item"
                                    nextLinkClassName="page-link"
                                    breakClassName="page-item"
                                    breakLinkClassName="page-link"
                                    previousLabel="Previous"
                                    nextLabel="Next"
                                ></ReactPaginate>

                            </div>
                        )}

                        <div className={`modal fade ${showFeedback ? 'show' : ''}`} tabIndex="-1"
                             aria-labelledby="feedbackModalLabel" aria-hidden="true"
                             style={{display: showFeedback ? 'block' : 'none'}}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="feedbackModalLabel">Fedbacks for {actualFeedbacks.versions?.title}</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal"
                                                aria-label="Close" onClick={closeModal}></button>
                                    </div>
                                    <div className="modal-body">
                                        <table className="table table-striped table-hover table-fixed">
                                            <thead>
                                            <tr>
                                                <th scope="col" className="w-50 text-start">Author</th>
                                                <th scope="col" className="w-50 text-start">Text</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {actualFeedbacks.comments && actualFeedbacks.comments.map((feedback, ind) => (
                                                    <tr>
                                                        <td className="text-start">{feedback?.author}</td>
                                                        <td className="text-start">{feedback?.text}</td>
                                                    </tr>
                                                )
                                            )
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                                onClick={closeModal}>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-2">

                    </div>
                </div>

                </div>
            </div>
    )

}

export default Questions;