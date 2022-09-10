import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import Tank from './components/Tank';
import {
  TANK_ICON_SIZES
} from './constants';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
    <Tank playerId="1950197" outline="true" size={TANK_ICON_SIZES.Large}/>
    <Tank playerId="3162693" outline="false" size={TANK_ICON_SIZES.Medium}/>
    <Tank playerId="1145079" outline="true" size={TANK_ICON_SIZES.Small}/>
    <Tank playerId="0" outline="true" size={TANK_ICON_SIZES.Large}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
