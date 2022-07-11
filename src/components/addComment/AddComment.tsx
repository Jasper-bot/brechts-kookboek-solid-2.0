import { useSession } from '@inrupt/solid-ui-react';
import { IonLabel, IonText, IonTextarea, IonButton, useIonAlert } from '@ionic/react';
import React, { FC, useEffect, useRef, useState } from 'react';
import styles from './AddComment.module.css';
import {db, storage} from '../../firebase/firebase.utils';
import {
    createSolidDataset,
    getSolidDataset,
    saveSolidDatasetAt, 
    getThing, 
    getUrlAll
  } from "@inrupt/solid-client";

interface CommentProps {
    recipeId: string
}

const AddComment: React.FC<CommentProps> = ({recipeId}) => {
    const [presentAskPermission] = useIonAlert();
    const [uploadMessage, setUploadMessage] = useState('');
    const [comment, setComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>();
    const { session } = useSession();

    console.log("session state: " + JSON.stringify(session.info));

    useEffect(() => {
      if (!session) return;

      (async () => {
        const profileDataset = await getSolidDataset(session.info.webId, {
          fetch: session.fetch,
        });
        const profileThing = getThing(profileDataset, session.info.webId);
        const podsUrls = getUrlAll(
          profileThing,
          "http://www.w3.org/ns/pim/space#storage"
        );
        const pod = podsUrls[0];
        const containerUri = `${pod}comments/`;
        const list = await getOrCreateCommentDataset(containerUri, session.fetch);
        console.log(JSON.stringify(list));
        
        // setTodoList(list);
      })();
    }, [session]);

    const handleCommentUpload = async () => {
        const webId = session.info.webId;
        const commentRef = db.collection('recipes').doc(recipeId).collection('webIdsComments');
        await commentRef.add({webId: webId});

        // setLoading(true);
        // setComments([]);
        // if(photo == previousPhoto){
        //     setUploadMessage('Je hebt geen foto geselecteerd of je hebt deze foto al geüploadt.');
        //     setLoading(false);
        // } else if( comment.length > 0 && comment.length < 5){
        //     setUploadMessage('Gebruik minstens 5 karakters bij een reactie of laat deze leeg!');
        //     setLoading(false);
        // } else if(comment.length > 200){
        //     setUploadMessage('Gebruik maximum 200 karakters bij een reactie');
        //     setLoading(false);
        // } else {
        //     try {
        //         await savePhoto(photo, id, userName, comment, userId);
        //         await updateUserBadge(recipe.category);
        //         setPhoto('/assets/images/addImage.png');
        //         setComment('');
        //         setUploadMessage('Upload geslaagd!');
        //     } catch (e) {
        //         setUploadMessage(e.message);
        //     } finally {
        //         setPreviousPhoto(photo);
        //         setLoading(false);
        //     }
        // }
    }

    async function getOrCreateCommentDataset(containerUri, fetch){
        const indexUrl = `${containerUri}index.ttl`;
        try {
            const todoList = await getSolidDataset(indexUrl, { fetch });
            return todoList;
          } catch (error) {
            if (error.statusCode === 404) {
              const todoList = await saveSolidDatasetAt(
                indexUrl,
                createSolidDataset(),
                {
                  fetch,
                }
              );
              return todoList;
            }
          }
    }

    async function addCommentToPod() {}

    async function addHashedCommentToFirebase() {}
    
    return (
        <form className={"ion-margin"}>
        {/* <IonLabel position={"stacked"}>Upload een nieuwe comment:</IonLabel> */}
        <IonText color="warning">
            <p>{uploadMessage}</p>
        </IonText>
        <IonTextarea placeholder={"Type hier uw nieuwe comment"} value={comment}
                     onIonChange={(event) => setComment(event.detail.value)} />
        <IonButton onClick={() => presentAskPermission({
        header: 'Geeft u toestemming aan Brechts Kookboek om uw comment publiek zichtbaar te maken voor iedereen?',
        buttons: [
          {
            text: 'Nee',
            role: 'cancel',
            handler: () => { setUploadMessage('U hebt geweigerd'); }
          },
          {
            text: 'Ja',
            role: 'confirm',
            handler: () => { handleCommentUpload(); }
          }
        ]
      })}>Upload comment</IonButton>
    </form>
    );
};

export default AddComment;