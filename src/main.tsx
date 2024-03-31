import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { IonNav } from '@ionic/react';

import Tab2 from './pages/Customers';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <IonNav root={() => <App />}></IonNav>;
    {/* <App /> */}
  </React.StrictMode>
);