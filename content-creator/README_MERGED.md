# CollabX – Creator Team Merged Project

This archive combines the four submitted Creator-team ZIPs into one clean project source tree.

## Merge policy used
- Base: latest tested project/frontend/backend from the third submitted ZIP.
- Added Creator Review + Pricing from the first ZIP.
- Added Creator Campaigns + Discover + Portfolio support from the second ZIP.
- Added Brand workflows, Payments, Socket.IO negotiation support, and unique frontend components from the fourth ZIP.
- Preserved the tested Creator Request, Negotiation, Collaboration, Notification, Profile, and Dashboard implementations.
- Manually merged `backend/src/app.js`, `backend/src/server.js`, `backend/src/modules/creator/index.js`, `backend/src/modules/brand/index.js`, `backend/src/middleware/auth.middleware.js`, and `backend/package.json` so the modules are mounted together.
- Kept a single canonical `creatorProfile.model.js` and `Invitation.model.js` to avoid duplicate Mongoose models.

## Intentionally excluded
- `.env` and Atlas credential files
- `node_modules`
- Git internals
- backup folders
- generated frontend `dist`
- temporary test scripts/data

## After extraction
Backend:
```powershell
cd backend
npm install
npm start
```

Frontend:
```powershell
cd frontend
npm install
npm run lint
npm run dev
```

The backend package lock was intentionally omitted because the four source ZIPs contained conflicting lockfiles. `npm install` should generate a fresh lockfile for the merged dependency set.
