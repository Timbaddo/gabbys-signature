/* ============================================================
   DATA LAYER — all Firestore reads/writes live here.
   Collections:
     settings/main        (single doc: business info)
     settings/categories   (single doc: { list: [...] })
     designs/{id}
     posts/{id}
     appointments/{id}
     testimonials/{id}
     admins/{email}        (existence = admin — add manually
                             in the Firebase console, see README)
     users/{uid}            { fullName, email, favorites: [ids] }
   ============================================================ */

const DEFAULT_SETTINGS = {
  businessName: "Gabby's Signature",
  tagline: "Fashion & Tailoring",
  about:
    "Gabby's Signature is a professional fashion design and tailoring business specialising in stylish, elegant, and well-fitted clothing for women and children. We create custom-made outfits — casual, corporate, bridal, and special-occasion wear — tailored to your personal style and preferences. With a focus on quality craftsmanship, beautiful design, attention to detail, and excellent customer service, we are dedicated to creating outfits that make you look and feel confident.",
  whatsapp: "2348068090385",
  phone: "+2348068090385",
  email: "jacintajacyann131@gmail.com",
  address: "Abubor Nnewichi, Along Chimex Specialist Hospital, Edo-Ezemiwi Rd, Nnewi 435101, Anambra",
  mapLink: "https://maps.app.goo.gl/EK4SAf6y3fsvbyPM8",
  hours: "Mon – Sat: 9:00 AM – 6:00 PM · Sunday: Closed",
  facebook: "https://www.facebook.com/jacyann.gebechi",
  instagram: "https://www.instagram.com/jacyann_gabby",
  tiktok: "https://www.tiktok.com/@jacyann3",
  googleReviewLink: "https://maps.app.goo.gl/EK4SAf6y3fsvbyPM8",
  logoUrl: "",
  aboutPhotoUrl: "",
  workshopVideoUrl: "",
};

const DEFAULT_CATEGORIES = ["Gowns", "Bridal Wear", "Aso-Ebi", "Native Wear", "Children's Wear", "Corporate Wear", "Custom Restyle"];

const SERVICES = [
  { name: "Custom Clothing Design", desc: "Original pieces designed around your body, your event and your taste — from first sketch to final fitting." },
  { name: "Wedding & Bridal Wear", desc: "Bridal gowns and bridal party outfits, tailored with the structure and detail a wedding day deserves." },
  { name: "Aso-Ebi & Native Wear", desc: "Coordinated aso-ebi and native styles for owambe, traditional weddings and family celebrations." },
  { name: "Children's Fashion Design", desc: "Beautifully made outfits for little ones, sized and finished with the same care as our adult pieces." },
  { name: "Clothing Restyling", desc: "Give a loved garment new life — resized, reshaped or reimagined to fit and flatter you today." },
  { name: "Pattern Making", desc: "Precise, made-to-measure patterns that form the foundation of a garment that truly fits." },
  { name: "Tailoring & Alterations", desc: "Sharp, clean finishing on ready-made or custom pieces, fitted exactly to your frame." },
  { name: "Delivery", desc: "Completed pieces delivered to you, arranged directly once your order is confirmed." },
];

const SEED_DESIGNS = [
  { name: "Amara Emerald Gown", category: "Gowns", description: "A fitted evening gown with a fluid train, designed for a night that calls for presence.", featured: true, published: true, image: "" },
  { name: "Adaeze Bridal Set", category: "Bridal Wear", description: "Structured bodice, hand-finished lace overlay, and a silhouette built for your walk down the aisle.", featured: true, published: true, image: "" },
  { name: "Owambe Coral Aso-Ebi", category: "Aso-Ebi", description: "Bold coral aso-ebi styled for the dance floor, coordinated as a group or made solo.", featured: true, published: true, image: "" },
  { name: "Ifeoma Native Two-Piece", category: "Native Wear", description: "Iro and buba reworked with a modern crop and clean pleating.", featured: false, published: true, image: "" },
  { name: "Little Chidinma Set", category: "Children's Wear", description: "A matching mother-daughter piece scaled down without losing any of the detail.", featured: false, published: true, image: "" },
  { name: "Boardroom Wine Suit", category: "Corporate Wear", description: "A tailored skirt suit in deep wine, built for long days and sharp first impressions.", featured: false, published: true, image: "" },
];

const SEED_POSTS = [
  { title: "December Booking Calendar Now Open", description: "Slots for December weddings and owambe season are filling fast — book your appointment early to secure your date.", published: true },
  { title: "New Bridal Collection Preview", description: "A first look at pieces from our upcoming bridal collection, made for brides who want tradition with a modern edge.", published: true },
];

const SEED_TESTIMONIALS = [
  { name: "Uzoamaka O.", text: "My aso-ebi fit better than anything I've ever owned. Every seam sat exactly where it should.", approved: true },
  { name: "Blessing N.", text: "Gabby designed my wedding dress from a single reference photo and somehow made it even better.", approved: true },
];

// Uploads a file (image or video) picked from the phone to Firebase
// Storage and returns its public download URL. Only succeeds for signed-in
// admins — storage.rules enforces that server-side.
async function uploadToStorage(file, folder) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${folder}/${Date.now()}_${safeName}`;
  const ref = storage.ref().child(path);
  await ref.put(file);
  return ref.getDownloadURL();
}

const Data = {
  settings: { ...DEFAULT_SETTINGS },
  categories: [...DEFAULT_CATEGORIES],
  designs: [],
  posts: [],
  appointments: [],
  testimonials: [],
  isAdmin: false,

  async init() {
    await this.ensureSeeded();
    await Promise.all([
      this.loadSettings(),
      this.loadCategories(),
      this.loadDesigns(),
      this.loadPosts(),
      this.loadTestimonials(),
    ]);
  },

  async ensureSeeded() {
    // First-run only: if the settings doc doesn't exist yet, this is a brand
    // new Firebase project — populate it with sensible starting content.
    const settingsDoc = await db.collection("settings").doc("main").get();
    if (settingsDoc.exists) return;

    const batch = db.batch();
    batch.set(db.collection("settings").doc("main"), DEFAULT_SETTINGS);
    batch.set(db.collection("settings").doc("categories"), { list: DEFAULT_CATEGORIES });
    SEED_DESIGNS.forEach((d) => batch.set(db.collection("designs").doc(), { ...d, createdAt: firebase.firestore.FieldValue.serverTimestamp() }));
    SEED_POSTS.forEach((p) => batch.set(db.collection("posts").doc(), { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() }));
    SEED_TESTIMONIALS.forEach((t) => batch.set(db.collection("testimonials").doc(), t));
    await batch.commit();
  },

  async loadSettings() {
    const doc = await db.collection("settings").doc("main").get();
    this.settings = doc.exists ? doc.data() : DEFAULT_SETTINGS;
  },
  async saveSettings(next) {
    await db.collection("settings").doc("main").set(next, { merge: true });
    this.settings = { ...this.settings, ...next };
  },

  async loadCategories() {
    const doc = await db.collection("settings").doc("categories").get();
    this.categories = doc.exists ? doc.data().list : DEFAULT_CATEGORIES;
  },
  async saveCategories(list) {
    await db.collection("settings").doc("categories").set({ list });
    this.categories = list;
  },

  async loadDesigns() {
    const snap = await db.collection("designs").orderBy("createdAt", "desc").get().catch(() => db.collection("designs").get());
    this.designs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async addDesign(design) {
    await db.collection("designs").add({ ...design, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    await this.loadDesigns();
  },
  async updateDesign(id, patch) {
    await db.collection("designs").doc(id).update(patch);
    await this.loadDesigns();
  },
  async deleteDesign(id) {
    await db.collection("designs").doc(id).delete();
    await this.loadDesigns();
  },

  async loadPosts() {
    const snap = await db.collection("posts").orderBy("createdAt", "desc").get().catch(() => db.collection("posts").get());
    this.posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async addPost(post) {
    await db.collection("posts").add({ ...post, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    await this.loadPosts();
  },
  async updatePost(id, patch) {
    await db.collection("posts").doc(id).update(patch);
    await this.loadPosts();
  },
  async deletePost(id) {
    await db.collection("posts").doc(id).delete();
    await this.loadPosts();
  },

  async loadTestimonials() {
    const snap = await db.collection("testimonials").get();
    this.testimonials = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async addTestimonial(t) {
    await db.collection("testimonials").add({ ...t, approved: false, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    await this.loadTestimonials();
  },
  async approveTestimonial(id) {
    await db.collection("testimonials").doc(id).update({ approved: true });
    await this.loadTestimonials();
  },
  async deleteTestimonial(id) {
    await db.collection("testimonials").doc(id).delete();
    await this.loadTestimonials();
  },

  // Appointments are per-user (owner can read their own); admin reads all
  // separately via loadAllAppointments() once signed in as admin.
  async createAppointment(appt) {
    const uid = auth.currentUser ? auth.currentUser.uid : null;
    const ref = await db.collection("appointments").add({
      ...appt, status: "Pending", uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  },
  async loadMyAppointments() {
    if (!auth.currentUser) return [];
    const snap = await db.collection("appointments").where("uid", "==", auth.currentUser.uid).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async loadAllAppointments() {
    const snap = await db.collection("appointments").orderBy("createdAt", "desc").get().catch(() => db.collection("appointments").get());
    this.appointments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return this.appointments;
  },
  async setAppointmentStatus(id, status) {
    await db.collection("appointments").doc(id).update({ status });
    await this.loadAllAppointments();
  },

  async checkAdmin(email) {
    if (!email) return false;
    const doc = await db.collection("admins").doc(email.toLowerCase()).get();
    this.isAdmin = doc.exists;
    return this.isAdmin;
  },
};
