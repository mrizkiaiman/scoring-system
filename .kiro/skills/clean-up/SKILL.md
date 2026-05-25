---
name: clean-up
description: Automated code cleanup for TypeScript/React files. Removes all comments, audits useEffect usage against React best practices, checks for TypeScript errors, and enforces security rules. Use when user says "clean up", "clean this", "cleanup", or wants to remove comments, fix useEffect, or run a code hygiene pass on .ts/.tsx files.
---

# Clean Up

Run a structured cleanup pass on the target file(s). Execute each step in order.

## Quick start

User provides a file or folder. Run all 4 steps below on every `.ts` and `.tsx` file in scope.

## Workflow

### Step 1: Remove all comments

- Delete all single-line comments (`// ...`)
- Delete all multi-line comments (`/* ... */`)
- Delete all JSDoc comments (`/** ... */`)
- Preserve any `@ts-expect-error` or `@ts-ignore` directives (flag them to the user instead of removing)
- Do NOT remove code that is commented out — remove it too (dead code)

### Step 2: Audit useEffect

For each `useEffect` in the file, check against these rules (ref: https://react.dev/learn/you-might-not-need-an-effect):

**Remove the useEffect if it:**

- Computes derived state (replace with `useMemo` or inline computation)
- Resets state when a prop changes (use a `key` on the component instead)
- Fetches data (should use TanStack Query `useQuery`)
- Sends analytics on mount (move to event handler or keep only if truly fire-once)
- Syncs two pieces of state (compute during render)

**Keep the useEffect if it:**

- Subscribes to an external store (e.g., `supabase.auth.onAuthStateChange`)
- Sets up/tears down event listeners not tied to user actions
- Integrates with third-party imperative APIs

**If unsure:** Flag it to the user with the reason and ask whether to keep or remove.

### Step 3: TypeScript check

- Run `npx tsc --noEmit` after all changes
- Fix any errors introduced by the cleanup
- Ensure no `any` types were left behind
- Ensure no unused imports remain

### Step 4: Security rules

- Verify no secrets or env values are hardcoded
- Verify no `.env` files are being read/modified
- Verify no `console.log` statements leak sensitive data
- Remove any `console.log` / `console.warn` / `console.error` that are debug leftovers (keep intentional error logging in catch blocks)

## Output

After completing all steps, report:

- Number of comments removed
- useEffect instances: kept (with reason) / removed (with what replaced them)
- TypeScript errors found and fixed
- Security issues found and fixed
