# Ketu Telegram Mini App (Frontend)

Next.js frontend for Ketu Telegram Mini App.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- `@telegram-apps/sdk-react`

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_USE_MOCK_API=false
```

Important:

- `NEXT_PUBLIC_API_URL` must point to a public backend URL reachable from Telegram WebView.
- `localhost` does not work for real Telegram users (their device cannot access your local machine).

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run start
```

## Frontend Architecture

The app is split into modules:

- `app/modules/auth/*`:
  - Telegram `initData` normalization
  - call to `POST /auth/telegram`
  - access/refresh token storage and rotation
- `app/modules/user/*`:
  - `GET /user/profile`
  - `PUT /user/settings`
- `app/modules/places/*`:
  - `GET /places` with category/search filters
  - `GET /places/:id` for full place details
  - receives optimized preview image URLs for list and full image URLs for detail
- `app/components/providers/*`:
  - Telegram SDK bootstrap
  - app context with authenticated user and tokens
- `app/shared` is represented by cross-cutting utilities in `app/utils/*` and shared types in `app/types/*`.

Current auth-related structure:

```text
app/
  modules/
    auth/
      services/auth-client.service.ts
      types/auth.types.ts
      utils/init-data.util.ts
    user/
      services/user-client.service.ts
      types/user.types.ts
    places/
      services/places-client.service.ts
      types/place.types.ts
  components/providers/
    telegram-bootstrap.tsx
    telegram-context.tsx
    telegram-provider.tsx
  types/telegram.ts
  utils/debug.ts
```

## Auth Flow

1. `telegram-bootstrap` resolves `initDataRaw` from Telegram WebApp / SDK.
2. `authClient.validateAuth()` sends `Authorization: tma <initDataRaw>` to backend.
3. Backend validates `initData`, issues `accessToken + refreshToken`.
4. Frontend stores tokens in `localStorage` and keeps access token in memory.
5. Protected user requests go through `userClient` and auto-refresh on `401`.

## Places Flow

1. Home/saved screens request `GET /places` and render `previewImageUrl`.
2. Place detail screen requests `GET /places/:id` and uses `fullImageUrl` for high-quality images.
3. Image URLs are served by backend proxy endpoints that read objects from MinIO.
