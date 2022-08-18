import { useSession } from '@inrupt/solid-ui-react';
import { IonLabel, IonText, IonTextarea, IonButton, useIonAlert, IonLoading } from '@ionic/react';
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
    getSourceUrl,
    getDatetime,
    getDate,
    asUrl,
    createAcl,
    getSolidDatasetWithAcl,
  } from "@inrupt/solid-client";

import { schema } from 'rdf-namespaces';
import { universalAccess } from "@inrupt/solid-client";
import { handleIncomingRedirect, login, fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { acp_ess_2 } from "@inrupt/solid-client";
import { create } from 'yup/lib/array';

var crypto = require('crypto');

interface CommentProps {
    recipeId: string
}

const AddComment: React.FC<CommentProps> = ({recipeId}) => {
    const [presentAskPermission] = useIonAlert();
    const [uploadMessage, setUploadMessage] = useState('');
    const [comment, setComment] = useState('');
    const [commentDataset, setCommentDataset] = useState(null);
    const [profileThing, setProfileThing] = useState(null);
    const { session } = useSession();
    const [loading, setLoading] = useState(false);

    const rdfText = schema.Text;
    const rdfCreator = schema.creator;
    const rdfDateCreated = schema.dateCreated;

    //console.log("session state: " + JSON.stringify(session.info));

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

        // console.log("podsurls: " + podsUrls);
        // console.log("pod: " + pod);
        // console.log("container uri: " +  containerUri);

        const commentDataset = await getOrCreateCommentDataset(containerUri, session.fetch);

        setCommentDataset(commentDataset);
      })();
    }, [session]);

    async function getOrCreateCommentDataset(containerUri, fetch){
        const indexUrl = `${containerUri}index.ttl`;
        console.log("container uri:  " + JSON.stringify(containerUri));
        
        try {
            //const commentList = await getSolidDatasetWithAcl(indexUrl, { fetch });
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
              //return await getSolidDatasetWithAcl(indexUrl);
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

    function hashComment(comment) {
      return crypto.createHash('md5').update(comment).digest('hex');
    }

    async function addUrlAndHashedCommentToCollection(url, hashedComment) {
      // await setupPublicReadPolicyForResource(url);
      const commentRef = db.collection('recipes').doc(recipeId).collection('comments');
      await commentRef.add({
        Url: url,
        hashedComment: hashedComment
      });
    }

    async function addUrlAndHashedCommentToFirebase(updatedCommentDataset, hashedComment) {
      try {
        const latestComment = updatedCommentDataset.graphs.default[Object.keys(updatedCommentDataset.graphs.default).at(-1)];
        // universalAccess.setPublicAccess(
        //   latestComment.url,
        //   { read:true },
        //   {fetch: session.fetch}
        // ).then((newAccess) => {
        //   if (newAccess === null) {
        //     console.log("Could not load access details for this Resource.");
        //   } else {
        //     console.log("Returned Public Access:: ", JSON.stringify(newAccess));
        //   }});

        await addUrlAndHashedCommentToCollection(latestComment.url ,hashedComment);
        setUploadMessage("Uw comment is succesvol geupload!");
      } catch (e) {
        setUploadMessage(e.message);
      } finally {
        setLoading(false);
        setComment("");
      }
    }

    async function setupPublicReadPolicyForResource(resourceURL) {
      try {
        // 1. Fetch the SolidDataset with its Access Control Resource (ACR).
        let resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
          resourceURL,              // Resource for which to set up the policies
          { fetch: fetch }          // fetch from the authenticated session
        );
    
        // 2. Create a Matcher for the Resource.
        let resourcePublicMatcher = acp_ess_2.createResourceMatcherFor(
          resourceWithAcr,
          "match-public"  // Matcher URL will be {ACR URL}#match-public
        );
    
        // 3. Specify that the matcher matches the Public (i.e., everyone).
        resourcePublicMatcher = acp_ess_2.setPublic(resourcePublicMatcher);
    
        // 4. Add Matcher to the Resource's ACR.
        resourceWithAcr = acp_ess_2.setResourceMatcher(
          resourceWithAcr,
          resourcePublicMatcher,
        );
    
        // 5. Create the Policy for the Resource.
        let resourcePolicy = acp_ess_2.createResourcePolicyFor(
          resourceWithAcr,
          "public-policy",  // Policy URL will be {ACR URL}#public-policy
        );
    
        // 6. Add the Public Matcher to the Policy as an allOf() expression.
        resourcePolicy = acp_ess_2.addAllOfMatcherUrl(
          resourcePolicy,
          resourcePublicMatcher
        );
    
        // 7. Specify the access modes for the Policy.
        resourcePolicy = acp_ess_2.setAllowModes(
          resourcePolicy,
          { read: true, append: false, write: false },
        );
    
        // 8. Apply the Policy to the Resource.
        resourceWithAcr = acp_ess_2.addPolicyUrl(
           resourceWithAcr,
           asUrl(resourcePolicy)
         );
    
        // 9. Add the Policy definition to the Resource's ACR. 
        resourceWithAcr = acp_ess_2.setResourcePolicy(
           resourceWithAcr,
           resourcePolicy,
        );
    
        // 10. Save the ACR for the Resource.
        const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
          resourceWithAcr,
          { fetch: fetch }          // fetch from the authenticated session
        );
      } catch (error) {
        console.error(error.message);
      }
    }

    const handleCommentUpload = async () => {
      setLoading(true);
      if(!checkCommentText()) {
        setLoading(false);

        return;
      }

      const newCommentThing = createNewCommentThing();

      const updatedCommentDataset = updateDataset(newCommentThing);

      saveToPod(updatedCommentDataset);

      const hashedComment = hashComment(comment);
      addUrlAndHashedCommentToFirebase(updatedCommentDataset, hashedComment);
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
          <IonLoading isOpen={loading}/>
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