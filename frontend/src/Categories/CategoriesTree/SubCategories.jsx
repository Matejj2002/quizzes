import React from "react";
import "./CategoryLink.css"

const SubCategories = ({ category, catPath,  level = 0 }) => {
    const includesP = () => {
        for (let i =0; i < catPath.length; i++){
            if (catPath[i][1] === category.id){
                return true;
            }
        }
        return false;
    }

    const quizzesUrl = process.env.REACT_APP_BASENAME;
  return (
    <div style={{ marginLeft: `${level * 10}px` }}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href = "" className="text-decoration-none category-link"
         key={category.title} onClick={() => {
          const catPathFull = catPath.slice(0, -1).map(item => item[0]).reverse().join('/') + "/" + category['title'];


          const url = new URL(window.location);
          url.pathname = quizzesUrl+`/questions${catPathFull}`;
          url.searchParams.set("category_id", category.id);
          url.searchParams.set("category", category.title);
          url.searchParams.set("limit", "10");
          url.searchParams.set("offset", "0");
          console.log(url);
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