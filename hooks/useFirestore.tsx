import { db } from '@/firebase'
import { collection, query, where, onSnapshot, WhereFilterOp } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

type Params = {
  collectionName: string
  condition?: {
    fieldName: string
    operator: WhereFilterOp
    compareValue: unknown
  }
}

type Document = {
  id: string
  [key: string]: unknown
  createdAt: Date
}

const useFirestore = ({ collectionName, condition }: Params) => {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    let q
    if (condition) {
      q = query(collection(db, collectionName), where(condition.fieldName, condition.operator, condition.compareValue))
    } else {
      q = query(collection(db, collectionName))
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents: Document[] = []

      querySnapshot.forEach((doc) => {
        documents.push({
          ...doc.data(),
          id: doc.id,
          createdAt: new Date(doc.data().createdAt?.seconds * 1000)
        })
      })

      documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setDocuments(documents)
    })

    return unsubscribe
  }, [condition, collectionName])

  return documents
}

export default useFirestore
