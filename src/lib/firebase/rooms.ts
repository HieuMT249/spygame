import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Room } from "@/types/game";
import { generateRoomCode } from "@/utils/generateCode";

export const createRoom = async (hostId: string): Promise<string> => {
  const code = generateRoomCode();
  const roomRef = doc(collection(db, "rooms"));
  
  const newRoom: Partial<Room> = {
    id: roomRef.id,
    code,
    status: "waiting",
    citizenWord: "",
    spyWord: "",
    currentRound: 0,
    currentSpeakerIndex: 0,
    hostId,
    createdAt: Date.now(),
    winner: null,
  };

  await setDoc(roomRef, newRoom);
  return code;
};

export const getRoomByCode = async (code: string): Promise<Room | null> => {
  // We need to query rooms by code. Wait, querying requires `query` and `where`.
  // Let's import those.
  const { query, where, getDocs } = await import("firebase/firestore");
  const q = query(collection(db, "rooms"), where("code", "==", code));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Room;
};

export const updateRoom = async (roomId: string, data: Partial<Room>): Promise<void> => {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, data);
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  const roomRef = doc(db, "rooms", roomId);
  await deleteDoc(roomRef);
};
