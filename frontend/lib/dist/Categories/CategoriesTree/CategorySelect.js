import React from "react";
import "./CategoryLink.css";
const CategorySelect = ({
  category,
  catPath,
  level = 0
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "",
    className: "text-decoration-none category-link",
    key: category.title
  }, `${"– ".repeat(level)}${category.title}`), category.children && category.children.length > 0 && /*#__PURE__*/React.createElement("div", null, category.children.map((subCat, index) => /*#__PURE__*/React.createElement(CategorySelect, {
    key: index,
    category: subCat,
    catPath: catPath,
    level: level + 1
  }))));
};
export default CategorySelect;