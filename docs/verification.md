# Verification — 14 October 2026

- 22 automated tests passed: seeded generation, all 800 points, volatility, frozen scenarios, revealed history, integer-paise buy/sell validation, partial cost basis, P/L reconciliation, day progression, final scoring, leaderboard ties/scenario isolation, recovery, stale writes, save failures, CTA URL validation and PIN hashing.
- Production TypeScript/Vite build passed. The output is a static offline-capable app. Vite reports an advisory about the chart/animation bundle size (~247 kB gzipped); it does not prevent the build or offline play.
- Dependency installation after updating Vitest reported zero vulnerabilities.
- Browser flow: registration at ₹1,00,000; buy 10 DURGA at ₹264.05 (cash ₹97,359.50); reject an unaffordable purchase; reject selling 999999 shares; sell 4 (cash ₹98,415.70); advance and refresh on Day 2; switch the chart to KALI; advance through Day 5; finish with ₹1,00,348.18 including six DURGA shares; refresh results; inspect #1 leaderboard entry; start a second visitor with unchanged tournament prices and retained first result.
- Tested a 1440 × 810 desktop viewport and a 390 × 844 narrow viewport. Narrow layout had no page-level horizontal overflow; the market table scrolls independently.
- Stopped the production preview server, reloaded the app from its service-worker cache and executed another buy successfully. Offline reload and trading both worked.
- No browser console errors were observed in the tested gameplay flow.
- Admin PIN setup, approved CTA destination, QR appearance and fullscreen/audio behaviour should also be checked by the event host on the actual stall device. No real company URL or event credential has been invented.
- Shared multi-device rankings are an optional documented backend design, not part of this browser-local deployment.
