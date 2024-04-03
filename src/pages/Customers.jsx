import React, { useEffect, useState } from "react";
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
} from "@ionic/react";
import { closeCircle } from "ionicons/icons";

import "./StyleCustomers.css";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState([]);

  const [showEditDebtAlert, setShowEditDebtAlert] = useState(false);
  const [newDebtAmount, setNewDebtAmount] = useState(0);
  const [activeReceiptId, setActiveReceiptId] = useState(null);

  const [showCreteReceiptAlert, setShowCreateReceiptAlert] = useState(false);
  const [tempTotalPrice, setTempTotalPrice] = useState(0);
  const [activeCustomerId, setActiveCustomerId] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      let { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data ?? []);
    };
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
  const updateReceiptDebt = async () => {
    if (!activeReceiptId || newDebtAmount === "") return;

    const { data, error } = await supabase
      .from("receipts")
      .update({ remainingDebt: newDebtAmount })
      .eq("id", activeReceiptId);

    if (error) {
      console.error("Error updating debt amount:", error);
    } else {
      alert("Debt amount updated successfully.");
      // Reset state and close the alert
      setNewDebtAmount("");
      fetchReceipts();
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
      fetchReceipts(customerId); // Refresh receipts to show the new one
      setShowCreateReceiptAlert(false); // Close the alert
    }
  };
  //  This function is for searching customers in the database. It will be called when the user types in the search bar.
  const searchCustomers = async (searchCustomerTerm = "") => {
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
              <IonTitle>{customerDetails?.customer_name}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeCircle} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent class="ion-padding">
            <h2>Recibos de {customerDetails?.customer_name}</h2>
            <IonButton
              onClick={() => handleCreateReceiptClick(customerDetails.id)}
            >
              ok
            </IonButton>

            <IonAccordionGroup>
              <IonAccordion value="receiptsAccordion">
                <IonItem slot="header" color="light">
                  <IonLabel>Recibos Activos</IonLabel>
                </IonItem>
                <IonList className="ion-padding" slot="content">
                  {receipts.map((receipt, index) => (
                    <IonItem
                      key={index}
                      onClick={() => handleEditDebtClick(receipt.id)}
                    >
                      <IonLabel>
                        <h2>
                          {" "}
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
                            {new Date(receipt.dateCreated).toLocaleDateString(
                              "es-ES",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </IonText>

                        <IonText color="medium" style={{ fontSize: "smaller" }}>
                          <p>Monto Inicial: ${receipt.initialDebt}</p>
                        </IonText>
                      </IonLabel>
                      <IonBadge slot="end" style={{ backgroundColor: "green" }}>
                        ${receipt.remainingDebt}
                      </IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              </IonAccordion>
              <IonAccordion value="paidReceipts">
                <IonItem slot="header" color="light">
                  <IonLabel>Recibos Pagados</IonLabel>
                </IonItem>
                <IonList className="ion-padding" slot="content">
                  {receipts
                    .filter((receipt) => receipt.isPaid)
                    .map((receipt, index) => (
                      <IonItem key={receipt.id}>
                        <IonLabel>
                          <h2>{`Recibo #${receipt.id}`}</h2>
                          <IonText
                            color="medium"
                            style={{ fontSize: "smaller" }}
                          >
                            <p>
                              Fecha:{" "}
                              {new Date(receipt.dateCreated).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p>Monto: ${receipt.remainingDebt}</p>
                          </IonText>
                        </IonLabel>
                        <IonBadge
                          slot="end"
                          style={{ backgroundColor: "green" }}
                        >
                          ${receipt.remainingDebt}
                        </IonBadge>
                      </IonItem>
                    ))}
                </IonList>
              </IonAccordion>
            </IonAccordionGroup>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showEditDebtAlert}
          onDidDismiss={() => setShowEditDebtAlert(false)}
          header={"Update Debt Amount"}
          inputs={[
            {
              name: "newDebtAmount",
              type: "number",
              placeholder: "New Debt Amount",
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setNewDebtAmount("");
              },
            },
            {
              text: "Update",
              handler: (alertData) => {
                setNewDebtAmount(alertData.newDebtAmount);
                updateReceiptDebt();
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showCreteReceiptAlert}
          onDidDismiss={() => setShowCreateReceiptAlert(false)}
          header={"Add New Receipt"}
          inputs={[
            {
              name: "debtAmount",
              type: "number",
              placeholder: "New Debt Amount",
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setTempTotalPrice(0);
              },
            },
            {
              text: "Add",
              handler: (alertData) => {
                const price = parseFloat(alertData.debtAmount);
                createReceipt(activeCustomerId, price);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Customers;
