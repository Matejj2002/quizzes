import { createSlice } from "@reduxjs/toolkit";

export default function(url) {
  return createSlice({name: 'backend', initialState: {url}}).reducer;
}