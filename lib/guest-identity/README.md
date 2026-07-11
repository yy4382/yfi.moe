# @repo/guest-identity

Framework-neutral ownership policy for resources created before sign-in.

```ts
import { createGuestIdentityBackend } from "@repo/guest-identity/backend";
import { createGuestIdentityFrontend } from "@repo/guest-identity/frontend";
```

The backend resolver accepts only trusted session/cookie input and returns:

- `creationOwner` for a new resource;
- `ownedByViewer` for queries and authorization;
- `publicOwners` safe to expose to a client;
- declarative response effects for an HTTP adapter to commit after a successful write.

The frontend state machine synchronizes explicit identity response headers before public owner data enters the UI cache. Persisted projection state is never a backend credential.

The full data flow, trust model, first-request behavior, sign-in transition, state-loss recovery, and feature recipes are documented in [`docs/guest-identity.md`](../../docs/guest-identity.md).
