import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Room } from '@/types/game';

const ROOMS_COLLECTION = 'rooms';

export async function createRoom(data: Omit<Room, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), data);
  return docRef.id;
}

export async function getRoomByCode(
  code: string
): Promise<{ id: string; data: Room } | null> {
  const q = query(
    collection(db, ROOMS_COLLECTION),
    where('code', '==', code)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, data: { id: docSnap.id, ...docSnap.data() } as Room };
}

export async function updateRoomData(
  roomId: string,
  data: Partial<Room>
): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await updateDoc(roomRef, data);
}

export async function deleteRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  await deleteDoc(roomRef);
}
