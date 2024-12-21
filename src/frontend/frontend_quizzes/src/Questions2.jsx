import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navigation from "./Navigation";
import Categories from "./CategoriesTree/Categories";

const Questions2 = () => {
      const { page } = useParams();
      const [searchParams, setSearchParams] = useSearchParams();
      const navigate = useNavigate();

      const [numberOfQuestions, setNumberOfQuestions ] = useState(0);
      const [loading, setLoading] = useState(true);
      const [questions , setQuestions] = useState([]);

      const [teachers, setTeachers] = useState([]);
      const [authorFilter, setAuthorFilter] = useState(searchParams.get("author-filter") || "All");

      const [sort, setSort] = useState(searchParams.get("sort") || "");

      const [filterType, setFilterType] = useState(searchParams.get("filter-type") || "");

      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);

      const [actualCategory, setActualCategory] = useState(parseInt(searchParams.get("category_id") || 1));
      const [actualCategoryString, setActualCategoryString] = useState(searchParams.get("category")||"supercategory");

      const [categoryPath , setCategoryPath] = useState([]);

      const [allCategories, setAllCategories] = useState([]);

      const currentPage = parseInt(page || "1", 10);


  const fetchCategory = async (index) => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/questions/categories/get-path-to-supercategory/${index}`)
            setCategoryPath(response.data);

      }catch (error){

      }finally {
          setLoading(false);
      }
  }

  const fetchAllCategory = async () => {
      try{
          const response = await axios.get('http://127.0.0.1:5000/api/categories');
          setAllCategories(response.data);
      }catch(error){

      }finally {
          setLoading(false);
      }
  }

  const fetchAllTeachers = async () => {
      try{
          const response = await axios.get('http://127.0.0.1:5000/api/teachers');
          setTeachers(response.data);
      }catch(error){

      }finally {
          setLoading(false);
      }
  }

  const fetchQuestions = async (limit) => {
      try {
            const offset = (currentPage - 1) * limit;
            const authorFilterDec = decodeURIComponent(authorFilter);
            const response = await axios.get('http://127.0.0.1:5000/api/questions/' , {
            params: { limit, offset, sort, actualCategory, filterType, authorFilterDec },
            });
            setNumberOfQuestions(response.data[0].number_of_questions);
            setQuestions(response.data[2]);
      }catch (error){
      }finally {
            setLoading(false);
      }
  }

    useEffect(() => {
        setLoading(true);
        fetchQuestions(limit, offset);
        setCategoryPath([]);
        fetchCategory(actualCategory);
        fetchAllCategory();
  }, [limit, offset, page, actualCategory, authorFilter]);


  useEffect(() => {
    fetchAllTeachers();
}, []);


    useEffect(() => {
        setLoading(true);
        fetchQuestions(limit, offset, sort);
    }, [sort, filterType]);


  const numberOfPages = Math.ceil(numberOfQuestions / limit);
  const pageNumbers = [];

  if (numberOfPages > 1 && parseInt(page) <= numberOfPages){
      const pageNum = parseInt(page);

      if (!pageNumbers.includes(pageNum-1) && pageNum-1 >1){
        pageNumbers.push(pageNum-1);
      }

      if (!pageNumbers.includes(pageNum) && pageNum > 1 && pageNum< numberOfPages){
        pageNumbers.push(pageNum);
      }

      if (!pageNumbers.includes(pageNum+1) && pageNum+1 < numberOfPages){
        pageNumbers.push(pageNum+1);
      }

  }

  const sortTable = ["Newest", "Oldest", "Alphabetic", "Reverse Alphabetic"]
    const filterTypes = ["Matching Question", "Multiple Choice Question", "Short Question"]
  return (
      <div>
          <header className="navbar navbar-expand-lg bd-navbar sticky-top justify-content-center">
              <Navigation></Navigation>
          </header>
          <div className="container-fluid text-center">
              <div className="row">
                  <div className="col-2 sticky-top" style={{ position: "sticky", textAlign: "left", top: "0", height: "100vh", overflowY: "auto" }}>
                      <Categories catPath = {categoryPath} />
                  </div>
                  <div className="col-8">
                      <h2 className="mb-4">{actualCategoryString}</h2>

                      <div>

                          <div className='mb-3 d-flex justify-content-end'>
                              <div className="dropdown">
                                  <button className="btn btn-link dropdown-toggle text-dark text-decoration-none"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      Author
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      <span className="d-flex justify-content-center fw-bold mb-2">Author</span>
                                      {
                                          teachers.map((teacher, index) => (
                                              <li>
                                                  <a className="dropdown-item fs-6" href=""
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         setAuthorFilter(teacher.name);
                                                         navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}author-filter=${teacher.name}`);
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
                                  <button className="btn btn-link dropdown-toggle text-dark text-decoration-none"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      Type
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      <span className="d-flex justify-content-center fw-bold mb-2">Type</span>
                                      {
                                          filterTypes.map((name) => (
                                              <li>
                                                  <a className="dropdown-item fs-6" href=""
                                                     onClick={(e) => {
                                                         e.preventDefault();

                                                         if (filterType === name) {
                                                             name = "";
                                                         }
                                                         setFilterType(name);
                                                         navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${name}&category_id=${actualCategory}&author-filter=${authorFilter}`);
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
                                  <button className="btn btn-link dropdown-toggle text-dark text-decoration-none"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      Sort
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      <span className="d-flex justify-content-center fw-bold mb-2">Sort by</span>
                                      {
                                          sortTable.map((name) => (
                                              <li>
                                                  <a className="dropdown-item fs-6" href=""
                                                     onClick={(e) => {
                                                         e.preventDefault();

                                                         if (sort === name) {
                                                             name = "";
                                                         }
                                                         setSort(name)
                                                         navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${name}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`);
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

                              <button type="button" className="btn btn-success me-1" onClick={(e) => {
                                  navigate('/question/new-question');
                              }
                              }
                              >Add question
                              </button>

                              <button type="button" className="btn btn-success" onClick={(e) => {
                                  navigate(`/category/new-category?id=${actualCategory}&selected_category=${actualCategoryString}&limit=${limit}&offset=${offset}&sort=${sort}&page=${page}&filter-type=${filterType}$author-filter=${authorFilter}`);
                              }}>Add category
                              </button>
                          </div>
                      </div>

                      <div>
                          <ol className="list-group">
                              {
                                  questions.map((question, index) => (
                                      <li className="list-group-item d-flex justify-content-between align-items-start">
                                          <div className="ms-2 me-auto text-truncate text-start w-100">
                                              <div className="d-flex justify-content-between align-items-center w-100">
                                                  <h2 className="h5 text-start text-truncate">
                                                      <a href="" onClick={(e) => {
                                                          e.preventDefault();
                                                          navigate(`/question/${question.id}`);
                                                      }
                                                      } className="text-decoration-none">
                                                          {question.versions.title || "No title available"}
                                                      </a>
                                                  </h2>
                                                  <span
                                                      className="badge text-bg-primary rounded-pill flex-shrink-0">{question.versions.type}</span>
                                              </div>
                                              <p className="m-0 text-truncate">{question.versions.text}</p>
                                              <span
                                                  className="m-0 text-secondary text-truncate">Last updated {question.versions.dateCreated} by {question.versions.author_name}</span><br/>
                                          </div>
                                      </li>
                                  ))
                              }
                          </ol>
                      </div>

                      <div className='col-4 mx-auto'>
                          <div className="btn-toolbar justify-content-center mt-2" role="toolbar" aria-label="Toolbar with button groups">
                              {
                                  page === "1" ? (
                                      <div className="btn-group me-2" role="group" aria-label="First group">
                                          <button type="button" className="btn btn-danger" onClick={() => {
                                              const new_offset = (1 - 1) * limit;
                                              navigate(`/questions/${1}?limit=${limit}&offset=${new_offset}`)
                                          }
                                          }>1
                                          </button>
                                      </div>
                                  ) : (
                                      <div className="btn-group me-2" role="group" aria-label="First group">
                                          <button type="button" className="btn btn-primary" onClick={() => {
                                              const new_offset = (1 - 1) * limit;
                                              navigate(`/questions/${1}?limit=${limit}&offset=${new_offset}`)
                                          }
                                          }>1
                                          </button>
                                      </div>
                                  )
                              }

                              <div className="btn-group me-2" role="group" aria-label="First group">
                                  {
                                      pageNumbers.sort().map((index) => {
                                              if (parseInt(page) === index) {
                                                  return (
                                                      <button type="button" className="btn btn-danger" key={index}
                                                              onClick={() => {
                                                                  const new_offset = (index - 1) * limit;
                                                                  navigate(`/questions/${index}?limit=${limit}&offset=${new_offset}`)
                                                              }
                                                              }>{index}</button>
                                                  )
                                              } else {
                                                  return (
                                                      <button type="button" className="btn btn-primary" key={index}
                                                              onClick={() => {
                                                                  const new_offset = (index - 1) * limit;
                                                                  navigate(`/questions/${index}?limit=${limit}&offset=${new_offset}`)
                                                              }
                                                              }>{index}</button>
                                                  )
                                              }
                                          }
                                      )
                                  }
                              </div>
                              {numberOfPages > 1 &&
                                  (parseInt(page) === numberOfPages ? (
                                          <div className="btn-group me-2" role="group" aria-label="First group">
                                              <button type="button" className="btn btn-danger" onClick={() => {
                                                  const new_offset = (numberOfPages - 1) * limit;
                                                  navigate(`/questions/${numberOfPages}?limit=${limit}&offset=${new_offset}`)
                                              }
                                              }>{numberOfPages}</button>
                                          </div>
                                      ) : (
                                          <div className="btn-group me-2" role="group" aria-label="First group">
                                              <button type="button" className="btn btn-primary" onClick={() => {
                                                  const new_offset = (numberOfPages - 1) * limit;
                                                  navigate(`/questions/${numberOfPages}?limit=${limit}&offset=${new_offset}`)
                                              }
                                              }>{numberOfPages}</button>
                                          </div>
                                      )
                                  )
                              }
                          </div>
                      </div>
                  </div>
                  <div className="col-2">

                  </div>
              </div>

          </div>
      </div>
  );
}

export default Questions2;