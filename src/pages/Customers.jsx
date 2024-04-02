import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonIcon,
  IonItemOptions,
  IonItemOption,
  IonItemSliding,
  IonLabel,
  IonBadge,
  IonText,
  IonAlert,
  IonButton,
  IonFab,
  IonFabList,
  IonFabButton,
  IonToast,
  IonInput,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonButtons,
  IonAvatar,
  IonImg,
  IonNav,
  IonNavLink,
} from "@ionic/react";
import {
  create,
  cart,
  trash,
  add,
  chevronDownCircleOutline,
  personCircle,
  pricetag,
} from "ionicons/icons";
import ExploreContainer from "../components/ExploreContainer";
import "./StyleCustomers.css";
import React, { useEffect, useState, useRef } from "react";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

import CustomerDetails from "./CustomerDetails";

const Customers = () => {
  const [editItem, setEditItem] = useState();
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProductAlert, setShowAddProductAlert] = useState(false);
  const [showAddPersonAlert, setShowAddPersonAlert] = useState(false);
  const [tempInputName, setTempInputName] = useState("");
  const [tempInputPrice, setTempInputPrice] = useState("");
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const [currentProductName, setCurrentProductName] = useState("");
  const [currentProductPrice, setCurrentProductPrice] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [validationError, setValidationError] = useState("");

  const [showValidationErrorToast, setShowValidationErrorToast] =
    useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState("");

  const [productNameError, setProductNameError] = useState("");
  const [productPriceError, setProductPriceError] = useState("");

  const [customers, setCustomers] = useState([]);
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");

  const [tempTotalPrice, setTempTotalPrice] = useState(0);

  const [showPayConfirmToast, setShowPayConfirmToast] = useState(false);

  const notificationSound = new Audio("/paymentConfirmation.mp3");

  const handleCustomerSearch = (value) => {
    setSearchCustomerTerm(value.toLowerCase());
  };

  const loadCustomers = async (searchCustomerTerm = "") => {
    try {
      let query = supabase.from("customers").select("*");
      if (searchCustomerTerm) {
        query = query.ilike("customer_name", `%${searchCustomerTerm}%`);
      }
      let { data, error } = await query;
      if (error) throw error;
      setCustomers(
        data.sort((a, b) => a.customer_name.localeCompare(b.customer_name)) ??
          []
      );
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    loadCustomers(searchCustomerTerm); // This fetches customers based on searchCustomerTerm
  }, [searchCustomerTerm]); // Re-fetches whenever searchCustomerTerm changes

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Samboode</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Cuentas</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          {customers.map((customer) => (
            <IonItem key={customer.id} routerLink={`/Customers/${customer.id}`} detail={false}>
              <IonAvatar slot="start">
                <IonImg src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Customer" />
              </IonAvatar>
              <IonLabel>
                <h2>{customer.customer_name}</h2>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Customers;
