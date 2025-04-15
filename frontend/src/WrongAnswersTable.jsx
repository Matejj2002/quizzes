import FormattedTextRenderer from "./components/FormattedTextRenderer";
import React, {useEffect, useState} from "react";
import axios from "axios";

const WrongAnswersTable = ({wrongAnswers, tableCols, colsSize, colsType}) =>{
    const [showData, setShowData] = useState(wrongAnswers);
    const apiUrl = process.env.REACT_APP_API_URL;
    const [sortArray, setSortArray] = useState(
    Array.from({ length: tableCols.length }, () => "no")
  );
    const showSort = {
        "no":" ",
        "asc": "🔼",
        "desc": "🔽",
    }

    const handleSort = (item_id) =>{
        setSortArray((prev) => {
      const newSort = [...prev];
      newSort[item_id] =
        prev[item_id] === "no"
          ? "asc"
          : prev[item_id] === "asc"
          ? "desc"
          : "no";
      return newSort;
    });
    }

    const fetchData = async () => {
      try{
            const response = await axios.post(apiUrl+`sort-matching-questions-statistics`, {
                    "sort": sortArray,
                    "data": wrongAnswers,
                    "colsType": colsType,
            })
            setShowData(response.data.result);
      }catch (error){
      }
       finally {}
    }

    useEffect(() => {
        fetchData();
    }, [sortArray]);

    return (
        <table className="table table-striped">
            <thead>
            <tr>
                {tableCols.map((col, ind) => (
                        <th
                            scope="col"
                            className={colsSize[ind]}
                            style={{cursor: "pointer", whiteSpace: "nowrap"}}
                            onClick={() => handleSort(ind)}
                        >
                  <span style={{display: "inline-flex", alignItems: "center", gap: "4px"}}>
                        {col}
                      <span style={{width: "1em", display: "inline-block", textAlign: "center"}}>
                      {showSort[sortArray[ind]] || <>&nbsp;</>}
                    </span>
                  </span>
                        </th>
                    )
                )
                }

            </tr>
            </thead>
            <tbody>
            {showData.map((answ, ind) => (
                <tr>
                    {tableCols.map((col, inds) => (
                            <td className={colsSize[inds]}>
                                <FormattedTextRenderer
                                    text={answ[inds].toString() || "No answer"}
                                />

                            </td>
                        )
                    )}
                </tr>
            ))}

            </tbody>
        </table>
    )
}

export default WrongAnswersTable;