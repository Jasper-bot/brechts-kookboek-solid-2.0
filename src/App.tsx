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
import { SessionProvider, useSession } from "@inrupt/solid-ui-react";

const App: React.FC = () => {
    return (
        <IonApp>
            <SessionProvider>
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
            </SessionProvider>
        </IonApp>
    );
};

export default App;