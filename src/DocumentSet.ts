import { Document } from "text-versioncontrol";

export class DocumentSet
{
    private dictionary:{[uri:string]:Document} = {}

    constructor(docs:Document[]) {
        for(const doc of docs) {
            this.dictionary[doc.uri] = doc
        }
    }

    public get(uri:string):Document {
        return this.dictionary[uri]
    }

    public getKeys():string[] {
        return Object.keys(this.dictionary)
    }
}