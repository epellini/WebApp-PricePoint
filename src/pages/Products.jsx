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
import {
  create,
  cart,
  trash,
  add,
  chevronDownCircleOutline,
  personCircle,
  pricetag,
} from "ionicons/icons";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Products = () => {
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

  // Function to play the notification sound
  const playNotificationSound = () => {
    notificationSound
      .play()
      .catch((error) => console.error("Error playing the sound:", error));
  };

  // function to get customer list that will show up in modal when pay button is clicked
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

  const handleCustomerSearch = (value) => {
    setSearchCustomerTerm(value.toLowerCase());
  };

  const modal = useRef(null);

  const handleInput = (value) => {
    setSearchTerm(value.toLowerCase());
    console.log(value);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  useEffect(() => {
    loadCustomers(searchCustomerTerm); // This fetches customers based on searchCustomerTerm
  }, [searchCustomerTerm]); // Re-fetches whenever searchCustomerTerm changes

  const loadData = async () => {
    try {
      let query = supabase.from("products").select("*");

      if (searchTerm) {
        query = query.ilike("product_name", `%${searchTerm}%`);
      }

      let { data, error } = await query;

      if (error) throw error;

      // Sort and set items
      setItems(
        data.sort((a, b) => a.product_name.localeCompare(b.product_name)) ?? []
      );
    } catch (error) {
      alert(error.message);
    }
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

  const updateProductPrice = async (itemId, newPrice, newName) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          product_price: parseFloat(newPrice),
          product_updateDate: new Date(),
          product_name: newName,
        })
        .match({ id: itemId });

      if (error) throw error;

      // After updating, reload the items to reflect the changes
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const addItem = async (productName, productPrice) => {
    try {
      let { error } = await supabase.from("products").insert([
        {
          product_name: productName,
          product_price: parseFloat(productPrice),
        },
      ]);

      if (error) throw error;

      // Reload items after adding
      loadData(); // Assumes loadData is defined as before to fetch items
    } catch (error) {
      alert(error.message);
    }
  };

  const addPerson = async (customerName) => {
    try {
      let { error } = await supabase.from("customers").insert([
        {
          customer_name: customerName,
          customer_updatedate: new Date(),
          customer_totaldebt: 0,
          customer_doesowe: false,
        },
      ]);

      if (error) throw error;

      // Reload items after adding
      // loadData(); Not needed since we're only adding customers
      loadCustomers(); // Assumes loadData is defined as before to fetch items
    } catch (error) {
      alert(error.message);
    }
  };

  function handleRefresh(event) {
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000); // Increase this duration as needed
  }

  const confirmDelete = (itemId) => {
    setItemToDelete(itemId); // Store the item ID to delete
    setShowDeleteAlert(true); // Show the delete confirmation alert
  };

  const deleteItem = async (itemId) => {
    try {
      let { error } = await supabase
        .from("products")
        .delete()
        .match({ id: itemId });

      if (error) throw error;

      // Reload items after deletion
      loadData(); // Assumes loadData is defined as before to fetch items
    } catch (error) {
      alert(error.message);
    }
  };

  const calculatePriceStatusColorClass = (product) => {
    const updateDate = product.product_updateDate;
    const updateDateTime = new Date(updateDate).getTime();
    const currentTime = new Date().getTime();
    const diffDays = Math.floor(
      (currentTime - updateDateTime) / (1000 * 3600 * 24)
    );
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

    // console.log(`Product: ${product.product_name}, Status Class: ${className}`);
    return className;
  };

  // For Searchbar Debounce
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
    // Store the current total price temporarily before opening the modal
    setTempTotalPrice(totalPrice);
    openModal();
  };

  const handleCustomerSelect = async (customerId, tempTotalPrice) => {
    console.log(
      `Attempting to update customer ${customerId} with amount ${tempTotalPrice}`
    );
    try {
      // Ensure tempTotalPrice is a number
      tempTotalPrice = parseFloat(tempTotalPrice);
      if (isNaN(tempTotalPrice)) {
        console.error("tempTotalPrice is not a valid number");
        return;
      }

      // Fetch the current total debt of the selected customer
      let { data: currentDebtData, error: fetchError } = await supabase
        .from("customers")
        .select("customer_totaldebt")
        .eq("id", customerId)
        .single();

      if (fetchError) throw fetchError;
      console.log(`Current debt data:`, currentDebtData);

      // Calculate the new total debt
      const currentDebt = currentDebtData.customer_totaldebt || 0;
      const newTotalDebt = currentDebt + tempTotalPrice;
      console.log(`New total debt: ${newTotalDebt}`);

      // Update the customer's total debt with the new amount
      const { data: updateData, error: updateError } = await supabase
        .from("customers")
        .update({
          customer_totaldebt: newTotalDebt,
          customer_updatedate: new Date(),
        })
        .eq("id", customerId);
      setShowPayConfirmToast(true);
      playNotificationSound();

      // Add the total and the customer ID to as a new record in the receipts table
      const { data: receiptData, error: receiptError } = await supabase
        .from("receipts")
        .insert([ // Insert the new receipt record
          {
            customer_id: customerId,
            receipt_initialDebt: tempTotalPrice,
            receipt_remainingDebt: tempTotalPrice,
            receipt_dateCreated: new Date(),
            receipt_isPaid: false,
          },
        ]); // This will add a new record to the receipts table

      if (receiptError) throw receiptError;
      console.log("Receipt data:", receiptData); // This should not be null if a row was inserted

      

      if (updateError) throw updateError;
      console.log("Update response:", updateData); // This should not be null if a row was updated

      if (updateData) {
        console.log("Customer debt updated successfully");
        // Reset tempTotalPrice after successful update
        setTempTotalPrice(0);
      } else {
        console.log(
          "No rows updated. Check if the customer ID exists and matches."
        );
      }

      modal.current?.dismiss();
      setTotalPrice(0); // Reset total price after successful update
    } catch (error) {
      console.error("Failed to update customer debt:", error);
      alert(error.message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Buscar producto"
            debounce={300}
            onIonInput={(e) => handleInput(e.detail.value)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Refresher */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            refreshingSpinner="circles"
          ></IonRefresherContent>
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Productos</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>

          <IonFabList side="top">
            <IonFabButton
              onClick={() => setShowAddProductAlert(true)}
              color={"dark"}
            >
              <IonIcon icon={pricetag}></IonIcon>
            </IonFabButton>
            <IonFabButton
              onClick={() => setShowAddPersonAlert(true)}
              color={"dark"}
            >
              <IonIcon icon={personCircle}></IonIcon>
            </IonFabButton>
          </IonFabList>
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
                        ).toLocaleDateString("es-ES", {
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
                        setCurrentProductName(productToEdit.product_name);
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
                  {/* Add Item to Basket */}
                  <IonItemOption
                    color="tertiary"
                    onClick={() => addToBasket(product.product_price)} // Assuming product.product_price is the price of the item
                  >
                    <IonIcon slot="icon-only" icon={cart}></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
        </IonList>

        {/* Alert to delete product */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Verificar eliminación"
          message="¿Estás seguro de que deseas eliminar este producto?"
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => {
                setShowDeleteAlert(false); // Optionally reset itemToDelete here if not done on dismissal
              },
            },
            {
              text: "Sí",
              handler: () => {
                if (itemToDelete !== null) {
                  deleteItem(itemToDelete);
                  setItemToDelete(null); // Reset the itemToDelete after deletion
                }
              },
            },
          ]}
        />

        {/* Alert to change price */}
        <IonAlert
          isOpen={showEditAlert}
          onDidDismiss={() => setShowEditAlert(false)}
          header="Actualizar Precio"
          inputs={[
            {
              name: "productName",
              type: "text",
              placeholder: "Nombre del producto",
              value: currentProductName, // Ensures value is kept between edits
            },
            {
              name: "productPrice",
              type: "number",
              placeholder: "Precio",
              value: currentProductPrice, // Ensures value is kept between edits
            },
          ]}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => setShowEditAlert(false),
            },
            {
              text: "Aceptar",
              handler: (alertData) => {
                // Assuming the new price is provided, call the update function here
                if (selectedItemId !== null) {
                  updateProductPrice(selectedItemId, alertData.productPrice);
                }
              },
            },
          ]}
        />

        {/* Alert to add new Item */}
        <IonAlert
          isOpen={showAddProductAlert}
          onDidDismiss={() => setShowAddProductAlert(false)}
          header="Agregar producto"
          inputs={[
            {
              name: "productName", // Add a name property for identification
              type: "text",
              placeholder: "Nombre del producto",
            },
            {
              name: "productPrice",
              type: "number",
              placeholder: "Precio",
            },
          ]}
          buttons={[
            {
              text: "Descartar",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Aceptar",
              handler: (alertData) => {
                addItem(alertData.productName, alertData.productPrice);
              },
            },
          ]}
        />

        {/* Alert to add new Person */}
        <IonAlert
          isOpen={showAddPersonAlert}
          onDidDismiss={() => setShowAddPersonAlert(false)}
          header="Agregar persona"
          inputs={[
            {
              name: "customerName", // Add a name property for identification
              type: "text",
              placeholder: "Nombre de la persona",
            },
          ]}
          buttons={[
            {
              text: "Descartar",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Aceptar",
              handler: (alertData) => {
                addPerson(alertData.customerName);
              },
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => {
            setShowToast(false);
            setTotalPrice(0);
          }} // Reset total on dismiss
          message={`Total: $${totalPrice.toFixed(2)}`}
          duration={0} // Adjust duration as needed
          cssClass="custom-toast" // Apply the custom CSS class
          buttons={[
            {
              text: "Descartar",
              role: "cancel",
              handler: () => {
                console.log("Dismiss clicked");
              },
            },
            {
              text: "Pagar",
              role: "pay",
              handler: () => {
                handlePayClick();
                console.log("Pay clicked");
              },
            },
          ]}
        />

        {/* Toast for successful payment */}
        <IonToast
          isOpen={showPayConfirmToast}
          onDidDismiss={() => setShowPayConfirmToast(false)}
          message="Transacción Registrada!"
          position="top"
          duration={2000} // Toast will dismiss after 2000ms
          cssClass="payment-confirmation-toast"
        />

        {/* Modal that brings up the customers */}

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
                    {/* Add other customer details here as needed */}
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
