import * as React from "react"
import * as ReactDOM from "react-dom"
import { AppContainer } from 'react-hot-loader'
//import 'semantic-ui-css/semantic.min.css' // need loaders to work
import Root from "./Root"


ReactDOM.render(
    <AppContainer>
        <Root/>
    </AppContainer>
    ,
    document.getElementById("root")
);

if ((module as any).hot) {
    (module as any).hot.accept('./Root', () => {
        const NextRoot = require('./Root').default
        ReactDOM.render(
            <AppContainer>
                <NextRoot/>
            </AppContainer>,
            document.getElementById('root')
        )
    })
}