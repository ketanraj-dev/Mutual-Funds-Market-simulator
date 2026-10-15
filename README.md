# FINCELERATE — Mutual Fund Mahotsav

A complete browser-local React + TypeScript festival mutual fund game. Five simulated days, ten fictional mutual funds, ₹1,00,000 virtual starting capital. Uses Tailwind CSS, Recharts and Framer Motion. No account, live NAV API or real-money trading.

## Run

Requires Node.js 22+ and npm.

```sh
npm install
npm run dev
```

Open the printed localhost URL. For the event, use the production build:

```sh
npm run build
npm run preview -- --host 0.0.0.0
```

Open localhost on the stall laptop. `npm test` runs the simulation and persistence checks. `npm run build` type-checks and packages the app. Keep the local server running for the stall; a production web server can serve `dist/` with no backend.

## Before opening the stall

1. Open Event controls (the sliders icon at the top right) and set a private 6–12 digit event PIN. There is no hard-coded default PIN. Complete setup before visitors use the laptop.
2. Leave Tournament Mode on for comparable results. Choose a seed once for the event. Every participant using that seed and this app version gets the same daily NAVs and fund updates. Changing the seed creates a separate leaderboard; old results remain in storage.
3. Optionally enter the company's approved http(s) website or landing page and enable its QR code. No URL is invented. The “Explore Fincelerate” link and QR only appear once a destination is configured.
4. Run a full practice round, verify sound/fullscreen on the actual display, and test offline reload before opening. Sound starts muted.
5. Use the leaderboard's TV display mode. A second window at `/#leaderboard` in the SAME browser profile updates through storage events. Drag that window to an attached TV. A different device or browser does not share local storage.
6. Use “New player” after results. Do not clear browser data between visitors. Export an event backup from PIN-protected controls periodically.

## Gameplay

Enter a name. Buy or sell positive whole fund units at the displayed simulated daily NAV. Charts show five fictional prior-day NAVs from the start; the five game days reveal one at a time. This is a simplified game: real fund transactions use applicable NAV rules and settlement timelines, and may allow fractional units. Advance each day manually. Day 5 permits final buys and sells. Finish confirms the value of cash plus unliquidated holdings, saves the result and shows a celebratory learning insight. No fees, taxes, dividends, leverage, borrowing or short sales are modeled.

The “My holdings” tab opens after each buy or sell. It lists fund name/category, units owned, average purchase NAV, current NAV, invested amount for remaining units, current value, gain/loss and a Sell action. The order panel also has a “View my holdings” shortcut. Activity records every executed order. Partial sales allocate cost basis with integer rounding; the final sale consumes the exact remaining cost. Realized + unrealized P/L reconciles exactly to total return.

## Fairness and persistence

- Market engine version `mutual-fund-v3`: seeded PRNG, per-fund volatility/drift, market sentiment, consolidation regimes, bounded log returns, random jumps and generated fund portfolio news shocks. NAVs remain positive. Each fund has exactly five daily NAV observations, with Day 1 equal to its initial NAV. The lineup has two funds each in Debt (Short Duration and Liquid), Conservative Hybrid (Equity Savings and Conservative Hybrid), Aggressive Hybrid (Multi Asset and Aggressive Hybrid), Equity (Multi Cap and Flexi Cap), and Special (Innovation Thematic and Dynamic Asset Allocator Fund of Funds). These are game groups with illustrative risk levels.
- All paths and news are generated before the first trade and deeply frozen. Trading cannot change the scenario. Recovery recreates the exact path from the saved seed and engine version. Don't change this algorithm during a tournament; introduce a new version if changing it later.
- Rankings isolate scenario IDs, order by final portfolio value, then cash, then earlier completion. An exact three-way tie uses game ID for deterministic display. Practice scenarios use unique seeds and never enter the tournament board.
- One atomic local-storage document stores settings, active/completed game, results and a revision. A failed save rejects the action visibly; stale-tab writes are rejected. Refresh resumes the current game. Navigation prompts protect an active round; moving between in-app views is safe.
- Local data key: `fincelerate-mutual-funds-v3`. The eight-fund edition at `fincelerate-mutual-funds-v2` and old equity data at `fincelerate-v1` remain untouched. Event settings are carried forward from the latest available edition, while rounds and rankings start fresh to avoid relabelling old fund positions. The event host can export the earlier eight-fund backup from PIN-protected controls. Corrupt data is left intact with a recovery download instead of silent deletion. Backups are JSON; automated import is intentionally not exposed to visitors. Restore a reviewed backup through developer tools with the event closed, then reload.
- The PIN is salted and SHA-256 hashed, with a brief lockout after five incorrect attempts. This protects against casual visitors only. Browser owners can inspect or edit client data, NAVs and rankings. Do not use this client-only implementation for cash prizes or adversarial competition.

## Offline operation

The production build precaches all generated JS/CSS and its HTML shell with a versioned service worker. No fonts, chart data or artwork need a CDN. Service workers require localhost or HTTPS. Wait for the initial worker install to finish, then test a reload with the network disabled. Already-open gameplay works offline even without a worker. External CTA destinations naturally require internet. On an ordinary LAN HTTP address, keep the preview server reachable because offline service-worker installation is unavailable.

## Optional shared backend

The shipped application uses a single-browser board. A concrete optional multi-device API and server-authoritative validation design is in [docs/shared-leaderboard.md](docs/shared-leaderboard.md). No remote endpoint or synchronization is implied by the current UI.

## Accessibility and display

Responsive layout, native focus-trapped dialogs, keyboard-operable controls, labelled inputs, screen-reader order feedback, reduced-motion CSS, touch-compatible charts and fullscreen controls. The fund table scrolls horizontally on narrow screens. Large order controls support a touchscreen. All data is fictional; the educational disclaimer remains visible on each screen.

Daily NAV concept: [AMFI — Net Asset Value](https://www.amfiindia.com/investor/knowledge-center-info?zoneName=NetAssetValueNAV). The game deliberately simplifies units, applicable NAV, transaction costs and settlement.
