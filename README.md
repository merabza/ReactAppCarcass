# ReactAppCarcass
Common part for React Application

The shared React part of the Carcass applications (app.errata.ge, app.ganmarteba.ge, app.grammar.ge and others).
Each frontend clones this repository into its `src/appcarcass` folder, which the frontend repository ignores. It
imports these host files at fixed paths: `src/redux/store.ts` (`RootState`, `AppDispatch`), `src/AppParameters.ts`,
`src/TopNavMenu.tsx` and `src/Layout_Parameters.css`. Its tests (Vitest + React Testing Library) run with the host's
suite (`npm test`); some of them use the host's `src/testUtils/testStore.ts`.

## Authentication modes

`VITE_AUTH_MODE` selects how users sign in. Vite builds the value into the bundle, so a change needs a new build.

| | `local` (default) | `sso` |
|---|---|---|
| Sign-in | the app's own pages `/login`, `/registration`, `/confirm-email`, `/change-required-password`, `/forgot-password`, `/reset-password` against `api/v1/authentication/*` | sso.ltg.ge through the host's backend for frontend (BFF) |
| The browser keeps | the access and refresh token in localStorage (`user`, `pendingLogin`) | only the host's HttpOnly session cookie |
| API requests | `Authorization: Bearer` | the cookie and the header `X-CSRF: 1` |
| Host | BackendCarcass `Authentication:Mode = Local` | BackendCarcass `Authentication:Mode = Sso` (its README, "SSO mode") |

The Local mode works exactly as before. The Sso mode (merabza/SsoLtgGe#7, design `docs/sso-design.md` D17 in
merabza/SsoLtgGe) is implemented in `common/authMode.ts` and the components named below:

- `PrivateApp` (`SsoPrivateApp`) reads the user from `GET /bff/user` at every page load. Without a session the browser
  goes to `/bff/login?returnUrl=<current path>` and returns to that page after the sign-in; only a local path is
  sent, otherwise `/`. Any other error shows a message with a retry button instead of redirecting, so a broken host
  cannot cause a redirect loop.
- `jwtBaseQuery` sends no `Authorization`, uses `credentials: 'same-origin'` and adds `X-CSRF: 1`; a 401 sends the
  browser to `/bff/login`. There is no token refresh: the host refreshes its tokens itself.
- `userSlice` keeps the user (`setSsoUser`) and the sign-out form token in memory only and writes nothing to
  localStorage; at start it removes the Local mode's `user` and `pendingLogin`, which held tokens.
- The public routes stay in `App.tsx`; in the Sso mode their pages redirect themselves (`SsoRedirect`): `/login` to
  `/bff/login?returnUrl=/`, the other five to the sso page of the same name under `VITE_SSO_URL`
  (`account/register`, `account/confirm-email`, `account/change-required-password`, `account/forgot-password`,
  `account/reset-password`).
- `/profile` (`SsoProfile`) shows the user's data and a link to `<VITE_SSO_URL>account/profile`, where the names,
  the UserName, the e-mail and the password are changed and the account is deactivated; the app receives the changes
  at the next sign-in. The top bar of `/profile` has no password or delete buttons, because the host does not map
  those endpoints in the Sso mode.
- The menu item „გასასვლელი“ posts a form to `/bff/logout` with the antiforgery token of `/bff/user`. The host ends
  the app session and sends the browser to sso's end-session, which signs the user out of the other apps as well.

### Connecting an app

1. Switch the host to the Sso mode: BackendCarcass README, "SSO mode" (`Authentication` settings, the client
   secret in user secrets, `Users.SsoSubject` in the database, the client on sso).
2. Environment of the frontend (`.env.development`, `.env.production`). The API address is relative, because the SPA
   and the API share one origin:

   ```
   VITE_AUTH_MODE=sso
   VITE_SSO_URL=http://localhost:5090/
   VITE_REACT_APP_API_URI=/api/v1
   ```

   In production `VITE_SSO_URL=https://sso.ltg.ge/`. `VITE_REACT_APP_API_URI` is the API address that the host's
   `src/AppParameters.ts` passes as `baseUrl`.
3. Development server (`vite.config.ts`): Vite forwards everything the host answers to the host, so that the browser
   sees one origin. In production the host serves the SPA itself and no proxy is needed. Example for app.errata.ge
   (API 5062, Vite 5174):

   ```ts
   const toHost = { target: "http://localhost:5062", changeOrigin: false };

   export default defineConfig({
     plugins: [react()],
     server: {
       // the port of the redirect URI that sso knows for this client (http://localhost:5174/signin-oidc)
       port: 5174,
       proxy: {
         "/api": { ...toHost, ws: true }, // ws: SignalR hubs under /api
         "/bff": toHost,
         "/signin-oidc": toHost,
         "/signout-callback-oidc": toHost,
       },
     },
   });
   ```

   Use the object form with `changeOrigin: false` for every path. The host must see the Vite address
   (`localhost:5174`) to build the redirect URI registered on sso and to accept the `Origin` of a WebSocket, but the
   string form (`"/bff": "http://localhost:5062"`) turns `changeOrigin` on: the host then sends its own port in the
   redirect URI, and sso refuses the sign-in with 400.
4. `App.tsx` and `src/redux/store.ts` need no change: the six public routes keep their pages, which redirect
   themselves in the Sso mode, and `/bff/user` is an endpoint of `userRightsApi`, which the store already registers.
5. SignalR: the hub authenticates by the cookie. Give the client the CSRF header instead of the token; the browser
   cannot add headers to a WebSocket handshake, so the host checks its `Origin` instead:

   ```ts
   import { csrfHeaderName, csrfHeaderValue, isSsoMode } from "../appcarcass/common/authMode";

   const options: IHttpConnectionOptions = isSsoMode()
       ? { headers: { [csrfHeaderName]: csrfHeaderValue } }
       : { accessTokenFactory: () => user.token };
   const connection = new HubConnectionBuilder().withUrl(hubUrl, options).build();
   ```

   `hubUrl` must be on the same origin (e.g. `/api/v1/...`), so that the cookie goes with it.

### Tests

The Sso tests switch the mode with `vi.stubEnv("VITE_AUTH_MODE", "sso")` (and `VITE_SSO_URL`) and replace
`browserNavigation.replace` of `common/authMode.ts` with a spy, because jsdom cannot navigate.
