import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '.'
import firebase from 'firebase/compat/app'

type TAddData = {
  collectionName: string
  data: any
}

export const addData = async ({ collectionName, data }: TAddData) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    })

    console.log('Document written with ID: ', docRef.id)
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

export const updateData = async ({ collectionName, data }: TAddData) => {
  try {
    updateDoc(doc(db, collectionName, data.id), data)
  } catch (e) {
    console.error('Error update document: ', e)
  }
}

type TReadData = {
  collectionName: string
}

export const readData = async ({ collectionName }: TReadData) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    const documents = querySnapshot.docs
      .map((doc) => {
        return { ...doc.data(), id: doc.id }
      })
      // @ts-ignore
      .sort((a, b) => b.createdAt - a.createdAt)

    return documents
  } catch (e) {
    console.error('Error reading document: ', e)
    return []
  }
}

type TDeleteData = {
  collectionName: string
  id: string
}

export const deleteData = async ({ collectionName, id }: TDeleteData) => {
  try {
    deleteDoc(doc(db, collectionName, id))
  } catch (e) {
    console.error('Error delete document: ', e)
  }
}
