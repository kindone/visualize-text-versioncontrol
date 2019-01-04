import * as React from 'react'
import {IDelta, SharedString, Document, JSONStringify} from 'text-versioncontrol'
import DeltaComponent from './DeltaComponent';
import { Label, Grid, Popup } from 'semantic-ui-react';
import ContentChangeComponent from './ContentChangeComponent';
import ContentComponent from './ContentComponent';

interface IDocumentComponentProps {
    document:Document
}

interface IDocumentComponentState {

}

export default class DocumentComponent extends React.Component<IDocumentComponentProps, IDocumentComponentState>
{
    constructor(props: IDocumentComponentProps)
    {
        super(props)
    }

    render() {
        let idx = 0
        let rev = 0
        let content = this.props.document.getContentAt(0)
        const changes = this.props.document.getChangesFrom(0)
        let elements:JSX.Element[] = []

        const contentElement = this.contentElement(idx, content)
        const contentRow =
            <Grid.Row key={rev}>
                <Grid.Column width={1}>{rev++}</Grid.Column>
                <Grid.Column width={15}>{contentElement}</Grid.Column>
            </Grid.Row>
        elements.push(contentRow)


        for(const change of changes) {
            const ss = SharedString.fromDelta(content)
            ss.applyChange(change, "_")
            const changeElement = this.deltaElement(idx, change)
            const changeRow =
                <Grid.Row>
                    <Grid.Column width={1}>&#x25BC;</Grid.Column>
                    <Grid.Column width={15}>{this.rawDeltaPopup(changeElement, change)}</Grid.Column>
                </Grid.Row>
            elements.push(changeRow)

            content = ss.toDelta()
            const contentElement = this.contentElement(idx, content)
            const contentRow =
                <Grid.Row key={rev}>
                    <Grid.Column width={1}>{rev++}</Grid.Column>
                    <Grid.Column width={15}>{contentElement}</Grid.Column>
                </Grid.Row>
            elements.push(contentRow)
        }

        return <Grid celled>{elements}</Grid>
    }

    private rawDeltaPopup(trigger:JSX.Element, delta:IDelta) {
        return (
        <Popup trigger={trigger} position="right center">
            <Popup.Header>Delta</Popup.Header>
            <Popup.Content>
                {JSONStringify(delta.ops)}
            </Popup.Content>
        </Popup>
        )
    }

    private deltaElement(idx:number, delta:IDelta) {
        return (<div key={idx}>
                    <Label>
                        <DeltaComponent delta={delta}/>
                    </Label>
                </div>)
    }

    private contentElement(idx:number, content:IDelta) {
        // TODO display excerpts so far
        return (<div key={idx}>
                    <Label>
                        <ContentComponent content={content}/>
                    </Label>
                </div>)
    }

    private contentChangeElement(idx:number, content:IDelta, change:IDelta) {
        return (<div key={idx}>
                    <Label>
                        <ContentChangeComponent content={content} delta={change}/>
                    </Label>
                </div>)
    }

}