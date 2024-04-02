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
  IonSearchbar,
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

  useEffect(() => {
    const loadCustomers = async () => {
      let { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      setCustomers(data ?? []);
    };

    loadCustomers();
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
    await loadReceipts(id); // Load receipts after setting customer details
    setShowModal(true);
  };

  const loadReceipts = async (customerId) => {
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

  const updateCustomerDebt = async (customerId, amount) => {
    // Assuming you have a column `total_debt` in your `customers` table
    let { data, error } = await supabase
      .from("customers")
      .update({
        total_debt: supabase.rpc("add_to_debt", { amount_to_add: amount }),
      }) // Example: Use a stored procedure or direct operation
      .eq("id", customerId);

    if (error) {
      console.error("Error updating customer debt:", error);
      return;
    }

    alert(`Debt updated. New total: ${data[0].total_debt}`);
    setShowModal(false); // Optionally close the modal after update
  };

  const markDebtAsPaid = async (customerId) => {
    let { data, error } = await supabase
      .from("receipts")
      .update({ receipt_currentAmount: 0, receipt_ispaid: true }) // Ensure column names match your schema
      .eq("customer_id", customerId); // Correctly target receipts by customer ID
  
    if (error) {
      console.error("Error marking debt as paid:", error);
      return;
    }
  
    alert("All debts for the customer marked as paid.");
    // setShowModal(false); // Optionally close the modal after update
  };
  

  //  This function is for searching customers in the database. It will be called when the user types in the search bar.
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
            <h2>Customer Details</h2>
            <p>Name: {customerDetails?.customer_name}</p>

            <h2>Receipts:</h2>
            <IonList>
              {receipts.map((receipt, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    <p>{`Receipt ${index + 1}`}</p>
                  </IonLabel>
                  <IonText
                    color="medium"
                    style={{ display: "block", fontSize: "smaller" }}
                  >
                    <p>
                      Date:{" "}
                      {new Date(receipt.receipt_createddate).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <IonText>Amount: {receipt.receipt_amount}</IonText>
                  </IonText>
                  <IonButton
                    onClick={() =>
                      updateCustomerDebt(
                        customerDetails.id,
                        receipt.receipt_amount
                      )
                    }
                  >
                    Update Debt
                  </IonButton>
                  <IonButton onClick={() => markDebtAsPaid(customerDetails.id)}>
                    Mark as Paid
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Customers;
