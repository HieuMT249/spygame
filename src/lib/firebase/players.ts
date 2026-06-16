import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";
import { Player } from "@/types/game";

export const addPlayer = async (roomId: string, player: Player): Promise<void> => {
  const playerRef = doc(db, "rooms", roomId, "players", player.id);
  await setDoc(playerRef, player);
};

export const updatePlayer = async (roomId: string, playerId: string, data: Partial<Player>): Promise<void> => {
  const playerRef = doc(db, "rooms", roomId, "players", playerId);
  await updateDoc(playerRef, data);
};

export const getPlayers = async (roomId: string): Promise<Player[]> => {
  const playersRef = collection(db, "rooms", roomId, "players");
  const snapshot = await getDocs(playersRef);
  return snapshot.docs.map(doc => doc.data() as Player);
};

export const deleteAllPlayers = async (roomId: string): Promise<void> => {
  const playersRef = collection(db, "rooms", roomId, "players");
  const snapshot = await getDocs(playersRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
};