import * as React from 'react'
import {IDelta, SharedString, Document, JSONStringify, Delta} from 'text-versioncontrol'
import DeltaComponent from './DeltaComponent';
import { Label, Grid, Popup, Tab } from 'semantic-ui-react';
import ContentChangeComponent from './ContentChangeComponent';
import ContentComponent from './ContentComponent';
import { DocumentSet } from './DocumentSet';
import { Source } from 'text-versioncontrol/lib/primitive/IDelta';
import { Range } from 'text-versioncontrol/lib/primitive/Range';

interface IDocumentSetComponentProps {
    documentSet:DocumentSet
}

interface IDocumentSetComponentState {

}

export default class DocumentSetComponent extends React.Component<IDocumentSetComponentProps, IDocumentSetComponentState>
{
    constructor(props: IDocumentSetComponentProps)
    {
        super(props)
    }

    render() {
        const panes:{menuItem:string, render: () => JSX.Element}[] = []
        for(const key of this.props.documentSet.getKeys()) {
            const document = this.props.documentSet.get(key)
            const menuItem = document.uri
            const render = () => <Tab.Pane>{this.documentElement(document, this.props.documentSet)}</Tab.Pane>

            panes.push({menuItem, render})
        }
        return <Tab panes={panes}></Tab>
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

    private documentElement(document:Document, docSet:DocumentSet) {
        let idx = 0
        let rev = 0
        let content = document.getContentAt(0)
        const changes = document.getChangesFrom(0)
        let elements:JSX.Element[] = []

        const contentElement = this.contentElement(idx, content)
        const contentRow =
            <Grid.Row key={rev}>
                <Grid.Column textAlign="center" verticalAlign="middle" width={1}>Rev{rev++}</Grid.Column>
                <Grid.Column width={15}>{contentElement}</Grid.Column>
            </Grid.Row>
        elements.push(contentRow)


        for(const change of changes) {
            const ss = SharedString.fromDelta(content)

            const changeRow = this.changeRowElement(rev, content, change, docSet)
            elements.push(changeRow)

            ss.applyChange(change, "_")
            content = ss.toDelta()

            const contentRow = this.contentRowElement(rev, content)
            elements.push(contentRow)
        }

        return <Grid celled>{elements}</Grid>
    }

    private changeRowElement(rev:number, content:IDelta, change:IDelta, docSet:DocumentSet, range?:Range)
    {
        const changeElement = this.deltaElement(rev, content, change, docSet, range)
        const changeRow =
            <Grid.Row key={'change' + rev}>
                <Grid.Column textAlign="center" verticalAlign="middle" width={1}>&#x25BC;</Grid.Column>
                <Grid.Column width={15}>{this.rawDeltaPopup(changeElement, change)}</Grid.Column>
            </Grid.Row>
        return changeRow
    }

    private contentRowElement(rev:number, content:IDelta)
    {
        const contentElement = this.contentElement(rev, content)
        const contentRow =
            <Grid.Row key={rev}>
                <Grid.Column textAlign="center" verticalAlign="middle" width={1}>Rev{rev++}</Grid.Column>
                <Grid.Column width={15}>{contentElement}</Grid.Column>
            </Grid.Row>
        return contentRow
    }

    private contentElement(idx:number, content:IDelta) {
        // TODO display excerpts so far
        return (<div key={idx}>
                    <Label>
                        <ContentComponent content={content}/>
                    </Label>
                </div>)
    }

    private deltaElement(idx:number, content:IDelta, delta:IDelta, docSet:DocumentSet, range?:Range) {

        const fill = (character:string, size:number) => {
            let filled = ''
            for(let i = 0; i < size; i++) {
                filled += character
            }
            return filled
        }
        const initial = (text:string) => <span className='op-content'>{text}</span>
        const initialObj = (text:string) => <span className='op-content-obj'>{text}</span>
        const insert = (text:string) => <span className='op-insert'>{text}</span>
        const insertObj = (text:string) => <span className='op-insert-obj'>{text}</span>
        const retain = (size:number) => <span className='op-retain'>{fill('?', size)}</span>
        const retainAttr = (size:number) => <span className='op-retain-attr'>{fill('?', size)}</span>
        const del = (text:string) => <span className='op-delete'>{text}</span>

        let elements:JSX.Element[] = []

        const ss = SharedString.fromDelta(content)
        ss.applyChange(delta, '_')

        // mark range
        if(range) {
            const marker = new Delta().retain(range.start).insert('[').retain(range.end-range.start).insert(']')
            ss.applyChange(marker, '_')
        }

        const styledJSON = ss.toStyledJSON()
        for(const obj of styledJSON)
        {
            if(obj.type === 'initial') {
                if(typeof obj.value === 'string') {
                    elements.push(initial(obj.value))
                }
                else if(obj.value.type === 'embed') {
                    elements.push(initialObj(obj.value.value))
                }
            }
            else if(obj.type === 'inserted') {
                if(typeof obj.value === 'string') {
                    elements.push(insert(obj.value))
                }
                else if(obj.value.type === 'embed') {
                    elements.push(insertObj(obj.value.value))
                }
            }
            else if(obj.type === 'deleted') {
                if(typeof obj.value === 'string') {
                    elements.push(del(obj.value))
                }
                else if(obj.value.type === 'embed') {
                    elements.push(del(obj.value.value))
                }
            }
        }

        let i = 0
        if(delta.source) {
            let stringElement:JSX.Element = <p></p>
            if(delta.source.type === 'content') {
                stringElement = <p key={'content' + (i++)}>Excerpt: {JSONStringify(delta.source)}</p>
            }
            else if(delta.source.type === 'change') {
                stringElement = <p key={'sync' + (i++)}>Sync: {JSONStringify(delta.source)}</p>
            }

            const sourceElement = this.sourceElement(delta.source, docSet)
            const stringWithPopupElement =
                <Popup wide trigger={stringElement} position="right center" on={['focus']}>
                    <Popup.Header>{delta.source.uri} rev{delta.source.rev}</Popup.Header>
                    <Popup.Content>
                        {sourceElement}
                    </Popup.Content>
                </Popup>
            elements.push(stringWithPopupElement)
        }

        return (
            <div key={idx}>
                <Label>
                    {elements}
                </Label>
            </div>
        )
    }

    private sourceElement(source:Source, docSet:DocumentSet) {
        const doc = docSet.get(source.uri)
        const content = doc.getContentAt(source.rev)
        const elements:JSX.Element[] = []

        if(source.rev > 0) {
            const prevContent = doc.getContentAt(source.rev-1)
            elements.push(this.contentRowElement(source.rev-1, prevContent))
            const change = doc.getChangesFromTo(source.rev-1, source.rev-1)
            const range = new Range(source.start, source.end)
            elements.push(this.changeRowElement(source.rev, prevContent, change[0], docSet, range))
        }

        elements.push(this.contentRowElement(source.rev, content))

        return <Grid celled>{elements}</Grid>
    }

    private contentChangeElement(idx:number, content:IDelta, change:IDelta) {
        return (<div key={idx}>
                    <Label>
                        <ContentChangeComponent content={content} delta={change}/>
                    </Label>
                </div>)
    }

}