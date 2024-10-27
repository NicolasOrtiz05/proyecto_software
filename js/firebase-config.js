import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getDatabase, ref as dbRef, set, get, update, remove, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
	apiKey: "AIzaSyD8PfOAnu89wAFStwhBxUT48RbdqlX9828",
	authDomain: "techshopsoft.firebaseapp.com",
	projectId: "techshopsoft",
	storageBucket: "techshopsoft.appspot.com",
	messagingSenderId: "114819965276",
	appId: "1:114819965276:web:36770db16a2bb8a1266199",
	measurementId: "G-7R442M2WZP"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, ref, getDownloadURL, uploadBytes, deleteObject };
export { database, dbRef, set, get, update, remove, child };