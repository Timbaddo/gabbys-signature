/* ============================================================
   FIREBASE INITIALIZATION
   Uses the "compat" SDK loaded via <script> tags in index.html —
   no npm install, no bundler, so this works directly in Spck
   Editor on mobile. Edit ONLY the config values below if you
   ever need to point this site at a different Firebase project.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCwJeHWZS9z8JumhjXJYKbi-6kYZ5UMbAs",
  authDomain: "gabby-s-signature.firebaseapp.com",
  projectId: "gabby-s-signature",
  storageBucket: "gabby-s-signature.firebasestorage.app",
  messagingSenderId: "535415918119",
  appId: "1:535415918119:web:c57d831743fe48b9d3c802",
  measurementId: "G-Z47LQ3B619",
};

firebase.initializeApp(firebaseConfig);

// Shared handles used by every other script on the page.
const auth = firebase.auth();
const db = firebase.firestore();
// Storage is wired up now so image/video uploads work the moment
// you're ready — Admin just uses placeholders until then.
const storage = firebase.storage();

// Keep Firestore usable offline / on flaky mobile data.
db.enablePersistence({ synchronizeTabs: true }).catch(() => {
  /* multiple tabs open, or browser doesn't support it — safe to ignore */
});
