import * as React from 'react'
import {IDelta, JSONStringify, Change} from 'text-versioncontrol'

interface IDeltaComponentProps {
    delta:IDelta
}

interface IDeltaComponentState {

}

export default class DeltaComponent extends React.Component<IDeltaComponentProps, IDeltaComponentState>
{
    constructor(props: IDeltaComponentProps)
    {
        super(props)
    }

    render() {
        return (<span>{this.deltaToHtml(this.props.delta)}</span>)
    }

    private deltaToHtml(delta:Change) {

        const fill = (character:string, size:number) => {
            let filled = ''
            for(let i = 0; i < size; i++) {
                filled += character
            }
            return filled
        }
        const insert = (text:string) => <span className='op-insert'>{text}</span>
        const retain = (size:number) => <span className='op-retain'>{fill('?', size)}</span>
        const del = (size:number) => <span className='op-delete'>{fill('X', size)}</span>

        let elements:JSX.Element[] = []
        let i = 0
        for(const op of delta.ops) {
            let element:JSX.Element
            if(typeof op.insert === 'string') {
                element = insert(op.insert)
            }
            else if(op.insert) {
                element = insert(JSON.stringify(op.insert))
            }
            else if(op.retain && !op.attributes) {
                element = retain(op.retain)
            }
            else if(op.retain) {
                // TODO
            }
            else if(op.delete) {
                element = del(op.delete)
            }
            elements.push(<span key={i++}>{element}</span>)
        }
        if(delta.source) {
            if(delta.source.type === 'excerpt')
                elements.push(<p key={'excerpt' + (i++)}>Excerpt: {JSONStringify(delta.source)}</p>)
            else if(delta.source.type === 'sync')
                elements.push(<p key={'sync' + (i++)}>Sync: {JSONStringify(delta.source)}</p>)
        }

        return elements
    }
}