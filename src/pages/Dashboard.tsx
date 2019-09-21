import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonButton, IonButtons, IonIcon, IonList, IonLabel, IonFab, IonFabButton, IonText } from '@ionic/react';
import { withIonLifeCycle, IonModal } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { add, key, more, close, lock } from 'ionicons/icons';
import React from 'react';

import './Dashboard.css'

class Item {
  key: string
  constructor(key: string) {
    this.key = key
  }
}

type State = {
  items: Item[],
  next: number,
  selection: boolean,

  isAuthenticated: boolean
}

class Dashboard extends React.Component<RouteComponentProps, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: [new Item('AWS')],
      next: 2,
      selection: false,
      isAuthenticated: false
    }
  }
  
  ionViewWillEnter() {
    if (this.props.history.action === "POP") {
      this.setState({isAuthenticated: false});
    }

    console.log(this.props.history)
  }

  addItem = () => {
    this.state.items.push(new Item('Item ' + this.state.next));
    this.setState({
      items: this.state.items,
      next: this.state.next+1
    });
  }

  render() {
    return (
    <>
      <IonContent class="ion-padding">
        <IonModal isOpen={!this.state.isAuthenticated}>
          <div className="modal">
            <IonIcon icon={lock} size="large" slot="center"></IonIcon>
            <IonText class="ion-text-center">
              <h3>Please Enter the Password</h3>
            </IonText>
            <IonButton onClick={(e) => {this.setState({isAuthenticated: true})}}>Close</IonButton>
          </div>
        </IonModal>
      </IonContent>

      <IonPage>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>Encryptor</IonTitle>
            <IonButtons slot="primary">
              <IonButton fill="clear" onClick={() => this.setState({selection: true})}>
                <IonIcon slot="icon-only" icon={more} />
              </IonButton>
            </IonButtons>
            <IonButtons slot="secondary">
              <IonButton fill="clear">
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent class="ion-padding">
          <IonText color="primary">
            <h5 style={{fontWeight: 'bold'}}>Your Collections</h5>
          </IonText>

          <IonList class="ion-padding-2start ion-padding-end">
            {this.state.items.map(i => {
              return (
                <IonItem class="item" href={'/dashboard/' + i.key}>
                    <IonIcon slot="start" mode='md' color="primary" icon={key}></IonIcon>
                    <IonLabel class="ion-margin-vertical">
                      <h2>{i.key}</h2> 
                    </IonLabel>
                    <IonIcon slot="end" icon={lock}></IonIcon>
                </IonItem>);
            })}
          </IonList>
        </IonContent>
        <IonFab vertical="bottom" horizontal="end" class="ion-padding-end ion-padding-bottom">
          <IonFabButton color="primary" onClick={this.addItem}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonPage>
    </>);
  }
};

export default withIonLifeCycle(Dashboard);
