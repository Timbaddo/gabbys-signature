/* ============================================================
   AUTH — email + password + full name, backed by Firebase Auth.
   Each user also gets a users/{uid} Firestore doc that stores
   their display name and saved-design favorites.
   ============================================================ */

const Auth = {
  user: null,           // Firebase Auth user object, or null
  profile: null,        // { fullName, email, favorites: [] }

  async init() {
    return new Promise((resolve) => {
      auth.onAuthStateChanged(async (user) => {
        this.user = user;
        if (user) {
          await this.loadProfile();
          await Data.checkAdmin(user.email);
        } else {
          this.profile = null;
          Data.isAdmin = false;
        }
        resolve();
        if (typeof onAuthChanged === "function") onAuthChanged();
      });
    });
  },

  async loadProfile() {
    const doc = await db.collection("users").doc(this.user.uid).get();
    this.profile = doc.exists ? doc.data() : { fullName: this.user.email.split("@")[0], email: this.user.email, favorites: [] };
  },

  async signup(fullName, email, password) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: fullName });
    await db.collection("users").doc(cred.user.uid).set({ fullName, email, favorites: [], createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    this.user = cred.user;
    await this.loadProfile();
    await Data.checkAdmin(email);
    return cred.user;
  },

  async login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    this.user = cred.user;
    await this.loadProfile();
    await Data.checkAdmin(email);
    return cred.user;
  },

  async logout() {
    await auth.signOut();
    this.user = null;
    this.profile = null;
    Data.isAdmin = false;
  },

  async resetPassword(email) {
    await auth.sendPasswordResetEmail(email);
  },

  isFavorite(designId) {
    return !!(this.profile && this.profile.favorites && this.profile.favorites.includes(designId));
  },

  async toggleFavorite(designId) {
    if (!this.user) return false;
    const favs = this.profile.favorites || [];
    const next = favs.includes(designId) ? favs.filter((f) => f !== designId) : [...favs, designId];
    this.profile.favorites = next;
    await db.collection("users").doc(this.user.uid).set({ favorites: next }, { merge: true });
    return true;
  },
};
