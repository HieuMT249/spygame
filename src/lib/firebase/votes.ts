import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { Vote } from '@/types/game';

function votesCollection(roomId: string) {
  return collection(db, 'rooms', roomId, 'votes');
}

export async function addVote(
  roomId: string,
  data: Vote
): Promise<string> {
  const docRef = await addDoc(votesCollection(roomId), data);
  return docRef.id;
}

export async function getVotesForRound(
  roomId: string,
  round: number
): Promise<Vote[]> {
  const q = query(votesCollection(roomId), where('round', '==', round));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (docSnap) => (docSnap.data() as Vote)
  );
}

export async function clearRoundVotes(
  roomId: string,
  round: number
): Promise<void> {
  const q = query(votesCollection(roomId), where('round', '==', round));
  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map((docSnap) =>
    deleteDoc(docSnap.ref)
  );
  await Promise.all(deletePromises);
}

export async function hasPlayerVoted(
  roomId: string,
  voterId: string,
  round: number
): Promise<boolean> {
  const q = query(
    votesCollection(roomId),
    where('voterId', '==', voterId),
    where('round', '==', round)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
