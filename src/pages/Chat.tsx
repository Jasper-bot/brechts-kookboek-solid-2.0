import {
    IonButton,
    IonCol,
    IonContent, IonFooter, IonGrid,
    IonHeader, IonIcon, IonLabel,
    IonPage, IonRow, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/react';
import React, {useEffect, useRef, useState} from "react";
import Header from "../components/Header";
import { useAuth } from "../auth";
import { db } from '../firebase/firebase.utils';
import {MessageModel, toMessage} from "../models/messageModel";
import Message from "../components/Message";
import {useParams} from "react-router";
import { send } from 'ionicons/icons';
import firebase from "firebase/compat/app";

interface RouteParams {
    id: string;
}

const Chat: React.FC = () => {
    const { userName, userId } = useAuth();
    const { id } = useParams<RouteParams>() ;
    const [messages, setMessages] = useState<MessageModel[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const messagesEndRef = useRef(null)

    useEffect(() => {
        const messagesRef = db.collection('recipes').doc(id).collection('messages').orderBy('createdAt').limit(50);
        messagesRef.onSnapshot(({ docs }) => {
            setMessages(docs.map(toMessage));
        });
    }, [id]);

    useEffect(() => {
        setTimeout(scrollToBottom, 250);
    }, [messages])

    const handleAddMsg = async() => {
        try {
            const message:MessageModel = {
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                recipeid: id,
                text: newMsg,
                userid: userId,
                username: userName
            }
            await db.collection('recipes').doc(id).collection('messages').add(message);
            setNewMsg('');
        }  catch (e) {
            console.log(e.message);
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <IonPage>
            <IonHeader>
                <Header />
            </IonHeader>
            <IonContent fullscreen scrollEvents={true}>
                <IonGrid>
                    {messages.length == 0 ?
                        <h2 className="ion-margin ">Er zijn nog geen berichten verstuurd over dit recept.</h2>
                        :
                        messages.map((message, index) =>
                            <Message message={message} key={index} />
                    )}
                    <IonRow ref={messagesEndRef} />
                </IonGrid>

            </IonContent>
            <IonToolbar>
                <IonRow class="ion-justify-content-end">
                    <IonCol size='10'>
                        <IonTextarea placeholder={"Bericht"} value={newMsg} class="ion-no-padding"
                                     onIonChange={(event) => setNewMsg(event.detail.value)} />
                    </IonCol>
                    <IonCol size='2'>
                        <IonButton onClick={handleAddMsg}>
                            <IonIcon icon={send} slot="icon-only" />
                        </IonButton>
                    </IonCol>
                </IonRow>
            </IonToolbar>
        </IonPage>

    );
};

export default Chat;