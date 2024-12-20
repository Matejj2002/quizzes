import React, { useState, useEffect } from "react";
import TreeNode from "./TreeNode";

const Tree = ({catPath}) => {
  const [treeData, setTreeData] = useState('');

  useEffect(() => {const fetchTreeData = async () => {
      const response = await fetch("http://127.0.0.1:5000/api/get-category-tree");
      const data = await response.json();
      setTreeData(data);
    };

    fetchTreeData();
  }, []);

  return (
    <div>
      <TreeNode node={treeData} catPath = {catPath} ></TreeNode>
    </div>
  );
};

export default Tree;