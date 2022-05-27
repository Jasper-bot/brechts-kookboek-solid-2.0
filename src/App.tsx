//<editor-fold desc="imports">

import React, {useEffect, useState} from "react";
import {Redirect, Route, Switch} from 'react-router-dom';
import AppTabs from "./AppTabs";

/* Import Components */
import {IonApp, IonLoading} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';

/* Import Pages */
import Register from "./pages/register";
import Login from "./pages/Login";
import NotFoundPage from "./pages/NotFoundPage";

import {AuthContext, useAuthInit} from "./auth";
import Test from "./pages/test";

import { SessionProvider } from "@inrupt/solid-ui-react";

//</editor-fold>

const App: React.FC = () => {
    const {loading, auth} = useAuthInit();
    console.log('authstate: ',auth);

    if(loading) {
        return <IonLoading isOpen />
    }
    return (
        <IonApp>
            <SessionProvider>
                <AuthContext.Provider value={auth}>
                    {/* routes */}
                    <IonReactRouter>
                        <Switch>
                            <Route path="/register">
                                <Register/>
                            </Route>
                            <Route path="/login">
                                <Login />
                            </Route>
                            <Route path="/my">
                                <AppTabs/>
                            </Route>
                            <Route exact path="/">
                                <Redirect to="/login"/>
                            </Route>
                            <Route exact path={"/test"}>
                                <Test />
                            </Route>
                            <Route>
                                <NotFoundPage/>
                            </Route>
                        </Switch>
                    </IonReactRouter>
                </AuthContext.Provider>
            </SessionProvider>
        </IonApp>
    );
};

export default App;