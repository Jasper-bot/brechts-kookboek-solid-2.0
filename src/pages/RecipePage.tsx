import {
    IonButton,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonLoading,
    IonPage,
    IonRow,
    IonText,
    useIonAlert,
} from '@ionic/react';
import {db, storage} from '../firebase/firebase.utils';
import {arrayRemove, arrayUnion, deleteDoc, doc, updateDoc} from "firebase/firestore";
import React, {useEffect, useRef, useState} from "react";
import {useHistory, useParams} from "react-router";
import {Recipe, toRecipe} from "../models/recipe";
import {chatbubble, heart, heartOutline, trash} from "ionicons/icons";
import Header from "../components/Header";
import styles from "./RecipePage.module.css";
import {useAuth} from "../auth";
import {Comment, toComment} from "../models/comment";
import AddComment from '../components/addComment/AddComment';
import { useSession } from '@inrupt/solid-ui-react';
import { getSolidDataset, getStringNoLocale, getThing } from '@inrupt/solid-client';
import { schema } from 'rdf-namespaces';
var crypto = require('crypto');


interface RouteParams {
    id: string;
}

const RecipePage: React.FC = () => {
    const { userName, userId } = useAuth();
    const { id } = useParams<RouteParams>() ;
    const [recipe, setRecipe] = useState<Recipe>();
    const [commentsFb, setCommentsFb] = useState<Comment[]>([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [favorite, setFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmDelete] = useIonAlert();
    const { session } = useSession();

    const rdfText = schema.Text;
    const rdfCreator = schema.creator;
    const rdfDateCreated = schema.dateCreated;

    const history = useHistory();
    const fileInputRef = useRef<HTMLInputElement>();

    useEffect(() => {
        //nodig?
        const recipeRef = db.collection('recipes').doc(id);
        const userRef = db.collection('users').doc(userId);
        recipeRef.get().then ((doc) => setRecipe(toRecipe(doc)));
        userRef.onSnapshot((doc) => {
            doc?.data()?.favoriteRecipes?.includes(id) ? setFavorite(true) : setFavorite(false);
        });

        // vanaf hieronder wel nodig ja
        (async () => {
        setCommentsFb([]);
        const commentsRef = await db.collection('recipes').doc(id).collection('comments');
        commentsRef.onSnapshot((docs) =>{
            docs.docs.forEach(doc => {
                if(doc.exists) {
                    setCommentsFb(arr => [...arr, toComment(doc)])
                }
            })
        });

        await getCommentsFromPods();
        console.log("comments: "+JSON.stringify(commentsFb));
        })();

        
    }, [id]);

    async function getCommentsFromPods() {
        commentsFb.forEach(async (comment) => {
            const commentFromPod = await fetchCommentFromPod(comment["Url"]);
            console.log("pod comment:"+JSON.stringify(commentFromPod));

            if (compareHashes(comment, commentFromPod)) {
                // TODO toevoegen aan lokale dataset ofzo? allesinds, display the comment
            }

            return;
        });
    }

    async function fetchCommentFromPod(url) {
        const commentDataset = await getSolidDataset(
            url, 
            { fetch: session.fetch }  
        );

        const comment = getThing(
            commentDataset,
            url
          );

        return comment;
    }

    function compareHashes(commentFromFb, commentFromPod) {
        const commentValue = getStringNoLocale(commentFromPod, rdfText);
        const commentValueHashed = crypto.createHash('md5').update(commentValue).digest('hex');

        return commentValueHashed === commentFromFb["hashedComment"];

    }


    const handleDeleteRecipe = async () => {
        setLoading(true);
        //verwijder alle fotos rond het recept
        const storageRef = storage.ref(`images/${id}`);
        storageRef.listAll().then((listResults) => {
            const promises = listResults.items.map((item) => {
                return item.delete();
            });
            Promise.all(promises);
        }).catch((error) => {
            console.log("Error removing document:", error);
            return;
        });
        //verwijder het recept uit de favorieten van alle users
        db.collection("users").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                //console.log(doc.id, " => ", doc.data());
                const userRef = db.collection('users').doc(doc.id);
                updateDoc(userRef, {
                    favoriteRecipes: arrayRemove(id)
                });
            });
        })
        //verwijder het recept
        await deleteDoc(doc(db, "recipes", id)).then(() => {
                history.goBack();
            }
        ).catch((error) => {
            console.log("Error removing document:", error);
        });
        setLoading(false);
    }

    const changeFavorite = async () => {
        const userRef = db.collection('users').doc(userId);
        if(favorite) {
           await updateDoc(userRef, {
                favoriteRecipes: arrayRemove(id)
           });
        } else {
            await updateDoc(userRef, {
                favoriteRecipes: arrayUnion(id)
            });
        }
        setFavorite(!favorite);
    }

    const goToEdit = () => {
        history.push(`/my/recipes/edit-recipe/${id}`)
    }

    return (
        <IonPage >
            <IonHeader>
                <Header />
            </IonHeader>
            <IonContent class="ion-padding">
                <IonLoading isOpen={loading}/>
                <IonGrid>
                    {recipe?.userId === userId &&
                        <IonRow className={["ion-align-items-center", "ion-justify-content-center"].join(" ")}>
                            <IonCol offset="2">
                                <IonButton color={"danger"} onClick={() => confirmDelete({
                                    header:'Verwijder recept',
                                    message:'Ben je zeker dat je dit recept wil verwijderen?',
                                    buttons:['Nee!', {text: 'Ja!', handler:handleDeleteRecipe}]
                                })

                                }>Verwijder Recept</IonButton>
                            </IonCol>
                        </IonRow>
                    }
                    {recipe?.userId === userId &&
                    <IonRow className={["ion-align-items-center", "ion-justify-content-center"].join(" ")}>
                        <IonCol offset="2">
                            <IonButton color={"warning"} onClick={goToEdit}>Bewerk Recept</IonButton>
                        </IonCol>
                    </IonRow>
                    }
                    <IonRow className={["ion-align-items-center", "ion-justify-content-center", "ion-text-capitalize"].join(" ")} >
                        <IonCol size="8">
                            <h2 className="ion-no-margin">{recipe?.title}</h2>
                        </IonCol>
                        <IonCol>
                            <IonItem lines="none" onClick={changeFavorite}>
                                <IonIcon icon={favorite? heart : heartOutline} className={styles.heart} slot="end"/>
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <p  className={[styles.uploader].join(" ")} >Door {recipe?.userName }</p>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol className={styles.colimage}>
                            <IonImg src={recipe?.photo} alt={recipe?.title}/>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <p>{recipe?.description}</p>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonList>
                    <IonListHeader>
                        Ingrediënten
                    </IonListHeader>
                    {recipe?.ingredients?.map((entry, i) =>
                        <IonItem key={i}>
                            <IonLabel>
                                <p>
                                    {entry.valueOf()}
                                </p>
                            </IonLabel>
                        </IonItem>
                    )}
                </IonList>
                <IonListHeader>
                    Stappen
                </IonListHeader>
                <IonList>
                    {recipe?.steps.map((entry, i) =>
                        <IonItem key={entry.valueOf()}>
                            <IonLabel>
                                <p className="ion-text-wrap">
                                    {i += 1}: {entry.valueOf()}
                                </p>
                            </IonLabel>
                        </IonItem>
                    )}
                </IonList>
                <IonListHeader>
                    Comments
                </IonListHeader>
                {commentsFb.length == 0 &&
                    <IonText color={"primary"}>
                        <p>Er zijn nog geen foto's toegevoegd aan dit recept door andere gebruikers. Voeg als eerste een foto toe!</p>
                    </IonText>
                }

                <AddComment recipeId={id}></AddComment>
                {/* <IonList>
                    {comments.map((val, index) =>
                        <IonCard key={index}>
                            <IonImg src={val.downloadURL.valueOf()} alt={val.comment.valueOf()}/>
                            <IonCardHeader>
                                <IonCardSubtitle>Geplaatst door:</IonCardSubtitle>
                                <IonCardTitle> {val.name}</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol  size={userId === val.uploaderId ? "9" : "12" }>
                                            {val.comment}
                                        </IonCol>
                                        {val.uploaderId === userId &&
                                            <IonCol size="3">
                                               <IonButton onClick={() => confirmDelete({
                                                   header:'Verwijder Comment',
                                                   message:'Ben je zeker dat je deze comment wil verwijderen?',
                                                   buttons:['Laat maar staan!', {text:'Ja, verwijder!', handler: () => handleCommentDelete(val)}]
                                               })}><IonIcon icon={trash} slot="icon-only" /></IonButton>
                                            </IonCol>
                                        }
                                    </IonRow>
                                </IonGrid>

                            </IonCardContent>
                        </IonCard>
                    )}
                </IonList> */}
                {/* <form className={"ion-margin"}>
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
                    <IonButton onClick={handleAddPhoto}>Upload foto + boodschap</IonButton>
                </form> */}
                <IonFab vertical='bottom' horizontal='end' slot='fixed'>
                    <IonFabButton routerLink={`/my/recipes/${id}/chat`}>
                        <IonIcon icon={chatbubble} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default RecipePage;
