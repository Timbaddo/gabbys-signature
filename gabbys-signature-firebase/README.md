# Gabby's Signature — website project

Plain HTML/CSS/JS + Firebase. No npm, no build step, no bundler —
every file here can be opened and edited directly in **Spck Editor**
on your phone.

## Folder structure

```
gabbys-signature-firebase/
├── firebase.json        Hosting + rules config (don't rename)
├── .firebaserc           Points deploys at the gabby-s-signature project
├── firestore.rules       Who can read/write which data
├── storage.rules         Who can upload photos/video (for later)
└── public/                Everything Firebase Hosting serves
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── firebase-init.js   Your Firebase project keys
        ├── data.js             Firestore reads/writes + seed content
        ├── auth.js             Sign up / log in / favorites
        └── app.js               Routing + all page rendering
```

Everything under `public/` is what visitors see. The four files
outside `public/` only matter when you deploy.

## What this build already does

- Loads Firebase from CDN `<script>` tags (see the bottom of
  `index.html`) — nothing to install.
- On its very first run against your empty Firebase project, it
  seeds the `settings`, `designs`, `posts` and `testimonials`
  collections with starter content automatically, then never
  overwrites them again.
- Customer accounts use **email + password + full name** (Firebase
  Authentication). Each account gets a `users/{uid}` document that
  stores their name and saved designs.
- Appointments, testimonials, saved designs and admin edits all
  write straight to Firestore — this is the real backend, not a demo.
- Images are placeholders until you're ready — Admin → Designs has an
  "Image URL" field. Paste a link once you have somewhere to host
  photos (Firebase Storage, or any image URL) and it renders for real.

## 1. Make yourself an admin

The admin dashboard is gated by a Firestore document, not a password,
so there's nothing to leak in the app's code:

1. Open the [Firebase console](https://console.firebase.google.com) →
   your `gabby-s-signature` project → **Firestore Database**.
2. Create a collection called `admins` (if it doesn't already exist).
3. Add a document whose **Document ID** is your admin login email,
   lowercase, e.g. `jacintajacyann131@gmail.com`. It doesn't need any
   fields inside it — the document existing is what grants access.
4. In the live site, sign up for a customer account using that same
   email (Account → Sign Up), then visit **Admin** from the footer or
   menu. You're in.

Add more admin emails the same way any time.

## 2. Enable Firebase products (one-time, in the console)

Firestore and Storage aren't switched on by default:

1. **Authentication** → Sign-in method → enable **Email/Password**.
2. **Firestore Database** → Create database → start in **production
   mode** (the rules in `firestore.rules` handle security).
3. **Storage** → Get started (needed later for real photo uploads).

## 3. Editing in Spck Editor

- Open this folder as a project in Spck Editor (via its Git import,
  or by unzipping into Spck's file browser).
- Every file is plain text — edit `public/js/data.js` to change
  services/seed content, `public/css/styles.css` for colors, etc.
- To preview locally in Spck, use its built-in "Run" / live preview
  on `public/index.html`. Firebase calls will work as long as your
  phone has internet access — no local server setup required beyond
  what Spck already provides.

## 4. Deploying (publishing the site live)

Firebase Hosting is deployed with the `firebase` CLI, which needs
Node.js. Two ways to do this from a phone-first workflow:

### Easiest: Google Cloud Shell (all in a browser, nothing to install)

1. On any device, go to <https://shell.cloud.google.com> and sign in
   with the same Google account that owns the `gabby-s-signature`
   Firebase project. Cloud Shell gives you a free terminal with
   Node.js and the Firebase CLI already installed.
2. Upload this whole project folder to Cloud Shell (its file menu has
   an **Upload** option — zip the folder first, upload the zip, then
   `unzip gabbys-signature-firebase.zip`), or `git clone` it if it's
   in a GitHub repo.
3. Inside the project folder, run:
   ```
   firebase login
   firebase deploy
   ```
4. `firebase login` opens a Google sign-in link — approve it, and
   `firebase deploy` pushes `public/`, `firestore.rules` and
   `storage.rules` live. You'll get a `https://gabby-s-signature.web.app`
   URL when it finishes.

### If Spck Editor's own terminal has Node.js

Some Spck Editor plans include a built-in terminal with Node — if
yours does, you can run the same three commands (`npm install -g
firebase-tools`, `firebase login`, `firebase deploy`) directly on
your phone without Cloud Shell.

### After the first deploy

Any time you edit files in Spck Editor, just run `firebase deploy`
again (from Cloud Shell or Spck's terminal) to push the update — it
only takes the changed files.

## 5. Moving ownership to the client later

When you're ready to hand the project to Gabby's Signature:

1. Firebase console → Project settings → **Users and permissions** →
   invite the client's Google account as **Owner**.
2. Once they accept, you can remove yourself or stay on as an editor.
3. Nothing in the code needs to change — `firebase-init.js` keeps
   working the same way regardless of who owns the project.

## Notes

- `firebase-init.js` contains your Firebase **web config**, which is
  safe to be public (it's not a secret key) — real protection comes
  from `firestore.rules` and `storage.rules`.
- Real push notifications that arrive with the app closed need a
  service worker + Firebase Cloud Messaging, which is a further step
  beyond what's wired up here. The in-app "Enable notifications"
  button currently only works while the site tab is open.
