import React, {useState} from "react";
import {
    IonButton,
    IonContent, IonGrid,
    IonHeader,
    IonPage, IonRouterLink, IonRow
} from "@ionic/react";

import styles from './Login.module.css';
import RegisterHeader from '../components/RegisterHeader';
import { LoginButton } from "@inrupt/solid-ui-react";

const Login: React.FC = ({  }) => {
    function handleError() {
        console.log("Error during login");
    }

    return (
        <IonPage>
            <IonHeader>
                <RegisterHeader/>
            </IonHeader>
            <IonContent class="ion-padding">
                <IonGrid>
                    <IonRow>
                        <p>
                            Deze applicatie maakt gebruik van <a href="https://solidproject.org/">SOLID</a>.
                            Inloggen en registratie wordt momenteel alleen ondersteund voor Pods gehost via <a href="https://inrupt.net">Inrupt Pod Spaces</a>.
                        </p>
                    </IonRow>
                    <IonRow class="ion-justify-content-center">
                        <LoginButton
                        oidcIssuer="https://inrupt.net"
                        redirectUrl="http://localhost:8100/my/home"
                        onError={handleError}
                        authOptions={{
                            clientName : "brechts kookboek "
                        }} > 
                            <IonButton className={styles.solid}>Log In using solid</IonButton>
                        </LoginButton>
                    </IonRow>
                    <IonRow  class="ion-justify-content-center">
                        <IonRow  class="ion-justify-content-center" className={styles.row}>
                            <IonRouterLink href="https://inrupt.net/register" className={styles.login}>Of Registreer</IonRouterLink>
                        </IonRow>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Login;