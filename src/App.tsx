import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { cashOutline, receiptOutline } from "ionicons/icons";

import Products from "./pages/Products";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Tab3 from "./pages/Tab3";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import { Analytics } from "@vercel/analytics/react"
/* Theme variables */
import "./theme/variables.css";
setupIonicReact();
const App: React.FC = () => (
  <IonApp>
    <Analytics/>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/Products" component={Products} />

          <Route path="/Customers" component={Customers} />
          {/* <Route path="/Customers/:id" component={CustomerDetails} /> */}

          <Route exact path="/" render={() => <Redirect to="/Products" />} />

          <Route render={() => <Redirect to={"/Products"} />} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="products" href="/Products">
            <IonIcon aria-hidden="true" icon={cashOutline} />
          </IonTabButton>

          <IonTabButton tab="Customers" href="/Customers">
            <IonIcon aria-hidden="true" icon={receiptOutline} />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
