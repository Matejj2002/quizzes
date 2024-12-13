import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useNavigate, useParams} from "react-router-dom";
import { useLocation } from 'react-router-dom';
const NewCategory = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    const selectedCategory1 = queryParams.get('selected_category');

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState([]);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState("");
    const [generateSlugAut, setGenerateSlugAut] = useState(true);
    const [emptyTitle, setEmptyTitle] = useState(false);

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

  const saveCategory = () => {
        const data = {
            "supercategory" : selectedCategoryId,
            "title" : title,
            "slug" : slug
        }
        if (title.length === 0){
            setEmptyTitle(true);
        }else {
            axios.put(`http://127.0.0.1:5000/api/categories/new-category`, data)
                .then(response => {
                        window.location.href = '/questions';
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
    }, []);

  return (
      <div>
          <h1>New Category</h1>
          {emptyTitle && (
              <div className="alert alert-danger" role="alert">
                  Title musi byt vyplnene !
              </div>
          )}
          <div className="input-group mb-3">
              <label className="input-group-text" htmlFor="inputGroupSelect01">Supercategory</label>
              <select className="form-select" id="inputGroupSelect01">
                  <option value={id} key={id} selected>{selectedCategory}</option>
                  {
                      category.map((cat, index) => (parseInt(id) !== cat.id && (
                                  <option value={index} key={index} onClick={() => {
                                      setSelectedCategory(cat.title);
                                      setSelectedCategoryId(cat.id);

                                  }
                                  }
                                  >{cat.title}</option>
                              )
                          )
                      )
                  }
              </select>
          </div>


          <div className="input-group mb-3 ">
              <span className="input-group-text" id="inputGroup-sizing-default">Title</span>
              <input type="text" className="form-control" aria-label="Sizing example input"
                     aria-describedby="inputGroup-sizing-default" onChange={handleChange}/>
          </div>

          <div className="input-group mb-3 ">
              <span className="input-group-text" id="inputGroup-sizing-default">Slug</span>
              <input type="text" className="form-control" aria-label="Sizing example input"
                     aria-describedby="inputGroup-sizing-default" value={slug} onChange={handleSlugChange}/>
          </div>

          <button type="button" className="btn btn-primary mb-3"
                  onClick={() => {
                      saveCategory();
                  }
                  }
          >Submit
          </button>
      </div>
  )
}

export default NewCategory;