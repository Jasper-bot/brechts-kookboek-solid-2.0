import {
    IonButton,
    IonContent, IonGrid,
    IonHeader, IonIcon,
    IonItem, IonLabel,
    IonPage,
    IonRouterLink, IonRow,
    IonTitle,
    IonToggle,
} from '@ionic/react';
import styles from "./Account.module.css";
import React from "react";
import Header from "../components/Header";
import {moon} from "ionicons/icons";
import { useSession, CombinedDataProvider, Text, LogoutButton } from "@inrupt/solid-ui-react";

const Account: React.FC = () => {
    const { session } = useSession();

    const toggleDarkModeHandler = () => {
        document.body.classList.toggle("dark");
    };

    return (
        <IonPage>
            <IonHeader>
                <Header />
            </IonHeader>
                {session.info.isLoggedIn ? (
                <IonContent fullscreen>
                <IonTitle class="ion-padding-vertical">Welcome, </IonTitle>
                    <CombinedDataProvider datasetUrl={ session.info.webId} thingUrl={ session.info.webId}>
                        <Text property={
                            "http://xmlns.com/foaf/0.1/name"
                        } />
                    </CombinedDataProvider>

                <IonItem>
                    <IonIcon slot="start" icon={moon} />
                    <IonLabel>Dark Mode</IonLabel>
                    <IonToggle
                        slot="end"
                        name="darkMode"
                        onIonChange={toggleDarkModeHandler}
                    />
                </IonItem>
                <IonGrid>
                    <IonRow class="ion-justify-content-center">
                        <LogoutButton>
                            <IonButton fill="clear" color="dark"  routerLink="/login" className={styles.logout}>logout</IonButton> 
                        </LogoutButton>
                    </IonRow>
                </IonGrid>
                </IonContent>
                ) : (
                    
                    <IonContent fullscreen>
                        <div>Not logged in, please <IonRouterLink href='/login'>relogin</IonRouterLink> </div>
                    </IonContent>
                )};
        </IonPage>
    );
};

export default Account;

// const Account: React.FC = () => {
//     const { userName, userId } = useAuth();

//     const [vleesBdgLvl, setVleesBdgLvl ] = useState([]);
//     const [visBdgLvl, setVisBdgLvl ] = useState([]);
//     const [veggieBdgLvl, setVeggieBdgLvl ] = useState([]);
//     const [dessertBdgLvl, setDessertBdgLvl ] = useState([]);
//     const [andereBdgLvl, setAndereBdgLvl ] = useState([]);

//     const [showBadges, setShowBadges] = useState(
//         {
//         hideVleesBdg: true,
//         hideVisBdg: true,
//         hideVeggieBdg: true,
//         hideDessertBdg: true,
//         hideAndereBdg: true
//     })

//     const toggleDarkModeHandler = () => {
//         document.body.classList.toggle("dark");
//     };

//     useEffect(() => {
//         const userRef = db.collection('users').doc(userId);
//         userRef.onSnapshot((data) => {
//             setVleesBdgLvl( data.data().badges.Vlees);
//             setVisBdgLvl( data.data().badges.Vis);
//             setVeggieBdgLvl( data.data().badges.Veggie);
//             setDessertBdgLvl( data.data().badges.Dessert);
//             setAndereBdgLvl( data.data().badges.Andere);
//         })
//     }, [userId]);

//     return (
//         <IonPage>
//             <IonHeader>
//                 <Header />
//             </IonHeader>
//             <IonContent fullscreen>
//                 <IonTitle class="ion-padding ion-text-center">Welcome {userName}</IonTitle>
//                 <IonGrid>
//                     <IonRow>
//                         <IonCol onClick={() =>
//                             setShowBadges({
//                                 hideVleesBdg: !showBadges.hideVleesBdg,
//                                 hideVisBdg: true,
//                                 hideVeggieBdg: true,
//                                 hideDessertBdg: true,
//                                 hideAndereBdg: true
//                             })}
//                         >
//                             <IonList className={styles.listcenter}>
//                                 <IonImg src={"assets/icon/meat.png"} className={styles.icons}/>
//                                 <IonLabel class="ion-text-center">
//                                     {vleesBdgLvl[0] >= 10 && vleesBdgLvl[1] >= 20 ? "Slager lvl 3" : vleesBdgLvl[0] >= 5 && vleesBdgLvl[1] >= 10 ? "Slager lvl 2" :  vleesBdgLvl[0] >= 1 && vleesBdgLvl[1] >= 2? "Slager lvl 1" :"Slager lvl 0" }
//                                 </IonLabel>
//                             </IonList>
//                         </IonCol>
//                         <IonCol onClick={() =>  setShowBadges({
//                             hideVleesBdg: true,
//                             hideVisBdg: !showBadges.hideVisBdg,
//                             hideVeggieBdg: true,
//                             hideDessertBdg: true,
//                             hideAndereBdg: true
//                         })}>
//                             <IonList className={styles.listcenter}>
//                                <IonImg src={"assets/icon/fish.png"} className={styles.icons}/>
//                                 <IonLabel class="ion-text-center">
//                                     {visBdgLvl[0] >= 10 && visBdgLvl[1] >= 20 ? "Visser lvl 3" : visBdgLvl[0] >= 5 && visBdgLvl[1] >= 10 ? "Visser lvl 2" :  visBdgLvl[0] >= 1 && visBdgLvl[1] >= 2? "Visser lvl 1" :"Visser lvl 0" }
//                                 </IonLabel>
//                             </IonList>
//                         </IonCol>
//                         <IonCol onClick={() => setShowBadges({
//                             hideVleesBdg: true,
//                             hideVisBdg: true,
//                             hideVeggieBdg: !showBadges.hideVeggieBdg,
//                             hideDessertBdg: true,
//                             hideAndereBdg: true
//                         })}>
//                             <IonList className={styles.listcenter}>
//                                 <IonImg src={"assets/icon/vegan.png"} className={styles.icons}/>
//                                 <IonLabel class="ion-text-center">
//                                     {veggieBdgLvl[0] >= 10 && veggieBdgLvl[1] >= 20 ? "Groenteboer lvl 3" : veggieBdgLvl[0] >= 5 && veggieBdgLvl[1] >= 10 ? "Groenteboer lvl 2" :  veggieBdgLvl[0] >= 1 && veggieBdgLvl[1] >= 2? "Groenteboer lvl 1" :"Groenteboer lvl 0" }
//                                 </IonLabel>
//                             </IonList>
//                         </IonCol>
//                     </IonRow>
//                     <IonRow hidden={showBadges.hideVleesBdg} className={styles.row}>
//                         {
//                             vleesBdgLvl[0] >= 10 && vleesBdgLvl[1] >= 20 ?
//                                 `Proficiat! Je bent een slager van topniveau!`
//                             : vleesBdgLvl[0] >= 5 && vleesBdgLvl[1] >= 10 ?
//                                 `Upload nog ${10 - vleesBdgLvl[0] < 0 ? 0: 10 - vleesBdgLvl[0]} recepten met vlees en ${20 - vleesBdgLvl[1] < 0? 0 : 20 - vleesBdgLvl[1] }  foto’s van vleesgerechten van andere gebruikers om Slager lvl 3 te verdienen.`
//                                 :  vleesBdgLvl[0] >= 1 && vleesBdgLvl[1] >= 2?
//                                     `Upload nog ${5 - vleesBdgLvl[0] < 0 ? 0 : 5 - vleesBdgLvl[0]} recepten met vlees en ${10 - vleesBdgLvl[1] < 0 ? 0: 10 - vleesBdgLvl[1]}  foto’s van vleesgerechten van andere gebruikers om Slager lvl 2 te verdienen.`
//                                     :
//                                         `Upload nog ${1 - vleesBdgLvl[0] < 0 ? 0: 1 - vleesBdgLvl[0]} recepten met vlees en ${2 - vleesBdgLvl[1] < 0 ? 0: 2 - vleesBdgLvl[1]}  foto’s van vleesgerechten van andere gebruikers om Slager lvl 1 te verdienen.`
//                         }
//                     </IonRow>
//                     <IonRow hidden={showBadges.hideVisBdg} className={styles.row}>
//                         {
//                             visBdgLvl[0] >= 10 && visBdgLvl[1] >= 20 ?
//                                 `Proficiat! Je bent een Visser van topniveau!`
//                                 : visBdgLvl[0] >= 5 && visBdgLvl[1] >= 10 ?
//                                     `Upload nog ${10 - visBdgLvl[0] < 0 ? 0: 10 - visBdgLvl[0]} recepten met vis en ${20 - visBdgLvl[1] < 0? 0 : 20 - visBdgLvl[1] }  foto’s van visgerechten van andere gebruikers om Visser lvl 3 te verdienen.`
//                                     :  visBdgLvl[0] >= 1 && visBdgLvl[1] >= 2?
//                                         `Upload nog ${5 - visBdgLvl[0] < 0 ? 0 : 5 - visBdgLvl[0]} recepten met vis en ${10 - visBdgLvl[1] < 0 ? 0: 10 - visBdgLvl[1]}  foto’s van visgerechten van andere gebruikers om Visser lvl 2 te verdienen.`
//                                         :
//                                         `Upload nog ${1 - visBdgLvl[0] < 0 ? 0: 1 - visBdgLvl[0]} recepten met vis en ${2 - visBdgLvl[1] < 0 ? 0: 2 - visBdgLvl[1]}  foto’s van visgerechten van andere gebruikers om Visser lvl 1 te verdienen.`
//                         }
//                     </IonRow>
//                     <IonRow hidden={showBadges.hideVeggieBdg} className={styles.row}>
//                         {
//                             veggieBdgLvl[0] >= 10 && veggieBdgLvl[1] >= 20 ?
//                                 `Proficiat! Je bent een Groenteboer van topniveau!`
//                                 : veggieBdgLvl[0] >= 5 && veggieBdgLvl[1] >= 10 ?
//                                     `Upload nog ${10 - veggieBdgLvl[0] < 0 ? 0: 10 - veggieBdgLvl[0]} veggierecepten en ${20 - veggieBdgLvl[1] < 0? 0 : 20 - veggieBdgLvl[1] }  foto’s van veggierecepten van andere gebruikers om Groenteboer lvl 3 te verdienen.`
//                                     :  veggieBdgLvl[0] >= 1 && veggieBdgLvl[1] >= 2?
//                                         `Upload nog ${5 - veggieBdgLvl[0] < 0 ? 0 : 5 - veggieBdgLvl[0]} veggierecepten en ${10 - veggieBdgLvl[1] < 0 ? 0: 10 - veggieBdgLvl[1]}  foto’s van veggierecepten van andere gebruikers om Groenteboer lvl 2 te verdienen.`
//                                         :
//                                         `Upload nog ${1 - veggieBdgLvl[0] < 0 ? 0: 1 - veggieBdgLvl[0]} veggierecepten en ${2 - veggieBdgLvl[1] < 0 ? 0: 2 - veggieBdgLvl[1]}  foto’s van veggierecepten van andere gebruikers om Groenteboer lvl 1 te verdienen.`
//                         }
//                     </IonRow>
//                     <IonRow>
//                         <IonCol onClick={() => setShowBadges({
//                             hideVleesBdg: true,
//                             hideVisBdg: true,
//                             hideVeggieBdg: true,
//                             hideDessertBdg: !showBadges.hideDessertBdg,
//                             hideAndereBdg: true
//                         })}>
//                             <IonList className={styles.listcenter}>
//                                 <IonImg src={"assets/icon/cake.png"} className={styles.icons}/>
//                                 <IonLabel class="ion-text-center">
//                                     {dessertBdgLvl[0] >= 10 && dessertBdgLvl[1] >= 20 ? "Liefhebber lvl 3" : dessertBdgLvl[0] >= 5 && dessertBdgLvl[1] >= 10 ? "Liefhebber lvl 2" :  dessertBdgLvl[0] >= 1 && dessertBdgLvl[1] >= 2? "Liefhebber lvl 1" :"Liefhebber lvl 0" }
//                                 </IonLabel>
//                             </IonList>
//                         </IonCol>
//                         <IonCol onClick={() => setShowBadges({
//                             hideVleesBdg: true,
//                             hideVisBdg: true,
//                             hideVeggieBdg: true,
//                             hideDessertBdg: true,
//                             hideAndereBdg: !showBadges.hideAndereBdg
//                         })}>
//                             <IonList className={styles.listcenter}>
//                                 <IonImg src={"assets/icon/restaurant.png"} className={styles.icons}/>
//                                 <IonLabel class="ion-text-center">
//                                     {andereBdgLvl[0] >= 10 && andereBdgLvl[1] >= 20 ? "Alternatieveling lvl 3" : andereBdgLvl[0] >= 5 && andereBdgLvl[1] >= 10 ? "Alternatieveling lvl 2" :  andereBdgLvl[0] >= 1 && andereBdgLvl[1] >= 2? "Alternatieveling lvl 1" :"Alternatieveling lvl 0" }
//                                 </IonLabel>
//                             </IonList>
//                         </IonCol>
//                     </IonRow>
//                     <IonRow hidden={showBadges.hideDessertBdg} className={styles.row}>
//                         {
//                             dessertBdgLvl[0] >= 10 && dessertBdgLvl[1] >= 20 ?
//                                 `Proficiat! Je bent een Dessert liefhebber van topniveau!`
//                                 : dessertBdgLvl[0] >= 5 && dessertBdgLvl[1] >= 10 ?
//                                     `Upload nog ${10 - dessertBdgLvl[0] < 0 ? 0: 10 - dessertBdgLvl[0]} desserts en ${20 - dessertBdgLvl[1] < 0? 0 : 20 - dessertBdgLvl[1] }  foto’s van desserts van andere gebruikers om Liefhebber lvl 3 te verdienen.`
//                                     :  dessertBdgLvl[0] >= 1 && dessertBdgLvl[1] >= 2?
//                                         `Upload nog ${5 - dessertBdgLvl[0] < 0 ? 0 : 5 - dessertBdgLvl[0]} desserts en ${10 - dessertBdgLvl[1] < 0 ? 0: 10 - dessertBdgLvl[1]}  foto’s van desserts van andere gebruikers om Liefhebber lvl 2 te verdienen.`
//                                         :
//                                         `Upload nog ${1 - dessertBdgLvl[0] < 0 ? 0: 1 - dessertBdgLvl[0]} desserts en ${2 - dessertBdgLvl[1] < 0 ? 0: 2 - dessertBdgLvl[1]}  foto’s van desserts van andere gebruikers om Liefhebber lvl 1 te verdienen.`
//                         }
//                     </IonRow>
//                     <IonRow hidden={showBadges.hideAndereBdg} className={styles.row}>
//                         {
//                             andereBdgLvl[0] >= 10 && andereBdgLvl[1] >= 20 ?
//                                 `Proficiat! Je bent een Alternatieveling van topniveau!`
//                                 : andereBdgLvl[0] >= 5 && andereBdgLvl[1] >= 10 ?
//                                     `Upload nog ${10 - andereBdgLvl[0] < 0 ? 0: 10 - andereBdgLvl[0]} recepten in de categorie "andere" en ${20 - andereBdgLvl[1] < 0? 0 : 20 - andereBdgLvl[1] }  foto’s van recepten in de categorie "andere" van andere gebruikers om Alternatieveling lvl 3 te verdienen.`
//                                     :  andereBdgLvl[0] >= 1 && andereBdgLvl[1] >= 2?
//                                         `Upload nog ${5 - andereBdgLvl[0] < 0 ? 0 : 5 - andereBdgLvl[0]} recepten in de categorie "andere" en ${10 - andereBdgLvl[1] < 0 ? 0: 10 - andereBdgLvl[1]}  foto’s van recepten in de categorie "andere" van andere gebruikers om Alternatieveling lvl 2 te verdienen.`
//                                         :
//                                         `Upload nog ${1 - andereBdgLvl[0] < 0 ? 0: 1 - andereBdgLvl[0]} recepten in de categorie "andere" en ${2 - andereBdgLvl[1] < 0 ? 0: 2 - andereBdgLvl[1]}  foto’s van recepten in de categorie "andere" van andere gebruikers om Alternatieveling lvl 1 te verdienen.`
//                         }
//                     </IonRow>
//                     <IonRow>
//                         <IonCol size="12" className={["ion-text-center"].join(" ")} >
//                             <IonItem lines={"none"}>
//                                 <IonIcon slot="start" icon={moon} />
//                                 <IonLabel>Dark Mode</IonLabel>
//                                 <IonToggle
//                                     slot="end"
//                                     name="darkMode"
//                                     onIonChange={toggleDarkModeHandler}
//                                 />
//                             </IonItem>
//                         </IonCol>
//                     </IonRow>
//                     <IonRow>
//                         <IonCol size="12" className={["ion-padding", "ion-text-center"].join(" ")}>
//                             <IonButton fill="clear" color="dark" className={[styles.logout].join(" ")}
//                                        onClick={() => auth.signOut()}
//                             >
//                                 Logout
//                             </IonButton>
//                         </IonCol>
//                     </IonRow>
//                 </IonGrid>
//             </IonContent>
//         </IonPage>
//     );
// };

// export default Account;

// //className={["ion-align-items-center", "ion-justify-content-center"].join(" ")}