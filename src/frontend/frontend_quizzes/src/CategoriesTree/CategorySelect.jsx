import React from "react";
import "./CategoryLink.css"

const CategorySelect = ({ category, catPath,  level = 1 }) => {
    const includesP = () => {
        for (let i =0; i < catPath.length; i++){
            if (catPath[i][1] === category.id){
                return true;
            }
        }
        return false;
    }

  return (
    <div>
      <a href = "" className="text-decoration-none category-link"
         key={category.title}

      >{`${"– ".repeat(level)}${category.title}`}</a>
      {category.children && category.children.length > 0 && (
        <div>
          {category.children.map((subCat, index) => (
            <CategorySelect key={index} category={subCat} catPath={catPath} level = {level+1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelect