# SpeeUP UI Component Specifications

## Loaders

### 1. Initial Loader (`InitialLoader.tsx`)
The `InitialLoader` is the first component rendered in `main.tsx`. Its purpose is to prevent visual flashing during the initial React mount and brand assets loading.

**Behavior:**
- **Mount Point:** Renders at the root level in `main.tsx`, outside the main `App` component.
- **Timing:**
  - **Minimum Duration:** 1000ms (1 second). Even if the page loads instantly, the loader stays for 1s to ensure a smooth brand presentation.
  - **Maximum Duration (Fallback):** 2000ms (2 seconds). If the window `load` event hasn't fired by this time, the loader will force itself to hide to avoid blocking the user.
  - **Fade Duration:** 300ms smooth opacity transition.
- **Trigger:** Disappears when `window.onload` fires, or when the 2-second fallback is reached.

### 2. Global Route Loader (`useRouteLoader.ts` & `IconLoader.tsx`)
Used for transitions between different routes within the application.

**Behavior:**
- **Initial Mount:** Skips the loader on the very first page load (since `InitialLoader` is already active).
- **Transitions:** Triggers on every `location.pathname` change.
- **Minimum Duration:** 1000ms (enforced by `LoadingContext`).

### 3. API Request Loader (`AxiosLoadingInterceptor.tsx`)
Automatically shows the `IconLoader` during background API requests.

**Behavior:**
- **Inclusion:** Triggers for all requests made via the standard `api` axios instance.
- **Exclusion:** Specific requests can skip the loader by passing `skipLoader: true` in the request config (e.g., background preloading tasks).
- **Concurrency:** Uses a counter (`activeRequests`) to ensure the loader only hides when ALL concurrent requests have finished.
- **Timing:** Enforces a 1000ms minimum display time to prevent "flickering" for very fast API responses.

---

## Performance Notes
- **Preloading:** Background preloading (like in `Home.tsx`) must always use `skipLoader: true` to avoid interrupting the user experience with unexpected loaders.
- **Singleton Pattern:** `InitialLoader` is designed to run once per full page refresh.
