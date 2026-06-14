import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { Player } from '@/types/game';

function playersCollection(roomId: string) {
  return collection(db, 'rooms', roomId, 'players');
}

function playerDoc(roomId: string, playerId: string) {
  return doc(db, 'rooms', roomId, 'players', playerId);
}

export async function addPlayerToRoom(
  roomId: string,
  data: Omit<Player, 'id'>
): Promise<string> {
  const docRef = await addDoc(playersCollection(roomId), data);
  return docRef.id;
}

export async function updatePlayerData(
  roomId: string,
  playerId: string,
  data: Partial<Player>
): Promise<void> {
  await updateDoc(playerDoc(roomId, playerId), data);
}

export async function getPlayersInRoom(roomId: string): Promise<Player[]> {
  const snapshot = await getDocs(playersCollection(roomId));
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Player)
  );
}

export async function removePlayerFromRoom(
  roomId: string,
  playerId: string
): Promise<void> {
  await deleteDoc(playerDoc(roomId, playerId));
}
