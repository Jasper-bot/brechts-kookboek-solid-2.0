import { useSession } from '@inrupt/solid-ui-react';
import { IonLabel, IonText, IonTextarea, IonButton } from '@ionic/react';
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
    const [photo, setPhoto] = useState('/assets/images/addImage.png');
    const [uploadMessage, setUploadMessage] = useState('');
    const [comment, setComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>();
    const { session } = useSession();

    console.log("session state: " + JSON.stringify(session.info));

    const [todoList, setTodoList] = useState();

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // if(event.target.files.length > 0) {
        //     const file = event.target.files.item(0);
        //     const photoUrl = URL.createObjectURL(file);
        //     setPhoto(photoUrl);
        // }
    }

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

    const handlePictureClick = async () => {
        // if(!isPlatform('desktop') ){
        //     try {
        //         const photo = await Camera.getPhoto({
        //             resultType: CameraResultType.Uri,
        //         });
        //         setPhoto(photo.webPath);
        //     } catch (error) {
        //         console.log(error);
        //     }
        // } else {
        //     fileInputRef.current.click();
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
    
    return (
        <form className={"ion-margin"}>
        <IonLabel position={"stacked"}>Upload een nieuwe foto:</IonLabel>
        <IonText color="warning">
            <p>{uploadMessage}</p>
        </IonText>
        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} hidden className={styles.img}/>
        <img src={photo} alt=""
             onClick={handlePictureClick}
        />
        <IonTextarea placeholder={"Laat hier een boodschap achter voor bij je foto te zetten"} value={comment}
                     onIonChange={(event) => setComment(event.detail.value)} />
        <IonButton onClick={handleCommentUpload}>Upload foto + boodschap</IonButton>
    </form>
    );
};

export default AddComment;