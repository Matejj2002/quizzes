import React from "react";

const TreeNode = ({ node, catPath,  level = 1 }) => {
    const includesP = () => {
        for (let i =0; i < catPath.length; i++){
            if (catPath[i][1] === node.id){
                return true;
            }
        }
        return false;
    }

  return (
    <div style={{ marginLeft: `${level * 10}px` }}>
      <a href = "" className="text-decoration-none"
         style={{
              color: includesP() ? 'red' : 'black',
              cursor: "pointer",
            }}
         key={node.title} onClick={(e) => {
          const url = new URL(window.location);
          url.searchParams.set("category_id", node.id);
          url.searchParams.set("category", node.title);
          window.history.pushState({}, "", url);
      }
      }

      >{node.title}</a>
      {node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} catPath={catPath} level = {level+1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode