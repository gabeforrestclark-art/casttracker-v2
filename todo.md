
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
