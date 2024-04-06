import React, { useEffect, useState, useCallback } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonImg,
  IonModal,
  IonButton,
  IonIcon,
  IonButtons,
  IonText,
  IonAlert,
  IonSearchbar,
  IonInput,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonFab,
  IonFabButton,
  IonFabList,
  IonToast,
  IonItemDivider,
  IonItemGroup,
} from "@ionic/react";

import {
  create,
  cart,
  trash,
  closeCircle,
  add,
  chevronDownCircleOutline,
  personCircle,
  pricetag,
} from "ionicons/icons";

import "./StyleCustomers.css";

import { supabase } from "./client";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState([]);

  const [showEditDebtAlert, setShowEditDebtAlert] = useState(false);
  const [newDebtAmount, setNewDebtAmount] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null);

  const [showCreteReceiptAlert, setShowCreateReceiptAlert] = useState(false);
  const [tempTotalPrice, setTempTotalPrice] = useState(0);
  const [activeCustomerId, setActiveCustomerId] = useState(null);

  const [showAddPersonAlert, setShowAddPersonAlert] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [showDebtUpdatedAlert, setShowDebtUpdatedAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPaidDebt, setTotalPaidDebt] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const fetchCustomers = async () => {
    try {
      let { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (error) {
      console.error("Error fetching customers:", error.message);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      let { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data ?? []);
    };
    searchCustomers();
    // Fetch customers list when the component mounts
    fetchCustomers();
  }, []);

  const fetchCustomerDetails = async (id) => {
    let { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (customerError) {
      console.error("Error fetching customer details:", customerError);
      return;
    }
    setCustomerDetails(customerData);
    await fetchReceipts(id); // Load receipts after setting customer details
    setShowModal(true);
  };

  const fetchReceipts = async (customerId) => {
    try {
      let { data, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("customer_id", customerId);
      if (error) throw error;

      // Calculate total paid debt
      const paidDebt = data
        .filter((receipt) => receipt.isPaid)
        .reduce((acc, curr) => acc + curr.initialDebt, 0);

      setTotalPaidDebt(paidDebt);
      setReceipts(data ?? []);
    } catch (error) {
      console.error("Error loading receipts:", error);
    }
  };

  const handleEditDebtClick = (receiptId) => {
    setActiveReceiptId(receiptId);
    setShowEditDebtAlert(true);
  };

  const handleCreateReceiptClick = (customerId) => {
    setActiveCustomerId(customerId);
    setShowCreateReceiptAlert(true);
  };

  // Buttton to update the debt amount of a receipt
  const updateReceiptDebt = async (payment) => {
    if (!activeReceiptId || payment <= 0) return;

    // Fetch the current debt amount of the receipt
    const { data: receiptData, error: fetchError } = await supabase
      .from("receipts")
      .select("remainingDebt")
      .eq("id", activeReceiptId)
      .single();

    if (fetchError || !receiptData) {
      console.error("Error fetching current receipt:", fetchError);
      return;
    }

    const updatedDebtAmount = Math.max(receiptData.remainingDebt - payment, 0);
    const isPaid = updatedDebtAmount === 0;

    // Perform the update
    const { error } = await supabase
      .from("receipts")
      .update({ remainingDebt: updatedDebtAmount, isPaid })
      .eq("id", activeReceiptId);

    if (error) {
      console.error("Error updating debt amount:", error);
    } else {
      setShowDebtUpdatedAlert(true);
      await fetchReceipts(customerDetails.id); // Refresh receipts data
      await fetchCustomerDetails(customerDetails.id); // Refresh customer details (total debt
      // updateCustomerTotalDebt(customerDetails.id);
      setShowEditDebtAlert(false);
    }
  };



  const createReceipt = async (customerId, price) => {
    if (!customerId || price <= 0) return; // Ensure validation checks for both customerId and price

    const { data: receiptData, error: receiptError } = await supabase
      .from("receipts")
      .insert([
        {
          customer_id: customerId,
          initialDebt: price,
          remainingDebt: price,
          dateCreated: new Date(),
          isPaid: false,
        },
      ]);

    if (receiptError) {
      console.error("Error creating receipt:", receiptError.message);
    } else {
      console.log("Receipt created successfully:", receiptData);
      setTempTotalPrice(0); // Reset after successful creation
      fetchCustomerDetails(customerDetails.id); // Refresh customer details including total debt
      fetchReceipts(customerId); // Refresh receipts to show the new one
      setShowCreateReceiptAlert(false); // Close the alert
    }
  };
  //  This function is for searching customers in the database. It will be called when the user types in the search bar.
  const searchCustomers = async () => {
    try {
      let query = supabase.from("customers").select("*");
      if (searchTerm) {
        query = query.ilike("customer_name", `%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      setCustomers(data ?? []);
    } catch (error) {
      console.error("Error searching customers:", error.message);
    }
  };

  // Define a debounced version of the search function
  useEffect(() => {
    const handler = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 100); // Adjust the debounce time as needed

    return () => clearTimeout(handler);
  }, [searchTerm]);

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

      fetchCustomers(); // Assumes loadData is defined as before to fetch items
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInput = (value) => {
    setSearchTerm(value.toLowerCase());
    console.log(value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cuentas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Buscar cuenta"
            debounce={200}
            onIonInput={(e) => handleInput(e.detail.value)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Cuentas</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton    onClick={() => setShowAddPersonAlert(true)}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonList>
          {customers.map((customer) => (
            <IonItem
              key={customer.id}
              button
              onClick={() => fetchCustomerDetails(customer.id)}
            >
              <IonAvatar slot="start">
                <IonImg
                  src="https://ionicframework.com/docs/img/demos/avatar.svg"
                  alt="Customer"
                />
              </IonAvatar>
              <IonLabel>
                <h2>{customer.customer_name}</h2>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Recibos de {customerDetails?.customer_name}</IonTitle>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>
                  Cerrar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent class="ion-padding">
            <h3>Lista de Recibos</h3>
            <IonFab slot="fixed" vertical="top" horizontal="end">
              <IonFabButton
                onClick={() => handleCreateReceiptClick(customerDetails.id)}
              >
                <IonIcon icon={add}></IonIcon>
              </IonFabButton>
            </IonFab>

            <IonAccordionGroup>
              <IonAccordion value="receiptsAccordion">
                <IonItem slot="header" color="light">
                  <IonLabel>Recibos Activos </IonLabel>
                </IonItem>
                <IonList className="ion-padding" slot="content">
                  <IonItemGroup>
                    <IonItemDivider>
                      <IonLabel>
                        Deuda Total: ${customerDetails?.customer_totaldebt}
                      </IonLabel>
                    </IonItemDivider>

                    {receipts.filter((receipt) => !receipt.isPaid).length >
                    0 ? (
                      receipts
                        .filter((receipt) => !receipt.isPaid)
                        .map((receipt, index) => (
                          <IonItem
                            key={index}
                            onClick={() => {
                              const receiptToEdit = receipts.find(
                                (r) => r.id === receipt.id
                              );
                              if (receiptToEdit) {
                                setActiveReceiptId(receipt.id); // You already have this
                                setShowEditDebtAlert(true); // You already have this
                              }
                            }}
                          >
                            <IonLabel>
                              <h2>
                                <strong>{`Recibo #${index + 1}`}</strong>
                              </h2>
                              <IonText style={{ fontSize: "smaller" }}>
                                <p>
                                  <strong>Último Pago:</strong>{" "}
                                  {receipt.dateLastPayment
                                    ? new Date(
                                        receipt.dateLastPayment
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Aún no pagado"}
                                </p>
                              </IonText>
                              <IonText style={{ fontSize: "smaller" }}>
                                <p>
                                  <strong>Creado:</strong>{" "}
                                  {new Date(
                                    receipt.dateCreated
                                  ).toLocaleDateString("es-ES", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </IonText>
                              <IonText
                                color="medium"
                                style={{ fontSize: "smaller" }}
                              >
                                <p>Monto Inicial: ${receipt.initialDebt}</p>
                              </IonText>
                            </IonLabel>
                            <IonBadge
                              slot="end"
                              style={{ backgroundColor: "green" }}
                            >
                              ${receipt.remainingDebt}
                            </IonBadge>
                          </IonItem>
                        ))
                    ) : (
                      <div style={{ padding: "16px", textAlign: "center" }}>
                        No hay recibos activos
                      </div>
                    )}
                  </IonItemGroup>
                </IonList>
              </IonAccordion>
              <IonAccordion value="paidReceipts">
                <IonItem slot="header" color="light">
                  <IonLabel>Recibos Pagados</IonLabel>
                </IonItem>

                <IonList className="ion-padding" slot="content">
                  <IonItemDivider>
                    <IonLabel>
                      Deuda Pagada: ${totalPaidDebt.toFixed(2)}
                    </IonLabel>
                  </IonItemDivider>

                  {receipts.filter((receipt) => receipt.isPaid).length > 0 ? (
                    receipts
                      .filter((receipt) => receipt.isPaid)
                      .map((receipt, index) => (
                        <IonItem key={receipt.id}>
                          <IonLabel>
                            <h2>{`Recibo #${index + 1}`}</h2>
                            <IonText style={{ fontSize: "smaller" }}>
                              <p>
                                <strong>Creado:</strong>{" "}
                                {new Date(
                                  receipt.dateCreated
                                ).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </IonText>

                            <IonText style={{ fontSize: "smaller" }}>
                              <p>
                                <strong>Último Pago:</strong>{" "}
                                {receipt.dateLastPayment
                                  ? new Date(
                                      receipt.dateLastPayment
                                    ).toLocaleDateString("es-ES", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Aún no pagado"}
                              </p>
                            </IonText>

                            <IonText
                              color="medium"
                              style={{ fontSize: "smaller" }}
                            >
                              <p>Monto Inicial: ${receipt.initialDebt}</p>
                            </IonText>
                          </IonLabel>
                          <IonBadge
                            slot="end"
                            style={{ backgroundColor: "green" }}
                          >
                            ${receipt.remainingDebt}
                          </IonBadge>
                        </IonItem>
                      ))
                  ) : (
                    <div style={{ padding: "16px", textAlign: "center" }}>
                      No hay recibos pagados
                    </div>
                  )}
                </IonList>
              </IonAccordion>
            </IonAccordionGroup>
          </IonContent>
        </IonModal>

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

        <IonAlert
          isOpen={showEditDebtAlert}
          onDidDismiss={() => setShowEditDebtAlert(false)}
          header={"Registrar Pago"}
          inputs={[
            {
              name: "paymentAmount",
              type: "number",
              placeholder: "Cantidad Pagada",
            },
          ]}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => {
                setNewDebtAmount(""); // You might need to adjust this part based on your state management
              },
            },
            {
              text: "Pagar",
              handler: (alertData) => {
                const payment = parseFloat(alertData.paymentAmount);
                if (!isNaN(payment)) {
                  // Make sure payment is a number
                  updateReceiptDebt(payment);
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showCreteReceiptAlert}
          onDidDismiss={() => setShowCreateReceiptAlert(false)}
          header={"Agregar Recibo"}
          inputs={[
            {
              name: "debtAmount",
              type: "number",
              placeholder: "Monto de Deuda",
            },
          ]}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
              handler: () => {
                setTempTotalPrice(0);
              },
            },
            {
              text: "Agregar",
              handler: (alertData) => {
                const price = parseFloat(alertData.debtAmount);
                createReceipt(activeCustomerId, price);
              },
            },
          ]}
        />

        {/* Toast for successful debt update */}
        <IonToast
          isOpen={showDebtUpdatedAlert}
          onDidDismiss={() => setShowDebtUpdatedAlert(false)}
          message="Transacción Registrada!"
          position="top"
          duration={2000} // Toast will dismiss after 2000ms
          // cssClass="payment-confirmation-toast"
        />
      </IonContent>
    </IonPage>
  );
};

export default Customers;
