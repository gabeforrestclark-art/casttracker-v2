
## Trip Media Upload Feature
- [x] Add tripMedia table to drizzle schema (tripId, fileKey, url, mimeType, fileName, size, uploadedAt)
- [x] Run pnpm db:push to migrate schema
- [x] Add server-side upload procedure (presigned S3 put + save metadata)
- [x] Add server-side media query procedure (get media by tripId)
- [x] Add server-side delete procedure (remove from S3 + DB)
- [x] Build MediaUploadModal component (drag-drop + file picker, photo + video support)
- [x] Build TripMediaGallery component (thumbnail grid, lightbox preview, delete)
- [x] Integrate media gallery into TripLog page per trip row
- [x] Write vitest test for media upload procedure

## Journey Planning Feature
- [ ] Add tripPlan table to drizzle schema (tripNumber, goNoGo, prepNotes, checklistItems JSON, updatedAt)
- [ ] Run pnpm db:push to migrate schema
- [ ] Add backend planRouter (getByTrip, upsert, weather lookup via Open-Meteo API)
- [ ] Register planRouter in appRouter
- [ ] Build WeatherWidget component (7-day forecast for trip location coords)
- [ ] Build TripChecklist component (gear checklist with check/uncheck per item)
- [ ] Build GoNoGo component (decision badge + override toggle)
- [ ] Build JourneyPlanner page (upcoming trips list + full planner panel)
- [ ] Add Journey Planner nav item to sidebar
- [ ] Write vitest tests for planRouter

## Interactive Roadmap Feature
- [x] Add roadmapTask table to drizzle schema (taskId, checked, updatedAt)
- [x] Run pnpm db:push to migrate schema
- [x] Write roadmapRouter (getAll, toggleTask) with persistent DB state
- [x] Register roadmapRouter in appRouter
- [x] Write full roadmap data file (phases, days, tasks) covering launch prep through Season 4 finish
- [x] Build Roadmap page with phase accordion, day rows, checkable tasks, and progress bars
- [x] Add Roadmap nav item to sidebar Layout
- [x] Write vitest tests for roadmapRouter

## Interactive Roadmap + Social Publishing
- [ ] Add socialPost table to drizzle schema (taskId, caption, platforms, status, scheduledAt, publishedAt, ayrsharePostId)
- [ ] Run pnpm db:push to migrate socialPost table
- [ ] Add Ayrshare API key secret
- [ ] Build socialRouter with createPost, listByTask, deletePost procedures
- [ ] Register socialRouter in appRouter
- [ ] Build TaskDetailDrawer component (slide-out, notes, completion toggle, social composer)
- [ ] Build SocialComposer component (caption editor, platform checkboxes, schedule picker, queue button)
- [ ] Upgrade Roadmap page to open TaskDetailDrawer on task click
- [ ] Write vitest tests for socialRouter

## Bundle.social Live Publishing Integration
- [x] Store BUNDLE_SOCIAL_API_KEY and BUNDLE_SOCIAL_TEAM_ID as env secrets
- [ ] Build bundleSocial.ts server service (publishPost, getConnectedAccounts)
- [ ] Update socialRouter publishNow procedure to call bundle.social API live
- [ ] Wire connected account display and platform badges in TaskDetailDrawer
- [ ] Write vitest test validating bundle.social API key connectivity
- [ ] Save checkpoint
