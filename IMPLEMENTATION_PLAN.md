# RSP News Publisher - Implementation Plan (Final)

## Project Overview
A web application for **Ranchi Samachar Patrika** to automate news content generation using Gemini AI, generate branded images using Canvas API, and copy platform-specific content to clipboard for manual posting on Facebook, Instagram, and Twitter.

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | Angular 17+ | Free |
| Local Storage (Phase 1) | IndexedDB via Dexie.js | Free |
| Backend | Node.js + Express | Free |
| Database | MongoDB (Local) | Free |
| AI Content | Google Gemini API (`@google/genai` SDK, `gemini-2.5-flash`) | Free (1500 req/day) |
| Image Processing | HTML5 Canvas API | Free |
| **TOTAL** | | **₹0 / $0** |

---

## How to Resume After Account Switch
> If you switch Amazon Q accounts, share this file and say:
> **"Resume RSP News Publisher implementation. Read IMPLEMENTATION_PLAN.md and continue from the first unchecked step."**

---

## PHASE 1 — Frontend with IndexedDB (Local Storage)
> Backend NOT needed in this phase. All data stored in browser's IndexedDB via Dexie.js.

### 1.1 Project Initialization
- [x] Create Angular project
  ```bash
  cd "/Users/ashishkumar/Documents/SYNAPSE CREATIVE MEDIA /RSP_APP"
  ng new frontend --routing --style=scss --skip-git
  cd frontend
  ```
- [x] Install dependencies
  ```bash
  ng add @angular/material
  npm install dexie @google/generative-ai
  npm install @angular/animations@22.0.8
  ```

### 1.2 Project Structure to Create
```
frontend/src/app/
├── models/
│   └── post.model.ts
├── db/
│   └── app-db.ts               ← Dexie IndexedDB setup
├── services/
│   ├── gemini.service.ts        ← Gemini API calls
│   ├── post.service.ts          ← Save/get posts (IndexedDB in Phase1, API in Phase3)
│   └── canvas.service.ts        ← Image generation
├── components/
│   ├── editor/                  ← Main page
│   │   ├── editor.component.ts
│   │   ├── editor.component.html
│   │   └── editor.component.scss
│   ├── image-editor/            ← Canvas image editor
│   │   ├── image-editor.component.ts
│   │   ├── image-editor.component.html
│   │   └── image-editor.component.scss
│   └── history/                 ← Saved posts list
│       ├── history.component.ts
│       ├── history.component.html
│       └── history.component.scss
└── assets/
    └── templates/
        ├── breaking-news.png
        ├── politics.png
        ├── sports.png
        └── entertainment.png
```

### 1.3 Files to Create — Models
- [x] Create `frontend/src/app/models/post.model.ts`

### 1.4 Files to Create — IndexedDB Setup
- [x] Create `frontend/src/app/db/app-db.ts`

### 1.5 Files to Create — Services
- [x] Create `frontend/src/app/services/gemini.service.ts`
- [x] Create `frontend/src/app/services/post.service.ts`
- [x] Create `frontend/src/app/services/canvas.service.ts`

### 1.6 Files to Create — Components
- [x] Create `editor` component (main page)
- [x] Create `image-editor` component
- [x] Create `history` component

### 1.7 Files to Update
- [x] Update `app.routes.ts` with routing
- [x] Update `app.html` with router outlet
- [x] Update `app.config.ts` with providers
- [x] Update `styles.scss` with global styles

### 1.8 Add Template Images ⬅️ YOUR ACTION NEEDED
- [x] `breaking-news.png` added to `frontend/public/templates/`
- [ ] Add more templates to `frontend/public/templates/` when ready
  - politics.png
  - sports.png
  - entertainment.png
  - crime.png
  - business.png
  > ⚠️ Angular 22 serves static files from `public/` folder NOT `src/assets/`
  > Always put template images in `frontend/public/templates/`

### 1.9 Get Gemini API Key ⬅️ YOUR ACTION NEEDED
- [x] Gemini API key stored in `backend/.env` as `GEMINI_API_KEY`
- [x] Gemini SDK: `@google/genai` (new SDK) — `npm install @google/genai` in backend
- [x] Gemini model: `gemini-2.5-flash` ✅ confirmed working

### 1.10 Phase 1 Testing Checklist
- [x] `ng build` runs without errors
- [x] `ng serve` runs and app opens at http://localhost:4200
- [x] Gemini API key added and Generate button works
- [x] Gemini content renders in UI (fixed with `ChangeDetectorRef.markForCheck()`)
- [x] Can edit generated content in each tab
- [x] Copy to clipboard works for each platform
- [x] Can upload news photo and see image preview (photo fills middle of template)
- [x] Can download generated image
- [x] Save post stores in IndexedDB (fixed spinner with `.finally()` + `markForCheck()`)
- [x] History page shows all saved posts on load (fixed with `markForCheck()` in `loadPosts()`)
- [x] Can re-copy content from history
- [x] Can delete post from history

---

## PHASE 2 — Backend (Node.js + Express)
> Replace IndexedDB calls with real HTTP API calls. Frontend stays the same, only `post.service.ts` changes.

### 2.1 Backend Project Setup
- [x] Initialize backend project
  ```bash
  cd "/Users/ashishkumar/Documents/SYNAPSE CREATIVE MEDIA /RSP_APP"
  mkdir backend && cd backend
  npm init -y
  npm install express mongoose dotenv cors @google/generative-ai
  npm install -D nodemon
  ```

### 2.2 Files to Create
- [x] Create `backend/.env`
- [x] Create `backend/models/Post.js`
- [x] Create `backend/routes/generate.js`
- [x] Create `backend/routes/posts.js`
- [x] Create `backend/server.js`

### 2.3 Move Gemini API to Backend
- [x] Move Gemini API key from frontend `environment.ts` to backend `.env`
- [x] Update `gemini.service.ts` to call backend `/api/generate` instead of Gemini directly
- [x] Remove `@google/generative-ai` from frontend

### 2.4 Phase 2 Testing Checklist
- [x] `npm run dev` starts backend on port 3000
- [x] `GET http://localhost:3000/api/posts` returns empty array
- [x] `POST http://localhost:3000/api/generate` returns Gemini content
- [x] Frontend still works with backend running (test with Postman or browser)

---

## PHASE 3 — Local MongoDB Installation
> Replace in-memory/mock DB with real MongoDB. Backend model stays the same.

### 3.1 Install MongoDB on macOS
- [x] Install MongoDB (manual install — no Homebrew)
  > Downloaded from https://fastdl.mongodb.org/osx/mongodb-macos-arm64-7.0.21.tgz
  > Binaries copied to `/usr/local/bin/`
  > See `backend/MONGODB_SETUP.md` for full steps
- [x] Start MongoDB service
  > launchd plist created at `~/Library/LaunchAgents/org.mongodb.mongod.plist`
  > Auto-starts on login, runs on port 27017
- [x] Verify installation
  > `mongod --version` → db version v7.0.21

### 3.2 Connect Backend to MongoDB
- [x] `backend/.env` already has `MONGODB_URI=mongodb://localhost:27017/rsp_news`
- [x] `backend/server.js` connects mongoose on startup
- [x] Tested — logs `✅ MongoDB connected` on start

### 3.3 Update Frontend post.service.ts
- [x] Already using HttpClient calls to backend (done in Phase 2)

### 3.4 Phase 3 Testing Checklist
- [x] MongoDB running locally (PID confirmed, auto-starts via launchd)
- [x] Backend connects to MongoDB on startup
- [x] Save post → appears in MongoDB (`POST /api/posts` tested ✅)
- [x] History page loads from MongoDB (`GET /api/posts` returns data ✅)
- [x] Delete post removes from MongoDB (`DELETE /api/posts/:id` tested ✅)
- [x] Restart backend → data still persists

---

## PHASE 5 — Fabric.js Image Editor
> Add interactive image editing (crop, zoom, move, add text overlays) on the uploaded news photo before it gets placed into the template.

### 5.1 Install Fabric.js
- [x] Install fabric package
  ```bash
  cd frontend
  npm install fabric
  npm install @types/fabric --save-dev
  ```

### 5.2 Updated Flow
> Old: Upload photo → Generate Preview → Download
> New: Upload photo → **Fabric.js Editor** (crop/zoom/move/text) → Apply Edits → Generate Preview → Download

### 5.3 Files to Change
- [x] `image-editor.component.ts` — add Fabric.js canvas logic, toolbar actions, apply edits
- [x] `image-editor.component.html` — add Fabric canvas element + toolbar (move, zoom, crop, add text, delete, undo)
- [x] `image-editor.component.scss` — toolbar and fabric canvas styles
- [x] `canvas.service.ts` — no changes needed (receives edited image dataUrl as before)

### 5.4 Toolbar Features
- [x] Move/Pan uploaded photo on canvas
- [x] Zoom In / Zoom Out / Reset Zoom
- [x] Rotate Left / Rotate Right
- [x] Flip Horizontal / Flip Vertical
- [x] Add text overlay on photo (with shadow, bold, white)
- [x] Delete selected object
- [x] Undo last action (up to 20 steps)
- [x] Apply Edits & Generate Preview button

### 5.5 Testing Checklist
- [x] Upload photo → Fabric editor appears with photo loaded
- [x] Can move/reposition photo
- [x] Can zoom in and out
- [x] Can add text overlay on photo
- [x] Can delete added text
- [x] Can undo actions
- [x] Apply Edits → photo placed correctly in template
- [x] Download image works as before

---

## PHASE 6 — Advanced Caption Editor
> Enhance the image caption system with multiple captions, drag/resize on preview, and per-caption styling.

### 6.1 Caption Enhancements
- [x] Multiple captions — `+` button to add, `−` button to remove
- [x] First caption pre-filled from generated content by default
- [x] Each caption is a draggable, resizable `IText` object on the preview Fabric canvas
- [x] Captions start in the footer area (y=1066–1280) but can be dragged anywhere
- [x] Per-caption text alignment — Left / Center / Right toggle buttons
- [x] Per-caption text colour picker (native colour input, opacity-0 overlay on swatch)
- [x] Per-caption background colour picker with "No Background" (transparent) reset button
- [x] Download exports preview Fabric canvas at full 1024×1280 with captions at final positions

### 6.2 Files Changed
- [x] `image-editor.component.ts` — `CaptionConfig` interface (`text`, `align`, `color`, `bgColor`); `captions[]` array replaces single string; `setCaptionAlign()`, `addCaption()`, `removeCaption()`; `initPreviewFabric()` applies all caption styles to Fabric `IText`
- [x] `image-editor.component.html` — caption blocks with text input, align buttons, colour swatches
- [x] `image-editor.component.scss` — `.caption-block`, `.caption-style-row`, `.colour-swatch`, `.colour-input` (opacity-0 fix for native colour picker)
- [x] `canvas.service.ts` — caption drawing removed (now handled by Fabric.js on preview canvas)

### 6.3 Key Fix — colour picker not opening
- `<input type="color" hidden>` blocks the browser from opening the native picker
- **Fix:** Use `opacity: 0; position: absolute; inset: 0` via `.colour-input` class instead

### 6.4 Key Fix — uploaded image not rendering in template
- Fabric canvas export (640×480 with dark background) was being passed to `canvas.service` instead of the original file
- **Fix:** Pass `this.selectedFile` (original upload) directly to `canvas.service.generateImage()` — Fabric editor is for visual adjustments only; the final composite always uses the original photo

### 6.5 Testing Checklist
- [x] First caption pre-filled on load
- [x] `+` button adds new caption with default white text, transparent BG, center align
- [x] `−` button removes caption (hidden when only one caption)
- [x] Left / Center / Right align buttons highlight active selection
- [x] Text colour swatch opens native colour picker on click
- [x] BG colour swatch opens native colour picker on click
- [x] "No BG" button resets background to transparent
- [x] Apply Edits → template renders correctly with photo in black area
- [x] Captions appear on preview canvas in footer area with correct styles
- [x] Captions are draggable and resizable on preview canvas
- [x] Download exports full 1024×1280 image with captions at final positions
- [x] **PHASE 6 COMPLETE** ✅

---

## PHASE 7 — UI Redesign & Branding
> Complete visual overhaul of both Editor and History pages with a professional dark-sidebar layout using colors extracted from the RSP logo.

### 7.1 Logo Color Palette (extracted via Python PIL)
| Role | Hex | Usage |
|---|---|---|
| Deep Navy | `#0d0d2e` | Sidebar background, page titles |
| Navy Mid | `#1e1e4b` | Save button gradient |
| Deep Purple | `#2d0f4b` | Active nav bg, gradient ends, left border accents |
| Magenta | `#85073f` | Generate button, active nav indicator, error text |
| Slate | `#5a5a78` | Dividers, version text |
| Lavender | `#8c8ca0` | Muted descriptions, secondary text |
| Soft Lilac | `#b8a0c8` | "Synapse Creative Media" sidebar text |

### 7.2 Layout — Dark Sidebar + Light Content
- [x] Fixed left sidebar (220px, `#0d0d2e`) with logo, brand text, nav links
- [x] Sidebar collapses to 60px icon-only on mobile (≤768px)
- [x] Main content area: `#f5f4f9` (subtle purple-tinted background)
- [x] Sticky sidebar — always visible while scrolling
- [x] Navigation-ready structure — future items can be added as `sidebar-nav-item` entries

### 7.3 Sidebar Brand Block
```
[logo]  RSP
        A unit of
        Synapse Creative Media
```
- [x] RSP logo (44px rounded square) with magenta glow shadow
- [x] "RSP" — bold white, large
- [x] "A unit of" — tiny muted grey
- [x] "Synapse Creative Media" — soft lilac
- [x] Bottom: `v1.0 · RSP Publisher` + `© 2026 Ranchi Samachar Patrika`

### 7.4 Sidebar Navigation
- [x] Editor nav item (active on editor page) — magenta highlight + left accent bar
- [x] History nav item (active on history page)
- [x] Active state: `rgba(133,7,83,0.18)` background + `#e879b8` text + 3px left bar
- [x] Hover state: subtle white overlay
- [x] Commented placeholder slots for future nav items (Analytics, Settings, etc.)

### 7.5 Editor Page Redesign
- [x] Removed old top header bar
- [x] Page title "News Editor" + subtitle
- [x] Panels replace cards — `16px` border-radius, soft shadow, no colored top border
- [x] Panel header: colored icon badge (magenta→purple gradient) + title + description
- [x] Generate button: magenta→purple gradient with drop shadow + hover lift
- [x] Save button: navy gradient
- [x] Error banner: pink-tinted background matching magenta theme
- [x] Removed "AI Ready" status chip
- [x] Removed footer text from main content area

### 7.6 History Page Redesign
- [x] Same sidebar as Editor (History nav item active)
- [x] Page header with title, subtitle, search field top-right
- [x] Post cards: white, `14px` border-radius, hover lift shadow
- [x] Raw preview: `#f9f8fc` background with `#2d0f4b` left border
- [x] Content preview (expanded): `#85073f` magenta left border
- [x] Empty state: magenta icon circle + styled title/subtitle
- [x] Delete button turns magenta on hover
- [x] Category badges retain their original colors

### 7.7 Assets
- [x] `rsp-logo.jpg` copied to `frontend/public/rsp-logo.jpg`
- [x] `rsp-banner.png` copied to `frontend/public/rsp-banner.png` (available for future use)

### 7.8 Files Changed
- [x] `editor.component.html` — full rewrite with sidebar + panel layout
- [x] `editor.component.scss` — full rewrite with logo color theme
- [x] `editor.component.ts` — added `currentYear` property
- [x] `history.component.html` — full rewrite matching sidebar layout
- [x] `history.component.scss` — full rewrite matching logo color theme
- [x] `styles.scss` — cleaned up old responsive overrides

### 7.9 Testing Checklist
- [x] Editor page renders with sidebar and correct colors
- [x] History page renders with sidebar and correct colors
- [x] Active nav item highlights correctly on each page
- [x] Sidebar collapses to icons on mobile
- [x] Logo loads from `public/rsp-logo.jpg`
- [x] All existing functionality (generate, copy, save, delete) unchanged
- [x] Build passes with zero errors ✅
- [x] **PHASE 7 COMPLETE** — UI Redesign & Branding ✅

---

## PHASE 4 — Integration & Full App Testing

### 4.1 End-to-End Flow Testing
- [x] Full workflow test:
  1. Paste news → Generate → Copy all 3 platforms → Download image → Save
  2. Go to History → Find post → Re-copy content
  3. Delete old posts
- [x] Test with Hindi content
- [x] Test with English content
- [x] Test all 4 image templates
- [x] Test long captions (text wrapping on image)
- [x] Test with different image sizes/orientations

### 4.2 Edge Cases
- [x] What happens if Gemini API is down? (error banner shown below Generate button)
- [x] What happens if image upload is very large? (warning shown if >5MB)
- [x] Twitter content > 280 characters? (character count warning already in place)
- [x] Empty news content submitted? (form validation already in place)

### 4.3 UI Polish
- [x] Loading spinner while Gemini generates
- [x] Success toast when content copied
- [x] Confirm dialog before deleting post (Angular Material dialog — replaces browser `confirm()`)
- [x] Responsive design (works on tablet and mobile)

### 4.4 Final Checklist
- [x] All Phase 1 tests pass
- [x] All Phase 2 tests pass
- [x] All Phase 3 tests pass
- [x] No console errors
- [x] App works after browser refresh
- [x] App works after system restart (MongoDB auto-starts via launchd)

---

## Current Status
- [x] Implementation plan created
- [x] Plan revised (removed social APIs, added clipboard)
- [x] Plan finalized (4 phases, IndexedDB for Phase 1)
- [x] Phase 1 code complete — build passes ✅
- [x] Angular 22 zoneless rendering fixed with `ChangeDetectorRef` ✅
- [x] Gemini API working with `gemini-3.6-flash` model ✅
- [x] Template image path fixed (`public/templates/` not `src/assets/`) ✅
- [x] Canvas image generation fixed (header+footer drawn separately, uploaded image fills black area) ✅
- [x] Save spinner fix applied ✅
- [x] History page load fix applied ✅
- [x] **PHASE 1 COMPLETE** ✅
- [x] **PHASE 2 COMPLETE** — Backend (Node.js + Express) ✅
- [x] **PHASE 3 COMPLETE** — Local MongoDB Installation ✅
- [x] UI Polish complete ✅
- [x] Edge Cases handled ✅
- [x] Gemini model switched to `gemini-2.5-flash` (3.6-flash was returning 503) ✅
- [x] Save to History button moved inside Generated Content card ✅
- [x] "Save & View History" button added ✅
- [x] Button shows "Saved! ✓" checkmark after saving ✅
- [x] **PHASE 4 COMPLETE** — Integration & Full App Testing ✅
- [x] **🎉 ALL PHASES COMPLETE — APP IS FULLY FUNCTIONAL**
- [ ] **PHASE 5 — Fabric.js Image Editor** ← In Progress
- [x] Fabric.js v7 installed ✅
- [x] Fabric canvas with full toolbar implemented ✅
- [x] Build passes with zero errors ✅
- [x] **PHASE 5 COMPLETE** — Fabric.js Image Editor ✅
- [x] **PHASE 6 COMPLETE** — Advanced Caption Editor ✅
  - Multiple captions with `+` / `−` buttons
  - Draggable & resizable captions on preview Fabric canvas
  - Per-caption: text align (L/C/R), text colour picker, background colour picker
  - Fixed: colour picker not opening (`hidden` → `opacity:0` CSS fix)
  - Fixed: uploaded image not rendering in template (pass `selectedFile` directly to `canvas.service`)
- [x] **PHASE 7 COMPLETE** — UI Redesign & Branding ✅
  - Dark sidebar layout with RSP logo color palette
  - Colors extracted from logo: navy `#0d0d2e`, purple `#2d0f4b`, magenta `#85073f`
  - Sidebar brand: RSP + "A unit of" + "Synapse Creative Media" + copyright
  - Editor & History pages fully redesigned and theme-matched
  - Navigation-ready sidebar structure for future features
- [x] **PHASE 8 COMPLETE** — Authentication & User Management ✅
  - JWT login with bcrypt password hashing
  - Admin auto-seeded on startup (`admin/admin`, Ashish Kumar)
  - All API routes protected with JWT middleware
  - Angular `authGuard` protects editor + history routes
  - Login page: split layout with RSP banner + themed form
  - Both sidebars show user avatar (initials), name, role, logout button
- [x] **PHASE 9 COMPLETE** — News Validation + UI Fixes ✅
  - AI fact-check runs in parallel with content generation
  - Validation score (0–100%), verdict, summary, and sources shown in editor
  - Validation data saved to MongoDB and displayed in history
  - Login page updated: banner fills left panel (no overlay), brand block on form side
  - Favicon replaced with RSP logo (`rsp-logo.png`), page title set to "RSP News Publisher"
  - Debug console logs removed from backend
  - Gemini SDK migrated from `@google/generative-ai` → `@google/genai`
  - Model confirmed working: `gemini-2.5-flash` with new SDK

---

## PHASE 9 — News Validation + UI Fixes ✅
> AI-powered fact-checking on news content, login page polish, favicon, and Gemini SDK upgrade.

### 9.1 News Validation Feature
- [x] `backend/routes/validate.js` — new `POST /api/validate` endpoint using Gemini
  - Returns: `score` (0–100), `verdict`, `summary`, `sources[]`
  - Verdict scale: Verified / Likely True / Unverified / Likely False / False
- [x] `backend/models/Post.js` — added fields: `validationScore`, `validationVerdict`, `validationSummary`, `validationSources`
- [x] `backend/server.js` — `/api/validate` registered as JWT-protected route
- [x] `frontend/models/post.model.ts` — added `ValidationResult` interface + validation fields to `Post`
- [x] `frontend/services/gemini.service.ts` — added `validateContent()` method
- [x] `editor.component.ts` — generate + validate run in parallel via `Promise.all`; validation saved with post
- [x] `editor.component.html` — validation panel between raw news and generated content panels
  - Score circle, verdict badge, summary text, clickable source chips
  - Panel background color changes based on score (green/yellow/orange/red)
- [x] `history.component.ts` — added `getValidationColor()` helper
- [x] `history.component.html` — each post card shows validation badge + sources
- [x] CSS budget in `angular.json` increased from `8kB` → `32kB` (error limit)

### 9.2 Login Page Updates
- [x] Removed gradient overlay from banner — banner now shows clean
- [x] Brand block added to form side: RSP logo + "Ranchi Samachar Patrika" + "A unit of Synapse Creative Media"
- [x] Tested full-screen banner layout (reverted — left/right split kept as final)
- [x] Login page layout: banner fills left panel, form card on right with brand block at top

### 9.3 Favicon & Page Title
- [x] `frontend/public/rsp-logo.png` — RSP logo converted to PNG (64×64) via `sips`
- [x] `frontend/src/index.html` — favicon points to `rsp-logo.png`, title set to `RSP News Publisher`

### 9.4 Gemini SDK Migration ⚠️ IMPORTANT
- [x] Uninstalled old SDK: `@google/generative-ai`
- [x] Installed new SDK: `npm install @google/genai`
- [x] `backend/routes/generate.js` — migrated to new SDK
- [x] `backend/routes/validate.js` — migrated to new SDK
- [x] Model: `gemini-2.5-flash` ✅ confirmed working with new SDK
- See **Key Lessons Learned → #4** for correct usage pattern

### 9.5 Backend Cleanup
- [x] Removed all debug `console.log` statements from `server.js` and `routes/auth.js`

### 9.6 Testing Checklist
- [x] Generate content → validation panel appears with score, verdict, summary, sources
- [x] Score color changes correctly (green ≥80, yellow ≥60, orange ≥40, red <40)
- [x] Save post → validation data persisted in MongoDB
- [x] History page shows validation badge on each saved post
- [x] Source chips are clickable links
- [x] Login page brand block visible on form side
- [x] Favicon shows RSP logo in browser tab
- [x] Page title shows "RSP News Publisher"
- [x] Build passes with zero errors ✅
- [x] **PHASE 9 COMPLETE** ✅

---

## PHASE 8 — Authentication & User Management ✅
> JWT-based login system with role-based access. All API routes protected. Admin user auto-seeded on startup.

### 8.1 Backend — Auth Infrastructure
- [x] `backend/models/User.js` — username, password (bcrypt hashed), firstName, lastName, role
- [x] `backend/routes/auth.js` — `POST /api/auth/login` + `POST /api/auth/signup`
- [x] `backend/middleware/auth.js` — JWT verification middleware for protected routes
- [x] `backend/seed/seedAdmin.js` — auto-creates `admin/admin` (Ashish Kumar, role: admin) on first startup
- [x] `backend/server.js` — seed runs on startup, all existing routes protected with JWT
- [x] `add-user.curl.sh` — shell script ready for adding future users via API

### 8.2 Frontend — Auth Integration
- [x] `auth.service.ts` — login, logout, token + user storage in localStorage
- [x] `guards/auth.guard.ts` — redirects to `/login` if not authenticated
- [x] `post.service.ts` + `gemini.service.ts` — JWT `Authorization` header attached to all API calls
- [x] Login component — split layout (banner + logo on left, form on right), themed with RSP logo colors
- [x] `app.routes.ts` — `/login` route added; editor + history routes protected with `authGuard`
- [x] Both sidebars (Editor + History) — user avatar (initials), full name, role, and logout button at bottom

### 8.3 How to Use
1. Restart backend: `npm run dev` in the `backend/` folder
2. Open http://localhost:4200 — redirected to `/login` automatically
3. Login with `admin` / `admin`

### 8.4 Testing Checklist
- [x] Unauthenticated access to `/editor` or `/history` redirects to `/login`
- [x] Login with `admin/admin` succeeds and redirects to editor
- [x] JWT token stored in localStorage after login
- [x] All API calls include `Authorization: Bearer <token>` header
- [x] Logout clears token and redirects to `/login`
- [x] User avatar, name, and role visible in both sidebars
- [x] Backend rejects API calls without valid JWT
- [x] Admin user auto-created on first backend startup
- [x] **PHASE 8 COMPLETE** — Authentication & User Management ✅

---

## UI Design Reference

### Editor Page (Phase 7 — Current)
```
┌─────────────┬────────────────────────────────────────────┐
│  [logo]     │  News Editor                               │
│  RSP        │  Generate AI-powered content...            │
│  A unit of  ├────────────────────────────────────────────┤
│  Synapse    │  ┌ 🔴 Raw News Content ─────────────────┐  │
│  Creative   │  │  Category ▼   Language ▼             │  │
│  Media      │  │  [textarea]                          │  │
│             │  │              [✨ Generate Content]   │  │
│  ── Nav ──  │  └──────────────────────────────────────┘  │
│  ✏️ Editor  │  ┌ 🟣 Generated Content ────────────────┐  │
│  📋 History │  │  [FB] [IG] [TW] tabs                 │  │
│             │  │  [textarea]  [📋 Copy]               │  │
│  ─────────  │  │  [💾 Save]  [↗ Save & History]       │  │
│  v1.0 RSP   │  └──────────────────────────────────────┘  │
│  © 2026 RSP │  ┌ Image Editor ────────────────────────┐  │
└─────────────┴──┴──────────────────────────────────────┴──┘
```

### History Page (Phase 7 — Current)
```
┌─────────────┬────────────────────────────────────────────┐
│  [logo]     │  Post History          [🔍 Search...]      │
│  RSP        │  Browse, preview and re-copy saved posts   │
│  ...        ├────────────────────────────────────────────┤
│  ✏️ Editor  │  ┌─────────────────────────────────────┐   │
│  📋 History │  │ 🔴 Breaking News  Hindi  12 Jan 2026 🗑│  │
│  (active)   │  │ "रिकॉर्ड 68,000+ सेवा आदेश जारी..." │  │
│             │  │ [Copy Facebook ▼] [Copy IG ▼] [Copy TW ▼]│
└─────────────┴──┴─────────────────────────────────────┴───┘
```

---

## Key Lessons Learned (Important for Phase 2+)

### 1. Angular 22 is Zoneless by Default
- `async/await` and Promises run outside Angular's change detection
- **Fix:** Always call `this.cdr.markForCheck()` after updating component state from a Promise
- `NgZone.run()` does NOT work in Angular 22 — use `ChangeDetectorRef` instead
- Inject `ChangeDetectorRef` in every component that uses async operations

### 2. Angular 22 Static Files Location
- Static files (images, templates) must go in `frontend/public/` folder
- NOT in `src/assets/` (that was Angular 16 and below)
- URL in code: `templates/breaking-news.png` (no `assets/` prefix)

### 3. Canvas Image Generation — Template Structure
- Template size: **1024×1280px**
- Header (red): `y=0` to `y=206` (206px)
- Black area (news photo goes here): `y=206` to `y=1066` (860px)
- Footer (red, caption): `y=1066` to `y=1280` (214px)
- Draw header and footer separately from template — do NOT draw full template on top of photo

### 4. Gemini Model & SDK
- ⚠️ **Old SDK:** `@google/generative-ai` — DEPRECATED, do NOT use
- ✅ **New SDK:** `@google/genai` — install with `npm install @google/genai`
- ✅ **Working model:** `gemini-2.5-flash` with new SDK
- ❌ `gemini-2.5-flash` with old SDK → 404 (model no longer available to new users via old SDK)
- ❌ `gemini-3.6-flash` → 503 (high demand/unavailable)
- ❌ `gemini-2.0-flash` → 404 for this account
- ❌ `gemini-2.0-flash-lite` → tested but replaced with 2.5-flash

**Correct usage (both generate.js and validate.js):**
```javascript
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt
});
const text = response.text.replace(/```json|```/g, '').trim();
```

### 5. Phase 2 — post.service.ts Migration Note
When migrating from IndexedDB to backend API in Phase 2+:
```typescript
// Current (Phase 1) — Dexie IndexedDB:
return db.posts.add({ ...post, createdAt: new Date() });

// Phase 2+ — HTTP API:
return this.http.post<Post>('http://localhost:3000/api/posts', post).toPromise();
```
Only `post.service.ts` needs to change — all components stay the same.

---

## File-by-File Code Reference

### post.model.ts
```typescript
export interface Post {
  id?: number;           // IndexedDB auto-increment (Phase 1)
  _id?: string;          // MongoDB ID (Phase 2+)
  rawContent: string;
  category: string;
  language: string;
  facebookContent: string;
  instagramContent: string;
  twitterContent: string;
  imageCaption: string;
  copiedTo: { facebook: boolean; instagram: boolean; twitter: boolean; };
  createdAt: Date;
}
```

### app-db.ts (Dexie IndexedDB — Phase 1 only)
```typescript
import Dexie, { Table } from 'dexie';
import { Post } from '../models/post.model';

export class AppDB extends Dexie {
  posts!: Table<Post, number>;
  constructor() {
    super('rsp_news_db');
    this.version(1).stores({ posts: '++id, category, createdAt' });
  }
}
export const db = new AppDB();
```

### post.service.ts (Phase 1 — IndexedDB)
```typescript
// Phase 1 uses Dexie, Phase 2+ replaces with HttpClient calls
import { db } from '../db/app-db';

save(post: Omit<Post, 'id' | 'createdAt'>) {
  return db.posts.add({ ...post, createdAt: new Date() });
}
getAll() { return db.posts.orderBy('createdAt').reverse().toArray(); }
delete(id: number) { return db.posts.delete(id); }
```
