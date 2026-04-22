import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "../lib/firebase";

function normalizeValue(value) {
  if (!value) {
    return value;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)]));
  }

  return value;
}

function sanitizePayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

function normalizeDoc(entry) {
  return { id: entry.id, ...normalizeValue(entry.data()) };
}

export function isFirebaseAvailable() {
  return Boolean(hasFirebaseConfig && db);
}

export async function listDocuments(collectionName, options = {}) {
  const { orderField, orderDirection = "asc" } = options;
  const target = collection(db, collectionName);
  const snapshot = orderField
    ? await getDocs(query(target, orderBy(orderField, orderDirection)))
    : await getDocs(target);

  return snapshot.docs.map(normalizeDoc);
}

export async function getDocument(collectionName, id) {
  const snapshot = await getDoc(doc(db, collectionName, id));
  return snapshot.exists() ? normalizeDoc(snapshot) : null;
}

export async function createDocument(collectionName, payload, options = {}) {
  const { id } = options;
  const prepared = sanitizePayload({
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  if (id) {
    await setDoc(doc(db, collectionName, id), prepared, { merge: true });
    return getDocument(collectionName, id);
  }

  const created = await addDoc(collection(db, collectionName), prepared);
  return getDocument(collectionName, created.id);
}

export async function upsertDocument(collectionName, id, payload) {
  const prepared = sanitizePayload({
    ...payload,
    updatedAt: serverTimestamp()
  });
  await setDoc(doc(db, collectionName, id), prepared, { merge: true });
  return getDocument(collectionName, id);
}

export async function updateDocument(collectionName, id, payload) {
  const prepared = sanitizePayload({
    ...payload,
    updatedAt: serverTimestamp()
  });
  await updateDoc(doc(db, collectionName, id), prepared);
  return getDocument(collectionName, id);
}

export async function deleteDocumentById(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}
