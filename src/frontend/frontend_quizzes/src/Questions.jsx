import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navigation from "./Navigation";
import Categories from "./CategoriesTree/Categories";
import ReactPaginate from "react-paginate";

const Questions = () => {
      const { page } = useParams();
      const [searchParams, setSearchParams] = useSearchParams();
      const navigate = useNavigate();

      const [numberOfQuestions, setNumberOfQuestions ] = useState(0);
      const [loading, setLoading] = useState(true);
      const [questions , setQuestions] = useState([]);
      const [numberOfQuestionsFilter,setNumberOfQuestionsFilter] = useState(0);

      const [teachers, setTeachers] = useState([]);
      const [authorFilter, setAuthorFilter] = useState(searchParams.get("author-filter") || "");

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
            setNumberOfQuestions(response.data[0].number_of_all_questions);
            setNumberOfQuestionsFilter(response.data[0].number_of_questions)
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

  const handlePageChange = (selectedPage) => {
        const newOffset = selectedPage.selected * limit;
        navigate(`/questions/${selectedPage.selected + 1}?limit=${limit}&offset=${newOffset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}&author-filter=${authorFilter}`);
    };

  const authorFilterShow = () =>{
      if (authorFilter === ""){
          return "Author"
      }

      return "Author:" + authorFilter
  }

  const typeFilterShow = () =>{
      if (filterType === ""){
          return "Type"
      }

      return "Type:" + filterType;
  }

  const sortFilterShow = () =>{
      if (sort === ""){
          return "Sort"
      }

      return "Sort:" + sort;
  }

  const showQuestionsErr = () =>{
        if (numberOfQuestions === 0){
            return (
                <div className="alert alert-danger" role="alert">
                    No questions in this category
                </div>
            )
        }

        if (numberOfQuestionsFilter === 0){
             return (
                <div className="alert alert-danger" role="alert">
                    No questions with those filters
                </div>
            )
        }
  }

    const sortTable = ["Newest", "Oldest", "Alphabetic", "Reverse Alphabetic"]
    const filterTypes = ["Matching Question", "Multiple Choice Question", "Short Question"]

  return (
      <div>
          <header className="navbar navbar-expand-lg bd-navbar sticky-top">
              <Navigation></Navigation>
          </header>
          <div className="container-fluid text-center" style ={{marginTop: "50px"}}>
              <div className="row">
                  <div className="col-2 sidebar" style={{position: "sticky",textAlign: "left", top: "50px", height: "calc(100vh - 60px)" }}>
                      <Categories catPath = {categoryPath} />
                  </div>
                  <div className="col-8">
                      <h2 className="mb-4">{actualCategoryString}</h2>

                      <div>

                          <div className='mb-3 d-flex justify-content-end'>
                              <div className="dropdown">
                                  <button className="btn btn-secondary text-decoration-none me-2"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      {authorFilterShow()}
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      <span className="d-flex justify-content-center fw-bold mb-2">Author</span>
                                      {
                                          teachers.map((teacher, index) => (
                                              <li key = {index}>
                                                  <a className="dropdown-item fs-6" href=""
                                                     onClick={(e) => {
                                                         e.preventDefault();
                                                         let teacher_name = teacher.name;
                                                         if (teacher_name === authorFilter) {
                                                             teacher_name = "";
                                                         }
                                                         setAuthorFilter(teacher_name);
                                                         navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&category_id=${actualCategory}author-filter=${teacher_name}`);
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
                                  <button className="btn btn-secondary text-decoration-none me-2"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      {typeFilterShow()}
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      <span className="d-flex justify-content-center fw-bold mb-2">Type</span>
                                      {
                                          filterTypes.map((name, index) => (
                                              <li key = {index}>
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
                                  <button className="btn btn-secondary text-decoration-none me-2"
                                          type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                      {sortFilterShow()}
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                      {
                                          sortTable.map((name, index) => (
                                              <li key={index}>
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
                                  navigate(`/question/new-question?id=${actualCategory}&selected_category=${actualCategoryString}&limit=${limit}&offset=${offset}&sort=${sort}&page=${page}&filter-type=${filterType}&author-filter=${authorFilter}`);
                              }
                              }
                              >Add question
                              </button>

                              <button type="button" className="btn btn-success" onClick={(e) => {
                                  navigate(`/category/new-category?id=${actualCategory}&selected_category=${actualCategoryString}&limit=${limit}&offset=${offset}&sort=${sort}&page=${page}&filter-type=${filterType}&author-filter=${authorFilter}`);
                              }}>Add category
                              </button>
                          </div>
                      </div>

                      <div>
                          <ol className="list-group">
                              {
                                  questions.map((question, index) => (
                                      <li key = {index} className="list-group-item d-flex justify-content-between align-items-start">
                                          <div className="ms-2 me-auto text-truncate text-start w-100">
                                              <div className="d-flex justify-content-between align-items-center w-100">
                                                  <h2 className="h5 text-start text-truncate">
                                                      <a href="" onClick={(e) => {
                                                          e.preventDefault();
                                                          navigate(`/question/${question.id}?id=${actualCategory}&selected_category=${actualCategoryString}&limit=${limit}&offset=${offset}&sort=${sort}&page=${page}&filter-type=${filterType}&author-filter=${authorFilter}`);
                                                      }
                                                      } className="text-decoration-none">
                                                          {question.versions.title || "No title available"}
                                                      </a>
                                                  </h2>
                                                  <span
                                                      className="badge text-bg-primary rounded-pill flex-shrink-0">{question.versions.type}
                                                  </span>
                                              </div>
                                              <p className="m-0 text-truncate">{question.versions.text}</p>
                                              <span
                                                  className="m-0 text-secondary text-truncate">Last updated {question.versions.dateCreated} by {question.versions.author_name}</span><br/>
                                          </div>
                                      </li>
                                  ))
                              }
                          </ol>
                          {showQuestionsErr()}
                      </div>

                      <div className='col-4 mx-auto'>
                          <ReactPaginate
                                pageCount={Math.ceil(numberOfQuestions / limit)}
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
                  </div>
                  <div className="col-2">

                  </div>
              </div>

          </div>
      </div>
  );
}

export default Questions;