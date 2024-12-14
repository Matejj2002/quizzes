import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {useParams, useNavigate, useSearchParams} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navigation from "./Navigation";

const Questions2 = () => {
      const { page } = useParams();
      const [searchParams, setSearchParams] = useSearchParams();
      const navigate = useNavigate();

      const [numberOfQuestions, setNumberOfQuestions ] = useState(0);
      const [loading, setLoading] = useState(true);
      const [questions , setQuestions] = useState([]);

      const [teachers, setTeachers] = useState([]);
      const [authorFilter, setAuthorFilter] = useState("Author filter");

      const [sort, setSort] = useState(searchParams.get("sort") || "");

      const [filterIsChecked, setFilterIsChecked] = useState([false, false, false]);
      const [filterType, setFilterType] = useState("");

      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);

      const [actualCategory, setActualCategory] = useState(parseInt(searchParams.get("category_id") || 1));
      const [actualCategoryString, setActualCategoryString] = useState(searchParams.get("category")||"supercategory");

      const [categoryPath , setCategoryPath] = useState([]);
      const [lastCategory, setLastCategory] = useState("");

      const [allCategories, setAllCategories] = useState([]);

      const currentPage = parseInt(page || "1", 10);


  const fetchCategory = async (index) => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/questions/categories/get-path-to-supercategory/${index}`)
            setLastCategory(response.data.shift());
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

  const getFilterType = () =>{
      let result = [];
      if(filterIsChecked[0]){
          result.push("matching_answer_question")
      }
      if(filterIsChecked[1]){
          result.push("short_answer_question")
      }
      if (filterIsChecked[2]){
          result.push("multiple_answer_question")
      }
      setFilterType(result.join(","));

      return result.join(",");
    }

  const handleCheckboxChange = (index) =>{
        const newFilterIsChecked = [...filterIsChecked];
        newFilterIsChecked[index] = !newFilterIsChecked[index];
        setFilterIsChecked(newFilterIsChecked);
  }


  return (
      <div>
          <Navigation page={page} limit={limit} offset={offset} actualCategory={actualCategoryString}
                      filterType={filterType}
                      setSort={setSort}></Navigation>
          <div>
              <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                      {categoryPath.slice().reverse().map((cat) => (
                          <li className="breadcrumb-item" key={cat[1]}><a href=""
                                                                          onClick={(e) => {
                                                                              e.preventDefault();
                                                                              setActualCategory(cat[1]);
                                                                              setActualCategoryString(cat[0]);
                                                                              navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${cat[0]}&sort=${sort}$filter-type=${filterType}&author-filter=${authorFilter}`);
                                                                          }
                                                                          }>{cat[0]}</a></li>
                      ))
                      }
                      <li className="breadcrumb-item active" aria-current="page">{lastCategory[0]}</li>
                  </ol>
              </nav>
          </div>

          <div className='mb-3 d-flex'>
              <div className="btn-group dropend mb-3">
                  <button type="button" className="btn btn-secondary" onClick={(e) => {
                      navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${getFilterType()}$author-filter=${authorFilter}`);
                  }}>
                      Filter Question Type
                  </button>
                  <button type="button" className="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                          data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="visually-hidden">Toggle Dropend</span>
                  </button>


                  <ul className="dropdown-menu">
                      <li>
                          <div className="mb-3 ms-1">
                              <div className="form-check">
                                  <input type="checkbox" className="form-check-input" id="dropdownCheck2"
                                         checked={filterIsChecked[0]} onChange={(e) => handleCheckboxChange(0)}/>
                                  <label className="form-check-label" htmlFor="dropdownCheck2">
                                      MatchingQuestion
                                  </label>
                              </div>
                          </div>
                      </li>

                      <li>
                          <div className="mb-3 ms-1">
                              <div className="form-check">
                                  <input type="checkbox" className="form-check-input" id="dropdownCheck2"
                                         checked={filterIsChecked[1]} onChange={(e) => handleCheckboxChange(1)}/>
                                  <label className="form-check-label" htmlFor="dropdownCheck2">
                                      ShortQuestion
                                  </label>
                              </div>
                          </div>
                      </li>
                      <li>
                          <div className="mb-3 ms-1">
                              <div className="form-check">
                                  <input type="checkbox" className="form-check-input" id="dropdownCheck2"
                                         checked={filterIsChecked[2]} onChange={(e) => handleCheckboxChange(2)}/>
                                  <label className="form-check-label" htmlFor="dropdownCheck2">
                                      MultipleChoiceQuestion
                                  </label>
                              </div>
                          </div>
                      </li>
                  </ul>

              </div>
              <div className="dropdown ms-3">
                  <a className="btn btn-secondary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                     aria-expanded="false">
                      {authorFilter}
                  </a>

                  <ul className="dropdown-menu">
                      <li className="dropdown-item" href="" onClick={(e) => {
                                     e.preventDefault();
                                     setAuthorFilter("All");
                                     navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&author-filter="All"`);
                                 }}
                      >All</li>

                      {teachers.map((teacher, index) => (
                        <li key={index}><a className="dropdown-item" href="" onClick={(e) => {
                                     e.preventDefault();
                                     setAuthorFilter(teacher.name);
                                     navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${actualCategoryString}&sort=${sort}&filter-type=${filterType}&author-filter=${teacher.name}`);


                                 }
                                 }>{teacher.name}</a></li>
                    ))}

                  </ul>
              </div>
          </div>

          <div>
              <div className='mb-3 d-flex justify-content-between '>
                  <button type="button" className="btn btn-primary" onClick={(e) => {
                      navigate('/question/new-question');
                  }
                  }
                  >Add question
                  </button>

                  <button type="button" className="btn btn-primary" onClick={(e) => {
                      navigate(`/category/new-category?id=${actualCategory}&selected_category=${actualCategoryString}&limit=${limit}&offset=${offset}&sort=${sort}&page=${page}&filter-type=${filterType}$author-filter=${authorFilter}`);
                  }}>Add category
                  </button>
              </div>
              <select className="form-select mb-3" size="3" aria-label="Size 3 select example">
                  <option selected>{actualCategoryString}</option>
                  {
                      allCategories.map((cat, index) => (
                              <option value={index} key={index}
                                      onClick={() => {
                                          setActualCategory(cat.id);
                                          setActualCategoryString(cat.title);
                                          navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category=${cat.title}&sort=${sort}&filter-type=${filterType}$author-filter=${authorFilter}`);
                                      }}
                              >{cat.title}</option>
                          )
                      )
                  }
              </select>
          </div>

          <div>
              {
                  questions.map((question, index) => (
                      <div className="card w-100 mb-3 " key={index}>
                          <div className="card-body ">
                              <h5 className="card-title">
                                  <label>Title:</label> {question.versions.title || "No title available"}
                              </h5>
                              <p className="card-text"><label>Text:</label> {question.versions.text || " "}</p>

                              <ul className="list-group list-group-flush">
                                  <li className="list-group-item"><label>Category:</label> {question.category}</li>
                                  <li className="list-group-item">
                                      <label>Author:</label> {question.versions.author_name || " "}
                                  </li>
                                  <li className="list-group-item"><label>Type:</label> {question.versions.type || " "}
                                  </li>
                              </ul>
                              <a href=""
                                 className="btn btn-primary"
                                 onClick={(e) => {
                                     e.preventDefault();
                                     navigate(`/question/${question.id}`);
                                 }
                                 }
                              >Update</a>
                          </div>
                      </div>
                  ))
              }
          </div>

          <div className='col-4 mx-auto'>
              <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
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
  );
}

export default Questions2;