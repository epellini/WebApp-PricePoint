import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
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
  const [customerDetails, setCustomerDetails] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single(); // Assuming 'id' is your unique identifier

      if (error) {
        console.error('Error fetching customer details:', error);
      } else {
        setCustomerDetails(data);
      }
    };

    fetchCustomerDetails();
  }, [id]); // Re-fetch if the ID changes

  // Loading or error state handling
  if (!customerDetails) return <div>Loading customer details...</div>;

  return (
      <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
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