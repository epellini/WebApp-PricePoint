import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CustomerDetails = () => {
  const { id } = useParams();
  // Rename the state setter function for clarity
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    // This async function is correctly scoped and distinct from the state setter
    const fetchCustomerDetails = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single(); // Assuming 'id' is your unique identifier

      if (error) {
        console.error('Error fetching customer details:', error);
      } else {
        setCustomerDetails(data); // Use the correctly named state setter function here
      }
    };

    // Don't forget to call the function within the useEffect hook
    fetchCustomerDetails();
  }, [id]); // Re-fetch if the ID changes

  // Loading or error state handling
  if (!customerDetails) return <div>Cargando...</div>;


  return (
      <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
          <IonButton routerLink="/Customers">Cuentas</IonButton>
          </IonButtons>
          <IonTitle>{customerDetails.customer_name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <h2>Customer Details</h2>
        {/* Display other customer details here */}
        <p>Name: {customerDetails.customer_name}</p>
        {/* Add more details as needed */}
      </IonContent>
    </>
  )
}

export default CustomerDetails