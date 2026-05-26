# Contributing

Thank you for your interest in Lighthouse Attention Lab.

## Getting started

1. Fork the repository and clone your fork.
2. Set up the backend and frontend as described in [README.md](README.md).
3. Create a branch for your change: `git checkout -b your-feature-name`.

## Backend changes

```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
pytest
```

All backend logic lives in `backend/app/`. Tests live in `backend/tests/`. Add a test for any new behavior.

## Frontend changes

```bash
cd frontend
npm install
npm run build   # type-check + production build
npm run dev     # development server
```

## Pull request checklist

- [ ] `pytest` passes with no errors.
- [ ] `npm run build` completes with no TypeScript errors.
- [ ] New behavior is covered by at least one test.
- [ ] The README is updated if setup steps or API endpoints change.

## Code style

- Python: standard library `typing` and `dataclasses`, no additional linters required.
- TypeScript: strict mode is on; avoid `any`.
- No external AI model downloads — the project must stay self-contained and dependency-free at runtime.
