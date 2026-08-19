# Repository and deployment boundaries

## Version branches

- `MM-Hosting` is the only repository used for release/version branches such as `5.30` and `5.31`.
- Create, switch, rename, delete, commit, and push release branches only in `MM-Hosting`, unless the user explicitly requests otherwise.
- Before any branch operation, verify that the working directory is `/Users/rickmac/Documents/VS-Code/MM-Hosting`.

## Makkie-Backend

- `/Users/rickmac/Documents/VS-Code/Makkie-Backend` is only a local static backup/mirror of the backend and admin files deployed to the SSH server.
- Keep `Makkie-Backend` on `main`. Do not create release branches or release commits in that repository unless the user explicitly requests it.
- Backend/admin changes may remain as uncommitted local backup changes after they are deployed through SSH.

## Deployment

- Deploy backend and admin changes to the production server through SSH, following the deployment and backup checks in the backend repository's own `AGENTS.md`.
- The customer-facing `MM-Hosting` site is managed from this repository. Do not assume that an SSH backend deployment publishes frontend changes.
