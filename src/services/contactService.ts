import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  createdAt?: Timestamp;
}

export const submitContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> => {
  await addDoc(collection(db, 'contactMessages'), {
    name: data.name.trim(),
    email: data.email.trim(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    status: 'new',
    createdAt: serverTimestamp(),
  });
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const list: ContactMessage[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() } as ContactMessage);
  });
  return list;
};

export const markContactMessageRead = async (messageId: string): Promise<void> => {
  await updateDoc(doc(db, 'contactMessages', messageId), { status: 'read' });
};
