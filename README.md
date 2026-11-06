# FieldPulse

FieldPulse is an offline-first mobile application for creating and managing field inspections. It uses local SQLite storage for offline access and synchronizes inspection data, photos, authentication, and deletion operations with the FieldPulse backend.

## Features

- Account registration, login, logout, and automatic access-token refresh
- Organization isolation between users and organizations
- Create inspections with title, description, GPS coordinates, and photo evidence
- Capture photos through Expo Camera and location through Expo Location
- Local-first SQLite persistence with Drizzle ORM
- Synchronize records from PostgreSQL into the device
- Upload inspection photos with multipart requests
- Download protected remote photos and cache them locally
- Remove local and remote inspections across synchronized devices
- Offline fallback to locally stored inspections when synchronization is unavailable

## Tech Stack

- Expo SDK 57
- React Native 0.86
- Expo Router
- TypeScript
- SQLite with Drizzle ORM
- TanStack Query
- React Hook Form and Zod
- Expo Camera, Location, FileSystem, and SecureStore
- Fastify backend with PostgreSQL

## Requirements

- Node.js and npm
- Expo Go or an emulator
- Android/iOS permissions for camera and location
- A running FieldPulse backend
- Reachable LAN or HTTPS backend address from each physical device

## Installation

```bash
npm install
```

Configure the backend URL in `src/config/api.ts`:

```ts
export const API_URL = "http://YOUR_SERVER_IP:3000/api/v1"
```

The app uses clear-text HTTP for Android local-network development. For production, use HTTPS.

When the backend is running with Docker Compose, the mobile app still uses port `3000` and `src/config/api.ts` only needs the Docker host's LAN IP:

```text
http://YOUR_SERVER_LAN_IP:3000/api/v1
```

Docker does not expose the backend through `localhost` on another physical device.

## Run the app

```bash
npx expo start
```

Open the app with Expo Go or start a platform-specific development session:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

Physical devices must be able to reach the backend host. The backend URL must use the host computer's LAN address, not `localhost`, for devices that are not running on the same machine.

## Authentication and Organization Isolation

The app stores access and refresh tokens securely with Expo SecureStore. Authenticated requests send the access token through the `Authorization: Bearer <token>` header.

When an access token expires, the API client automatically uses the refresh token, stores the renewed tokens, and retries the request.

Every inspection and protected photo request belongs to the authenticated user's organization. Records from another organization are not returned or accessible to the current user.

## Offline-first Synchronization

- Inspection records are stored in SQLite.
- `remote_id` associates a local record with its PostgreSQL record.
- Remote synchronization downloads the current organization's inspections.
- Local records removed remotely are also removed from the local SQLite cache.
- Synchronization failures fall back to the local SQLite cache.
- Local pending operations remain recorded in `sync_queue`.

Photo handling differs by source:

- Local photos use `file://` URIs directly.
- Remote photos use protected backend URLs and are downloaded to the Expo cache with the access token.
- The rendered image uses the downloaded local URI.

## Project Structure

```text
app/
  (tabs)/             Inspection list and profile
  inspection/         New inspection and inspection details
  login.tsx           Login screen
  register.tsx        Registration and organization creation

src/
  components/ui/      Reusable interface components
  config/             API configuration
  database/           SQLite connection and Drizzle schema
  features/
    auth/             Authentication services and secure storage
    inspections/      Inspection hooks and synchronization service
  services/           Shared API client and asset URL resolution
```

## Important Files

- `src/config/api.ts`: backend URL configuration
- `src/services/apiClient.ts`: API requests, token refresh, photo upload
- `src/database/schema.ts`: SQLite tables and synchronization queue
- `src/features/inspections/services/inspectionService.ts`: local cache and remote synchronization
- `app/inspection/new.tsx`: photo capture and inspection submission
- `app/inspection/[id].tsx`: remote/local photo display and deletion

## Validation

```bash
npx expo lint
npx tsc --noEmit
```

Run both commands before submitting changes. Validate camera, location, remote photo download, token refresh, and organization isolation on real devices.
