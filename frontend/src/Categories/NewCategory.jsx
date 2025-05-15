import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {useNavigate} from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Navigation from "../components/Navigation";
import Categories from "./CategoriesTree/Categories";
import Login from "../components/Login";

const NewCategory = () => {
    const location = useLocation();

    const catPath = location.state['catPath'];
    const page = location.state['page'];
    const limit = location.state['limit'];
    const offset = location.state['offset'];
    const userRole = location.state.userRole;
    const sort = location.state['sort'];
    const selectedCategory1 = location.state['selectedCategory'];
    const id = location.state['id'];
    const filters = location.state['filterType'];
    const authorFilter = location.state['authorFilter']
    const navigate = useNavigate();

    const [categorySelect, setCategorySelect] = useState([]);

    const [, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState("");
    const [generateSlugAut, setGenerateSlugAut] = useState(true);
    let [emptyTitle, setEmptyTitle] = useState("");

    const [selectedCategoryId, setSelectedCategoryId] = useState(id);
    const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);

    const apiUrl = process.env.REACT_APP_API_URL;

    const fetchCategory = async () => {
      try{
            const response = await axios.get(apiUrl+`categories`)
            setCategory(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
  }

  const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(apiUrl+`get-category-tree-array`)
            setCategorySelect([{id:1, title:"None (Create top-level category)"}, ...response.data]);
      }catch (error){
      }finally {
          setLoading(false);
      }
      }

  const saveCategory = () => {
        const data = {
            "supercategory" : selectedCategoryId,
            "title" : title,
            "slug" : slug
        }

        let canSave = true;
        const categoryFound = category.find(categoryA => categoryA.title === title);
        const slugFound = category.find(categoryA => categoryA.slug === slug);

        if (title.length === 0){
            emptyTitle+="Title is empty, fill title\n";
            canSave = false;
        }
        if(categoryFound){
            setEmptyTitle("Category with this title already exists, please rename\n");
            canSave = false;
        }
        if(slugFound){
            setEmptyTitle("Slug with this name already exists, please rename\n");
            canSave = false;
        }

        if (canSave) {
            axios.put(apiUrl+`categories/new-category`, data)
                .then(() => {
                        navigate(`/questions/${catPath}?page=${page}&limit=${limit}&offset=${offset}&category_id=${id}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                    }
                )
        }
  }

  const generateSlug = (text) => {
    return text
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleChange = (event) => {
      const newTitle = event.target.value;
        setTitle(newTitle);

        if (generateSlugAut) {
            setSlug(generateSlug(newTitle));
        }
    }

    const handleSlugChange = (event) => {
        setGenerateSlugAut(false);
        const newSlug = event.target.value;
        setSlug(newSlug);
    };

  useEffect(() => {
        setLoading(true);
        fetchCategory().then(() => {});
        fetchCategorySelect().then(() => {});
    }, []);

    if (userRole !=="teacher"){
        navigate("/quizzes");
    }

      return (
          <div>

                  <Navigation active="Questions"></Navigation>


              <div className="containter-fluid">
                  <div className="row">
                      <div className="col-2 sidebar"
                           style={{position: "sticky", textAlign: "left", top: "50px", height: "calc(100vh - 60px)"}}>
                          <Categories catPath={""}/>
                      </div>
                      <div className="col-8">
                          <h1>New Category</h1>
                          {emptyTitle !== "" && (
                              <div className="alert alert-danger" role="alert">
                                  {emptyTitle}
                              </div>
                          )}

                          <div className="mb-3">
                              <label htmlFor="select-category">Category</label>
                              <select
                                  id="select-category"
                                  className="form-select"
                                  value={selectedCategoryId.toString() || "0"}
                                  onChange={(e) => {

                                      const selectedOption = categorySelect.find(
                                          (cat) => cat.id === Number(e.target.value)
                                      );
                                      setSelectedCategory(selectedOption.title);
                                      setSelectedCategoryId(selectedOption.id);
                                  }}
                              >
                                  <option value="" disabled>
                                      Select a category
                                  </option>

                                  {Array.isArray(categorySelect) &&
                                      categorySelect.map((cat) => (
                                          <option key={cat.id} value={cat.id}>
                                              {cat.title}
                                          </option>
                                      ))}
                              </select>
                          </div>

                          <div className="input-group mb-3 ">
                          <span className="input-group-text">Title</span>
                              <input type="text" className="form-control" onChange={handleChange}/>
                          </div>

                          <div className="input-group mb-3 ">
                              <span className="input-group-text">Slug</span>
                              <input type="text" className="form-control" value={slug} onChange={handleSlugChange}/>
                          </div>

                          <div className='mb-3 d-flex justify-content-between'>
                              <button type="button" className="btn btn-outline-primary mb-3"
                                      onClick={() => {
                                          navigate(`/questions/${catPath}?page=${page}&limit=${limit}&offset=${offset}&category_id=${id}&category=${selectedCategory1}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                                      }
                                      }
                              >Back
                              </button>

                              <button type="button" className="btn btn-success mb-3"
                                      disabled={title.length === 0}
                                      onClick={() => {
                                          saveCategory();
                                      }
                                      }
                              >Submit
                              </button>

                          </div>
                      </div>
                      <div className="col-2"></div>
                  </div>
              </div>
          </div>
      )
}

export default NewCategory;