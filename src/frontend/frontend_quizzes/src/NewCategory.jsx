import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {useNavigate} from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Navigation from "./Navigation";
import Categories from "./CategoriesTree/Categories";

const NewCategory = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const selectedCategory1 = queryParams.get('selected_category');

    const page = queryParams.get("page");
    const limit = queryParams.get("limit");
    const offset = queryParams.get("offset");
    const sort = queryParams.get("sort");
    const categoryS = queryParams.get("selected_category");
    const categorySId = queryParams.get("id");
    const filters = queryParams.get("filter-type");
    const authorFilter = queryParams.get("author-filter")

    const navigate = useNavigate();

    const [categorySelect, setCategorySelect] = useState("");

    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState("");
    const [generateSlugAut, setGenerateSlugAut] = useState(true);
    let [emptyTitle, setEmptyTitle] = useState("");

    const [selectedCategoryId, setSelectedCategoryId] = useState(id);
    const [selectedCategory, setSelectedCategory] = useState(selectedCategory1);

    const fetchCategory = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/categories`)
            setCategory(response.data);
      }catch (error){
      }finally {
          setLoading(false);
      }
  }

  const fetchCategorySelect = async () => {
      try{
            const response = await axios.get(`http://127.0.0.1:5000/api/get-category-tree-array`)
            setCategorySelect(response.data);
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
            axios.put(`http://127.0.0.1:5000/api/categories/new-category`, data)
                .then(response => {
                        navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category_id=${categorySId}&category=${categoryS}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                    }
                )
        }
  }

  const generateSlug = (text) => {
    return text
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
        fetchCategory();
        fetchCategorySelect();
    }, []);

  return (
      <div>
          <header className="navbar navbar-expand-lg bd-navbar sticky-top">
              <Navigation></Navigation>
          </header>

          <div className="containter-fluid" style ={{marginTop: "50px"}}>
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
                              value={selectedCategoryId || ""}
                              onChange={(e) => {
                                  const selectedOption = categorySelect.find(
                                      (cat) => cat.id === parseInt(e.target.value)
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

                      <div className='mb-3 d-flex justify-content-center'>
                          <button type="button" className="btn btn-success mb-3 me-3"
                                  onClick={() => {
                                      saveCategory();
                                  }
                                  }
                          >Submit
                          </button>

                          <button type="button" className="btn btn-primary mb-3"
                                  onClick={() => {
                                      navigate(`/questions/${page}?limit=${limit}&offset=${offset}&category_id=${categorySId}&category=${categoryS}&sort=${sort}&filter-type=${filters}&author-filter=${authorFilter}`);
                                  }
                                  }
                          >Back
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