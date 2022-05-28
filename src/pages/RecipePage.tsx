import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
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
    IonTextarea, isPlatform,
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
import {Camera, CameraResultType} from "@capacitor/camera";

interface RouteParams {
    id: string;
}

async function savePhoto(blobUrl, recipeId, uploaderName, comment, userId) {
    const uid = uploaderName + "." + Date.now().toString(36) + Math.random().toString(36).substr(2);
    const photoRef = storage.ref(`/images/${recipeId}/${uid}`);
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    await photoRef.put(blob).then((async () => {
         let downloadUrl = await photoRef.getDownloadURL();
         const data = {comment: comment, downloadURL: downloadUrl, name: uploaderName, uploaderId: userId, storageId: uid };
         const commentRef = db.collection('recipes').doc(recipeId).collection('comments');
         await commentRef.add(data);
    }));
}

const RecipePage: React.FC = () => {
    const { userName, userId } = useAuth();
    const { id } = useParams<RouteParams>() ;
    const [recipe, setRecipe] = useState<Recipe>();
    const [photo, setPhoto] = useState('/assets/images/addImage.png');
    const [previousPhoto, setPreviousPhoto] = useState('/assets/images/addImage.png');
    const [comments, setComments] = useState<Comment[]>([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [favorite, setFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState('');
    const [confirmDelete] = useIonAlert();

    const history = useHistory();
    const fileInputRef = useRef<HTMLInputElement>();

    useEffect(() => {
        const recipeRef = db.collection('recipes').doc(id);
        const userRef = db.collection('users').doc(userId);
        recipeRef.get().then ((doc) => setRecipe(toRecipe(doc)));
        userRef.onSnapshot((doc) => {
            doc?.data()?.favoriteRecipes?.includes(id) ? setFavorite(true) : setFavorite(false);
        });
    }, [id]);

    useEffect(() => () => {
        if(photo.startsWith('blob:')){
            URL.revokeObjectURL(photo);
        }
    }, [photo]);

    useEffect(() => {
        setComments([]);
        const commentsRef = db.collection('recipes').doc(id).collection('comments');
        commentsRef.onSnapshot((docs) =>{
            docs.docs.forEach(doc => {
                if(doc.exists) {
                    setComments(arr => [...arr, toComment(doc)])
                }
            })
        })
    },[id, uploadMessage]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files.length > 0) {
            const file = event.target.files.item(0);
            const photoUrl = URL.createObjectURL(file);
            setPhoto(photoUrl);
        }
    }

    const handleAddPhoto = async () => {
        setLoading(true);
        setComments([]);
        if(photo == previousPhoto){
            setUploadMessage('Je hebt geen foto geselecteerd of je hebt deze foto al geüploadt.');
            setLoading(false);
        } else if( comment.length > 0 && comment.length < 5){
            setUploadMessage('Gebruik minstens 5 karakters bij een reactie of laat deze leeg!');
            setLoading(false);
        } else if(comment.length > 200){
            setUploadMessage('Gebruik maximum 200 karakters bij een reactie');
            setLoading(false);
        } else {
            try {
                await savePhoto(photo, id, userName, comment, userId);
                await updateUserBadge(recipe.category);
                setPhoto('/assets/images/addImage.png');
                setComment('');
                setUploadMessage('Upload geslaagd!');
            } catch (e) {
                setUploadMessage(e.message);
            } finally {
                setPreviousPhoto(photo);
                setLoading(false);
            }
        }
    }

    const handlePictureClick = async () => {
        if(!isPlatform('desktop') ){
            try {
                const photo = await Camera.getPhoto({
                    resultType: CameraResultType.Uri,
                });
                setPhoto(photo.webPath);
            } catch (error) {
                console.log(error);
            }
        } else {
            fileInputRef.current.click();
        }
    }

    const handleCommentDelete = async (comment) => {
        setLoading(true);
        try {
            // verwijder comment foto
            await storage.ref(`images/${id}/${comment.storageId}`).delete()
            //verwijder comment firebase
            await db.collection('recipes').doc(id).collection('comments').doc(comment.id).delete()
            setUploadMessage('Comment verwijderd!')
        } catch (e) {
            console.log(e);
            setUploadMessage('error removing comment');
            return;
        } finally {
            setLoading(false);
        }
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

    const updateUserBadge = async (category) => {
        readBadges(userId).then((data) => {
            let newData = data;
            newData[category][1] += 1;
            db.collection("users").doc(userId).update({
                badges: newData
            });
        })
    }

    const readBadges =async (id) => {
        let response = await db
            .collection("users")
            .doc(id)
            .get();
        if (response === null || response === undefined) return null;
        return response.data().badges;
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
                    Foto's
                </IonListHeader>
                {comments.length == 0 &&
                    <IonText color={"primary"}>
                        <p>Er zijn nog geen foto's toegevoegd aan dit recept door andere gebruikers. Voeg als eerste een foto toe!</p>
                    </IonText>
                }
                <IonList>
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
                </IonList>
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
                    <IonButton onClick={handleAddPhoto}>Upload foto + boodschap</IonButton>
                </form>
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
