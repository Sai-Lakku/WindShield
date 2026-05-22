# WindShield Backend

## Run

```bash
npm run dev:backend
```

Copy environment values before running:

```bash
cp backend/.env.example backend/.env
```

## Structure

- `src/routes/v1`: API endpoints by feature domain
- `src/domain/*/repository.ts`: persistence layer backed by Supabase
- `src/domain/*/service.ts`: business logic layer (cards, goals, decisions, sms)
- `src/domain/shared/plan-engine.ts`: single source of truth for forward-plan math
- `src/domain/shared/impact-engine.ts`: shared impact comparisons for scenarios/windfalls/live edits
- `src/lib/supabase.ts`: service-role Supabase client (server only)
- `src/middleware/auth.ts`: Supabase JWT verification middleware

## Overlap rules baked into structure

- Life events + forward plan use one model (`plan-engine`)
- Live impact editor + windfall allocator share `impact-engine`
- Paycheck check-ins + proactive warnings create rows in `notifications` (in-app center)
- Card recommendations always read/write via the same plan context

## Supabase notes

- Backend requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Never expose service role key to frontend
- Frontend should use publishable key with RLS policies enabled
- Apply migrations in `backend/supabase/migrations`

## Ollama notes

- Statement categorization can use a local Ollama model
- Configure:
  - `OLLAMA_BASE_URL` (default `http://127.0.0.1:11434`)
  - `OLLAMA_MODEL` (default `llama3.1:8b`)
- Upload endpoint accepts `useLlm=true|false` (defaults to `true`)

## Hybrid AI

- Local via Ollama:
  - lightweight parsing/categorization
- Cloud via OpenAI:
  - financial reasoning and user-facing decision insights
- Wrapper:
  - `aiService.analyzeDecision()`
  - `aiService.extractCardDataFromStatement()`

## Auth model

- `Authorization: Bearer <supabase_access_token>` required on API routes
- `req.userId` is extracted from verified JWT `sub`
- `/api/v1/sms/webhooks/*` is exempt for provider callbacks
