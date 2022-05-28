import {IonCol, IonContent, IonGrid, IonPage, IonRow} from '@ionic/react';
import Image from '../components/Image';
import styles from  './Home.module.css';
import React from "react";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
          <img src="assets/images/topbarlogo.jpg" className={styles.img} alt="Header van de homepagina" />
          <IonGrid>
            <IonRow className={styles.row}>
                <IonCol>
                    <Image
                        imagePath="assets/images/allerecepten.jpg"
                        description="Alle Recepten"
                        linkPath="recipes">
                    </Image>
                </IonCol>
                <IonCol>
                    <Image
                        imagePath="assets/images/uwaccount.jpg"
                        description="Uw Account"
                        linkPath="account">
                    </Image>
                </IonCol>
            </IonRow>
              <IonRow>
                  <IonCol>
                      <Image
                          imagePath="assets/images/voegrecepttoe.jpg"
                          description="Voeg Recept Toe"
                          linkPath="recipes/add-recipe">
                      </Image>
                  </IonCol>
                  <IonCol>
                      <Image
                          imagePath="assets/images/favorieterecepten.jpg"
                          description="Favoriete Recepten"
                          linkPath="favorite-recipes">
                      </Image>
                  </IonCol>
              </IonRow>

              <IonRow>
                  <IonCol>
                      <Image
                          imagePath="assets/images/voegrecepttoe.jpg"
                          description="TESTPAGINA"
                          linkPath="test">
                      </Image>
                  </IonCol>
              </IonRow>
          </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
