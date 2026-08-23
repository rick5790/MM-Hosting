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

# Frontend regressions: standing defences

These rules exist because the same class of bug has now happened four times in
`index.html`: something invisible in a desktop Chrome check was dropped, and it
was only caught weeks later by the user on a real phone.

## Load-bearing code

- Some CSS/JS here works around browser bugs and *looks like dead code*. Such
  blocks are marked `承重 · 勿删` with the reason and the commit history. Never
  delete, "clean up", or fold away a marked block. If a change genuinely
  requires touching one, say so in the commit message.
- Before rewriting a single-line CSS rule that packs many declarations, compare
  the declaration list property by property, or split the rule across lines in
  the same commit. A one-line rule shows up in `git diff` as one `-` and one
  `+`; a dropped declaration inside it is invisible. That is exactly how
  `c00e047` lost the `mask-image` corner-clip hack.
- Run `sh scripts/check-invariants.sh` before committing frontend changes.
  `sh scripts/install-hooks.sh` wires it into `pre-commit`. Add a check there
  whenever you fix a bug that leaves no error behind **and** does not reproduce
  in desktop Chrome.

## Never remove a feature as a side effect

- Do not disable or delete anything the user can see — an animation, an effect,
  a layout element — as a side effect of a performance, compatibility, or
  responsive fix. Ask first. Removing a feature is the user's call, not a free
  optimisation.
- Making an effect cheaper means: lower the render resolution, pause it
  off-screen, cut the frame rate. It does not mean `display:none` at one
  breakpoint. `ee2b164` killed the shop cards' silk background on phones this
  way and nobody noticed for weeks.
- If a commit removes or disables anything, the message must name it.

## Commit messages

- Never `update`, `fix`, `polish`, or any other subject that does not say what
  changed. Subject line: what changed, and where.
- Removals get their own line in the body: what went away and why.

## Verification blind spots

Desktop Chrome passing is not a pass. Every regression in this list hid in one
of these:

- **Real-GPU compositing** — rounded-corner clipping of a composited canvas or
  video layer. Headless Chrome renders WebGL through SwiftShader and clips
  correctly, so it cannot reproduce this.
- **WebKit** — desktop Safari and *every* iOS browser. It drops the alpha
  channel of WebM video (the mascot's yellow disc) and only supports
  transparent video as HEVC-with-alpha in MP4/MOV.
- **WeChat's in-app browser** — mostly refuses inline video autoplay.
- **Narrow breakpoints** and **`prefers-reduced-motion`** — rules there are
  never exercised by a normal desktop check.

State plainly which of these you could not verify, and ask the user to check on
the device. Do not report a fix as confirmed on the strength of a headless
screenshot alone.
