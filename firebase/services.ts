import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '.'

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

    return docRef.id
  } catch (e) {
    console.error('Error adding document: ', e)
  }
}

export const updateData = async ({ collectionName, data }: TAddData) => {
  try {
    await updateDoc(doc(db, collectionName, data.id), data)
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
    await deleteDoc(doc(db, collectionName, id))
  } catch (e) {
    console.error('Error delete document: ', e)
  }
}

export const getById = async ({ collectionName, id }: TDeleteData) => {
  try {
    const docRef = await getDoc(doc(db, collectionName, id))
    return docRef.data()
  } catch (error) {
    return null
  }
}
