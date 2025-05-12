import { configureStore } from '@reduxjs/toolkit';
import backendReducer from './backendSlice';
export default function (backendUrl) {
  return configureStore({
    reducer: {
      backend: backendReducer(backendUrl)
    }
  });
}