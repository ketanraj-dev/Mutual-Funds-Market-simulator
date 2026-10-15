# Fincelerate Mutual Fund Mahotsav — current specification

Updated: 15 October 2026

This is the latest product specification for the Fincelerate simulator. It replaces the original equity-based concept and the earlier eight-fund mutual fund edition. All funds, NAVs, news, and trades are fictional and for education and event entertainment only.

## Purpose and audience

Build a responsive, touchscreen-friendly mutual fund game for visitors at a Fincelerate event. A round should take roughly 3–5 minutes. The player should be able to inspect recent NAV movement, choose funds, buy or sell simulated units, see their holdings, and learn how their decisions affected their final portfolio value. No account, real money, live market feed, or investment recommendation is involved.

## Game rules

- A player enters a display name of 1–32 characters and receives ₹1,00,000 in virtual cash.
- A round lasts five simulated days, with one NAV per fund per day. The player advances days manually.
- Players buy or sell positive whole fund units at the displayed daily NAV. Orders execute immediately in the game. A buy requires sufficient cash; a sell requires sufficient holdings.
- Day 5 still permits trades. Finishing locks the round and scores cash plus the current value of unsold units. A player need not sell everything before finishing.
- Show available cash, holdings value, total portfolio value, total return, realized profit/loss, and unrealized profit/loss. Record each trade in Activity. Allocate cost basis proportionally on partial sales; clear the remaining cost on the final sale.
- Do not model fees, taxes, dividends, borrowing, leverage, short sales, real-fund transaction cutoffs, settlement delays, or fractional units. Explain that these simplifications differ from real mutual funds.
- Tournament mode gives every player using the same seed and engine version the same NAV and news path. Practice mode uses a unique seed and does not enter the tournament leaderboard.

## Exact ten-fund lineup

The five category names below are game groups. The risk labels are illustrative, not ratings of real products.

| Group | Fictional fund | Fund type | Starting NAV | Illustrative risk |
| --- | --- | --- | ---: | --- |
| Debt | Lakshmi Short Duration Fund | Short Duration Debt | ₹25 | Low |
| Debt | Annapurna Liquid Fund | Liquid Debt | ₹10 | Low |
| Conservative Hybrid | Saraswati Equity Savings Fund | Equity Savings | ₹30 | Medium |
| Conservative Hybrid | Parvati Conservative Hybrid Fund | Conservative Hybrid | ₹20 | Medium |
| Aggressive Hybrid | Shakti Multi Asset Fund | Multi Asset | ₹40 | High |
| Aggressive Hybrid | Mahishasura Aggressive Hybrid Fund | Aggressive Hybrid | ₹30 | High |
| Equity | Kali Multi Cap Fund | Multi Cap Equity | ₹35 | Very High |
| Equity | Durga Flexi Cap Fund | Flexi Cap Equity | ₹50 | High |
| Special | Pragati Innovation Thematic Fund | Innovation Thematic | ₹60 | Very High |
| Special | Niyati Dynamic Asset Allocator Fund of Funds | Dynamic Asset Allocator Fund of Funds | ₹45 | Medium |

## Player-facing experience

- Use the user-supplied Fincelerate full logo and icon. The visual direction is premium fintech with restrained Durga Puja accents: navy, ivory, gold, and clear green/red gain-and-loss cues.
- The welcome screen starts a round with a name. The active game shows the current day, portfolio summary, fund updates, a selectable NAV chart, a Buy/Sell order panel, Explore Funds, My holdings, and Activity.
- Each fund chart shows five fictional previous-day NAV observations from the start of the game, followed by only the game days revealed so far. Provide interactive values/tooltips so a player can inspect the prior trend before deciding what to do. Future game-day NAVs and news must remain hidden.
- The Explore Funds table shows Fund, Type, NAV, Previous Day Change on Day 1 or Day Change afterward, Risk, and Buy/Sell actions. It must have **no Trend column**. Action names must be **Buy** and **Sell**, not Invest and Redeem.
- My holdings shows each owned fund's category, units, average purchase NAV, current NAV, invested amount for remaining units, current value, gain/loss, and a Sell action. Make it easy to reach from the trading panel; open it after an executed order.
- Activity lists executed orders. Results show the final value, return, a brief educational insight, and a celebratory treatment. Provide a ranked leaderboard and a separate TV display mode.
- Provide help, keyboard-operable controls, responsive layouts, reduced-motion handling, a sound toggle that starts muted, and fullscreen controls. Keep the fictional-data disclaimer visible.
- After results, an optional “Explore Fincelerate” link and QR code appear only if the event host has configured an approved HTTP(S) destination. Do not invent a company URL or contact details.

## Simulation and ranking

- Generate the entire five-day scenario before the first trade from a deterministic seed, then treat it as immutable. Trading must never affect future NAVs or news. Version the generation algorithm; the current engine version is `mutual-fund-v3`.
- Funds have different baseline volatility and drift. The generator includes common market sentiment, quiet periods, bounded daily returns, occasional jumps, and fictional fund-news shocks. NAVs must remain positive. Daily fund updates should correspond to their simulated effects.
- A scenario is identified by engine version plus seed. Players on the same tournament scenario see the same data. A changed seed or algorithm version creates a separate leaderboard. Do not move old results into a new scenario.
- Rank completed tournament games by final portfolio value descending, then cash descending, then earlier completion time, then game ID for stable ties. Practice rounds never enter the tournament board.
- The simulator must use integer paise internally for money and validate all order quantities and state transitions.

## Event controls and persistence in the current version

- An event host can configure a 6–12 digit PIN, tournament seed, optional approved destination URL/QR, and export an event backup. A deliberate leaderboard reset requires typing `RESET` and is unavailable while a game is active.
- The current implementation is browser-local. Settings, the active game, and results are stored in a revisioned `localStorage` document. Refresh resumes an active round. Stale writes from another tab are rejected. Corrupt saved data is preserved for recovery rather than silently deleted.
- The current storage key is `fincelerate-mutual-funds-v3`. Earlier eight-fund (`fincelerate-mutual-funds-v2`) and equity (`fincelerate-v1`) data remain untouched. Host settings may carry forward, but games and results start fresh because fund identities changed. The host can export the earlier eight-fund backup.
- The TV leaderboard can update from another window in the same browser profile. Different devices or browser profiles do **not** share a leaderboard.
- The PIN uses client-side salted hashing and a temporary lockout. It deters casual visitors, but it is **not secure administrator authentication**. Browser owners can inspect or modify client state and scores. The current app should not be used for prize-bearing or adversarial competition without a server-authoritative design.
- The production static site caches its shell and assets for offline use after the first successful load. No live market API or backend is present. An external destination link naturally requires connectivity.

## Current technical implementation

React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Recharts 3, and Framer Motion 12. The site builds to static files and can be served without a backend. The core logic is in `src/engine.ts`, browser persistence in `src/storage.ts`, event controls in `src/Admin.tsx`, and the main interface in `src/App.tsx`. The current build has passed its simulation/persistence tests and production build. The existing `docs/shared-leaderboard.md` is an optional backend design document, not an implemented service.
