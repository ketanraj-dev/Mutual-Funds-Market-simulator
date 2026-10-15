# Ten-fund edition verification — 15 October 2026

- All 28 automated tests pass. They check the five groups of two funds, the exact requested fund types, seeded daily NAVs, buy/sell accounting, and preservation of the previous edition's game and host settings.
- The TypeScript/Vite production build passes. The generated offline shell includes the new interface.
- Local browser preview shows ten funds in Explore Funds, their group labels, the five previous-day NAV points, and Buy/Sell controls. The longer fund names remain readable in the horizontally scrolling table.
- The new edition uses `fincelerate-mutual-funds-v3`. The earlier eight-fund browser data stays at its original key; host settings carry forward, and old rankings stay separate.

## Eight-fund edition verification (historical)

- All 26 automated tests pass, including five locked daily NAVs per fund, portfolio accounting, redemption limits, scenario isolation, persistence and preservation of legacy equity data.
- Browser verification: invested in 100 Durga Flexi Cap Fund units at ₹50 NAV. My holdings opened with ₹5,000 invested. On Day 2 the NAV became ₹49.79 and current value ₹4,979. Redeeming 40 units left 60 units, ₹3,000 invested cost and ₹2,987.40 current value. The holdings table reconciled exactly.
- Mutual funds have one daily NAV point; chart tooltips and controls use NAV, units, Invest and Redeem terminology. The simplified game uses whole units and immediate execution at displayed NAV; applicable NAV/settlement differences are stated in the app.
- The previous portfolio section was reused and expanded, rather than duplicating it. Holdings also have a shortcut in the order panel and a fund count.
- Old equity browser data is preserved under its original storage key. Host settings are carried forward; mutual fund rounds and rankings start separately.

## Original equity edition verification (historical)

Verification — 14 October 2026

- 22 automated tests passed: seeded generation, all 800 points, volatility, frozen scenarios, revealed history, integer-paise buy/sell validation, partial cost basis, P/L reconciliation, day progression, final scoring, leaderboard ties/scenario isolation, recovery, stale writes, save failures, CTA URL validation and PIN hashing.
- Production TypeScript/Vite build passed. The output is a static offline-capable app. Vite reports an advisory about the chart/animation bundle size (~247 kB gzipped); it does not prevent the build or offline play.
- Dependency installation after updating Vitest reported zero vulnerabilities.
- Browser flow: registration at ₹1,00,000; buy 10 DURGA at ₹264.05 (cash ₹97,359.50); reject an unaffordable purchase; reject selling 999999 shares; sell 4 (cash ₹98,415.70); advance and refresh on Day 2; switch the chart to KALI; advance through Day 5; finish with ₹1,00,348.18 including six DURGA shares; refresh results; inspect #1 leaderboard entry; start a second visitor with unchanged tournament prices and retained first result.
- Tested a 1440 × 810 desktop viewport and a 390 × 844 narrow viewport. Narrow layout had no page-level horizontal overflow; the market table scrolls independently.
- Stopped the production preview server, reloaded the app from its service-worker cache and executed another buy successfully. Offline reload and trading both worked.
- No browser console errors were observed in the tested gameplay flow.
- Admin PIN setup, approved CTA destination, QR appearance and fullscreen/audio behaviour should also be checked by the event host on the actual stall device. No real company URL or event credential has been invented.
- Shared multi-device rankings are an optional documented backend design, not part of this browser-local deployment.
