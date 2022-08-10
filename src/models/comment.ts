export interface Comment {
    id?: string,
    uploaderId?: string,
    comment?: string,
    name?: string,
    downloadURL?: string,
    storageId?: string,
    Url?: string,
    hashedComment?: string,
}

export function toComment(doc): Comment {
    return {id: doc.id, ...doc.data()}
}