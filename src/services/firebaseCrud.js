import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "../lib/firebase";

// Converts Firestore timestamps and nested values into app-friendly plain data.
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

// Strips undefined fields so Firestore only receives real values.
function sanitizePayload(payload) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

// Gives every fetched document a top-level id alongside its data.
function normalizeDoc(entry) {
  return { id: entry.id, ...normalizeValue(entry.data()) };
}

// Quick guard used before trying Firebase reads or writes.
export function isFirebaseAvailable() {
  return Boolean(hasFirebaseConfig && db);
}

// Reads an entire collection, optionally sorted for predictable UI output.
export async function listDocuments(collectionName, options = {}) {
  const { orderField, orderDirection = "asc" } = options;
  const target = collection(db, collectionName);
  const snapshot = orderField
    ? await getDocs(query(target, orderBy(orderField, orderDirection)))
    : await getDocs(target);

  return snapshot.docs.map(normalizeDoc);
}

// Reads a single Firestore document by id.
export async function getDocument(collectionName, id) {
  const snapshot = await getDoc(doc(db, collectionName, id));
  return snapshot.exists() ? normalizeDoc(snapshot) : null;
}

// Finds the first matching document for simple lookups like email-based profile matching.
export async function findFirstDocument(collectionName, field, value) {
  const snapshot = await getDocs(query(collection(db, collectionName), where(field, "==", value), limit(1)));
  const [firstDoc] = snapshot.docs;
  return firstDoc ? normalizeDoc(firstDoc) : null;
}

// Creates a document and adds timestamps automatically.
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

// Updates or creates a document at a known id.
export async function upsertDocument(collectionName, id, payload) {
  const prepared = sanitizePayload({
    ...payload,
    updatedAt: serverTimestamp()
  });
  await setDoc(doc(db, collectionName, id), prepared, { merge: true });
  return getDocument(collectionName, id);
}

// Applies a partial update to an existing document.
export async function updateDocument(collectionName, id, payload) {
  const prepared = sanitizePayload({
    ...payload,
    updatedAt: serverTimestamp()
  });
  await updateDoc(doc(db, collectionName, id), prepared);
  return getDocument(collectionName, id);
}

// Deletes a document by id from the chosen collection.
export async function deleteDocumentById(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}
