import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import React from 'react';

interface DetailPageProps extends RouteComponentProps <{id: string}>{}

class Details extends React.Component<DetailPageProps> {
  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/dashboard" />
            </IonButtons>
            <IonTitle>{this.props.match.params.id} Detail</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
            <IonCardTitle>Card Title</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            Keep close to Nature's heart... and break clear away, once in awhile,
            and climb a mountain or spend a week in the woods. Wash your spirit clean.
          </IonCardContent>
        </IonCard>
        </IonContent>
      </IonPage>
    );
  }
};

export default Details;
