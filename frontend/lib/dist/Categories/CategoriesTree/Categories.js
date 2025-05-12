import React, { useState, useEffect } from "react";
import SubCategories from "./SubCategories";
import CategorySelect from "./CategorySelect";
const Categories = ({
  catPath,
  type = "SubCat"
}) => {
  const [categories, setCategories] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchTreeData = async () => {
      const response = await fetch(apiUrl + "get-category-tree");
      const data = await response.json();
      setCategories(data);
    };
    fetchTreeData().then(() => {});
  }, []);
  return /*#__PURE__*/React.createElement("div", null, type === "SubCat" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SubCategories, {
    category: categories,
    catPath: catPath
  })), type === "ChosCat" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(CategorySelect, {
    category: categories,
    catPath: catPath
  })));
};
export default Categories;