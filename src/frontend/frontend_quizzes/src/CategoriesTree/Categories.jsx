import React, { useState, useEffect } from "react";
import SubCategories from "./SubCategories";

const Categories = ({catPath}) => {
  const [categories, setCategories] = useState('');

  useEffect(() => {const fetchTreeData = async () => {
      const response = await fetch("http://127.0.0.1:5000/api/get-category-tree");
      const data = await response.json();
      setCategories(data);
    };

    fetchTreeData();
  }, []);

  return (
    <div>
      <SubCategories category={categories} catPath = {catPath} ></SubCategories>
    </div>
  );
};

export default Categories;