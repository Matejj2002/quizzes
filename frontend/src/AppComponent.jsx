import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import initStore from './redux/store';

import { connect } from 'react-redux';

export default function configure(backendUrl) {
  return {
    prepare: (initialState, additionalArgs) => {
      const syncedState = JSON.parse(JSON.stringify(initialState)) || {}
      const instance = {
        store: initStore(backendUrl),
        syncedState,
        ghAccessToken: additionalArgs?.ghAccessToken,
      };
      const getState = (instance) => JSON.parse(JSON.stringify(instance.syncedState));
      return {
        instance,
        getState
      };
    },
    AppComponent: (props) => (
      <div
        className={`formalization-checker-ZF2r5pOxUp`}
      >
        <Provider store={props.instance.store}>
          <AppComponent instance={props.instance} onStateChange={props.onStateChange} />
        </Provider>
      </div>
    )
  }
}

function AppComponent({ instance, onStateChange, isEdited }) {
  return (
    <>
      Ahoj
    </>
  );
}