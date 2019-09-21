import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonButton, IonButtons, IonIcon, IonList, IonLabel, IonFab, IonFabButton } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { add, key, trash } from 'ionicons/icons';
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
  selection: boolean
}

class Dashboard extends React.Component<RouteComponentProps, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: [new Item('AWS')],
      next: 2,
      selection: false
    }
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab Two</IonTitle>
          <IonButtons slot="secondary">
            <IonButton fill="clear" onClick={() => this.setState({selection: true})}>
              <IonIcon slot="icon-only" icon={trash} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {this.state.items.map(i => {
            return (
              <IonItem class="item" href={'/dashboard/' + i.key}>
                <IonIcon slot="start" icon={key}></IonIcon>
                <IonLabel>{i.key}</IonLabel>
              </IonItem>);
          })}
        </IonList>
        <IonFab vertical="bottom" horizontal="end" class="ion-padding-end fab">
          <IonFabButton color="primary" onClick={this.addItem}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>);
  }
};

export default Dashboard;
