import React, { useState } from 'react';
import FormattedTextRenderer from "./FormattedTextRenderer";
const FormattedTextInput = ({
  handleFunction,
  text,
  isDisabled = false,
  idVal = "questionText"
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "d-flex justify-content-between"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "form-control w-50 me-2",
    id: idVal,
    disabled: isDisabled,
    value: text,
    onChange: e => handleFunction(e.target.value),
    rows: 4,
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "w-50  border border-1 p-2"
  }, /*#__PURE__*/React.createElement(FormattedTextRenderer, {
    text: text
  }))));
};
export default FormattedTextInput;