import React, { useEffect, useState, useRef } from "react";
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
} from "@ionic/react";
import "./StyleProducts.css";
import { create, cart, trash, add, chevronDownCircleOutline } from "ionicons/icons";

// Import data from exampleData.js
import { products as exampleProducts, customers as exampleCustomers } from "./exampleData";

const Products = () => {
  const [editItem, setEditItem] = useState();
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProductAlert, setShowAddProductAlert] = useState(false);
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
  const [showValidationErrorToast, setShowValidationErrorToast] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState("");
  const [productNameError, setProductNameError] = useState("");
  const [productPriceError, setProductPriceError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [tempTotalPrice, setTempTotalPrice] = useState(0);
  const [showPayConfirmToast, setShowPayConfirmToast] = useState(false);

  const notificationSound = new Audio("/paymentConfirmation.mp3");

  const playNotificationSound = () => {
    notificationSound
      .play()
      .catch((error) => console.error("Error playing the sound:", error));
  };

  const loadCustomers = (searchCustomerTerm = "") => {
    let filteredCustomers = exampleCustomers;
    if (searchCustomerTerm) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.customer_name.toLowerCase().includes(searchCustomerTerm.toLowerCase())
      );
    }
    setCustomers(filteredCustomers.sort((a, b) => a.customer_name.localeCompare(b.customer_name)));
  };

  const handleCustomerSearch = (value) => {
    setSearchCustomerTerm(value.toLowerCase());
  };

  const modal = useRef(null);

  const handleInput = (value) => {
    setSearchTerm(value.toLowerCase());
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  useEffect(() => {
    loadCustomers(searchCustomerTerm);
  }, [searchCustomerTerm]);

  const loadData = () => {
    let filteredItems = exampleProducts;
    if (searchTerm) {
      filteredItems = filteredItems.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setItems(filteredItems.sort((a, b) => a.product_name.localeCompare(b.product_name)));
  };

  const addToBasket = (price) => {
    setTotalPrice((currentTotal) => currentTotal + price);
    setShowToast(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const updateProductPrice = (itemId, newPrice) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, product_price: parseFloat(newPrice), product_updateDate: new Date().toISOString() } : item
    );
    setItems(updatedItems);
  };

  const addItem = (productName, productPrice) => {
    const newItem = {
      id: items.length + 1,
      product_name: productName,
      product_price: parseFloat(productPrice),
      product_updateDate: new Date().toISOString(),
    };
    setItems([...items, newItem]);
  };

  const handleRefresh = (event) => {
    setTimeout(() => {
      event.detail.complete();
    }, 2000);
  };

  const confirmDelete = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteAlert(true);
  };

  const deleteItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const calculatePriceStatusColorClass = (product) => {
    const updateDate = product.product_updateDate;
    const updateDateTime = new Date(updateDate).getTime();
    const currentTime = new Date().getTime();
    const diffDays = Math.floor((currentTime - updateDateTime) / (1000 * 3600 * 24));
    let className;

    if (diffDays <= 7) {
      className = "green-badge";
    } else if (diffDays <= 14) {
      className = "yellow-badge";
    } else if (diffDays <= 21) {
      className = "orange-badge";
    } else {
      className = "red-badge";
    }

    return className;
  };

  const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const openModal = () => {
    modal.current?.present();
  };

  const handlePayClick = () => {
    setTempTotalPrice(totalPrice);
    openModal();
  };

  const handleCustomerSelect = (customerId, tempTotalPrice) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === customerId ? { ...customer, customer_totaldebt: customer.customer_totaldebt + parseFloat(tempTotalPrice) } : customer
    );
    setCustomers(updatedCustomers);
    setShowPayConfirmToast(true);
    playNotificationSound();
    modal.current?.dismiss();
    setTotalPrice(0);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Products</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Search product"
            debounce={200}
            onIonInput={(e) => handleInput(e.detail.value)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          ></IonRefresherContent>
        </IonRefresher>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => setShowAddProductAlert(true)}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonList inset={true}>
          {items
            .filter((item) =>
              item.product_name.toLowerCase().includes(searchTerm)
            )
            .map((product, index) => (
              <IonItemSliding key={index}>
                <IonItem button={true}>
                  <IonLabel>
                    <h2>{product.product_name}</h2>
                    <IonText color="medium" style={{ fontSize: "smaller" }}>
                      <p>
                        {new Date(
                          product.product_updateDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </IonText>
                  </IonLabel>
                  <IonBadge
                    slot="end"
                    className={calculatePriceStatusColorClass(product)}
                  >
                    $ {formatPrice(product.product_price)}
                  </IonBadge>
                </IonItem>
                <IonItemOptions slot="end">
                  <IonItemOption
                    color="danger"
                    expandable={true}
                    onClick={() => confirmDelete(product.id)}
                  >
                    <IonIcon slot="icon-only" icon={trash}></IonIcon>
                  </IonItemOption>
                  <IonItemOption
                    color="warning"
                    onClick={() => {
                      const productToEdit = items.find(
                        (item) => item.id === product.id
                      );
                      if (productToEdit) {
                        setCurrentProductPrice(
                          productToEdit.product_price.toString()
                        );
                        setSelectedItemId(product.id);
                        setShowEditAlert(true);
                      }
                    }}
                  >
                    <IonIcon slot="icon-only" icon={create}></IonIcon>
                  </IonItemOption>
                  <IonItemOption
                    color="tertiary"
                    onClick={() => addToBasket(product.product_price)}
                  >
                    <IonIcon slot="icon-only" icon={cart}></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
        </IonList>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Deletion"
          message="Are you sure you want to delete this product?"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setShowDeleteAlert(false);
              },
            },
            {
              text: "Yes",
              handler: () => {
                if (itemToDelete !== null) {
                  deleteItem(itemToDelete);
                  setItemToDelete(null);
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showEditAlert}
          onDidDismiss={() => setShowEditAlert(false)}
          header="Update Price"
          inputs={[
            {
              name: "productPrice",
              type: "number",
              placeholder: "Price",
              value: currentProductPrice,
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => setShowEditAlert(false),
            },
            {
              text: "Accept",
              handler: (alertData) => {
                if (selectedItemId !== null) {
                  updateProductPrice(selectedItemId, alertData.productPrice);
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showAddProductAlert}
          onDidDismiss={() => setShowAddProductAlert(false)}
          header="Add Product"
          inputs={[
            {
              name: "productName",
              type: "text",
              placeholder: "Product name",
            },
            {
              name: "productPrice",
              type: "number",
              placeholder: "Price",
            },
          ]}
          buttons={[
            {
              text: "Discard",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Accept",
              handler: (alertData) => {
                addItem(alertData.productName, alertData.productPrice);
              },
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false);
            setTotalPrice(0);
          }}
          message={`Total: $${totalPrice.toFixed(2)}`}
          duration={0}
          cssClass="custom-toast"
          buttons={[
            {
              text: "Discard",
              role: "cancel",
              handler: () => {
                console.log("Dismiss clicked");
              },
            },
            {
              text: "Pay",
              role: "pay",
              handler: () => {
                handlePayClick();
                console.log("Pay clicked");
              },
            },
          ]}
        />

        <IonToast
          isOpen={showPayConfirmToast}
          onDidDismiss={() => setShowPayConfirmToast(false)}
          message="Transaction Registered!"
          position="top"
          duration={2000}
          cssClass="payment-confirmation-toast"
        />

        <IonModal
          ref={modal}
          keepContentsMounted={true}
          initialBreakpoint={0.5}
          breakpoints={[0, 0.25, 0.5, 0.75]}
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => modal.current?.dismiss()}>
                  Close
                </IonButton>
              </IonButtons>
              <IonTitle>Select Customer</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonSearchbar
              debounce={300}
              value={searchCustomerTerm}
              onClick={() => modal.current?.setCurrentBreakpoint(0.75)}
              onIonInput={(e) => handleCustomerSearch(e.detail.value)}
              onIonChange={(e) => setSearchCustomerTerm(e.detail.value)}
              placeholder="Search"
            ></IonSearchbar>
            <IonList>
              {customers.map((customer) => (
                <IonItem
                  key={customer.id}
                  button
                  onClick={() =>
                    handleCustomerSelect(customer.id, tempTotalPrice)
                  }
                >
                  <IonAvatar slot="start">
                    <img
                      alt={customer.customer_name}
                      src="https://ionicframework.com/docs/img/demos/avatar.svg"
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{customer.customer_name}</h2>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Products;
