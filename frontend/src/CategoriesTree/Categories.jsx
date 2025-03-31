import React, { useState, useEffect } from "react";
import SubCategories from "./SubCategories";
import CategorySelect from "./CategorySelect";

const Categories = ({catPath, type= "SubCat"}) => {
  const [categories, setCategories] = useState('');

  useEffect(() => {const fetchTreeData = async () => {
      const response = await fetch("http://127.0.0.1:5000/api/get-category-tree");
      const data = await response.json();
      setCategories(data);
    };

    fetchTreeData().then(() => {});
  }, []);

  return (
      <div>
          {type === "SubCat" && (
    <div>
      <SubCategories category={categories} catPath={catPath} />
    </div>
  )}

  {type === "ChosCat" && (
    <div>
      <CategorySelect category={categories} catPath={catPath} />
    </div>
  )}
      </div>
      );
};

export default Categories;