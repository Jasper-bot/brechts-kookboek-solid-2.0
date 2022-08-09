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
    getUrlAll,
    buildThing,
    createThing,
    setThing,
    getSourceUrl
  } from "@inrupt/solid-client";

import { schema } from 'rdf-namespaces';
import { getOrCreateCommentDataset } from "../../utils/utils";

interface CommentProps {
    recipeId: string
}

const AddComment: React.FC<CommentProps> = ({recipeId}) => {
    const [presentAskPermission] = useIonAlert();
    const [uploadMessage, setUploadMessage] = useState('');
    const [comment, setComment] = useState('');
    //const [profileThing, setProfileThing] = useState('');
    //const fileInputRef = useRef<HTMLInputElement>();
    const [commentDataset, setCommentDataset] = useState(null);
    const [profileThing, setProfileThing] = useState(null);
    const { session } = useSession();

    const rdfText = schema.Text;
    const rdfCreator = schema.creator;
    const rdfDateCreated = schema.dateCreated;

    console.log("session state: " + JSON.stringify(session.info));

    useEffect(() => {
      if (!session) return;

      (async () => {
        const profileDataset = await getSolidDataset(session.info.webId, {
          fetch: session.fetch,
        });
        const profileThing = getThing(profileDataset, session.info.webId);
        setProfileThing(profileThing);

        const podsUrls = getUrlAll(
          profileThing,
          "http://www.w3.org/ns/pim/space#storage"
        );
        const pod = podsUrls[0];
        const containerUri = `${pod}comments/`;

        console.log("podsurls: " + podsUrls);
        console.log("pod: " + pod);
        console.log("container uri: " +  containerUri);

        // axios.head(containerUri).then(response => console.info("headers:", response.headers));
        
        const commentDataset = await getOrCreateCommentDataset(containerUri, session.fetch);
        setCommentDataset(commentDataset);
        // console.log(JSON.stringify(commentDataset));
      })();
    }, [session]);

    async function getOrCreateCommentDataset(containerUri, fetch){
        const indexUrl = `${containerUri}index.ttl`;
        try {
            const commentList = await getSolidDataset(indexUrl, { fetch });
            return commentList;
          } catch (error) {
            if (error.statusCode === 404) {
              const commentList = await saveSolidDatasetAt(
                indexUrl,
                createSolidDataset(),
                {
                  fetch,
                }
              );
              return commentList;
            }
          }
    }

    function createNewCommentThing() {
      const newCommentThing = buildThing()
      .addStringNoLocale(rdfText, comment)
      .addDatetime(rdfDateCreated,new Date())
      .addUrl(rdfCreator, profileThing)
      .build();

      return newCommentThing;
    }

    function updateDataset(newCommentThing) {
      const updatedCommentDataset = setThing(commentDataset, newCommentThing);
      setCommentDataset(updatedCommentDataset);
      return updatedCommentDataset;
    }

    async function saveToPod(updatedCommentDataset) {
      const indexUrl = getSourceUrl(commentDataset);
      const savedCommentDataset = await saveSolidDatasetAt(
        indexUrl,
        updatedCommentDataset,
        { fetch: session.fetch }
      );
    }

    const handleCommentUpload = async () => {
      if(!checkCommentText()) return;

      const newCommentThing = createNewCommentThing();

      const updatedCommentDataset = updateDataset(newCommentThing);

      saveToPod(updatedCommentDataset);

      // hashen
      // toevoegen aan firebase

      setUploadMessage("Uw comment is succesvol geupload!");

      // const webId = session.info.webId;
      // const commentRef = db.collection('recipes').doc(recipeId).collection('webIdsComments');
      // await commentRef.add({webId: webId});

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

    function checkCommentText() {
      if(comment.length <= 3) {
        setUploadMessage("Je hebt geen comment ingevoerd of de comment is korter dan drie karakters.");
        return false;
      }

      if(comment.length > 255) {
        setUploadMessage("Je comment mag maximum uit 255 karakters bestaan.");
        return false;
      }

      return true;
    }
    
    return (
        <form className={"ion-margin"}>
          <IonText color="warning">
              <p>{uploadMessage}</p>
          </IonText>
          <IonTextarea placeholder={"Typ hier uw nieuwe comment"} value={comment}
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