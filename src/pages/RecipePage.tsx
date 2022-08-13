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
import {chatbubble, trash} from "ionicons/icons";
import Header from "../components/Header";
import styles from "./RecipePage.module.css";
import {useAuth} from "../auth";
import {Comment, toComment} from "../models/comment";
import AddComment from '../components/addComment/AddComment';
import { Table, TableColumn, useSession } from '@inrupt/solid-ui-react';
import { getSolidDataset, getStringNoLocale, getThing, Thing } from '@inrupt/solid-client';
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
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [confirmDelete] = useIonAlert();
    const { session } = useSession();
    const [commentThingsArray, setCommentThingsArray] = useState(null);

    const rdfText = schema.Text;
    const rdfCreator = schema.creator;
    const rdfDateCreated = schema.dateCreated;

    const history = useHistory();

    useEffect(() => {
        const recipeRef = db.collection('recipes').doc(id);
        recipeRef.get().then ((doc) => setRecipe(toRecipe(doc)));

        (async () => {
        setCommentsFb([]);
        setCommentThingsArray(null);
        const commentsRef = await db.collection('recipes').doc(id).collection('comments');
        commentsRef.onSnapshot((docs) =>{
            docs.docs.forEach(doc => {
                if(doc.exists) {
                    setCommentsFb(arr => [...arr, toComment(doc)])
                }
            })
        });
        })();
    }, []);

    useEffect(() => {
    (async () => {
        const commentList = await getCommentsFromPods().then(result => {
            if(result === null) return;
            const thingsArray = result.map((thing) => {
                return {
                    dataset: thing,
                    thing: thing
                }
            });

            setCommentThingsArray(thingsArray);
            setLoading(false);
        });
    })();  
    },  [commentsFb]);

    async function getCommentsFromPods() {
        let commentThings : Thing[] = [];

        for(const comment of commentsFb) {
            const commentFromPod = await fetchCommentFromPod(comment["Url"]);

            if(commentFromPod !== -1 ) {
                if (compareHashes(comment, commentFromPod) && checkCommentText(comment)) {
                    commentThings.push(commentFromPod);
                } 
            } else {
                setErrorMessage("Sommige comments zijn niet zichtbaar omdat je niet de juiste leesrechten hebt");
            }
        }

        return commentThings;
    }

    async function fetchCommentFromPod(url) {
        try {
            const commentDataset = await getSolidDataset(
                url, 
                { fetch: session.fetch }  
            );
    
            const comment = await getThing(
                commentDataset,
                url
              );
    
            return comment;
        } catch(e) {
            return -1;
        }

    }

    function compareHashes(commentFromFb, commentFromPod) {
        const commentValue =  getStringNoLocale(commentFromPod, rdfText);
        const commentValueHashed = crypto.createHash('md5').update(commentValue).digest('hex');

        return commentValueHashed === commentFromFb["hashedComment"];
    }

    function checkCommentText(comment) {
        if(comment.length <= 3) {
            setErrorMessage("De comment is korter dan drie karakters.");
            
            return false;
        }
  
        if(comment.length > 255) {
            setErrorMessage("Je comment mag maximum uit 255 karakters bestaan.");
            
            return false;
        }
  
        return true;
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

    const goToEdit = () => {
        history.push(`/my/recipes/edit-recipe/${id}`);
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
                {commentsFb.length == 0 && errorMessage === "" &&
                    <IonText color={"primary"}>
                        <p>Er zijn nog geen comments toegevoegd aan dit recept door andere gebruikers. Voeg als eerste een comment toe!</p>
                    </IonText>
                }
                {
                    errorMessage.length != 0 && 
                    <IonText color={"danger"}>
                        {errorMessage}
                    </IonText>
                }

                {commentThingsArray != null &&
                    <Table className="table" things={commentThingsArray}>
                        <TableColumn 
                            dataType="url" 
                            property={rdfCreator}  
                            header="Comment uploaded by"
                            // body={({ value }) => value.toDateString()}
                        ></TableColumn>

                        <TableColumn property={rdfText}  header="Comment content"></TableColumn>

                        <TableColumn 
                            dataType="datetime" 
                            property={rdfDateCreated}
                            header="Comment uploaded at"
                            sortable
                        ></TableColumn>
                    </Table>
                }
                <AddComment recipeId={id}></AddComment>
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
