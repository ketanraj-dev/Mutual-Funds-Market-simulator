# Optional multi-device installation

This is an implementation design, not a running backend. The local event works independently of it.

## API

Use an HTTPS service and a transactional SQL database. Store money in integer paise (BIGINT), an immutable versioned scenario, event IDs and game IDs. Scope all reads and writes to an event and scenario. Authenticate host controls on the server using a real admin account; never send the client PIN hash as authorization.

- `POST /events`: admin creates an event with seed, engine version, approved CTA and settings. Lock the scenario after the first participant starts.
- `POST /events/:id/games`: accepts a validated display name (1–32 characters), creates a game with ₹10,000,000 paise and returns an opaque player token plus Day 1 quotes and history. Rate-limit new games.
- `POST /games/:id/orders`: accepts side, symbol, positive integer quantity, expected revision and idempotency key. In one transaction, verify token, game status, cash and holdings, execute at the server-held quote, and return canonical state. Duplicate keys return the original response; stale revisions return 409.
- `POST /games/:id/advance`: increment the current day exactly once, revealing only that day's prices and news. Reject after day 5 and require the expected revision.
- `POST /games/:id/finish`: only accept on Day 5. Calculate cash plus holdings on the server and persist an immutable result atomically. Duplicate requests return the same result.
- `GET /events/:id/leaderboard?scenarioId=...`: return completed games ordered by final value DESC, cash DESC, completion timestamp ASC, ID ASC. Never accept client-reported final values.
- `GET /events/:id/stream`: Server-Sent Events to refresh separate TV displays after committed finishes. Polling every 10 seconds is a simple fallback.
- `POST /events/:id/scenarios`: admin selects a new event scenario only when no games remain active. Keep archived boards separately.
- `DELETE /events/:id/leaderboard/:scenarioId`: admin-only, audited, deliberate reset; retain a backup/audit record according to the event's privacy policy.

## Server model

`events(id, active_scenario_id, settings, status)`; `scenarios(id, engine_version, seed, locked_prices, locked_news)`; `games(id, event_id, scenario_id, name, token_hash, day, cash_paise, revision, completed_at)`; `positions(game_id, symbol, quantity, cost_paise)`; `orders(id, game_id, idempotency_key, day, symbol, side, quantity, price_paise)`; `results(game_id UNIQUE, scenario_id, final_value_paise, cash_paise, completed_at)`.

Generate and lock the complete path on the server. Send only revealed history to clients. For prize-bearing events, hide seeds and future paths until the tournament closes. Validate authorization, integers, bounds, revisions, game transitions and idempotency on every write. Use prepared SQL statements and transactions; render participant names as text.

## Frontend integration

Replace the current `load`/`save` boundary and pure local transitions with asynchronous game API calls, retaining the pure engine for server execution and tests. Render the server's canonical state. The server must be authoritative; merely POSTing a local final score permits tampering. Keep a separate offline practice mode. Do not queue prize-bearing offline orders because the server cannot fairly reconcile decisions after later quotes are revealed. Show a connection interruption and let the host resume the same server game when connectivity returns.

Host a separate public read-only display token for the TV, never an admin or player token. Shared tournament mode needs connectivity; the browser-local mode remains the fallback when the venue has none.
