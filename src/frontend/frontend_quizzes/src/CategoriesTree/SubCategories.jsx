import React from "react";
import "./CategoryLink.css"

const SubCategories = ({ category, catPath,  level = 1 }) => {
    const includesP = () => {
        for (let i =0; i < catPath.length; i++){
            if (catPath[i][1] === category.id){
                return true;
            }
        }
        return false;
    }

  return (
    <div style={{ marginLeft: `${level * 10}px` }}>
      <a href = "" className="text-decoration-none category-link"
         key={category.title} onClick={(e) => {
          const url = new URL(window.location);
          url.pathname = "/questions/1";
          url.searchParams.set("category_id", category.id);
          url.searchParams.set("category", category.title);
          url.searchParams.set("limit", 10);
          url.searchParams.set("offset", 0);
          window.history.pushState({}, "", url);
      }
      }

      >{includesP() ? <strong>{category.title}</strong> : category.title}</a>
      {category.children && category.children.length > 0 && (
        <div>
          {category.children.map((subCat, index) => (
            <SubCategories key={index} category={subCat} catPath={catPath} level = {level+1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubCategories