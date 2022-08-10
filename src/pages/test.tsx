import {
    IonButton, IonCol,
    IonContent, IonFooter, IonGrid,
    IonHeader, IonIcon, IonInput,
    IonItem, IonLabel, IonList,
    IonPage,
    IonRouterLink, IonRow, IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar
} from '@ionic/react';
import styles from "./Account.module.css";
import React, {useEffect, useState} from "react";
import { auth } from '../firebase/firebase.utils.js';
import Header from "../components/Header";
import {useAuth} from "../auth";
import {home, moon} from "ionicons/icons";
import {removeWhitespaceFromArray, removeWhitespaceFromString, stringToArrayByComma} from "../helperfunctions";
import {db, storage} from '../firebase/firebase.utils';
import { send } from 'ionicons/icons';
import {Recipe, toRecipe} from "../models/recipe";
import {MessageModel, toMessage} from "../models/messageModel";
import Message from '../components/Message'
import AddComment from '../components/addComment/AddComment';
import { getSolidDataset, getThing } from '@inrupt/solid-client';
import { useSession } from '@inrupt/solid-ui-react';

const Test: React.FC = () => {
    const { session } = useSession();

    useEffect(() => {
        if (!session) return;
  
        (async () => {
            const commentDataset = await getSolidDataset(
                "https://jaspercoppens.inrupt.net/comments/index.ttl#16601556483423929874594480707", 
                { fetch: session.fetch }  
            );
            const comment = getThing(
                commentDataset,
                `https://jaspercoppens.inrupt.net/comments/index.ttl#16601556483423929874594480707`
              );
        })();
      }, [session]);

    return (
        <IonPage>
            <IonHeader>
                <Header />
            </IonHeader>
            <IonContent fullscreen>
                <AddComment recipeId='NgGFuHNPShvRbB0v64Ep' />
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    <IonRow>
                        <IonCol size='10'>
                            <IonTextarea autoGrow={true} maxlength={500} ></IonTextarea>
                        </IonCol>
                        <IonCol size='2'>
                            <IonButton>
                                <IonIcon icon={send} slot="icon-only" />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonToolbar>
            </IonFooter>
        </IonPage>

    );
};

export default Test;
