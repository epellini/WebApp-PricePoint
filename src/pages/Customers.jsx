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
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonFab,
  IonFabButton,
  IonToast,
  IonItemDivider,
  IonItemGroup,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
} from "@ionic/react";
import {
  create,
  trash,
  add,
} from "ionicons/icons";

import "./StyleCustomers.css";

// Import data from exampleData.js
import { customers as exampleCustomers, receipts as exampleReceipts } from "./exampleData";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [showEditDebtAlert, setShowEditDebtAlert] = useState(false);
  const [newDebtAmount, setNewDebtAmount] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null);
  const [showCreateReceiptAlert, setShowCreateReceiptAlert] = useState(false);
  const [tempTotalPrice, setTempTotalPrice] = useState(0);
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [showAddPersonAlert, setShowAddPersonAlert] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDebtUpdatedAlert, setShowDebtUpdatedAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPaidDebt, setTotalPaidDebt] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditCustomerAlert, setShowEditCustomerAlert] = useState(false);
  const [currentCustomerName, setCurrentCustomerName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [totalDebt, setTotalDebt] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(exampleCustomers);
    const total = exampleCustomers.reduce(
      (acc, customer) => acc + parseFloat(customer.customer_totaldebt || 0),
      0
    );
    setTotalDebt(total);
  };

  const fetchCustomerDetails = (id) => {
    const customerData = exampleCustomers.find((customer) => customer.id === id);
    setCustomerDetails(customerData);
    fetchReceipts(id);
    setShowModal(true);
  };

  const fetchReceipts = (customerId) => {
    const customerReceipts = exampleReceipts.filter(
      (receipt) => receipt.customer_id === customerId
    );

    const paidDebt = customerReceipts
      .filter((receipt) => receipt.isPaid)
      .reduce((acc, curr) => acc + curr.initialDebt, 0);

    setTotalPaidDebt(paidDebt);
    setReceipts(customerReceipts);
  };

  const handleEditDebtClick = (receiptId) => {
    setActiveReceiptId(receiptId);
    setShowEditDebtAlert(true);
  };

  const handleCreateReceiptClick = (customerId) => {
    setActiveCustomerId(customerId);
    setShowCreateReceiptAlert(true);
  };

  const updateReceiptDebt = (payment) => {
    if (!activeReceiptId || payment <= 0) return;

    const receiptIndex = receipts.findIndex(
      (receipt) => receipt.id === activeReceiptId
    );
    if (receiptIndex === -1) return;

    const updatedDebtAmount = Math.max(
      receipts[receiptIndex].remainingDebt - payment,
      0
    );
    const isPaid = updatedDebtAmount === 0;

    const updatedReceipts = [...receipts];
    updatedReceipts[receiptIndex] = {
      ...updatedReceipts[receiptIndex],
      remainingDebt: updatedDebtAmount,
      isPaid,
      dateLastPayment: new Date().toISOString(),
    };

    setReceipts(updatedReceipts);
    setShowDebtUpdatedAlert(true);
    fetchCustomerDetails(customerDetails.id);
    setShowEditDebtAlert(false);
  };

  const createReceipt = (customerId, price) => {
    if (!customerId || price <= 0) return;

    const newReceipt = {
      id: receipts.length + 1,
      customer_id: customerId,
      initialDebt: price,
      remainingDebt: price,
      dateCreated: new Date().toISOString(),
      isPaid: false,
    };

    setReceipts([...receipts, newReceipt]);
    fetchCustomerDetails(customerDetails.id);
    setShowCreateReceiptAlert(false);
  };

  const searchCustomers = () => {
    let filteredCustomers = exampleCustomers;
    if (searchTerm) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setCustomers(filteredCustomers);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      searchCustomers();
    }, 100);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const addPerson = (customerName) => {
    const newCustomer = {
      id: customers.length + 1,
      customer_name: customerName,
      customer_updatedate: new Date().toISOString(),
      customer_totaldebt: 0,
      customer_doesowe: false,
    };

    setCustomers([...customers, newCustomer]);
  };

  const handleInput = (value) => {
    setSearchTerm(value.toLowerCase());
  };

  const confirmDelete = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteAlert(true);
  };

  const deleteItem = (itemId) => {
    const updatedCustomers = customers.filter(
      (customer) => customer.id !== itemId
    );
    const updatedReceipts = receipts.filter(
      (receipt) => receipt.customer_id !== itemId
    );

    setCustomers(updatedCustomers);
    setReceipts(updatedReceipts);
  };

  const updateCustomer = (customerId, customerName) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId
        ? { ...customer, customer_name: customerName }
        : customer
    );
    setCustomers(updatedCustomers);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Accounts</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder="Search account"
            debounce={200}
            onIonInput={(e) => handleInput(e.detail.value)}
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Accounts</IonTitle>
          </IonToolbar>

          <IonItemDivider className="mainDivider" color="danger">
            <IonLabel>
              Total Debt: $
              {totalDebt.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </IonLabel>
          </IonItemDivider>
        </IonHeader>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => setShowAddPersonAlert(true)}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <IonList inset={true}>
          {customers.map((customer) => (
            <IonItemSliding key={customer.id}>
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
              <IonItemOptions slot="end">
                <IonItemOption
                  onClick={() => confirmDelete(customer.id)}
                  expandable={true}
                  color="danger"
                >
                  <IonIcon slot="icon-only" icon={trash}></IonIcon>
                </IonItemOption>
                <IonItemOption
                  color="warning"
                  onClick={() => {
                    setCurrentCustomerName(customer.customer_name);
                    setSelectedCustomerId(customer.id);
                    setShowEditCustomerAlert(true);
                  }}
                >
                  <IonIcon slot="icon-only" icon={create}></IonIcon>
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Receipts of {customerDetails?.customer_name}</IonTitle>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent class="ion-padding">
            <h3>Receipt List</h3>
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
                  <IonLabel>Active Receipts</IonLabel>
                </IonItem>
                <IonList className="ion-padding" slot="content">
                  <IonItemGroup>
                    <IonItemDivider>
                      <IonLabel>
                        Total Debt: ${customerDetails?.customer_totaldebt}
                      </IonLabel>
                    </IonItemDivider>

                    {receipts.filter((receipt) => !receipt.isPaid).length > 0 ? (
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
                                setActiveReceiptId(receipt.id);
                                setShowEditDebtAlert(true);
                              }
                            }}
                          >
                            <IonLabel>
                              <h2>
                                <strong>{`Receipt #${index + 1}`}</strong>
                              </h2>
                              <IonText style={{ fontSize: "smaller" }}>
                                <p>
                                  <strong>Last Payment:</strong>{" "}
                                  {receipt.dateLastPayment
                                    ? new Date(
                                        receipt.dateLastPayment
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Not paid yet"}
                                </p>
                              </IonText>
                              <IonText style={{ fontSize: "smaller" }}>
                                <p>
                                  <strong>Created:</strong>{" "}
                                  {new Date(receipt.dateCreated).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </IonText>
                              <IonText
                                color="medium"
                                style={{ fontSize: "smaller" }}
                              >
                                <p>Initial Amount: ${receipt.initialDebt}</p>
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
                        No active receipts
                      </div>
                    )}
                  </IonItemGroup>
                </IonList>
              </IonAccordion>
              <IonAccordion value="paidReceipts">
                <IonItem slot="header" color="light">
                  <IonLabel>Paid Receipts</IonLabel>
                </IonItem>

                <IonList className="ion-padding" slot="content">
                  <IonItemDivider>
                    <IonLabel>
                      Paid Debt: ${totalPaidDebt.toFixed(2)}
                    </IonLabel>
                  </IonItemDivider>

                  {receipts.filter((receipt) => receipt.isPaid).length > 0 ? (
                    receipts
                      .filter((receipt) => receipt.isPaid)
                      .map((receipt, index) => (
                        <IonItem key={receipt.id}>
                          <IonLabel>
                            <h2>{`Receipt #${index + 1}`}</h2>
                            <IonText style={{ fontSize: "smaller" }}>
                              <p>
                                <strong>Created:</strong>{" "}
                                {new Date(receipt.dateCreated).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </IonText>

                            <IonText style={{ fontSize: "smaller" }}>
                              <p>
                                <strong>Last Payment:</strong>{" "}
                                {receipt.dateLastPayment
                                  ? new Date(
                                      receipt.dateLastPayment
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Not paid yet"}
                              </p>
                            </IonText>

                            <IonText
                              color="medium"
                              style={{ fontSize: "smaller" }}
                            >
                              <p>Initial Amount: ${receipt.initialDebt}</p>
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
                      No paid receipts
                    </div>
                  )}
                </IonList>
              </IonAccordion>
            </IonAccordionGroup>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAddPersonAlert}
          onDidDismiss={() => setShowAddPersonAlert(false)}
          header="Add Person"
          inputs={[
            {
              name: "customerName",
              type: "text",
              placeholder: "Person's Name",
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
                addPerson(alertData.customerName);
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Deletion"
          message="Are you sure you want to delete this account and all associated receipts?"
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
          isOpen={showEditCustomerAlert}
          onDidDismiss={() => setShowEditCustomerAlert(false)}
          header="Edit Customer"
          inputs={[
            {
              name: "customerName",
              type: "text",
              value: currentCustomerName,
              placeholder: "Customer Name",
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                console.log("Edit cancelled");
              },
            },
            {
              text: "Save",
              handler: (alertData) => {
                updateCustomer(selectedCustomerId, alertData.customerName);
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showEditDebtAlert}
          onDidDismiss={() => setShowEditDebtAlert(false)}
          header={"Register Payment"}
          inputs={[
            {
              name: "paymentAmount",
              type: "number",
              placeholder: "Amount Paid",
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
              text: "Pay",
              handler: (alertData) => {
                const payment = parseFloat(alertData.paymentAmount);
                if (!isNaN(payment)) {
                  updateReceiptDebt(payment);
                }
              },
            },
          ]}
        />

        <IonAlert
          isOpen={showCreateReceiptAlert}
          onDidDismiss={() => setShowCreateReceiptAlert(false)}
          header={"Add Receipt"}
          inputs={[
            {
              name: "debtAmount",
              type: "number",
              placeholder: "Debt Amount",
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

        <IonToast
          isOpen={showDebtUpdatedAlert}
          onDidDismiss={() => setShowDebtUpdatedAlert(false)}
          message="Transaction Registered!"
          position="top"
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Customers;
