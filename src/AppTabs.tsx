//<editor-fold desc="imports">

import React, { useEffect, useState } from "react";
import {Redirect, Route} from 'react-router-dom';
/* Import Components */
import {
  IonIcon,
  IonLabel, IonLoading, IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { home, book, bag, heart } from 'ionicons/icons';

/* Import Pages */
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import YourRecipes from './pages/yourRecipes';
import AllRecipes from './pages/allRecipes';
import Account from './pages/Account';
import RecipePage from "./pages/RecipePage";
import {useAuth} from "./auth";
import AddRecipe from "./pages/AddRecipe";
import NotFoundPage from "./pages/NotFoundPage";
import SearchRecipes from "./pages/SearchRecipes";
import EditRecipe from "./pages/EditRecipe";
import Chat from "./pages/Chat";
import { useSession } from "@inrupt/solid-ui-react";


//</editor-fold>

const AppTabs: React.FC = () => {
  const { session, sessionRequestInProgress } = useSession();
  const [ authState, setauthState] = useState({"loading" : true, "loggedIn": false});

  useEffect(() => {
    setauthState({
      "loading": sessionRequestInProgress,
      "loggedIn" : session.info.isLoggedIn
    });
  }, [sessionRequestInProgress]);

  if(!authState.loading && !authState.loggedIn) {
    return <Redirect to="/login"/>;
  }

  return (
          <IonTabs>
            <IonLoading isOpen={authState.loading}/>
            <IonRouterOutlet>
              <Route exact path="/my/home">
                <Home />
              </Route>
              <Route exact path="/my/favorite-recipes">
                <Favorites />
              </Route>
              <Route path="/my/recipes/view/:id">
                <RecipePage />
              </Route>
              <Route path="/my/recipes/add-recipe">
                <AddRecipe />
              </Route>
              <Route path="/my/recipes/edit-recipe/:id">
                <EditRecipe />
              </Route>
              <Route path="/my/recipes/:id/chat">
                <Chat />
              </Route>
              <Route exact path="/my/recipes">
                <AllRecipes />
              </Route>
              <Route path="/my/your-recipes">
                    <YourRecipes />
              </Route>
              <Route path="/my/search-recipes">
                <SearchRecipes />
              </Route>
              <Route path="/my/account">
                <Account/>
              </Route>
              <Route>
                <NotFoundPage/>
              </Route>
            </IonRouterOutlet>

            {/* tabbar */}
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/my/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              <IonTabButton tab="allRecipes" href="/my/recipes">
                <IonIcon icon={book} />
                <IonLabel>Alle recepten</IonLabel>
              </IonTabButton>
              <IonTabButton tab="yourRecipes" href="/my/your-recipes">
                <IonIcon icon={bag} />
                <IonLabel>Uw recepten</IonLabel>
              </IonTabButton>
              <IonTabButton tab="favorites" href="/my/favorite-recipes">
                <IonIcon icon={heart} />
                <IonLabel>Favorieten</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
  );
};

export default AppTabs;