import FormattedTextRenderer from "./FormattedTextRenderer";
import React, { useEffect, useState } from "react";
import axios from "axios";
const WrongAnswersTable = ({
  wrongAnswers,
  tableCols,
  colsSize,
  colsType,
  title
}) => {
  const [showData, setShowData] = useState(wrongAnswers);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [sortArray, setSortArray] = useState(Array.from({
    length: tableCols.length
  }, () => "no"));
  const showSort = {
    "no": " ",
    "asc": "🔼",
    "desc": "🔽"
  };
  const handleSort = item_id => {
    setSortArray(prev => {
      const newSort = [...prev];
      newSort[item_id] = prev[item_id] === "no" ? "asc" : prev[item_id] === "asc" ? "desc" : "no";
      return newSort;
    });
  };
  const fetchData = async () => {
    try {
      const response = await axios.post(apiUrl + `sort-matching-questions-statistics`, {
        "sort": sortArray,
        "data": wrongAnswers,
        "colsType": colsType
      });
      setShowData(response.data.result);
    } catch (error) {} finally {}
  };
  useEffect(() => {
    fetchData();
  }, [sortArray]);
  return /*#__PURE__*/React.createElement("table", {
    className: "table table-striped"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, tableCols.map((col, ind) => /*#__PURE__*/React.createElement("th", {
    scope: "col",
    key: title + "head" + ind.toString(),
    className: colsSize[ind],
    style: {
      cursor: "pointer",
      whiteSpace: "nowrap"
    },
    onClick: () => handleSort(ind)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }
  }, col, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "1em",
      display: "inline-block",
      textAlign: "center"
    }
  }, showSort[sortArray[ind]] || /*#__PURE__*/React.createElement(React.Fragment, null, "\xA0"))))))), /*#__PURE__*/React.createElement("tbody", null, showData.map((answ, ind) => /*#__PURE__*/React.createElement("tr", {
    key: title + ind.toString()
  }, tableCols.map((col, inds) => /*#__PURE__*/React.createElement("td", {
    className: colsSize[inds],
    key: title + "-answs-" + inds.toString()
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: answ[inds].toString() || "No answer"
  })))))));
};
export default WrongAnswersTable;