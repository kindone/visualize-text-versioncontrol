import * as React from 'react'
import {IDelta, SharedString} from 'text-versioncontrol'

interface IContentComponentProps {
    content:IDelta
}

interface IContentComponentState {

}

export default class ContentComponent extends React.Component<IContentComponentProps, IContentComponentState>
{
    constructor(props: IContentComponentProps)
    {
        super(props)
    }

    render() {
        return (<span>{this.contentToHtml(this.props.content)}</span>)
    }

    private contentToHtml(content:IDelta) {

        const insert = (text:string) => <span className='op-content'>{text}</span>

        let elements:JSX.Element[] = []
        let i = 0
        for(const op of content.ops) {
            let element:JSX.Element
            if(typeof op.insert === 'string') {
                element = insert(op.insert)
            }
            else if(op.insert) {
                element = insert(JSON.stringify(op.insert))
            }
            elements.push(<span key={i++}>{element}</span>)
        }

        return elements
    }
}