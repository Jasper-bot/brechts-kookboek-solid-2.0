import {
    IonButton,
    IonCol,
    IonContent, IonFooter, IonGrid,
    IonHeader, IonIcon, IonLabel, IonLoading,
    IonPage, IonRow, IonTextarea, IonTitle, IonToolbar,
} from '@ionic/react';
import React, {useEffect, useRef, useState} from "react";
import Header from "../components/Header";
import { useAuth } from "../auth";
import { db } from '../firebase/firebase.utils';
import {MessageModel, toMessage} from "../models/messageModel";
import Message from "../components/Message";
import NoMessages from "../components/NoMessages";
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
    const ref = useRef<HTMLIonContentElement>(null);

    useEffect(() => {
        setMessages([]);
        setTimeout(() => {
            const messagesRef = db.collection('recipes').doc(id).collection('messages').orderBy('createdAt').limit(50);
            messagesRef.onSnapshot(({ docs }) => {
                setMessages(docs.map(toMessage));
            });
        }, 500);
    }, [id]);

    useEffect(() => {
        if(messages.length) {
            ref.current?.scrollToBottom(200);
        }
    }, [messages.length]);


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

    return (
        <IonPage>
            {/*<IonLoading isOpen={messages.length === 0}/>*/}
            <IonHeader>
                <Header />
            </IonHeader>
            <IonContent fullscreen ref={ref}>
                {messages.length == 0 ?
                        <NoMessages />
                        :
                        <IonGrid>
                            {messages.map((message, index) =>
                                <Message message={message} key={index} />
                            )}
                        </IonGrid>
                }
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