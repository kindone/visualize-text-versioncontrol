import * as React from "react"
import * as ReactDOM from "react-dom"
import { Container } from 'semantic-ui-react'
import { Delta, IDelta, Document } from 'text-versioncontrol'
import { DocumentSet } from "./DocumentSet";
import DocumentSetComponent from "./DocumentSetComponent";


export default function Root() {

    const doc1 = new Document('doc1', 'My Document 1')
    const doc2 = new Document('doc2', 'Here comes the trouble. HAHAHAHA')

    const doc1Changes = [
        new Delta([{ delete: 3 }, { insert: 'Your ' }]),
        new Delta([{ retain: 5 }, { insert: 'precious ' }]), // Your precious Document 1
    ]

    const doc2Changes = [
        new Delta().insert('Some introduction here: '), // Some introduction here: Here comes the trouble. HAHAHAHA
    ]
    doc1.append(doc1Changes)
    doc2.append(doc2Changes)

    const source1 = doc1.takeExcerpt(5, 14) // 'precious '
    const excerpt1 = doc2.pasteExcerpt(5, source1) // Some precious introduction here: ...'

    const doc1ChangesAfter = [
        new Delta([{ insert: "No, It's " }, { delete: 4 }, { insert: 'Our' }]), // +8, No, it's Our
        new Delta([{ retain: 13 + 8 }, { insert: ' beautiful ' }, { delete: 1 }]),
        new Delta([{ retain: 13 }, { insert: 'delicious ' }]),
        new Delta([{ retain: 16 }, { insert: 'ete' }, { delete: 6 }]),
    ]

    const doc2ChangesAfter = [
        new Delta([{ delete: 4 }, { insert: 'Actual' }]),
        new Delta([{ retain: 11 }, { insert: 'tty' }, { delete: 5 }]), // Actual pre|tty|cious
        new Delta([{ retain: 11 }, { insert: 'ttier' }, { delete: 3 }]),
    ]

    doc1.append(doc1ChangesAfter)
    doc2.append(doc2ChangesAfter)

    let source = source1
    let target = excerpt1.target

    const syncs = doc1.getSyncSinceExcerpted(source)
    target = doc2.syncExcerpt(syncs, target)

    const documentSet = new DocumentSet([doc1, doc2])
    return (
        <Container>
            <DocumentSetComponent documentSet={documentSet}/>
        </Container>
    )
}