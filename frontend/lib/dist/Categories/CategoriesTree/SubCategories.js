import React from "react";
import "./CategoryLink.css";
const SubCategories = ({
  category,
  catPath,
  level = 0
}) => {
  const includesP = () => {
    for (let i = 0; i < catPath.length; i++) {
      if (catPath[i][1] === category.id) {
        return true;
      }
    }
    return false;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: `${level * 10}px`
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "",
    className: "text-decoration-none category-link",
    key: category.title,
    onClick: () => {
      const catPathFull = catPath.slice(0, -1).map(item => item[0]).reverse().join('/') + "/" + category['title'];
      const url = new URL(window.location);
      url.pathname = `/questions/${catPathFull}`;
      url.searchParams.set("category_id", category.id);
      url.searchParams.set("category", category.title);
      url.searchParams.set("limit", "10");
      url.searchParams.set("offset", "0");
      window.history.pushState({}, "", url);
    }
  }, includesP() ? /*#__PURE__*/React.createElement("strong", null, category.title) : category.title), category.children && category.children.length > 0 && /*#__PURE__*/React.createElement("div", null, category.children.map((subCat, index) => /*#__PURE__*/React.createElement(SubCategories, {
    key: index,
    category: subCat,
    catPath: catPath,
    level: level + 1
  }))));
};
export default SubCategories;