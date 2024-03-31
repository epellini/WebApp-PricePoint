import React from 'react'
import {
    IonBackButton,
    IonButtons,
    IonButton,
    IonHeader,
    IonContent,
    IonNavLink,
    IonToolbar,
    IonTitle,
  } from '@ionic/react';

const CustomerDetails = () => {
  return (
    <>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton></IonBackButton>
        </IonButtons>
        <IonTitle>Page Two</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent class="ion-padding">
      <h1>Page Two</h1>
    </IonContent>
  </>
  )
}

export default CustomerDetails