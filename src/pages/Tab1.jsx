import React, { useEffect, useState } from "react";
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
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import "./Tab1.css";
import { create, cart, trash, add, chevronDownCircleOutline  } from "ionicons/icons";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Tab1 = () => {
  const [editItem, setEditItem] = useState();
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAlert, setShowAddAlert] = useState(false);
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
  const [validationError, setValidationError] = useState("");

  const [showValidationErrorToast, setShowValidationErrorToast] =
    useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState("");

  const [productNameError, setProductNameError] = useState("");
  const [productPriceError, setProductPriceError] = useState("");

  const handleInput = (value) => {
    setSearchTerm(value.toLowerCase());
    console.log(value);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

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
          <IonFabButton onClick={() => setShowAddAlert(true)}>
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
          isOpen={showAddAlert}
          onDidDismiss={() => setShowAddAlert(false)}
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
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
