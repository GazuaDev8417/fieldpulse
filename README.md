# FieldPulse

FieldPulse is an offline-first mobile app for recording and managing field inspections. It is designed for practical situations such as property maintenance teams documenting issues across multiple sites.

An inspector can create a record with a title and notes, capture GPS coordinates, and take a photo as evidence. Inspection records are stored locally in SQLite, so they remain available on the device without an internet connection.

## Features

- Create inspections with a required title and optional description
- Capture the device's current GPS coordinates
- Take and preview a photo as inspection evidence
- Browse inspections in chronological order and view their details
- Delete inspection records
- Store inspection data locally with SQLite
- Record create, update, and delete operations in a local queue as groundwork for future synchronization

## Tech Stack

- **Expo SDK 57** and **React Native**
- **Expo Router** for file-based navigation
- **SQLite** with **Drizzle ORM** for local persistence
- **TanStack Query** for managing inspection queries and mutations
- **React Hook Form** and **Zod** for form handling and validation
- **Expo Camera** and **Expo Location** for photo and GPS capture
- **TypeScript**

## Getting Started

### Requirements

- Node.js and npm
- Expo Go on a mobile device, or an emulator configured for Expo development

### Run the app

```bash
npm install
npx expo start
```

Use the Expo CLI menu or scan its QR code with Expo Go to open the app. Camera and location access require granting the corresponding permissions on the device.

## Project Structure

```text
app/
  (tabs)/              Main inspection list and tab navigation
  inspection/          New inspection form and inspection details
  _layout.tsx          Root initialization and app providers
src/
  components/ui/       Reusable buttons, cards, and inputs
  database/            SQLite connection, initialization, and schema
  features/
    inspections/       Inspection hooks and data service
    sync/              Local synchronization queue service
```

## Data and Synchronization

Inspection records and queued operations are stored in the app's local SQLite database. The queue records create, update, and delete actions for potential future delivery to a remote service.

**Remote synchronization is not implemented yet.** Queue entries are not currently sent to a server, and local records are not shared across devices. The app currently serves as a local inspection-recording prototype.

## Current Scope

FieldPulse provides basic inspection capture and local record management. It does not currently include user accounts, team collaboration, a backend, or a remote backup. Removing the app or clearing its app data may remove locally stored records and photo files.
