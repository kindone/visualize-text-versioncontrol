import * as React from 'react'
import {IDelta, SharedString} from 'text-versioncontrol'

interface IContentChangeComponentProps {
    content:IDelta
    delta:IDelta
}

interface IContentChangeComponentState {

}

export default class ContentChangeComponent extends React.Component<IContentChangeComponentProps, IContentChangeComponentState>
{
    constructor(props: IContentChangeComponentProps)
    {
        super(props)
    }

    render() {
        return (<span>{this.deltaToHtml(this.props.content, this.props.delta)}</span>)
    }

    private deltaToHtml(content:IDelta, delta:IDelta) {

        const ss = SharedString.fromDelta(content)
        ss.applyChange(delta, "N/A")
        const composed = ss.toFlattenedDelta()
        const result = ss.toDelta()

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
        for(const op of composed.ops) {
            let element:JSX.Element
            if(typeof op.insert === 'string') {
                element = insert(op.insert)
            }
            else if(op.insert) {
                element = insert(JSON.stringify(op.insert))
            }
            else if(op.retain) {
                element = retain(op.retain)
            }
            else if(op.delete) {
                element = del(op.delete)
            }
            elements.push(<span key={i++}>{element}</span>)

        }

        return elements
    }
}