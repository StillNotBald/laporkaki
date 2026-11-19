# 04 — Landscape: existing platforms, features, gaps, pain points, adoption

Researched 2026-11-19 via web search/fetch. Builds on `research/03-routing.md` (cited as "03 §N"; not re-fetched). `[stated]` = source says it (URL inline); `[inferred]` = our reasoning. "not found" = searched, no published number located. Statistics carry their as-of date.

**TL;DR for the pitch:** Citizen reporting works at scale — FixMyStreet has logged 8.18M reports in the UK since 2007 and SeeClickFix resolved 4M+ issues across 300+ US cities — but every Malaysian channel is a silo: MyJalan is roads-only and users report being bounced between JKR/TNB/council ("tai chi"), SISPAA needs registration and has no usable public dashboard, and no platform anywhere combines AI photo triage + cross-agency routing + a public per-council fix-time league table. LaporKaki is that missing layer for Klang Valley: one photo, AI names the problem, the right body gets the ticket, and the public watches the fix clock. [stated: URLs in §1–§4; synthesis inferred]

## 1. Platform assessment

### Malaysia (deepening 03 §3–§4 only where it matters)

- **SISPAA/SPAB (PCB, PM's Dept).** One national complaint system, per-agency subdomains, case ID + status tracking. Strength: universal government coverage, formal escalation path. Weakness: registration before filing; wrong-agency reports cause delays; a 2025/26 UTM paper had to build its own monitoring dashboard because SISPAA lacks usable visualisation for handlers. Adoption: Putrajaya resolved 1,632/1,632 complaints in 2025 (agency-published). Model: government-run, free. [stated, 03 §3: https://pcb.spab.gov.my/eApps/system/index.do?aplCode=en ; https://oiji.utm.my/index.php/oiji/article/download/340/246/1390 ; https://smart.putrajaya.my/en/initiatives/e-aduan/]
- **MyJalan (KKR).** Photo + pin road-defect reports, "No Wrong Door" auto-routing, 24h pothole SOP on federal roads; >54,000 complaints by Feb 2026, KKR claims ~95.8% resolved on its own roads. But ~2/3 of complaints were NOT KKR roads, and the iOS app (MYJalan2.0, developer JDN) sits at **2.3/5 from 28 ratings** (fetched 2026-11-19) with reviews describing reports marked "Selesai" with "not under our job scope, kindly contact JKR or TNB", 4+ months stuck at "Dalam proses", save/login server errors, and pins rejected as "not on a recognised road". Login + 10 fixed categories required per its privacy policy. Model: government-run, free, ministerial push. [stated, 03 §4/§6 for volumes; new: https://apps.apple.com/my/app/myjalan2-0-kkr/id6754416303?see-all=reviews&platform=iphone ; https://www.kkr.gov.my/en/myjalan-dasar-privasi]
- **Respons Rakyat V2 (PCB).** Snap photo, pin, track; front-end to government complaints. No fix suggestions, no public accountability layer. [stated, 03 §4]
- **myDBKL.** KL-only, manual category picker — user must already know the category. [stated, 03 §4]
- **i-Clean Selangor (KDEB).** Waste-only, Selangor-only; 36,800 complaints resolved in 2022 (company-published). Strength: tied to the actual operator, so reports reach crews. [stated, 03 §4/§6]
- **myTNB / Air Selangor.** Utility-only channels (streetlights/power; water leaks). Air Selangor runs a public "report leaks" campaign — evidence utilities actively want citizen reports. [stated, 03 §2: https://www.airselangor.com/whats-happening/campaigns/reportleakscampaign]
- **Independent FixMyStreet-style Malaysian platform with per-council routing: not found** (03 §4, re-confirmed by this round's searches).

### International

- **FixMyStreet (mySociety, UK, 2007).** Map-based report → routed to the responsible council by postcode/location; public per-report status pages; email updates. All-time dashboard (fetched 2026-11-19): **8,181,982 problems reported, 3,223,161 marked fixed**; ~21,900 reports/week. Model: charity-run free national site; open-source platform; commercial arm SocietyWorks sells **FixMyStreet Pro** to councils (profits donated back to the charity). Pro adds: nationwide triage/diversion to other authorities (National Highways, TfL, even e-scooter operators), duplicate-report detection with "subscribe to existing report", offline PWA drafting, automated status updates, staff dashboards/heatmaps, WCAG 2.2 AA. Logo wall lists 30+ authorities (Buckinghamshire, Bromley, Lincolnshire, TfL, National Highways, etc.). Cost claim from Buckinghamshire Council: an email about a report costs £7.12 vs 9p via FixMyStreet Pro. [stated] https://www.fixmystreet.com/reports ; https://www.societyworks.org/services/fixmystreet-pro/ ; earlier research report: >1M reports since 2007, 52% road-related https://research.mysociety.org/html/fms-report/
- **SeeClickFix / CivicPlus (US, 2008).** Citizen app (photo + location + category) feeding a government 311 CRM. By its 10th anniversary (Mar 2018): **4M+ issues resolved (~90% of those reported), 300+ cities officially adopted** (e.g. Jersey City), thousands of communities unofficially; app free for citizens; cities paid $3–$6 per 311 phone call (Philadelphia/LA audits) so the app was cheaper. v5.0 (2018) added photos and showing nearby existing reports to cut duplicates. Acquired by CivicPlus Oct 2019; CivicPlus had 3,500+ government clients at acquisition. Model: sell CRM/work-management SaaS to governments; citizen app free. Current (2024–26) adoption totals: not found (vendor pages blocked fetch). [stated] https://statescoop.com/seeclickfix-celebrates-10-years-with-new-version-of-app/ ; https://www.govtech.com/biz/CivicPlus-Acquires-311-Software-Company-SeeClickFix.html ; https://medium.com/@mileslasater/celebrating-the-acquisition-of-seeclickfix-12-years-8-memories-and-10-thank-yous-138ba6b3ce90 ; https://www.civicplus.com/seeclickfix-311-crm/
- **FixMyStreet clones.** The open-source platform runs abroad: **Züri wie neu** (Stadt Zürich, Switzerland) and **Fixa min gata** (KIVOS, Sweden). Zurich's city-run deployment is studied in academic co-creation literature. Proves the model transfers to non-UK jurisdictions when a city adopts it. [stated] https://fixmystreet.org/ ; https://www.emerald.com/insight/content/doi/10.1108/TG-03-2022-0033/full/html
- **Mark-a-Spot (Germany, 2011–).** Open-source Open311 platform (Drupal); intake, routing, status updates, dashboards; run commercially by Civic Patches; used by Bonn, and Munich/Duisburg per its hosting partner's site. Model: open core + municipal hosting/enterprise. [stated] https://www.mark-a-spot.com/ ; https://civicspot.io/solutions/issue-reporter ; https://github.com/markaspot/mark-a-spot
- **BuitenBeter (Netherlands).** National citizen app for public-space reports, routed to participating municipalities via a shared API; referenced in municipal policy documents (2024). Adoption count: not found in this round. [stated] https://api.buitenbeter.nl/ ; https://zoek.officielebekendmakingen.nl/gmb-2024-49743.html

## 2. Must-have feature matrix

✓ = has it, ~ = partial, ✗ = no evidence of it, ? = not verified. Sources: FMS = fixmystreet.com/reports + societyworks.org/services/fixmystreet-pro/; SCF = statescoop 2018 + civicplus.com/seeclickfix-311-crm/; MYJ = 03 §4 + kkr.gov.my privacy policy + App Store reviews; SISPAA = 03 §3; myDBKL/i-Clean/myTNB = 03 §2–§4. Cells without a specific source are [inferred] from those pages.

| Feature | FMS/Pro | SeeClickFix | MyJalan | SISPAA | myDBKL | i-Clean | myTNB | LaporKaki design |
|---|---|---|---|---|---|---|---|---|
| Photo + GPS report | ✓ | ✓ (2018+) | ✓ | ~ (Respons Rakyat front-end) | ~ | ✓ [inferred] | ~ | ✓ |
| AI photo triage (no category picking) | ✗ | ✗ | ✗ (10 fixed categories) | ✗ | ✗ (manual picker) | ✗ | ✗ | ✓ (core) |
| Correct-body routing, all problem types | ~ (UK-wide, street/env only) | ~ (within one city's dept list) | ~ (roads only; bounce complaints) | ✗ (pick your agency) | ✗ (KL only) | ✗ (waste only) | ✗ (power only) | ✓ (03 routing table v1) |
| Case ID + status tracking | ✓ | ✓ | ✓ (but stale statuses) | ✓ | ? | ? | ? | ✓ |
| Public transparency (reports visible) | ✓ (public map + per-report pages) | ✓ (public issues) | ✗ [inferred — no public map found] | ✗ (no public dashboard, UTM paper) | ✗ [inferred] | ✗ [inferred] | ✗ | ✓ (public dashboard) |
| Per-body fix-time league table | ~ (per-council report counts, not median-days ranking) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (raised/solved/median-days) |
| No-login / low-friction filing | ~ (email-based, no password upfront [inferred]) | ~ (account, simple [inferred]) | ✗ (register/login; MyDigital ID) | ✗ (registration, 03 §3) | ? | ? | ✗ (account [inferred]) | ✓ (demo: no login) |
| Mobile-first | ✓ (PWA, offline) | ✓ (apps) | ✓ (apps) | ✗ (web forms [inferred]) | ~ | ~ | ✓ | ✓ (390px first) |
| Dedup / "me too" on existing reports | ✓ (Pro: suggest + subscribe) | ✓ (2018+) | ✗ [inferred] | ✗ [inferred] | ✗ [inferred] | ✗ [inferred] | ✗ | ~ (design has dedup? see §3) |
| Feedback loop when fixed | ✓ (auto email/SMS updates) | ✓ | ~ (status exists; reviews say no updates) | ~ | ? | ? | ? | ✓ (notifications) |
| Moderation/abuse handling | ✓ (council moderation [inferred from Pro admin tools]) | ✓ (gov moderation [inferred]) | ✓ (gov-run [inferred]) | ✓ (gov-run [inferred]) | ✓ [inferred] | ✓ [inferred] | ✓ [inferred] | ~ (needs a plan) |

No assessed platform was found doing AI photo classification that removes the category/agency picker entirely — not found across FMS, SCF, Mark-a-Spot, MyJalan, SISPAA. [inferred from absence in fetched feature pages; treat as "not found", not proof of absence]

## 3. Gaps — the union of what's missing

1. **Cross-agency routing for ALL problem types in Malaysia.** MyJalan = roads only (03 §4); i-Clean = waste; myTNB = power; Air Selangor = water; SISPAA makes the citizen pick the agency (03 §3). FMS Pro does nationwide diversion but only UK street/environment scope. **LaporKaki addresses this** (03 routing table v1 + AI triage). Verified gap.
2. **AI photo triage so the citizen never picks category or agency.** Not found in any assessed platform (§2). **LaporKaki addresses this** — its clearest differentiator.
3. **Public per-council accountability league table (raised/solved/median-days).** FMS publishes per-council report counts and per-report status, but a cross-council median-time-to-fix ranking: not found. Malaysian unified table: not found (03 §3). **LaporKaki addresses this.** Caveat: with demo data it proves the design, not real accountability. [inferred]
4. **Dedup across agencies.** FMS Pro dedups within its own network; nothing found dedups a pothole reported to both MyJalan and a council SISPAA inbox. **LaporKaki partially addresses**: same-location "me too" is cheap in-app, but true cross-agency dedup needs agency data feeds we don't have. Be honest: demo shows in-app dedup only. [inferred]
5. **Citizen-visible fix timeline + trustworthy closure.** MyJalan reviews show statuses that lie ("Selesai" with no action) or never move. **LaporKaki addresses** timeline + notifications; it does NOT currently design closure evidence (after-photo / citizen confirm-fixed) — recommend adding, it directly answers the strongest review complaint. [inferred from App Store reviews §4]
6. **Volunteer/funding layer.** No assessed platform has one. Malaysia has grassroots energy (The Brotherhood) but DIY road works were ordered stopped in 2014, and public collections need permits (03 §5). **LaporKaki addresses** via pledge screen routing to authorised bodies; must not collect money in-app without a permitted partner (03 §5).
7. **Not covered by LaporKaki's current design:** moderation/abuse workflow at scale, agency-side work-order integration (FMS Pro/SCF's real moat), and legal identity/authority to actually bind agencies. A hackathon demo cannot prove these. [inferred]

## 4. Pain points, ranked (evidence × impact × demo-fixability)

Citizen side:

1. **The "tai chi" bounce — reports closed as done while nothing is fixed.** MyJalan iOS review (24 Jun 2026): reports marked "Selesai" with "not under our job scope, kindly contact JKR or TNB"; ~2/3 of MyJalan complaints were not KKR roads (03 §3). Strong evidence, huge impact, cheap to demo (routing table + no-false-close rule). [stated] https://apps.apple.com/my/app/myjalan2-0-kkr/id6754416303?see-all=reviews&platform=iphone
2. **Login/registration walls.** SISPAA needs an account before filing (03 §3); MyJalan requires login/registration and users reported being unable to log in or register for days after the 1.0→2.0 migration (Nov 2025 reviews). Cheap demo fix: no-login filing. [stated, 03 §3 + App Store URL above + https://www.kkr.gov.my/en/myjalan-dasar-privasi]
3. **No status updates; reports vanish into months of "Dalam proses".** Review (28 Jul 2026): two complaints from 15 Mar 2026 still "Dalam proses" after 4+ months, then the app errored on new submissions. r/malaysia: "whatsapp but no action taken". Cheap demo fix: timeline + "your report got fixed" notification. [stated, App Store URL; forum snippet] https://www.reddit.com/r/malaysia/comments/1ip0vs7/how_to_report_a_hazard/
4. **Not knowing which council owns your street.** r/malaysia: "You can google which council cover the said problematic area and you can email them"; council-boundary confusion documented in 03 §1 (Setapak KL vs Selangor, Glenmarie "Klang" ≠ MBDK). Cheap demo fix: GPS + reverse geocode + routing, user-correctable. [stated, forum snippet, same Reddit URL; 03 §1]
5. **Bureaucratic category pickers.** myDBKL manual categories (03 §4); MyJalan's 10 fixed categories (privacy policy). AI names the problem from the photo — core demo. [stated, 03 §4 + kkr.gov.my]
6. **Rigid intake rules.** MyJalan rejects pins "not on a recognised road" (review 14 Nov 2025, with developer apology); mandatory photo upload frustrates drivers who can't safely photograph while driving (review 29 Nov 2025). Demo fix: correctable location, photo-optional fallback. [stated, App Store URL]
7. **Language friction.** MyJalan error messages are Malay-only ("Ralat, Gagal menyimpan aduan"); SISPAA forms vary by agency [inferred]. Demo fix: EN + BM toggle. Evidence moderate. [stated, App Store URL; inferred for SISPAA]
8. **Duplicate reports annoy everyone.** FMS Pro and SeeClickFix both built dedup because duplicates are a top cost driver; Malaysian channels show no dedup (not found). Demo fix: "me too" on nearby open tickets. [stated, societyworks.org + statescoop URLs §1]

Agency side:

9. **Cost per contact.** Buckinghamshire: £7.12 per email vs 9p via FMS Pro; US cities $3–$6 per 311 call. Structured, deduped, correctly-routed tickets are the savings pitch to councils. [stated, §1 URLs]
10. **Wrong-agency inflow.** ~2/3 of MyJalan volume wasn't KKR's to fix (03 §3) — pre-routed tickets save triage labour. [stated, 03 §3]
11. **No usable monitoring dashboards.** UTM paper had to build one for SISPAA handlers (03 §3). LaporKaki's council inbox + public dashboard answers both sides. [stated, 03 §3]

Counter-evidence (keep honest): filing DOES sometimes work — r/malaysia threads show DBKL fixing a broken sidewalk after a complaint, and a 5-star MyJalan review praises fast action. The problem is variance and opacity, not total failure. [stated, forum] https://www.reddit.com/r/malaysia/comments/1ubnf5e/proof_that_filing_a_complaint_matters_dbkl_fixes/ ; App Store URL above.

## 5. Promotion, adoption, removing silos

How comparables got both sides onboard:

- **FixMyStreet: citizens first, councils follow.** The free national site sends reports to councils by email with zero signup required from the council; councils later adopt Pro as their official channel. Lincolnshire adopted Pro "and we've never even met them" — self-serve via the UK G-Cloud digital marketplace. mySociety publishes promotional posters for anyone to print. The public map itself is the marketing: every report is a shareable page. [stated] https://www.mysociety.org/tag/fixmystreet-for-councils/ ; https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/750036126019114 ; https://www.fixmystreet.com/about/posters ; https://www.fixmystreet.com/about/information-for-councils
- **SeeClickFix: free citizen app, paid government CRM.** Grew community-by-community, then became the official 311 tool in 300+ cities by being cheaper than call centres; acquisition by CivicPlus (3,500+ gov clients) gave it a government sales channel. [stated, §1 URLs]
- **MyJalan: top-down ministerial push.** Works Minister publicly mandated 24h pothole patching via the app; KKR runs Facebook how-to posts ("5 steps to make a complaint"); Federal Territories response target cut 24h→12h by the responsible minister. Volume followed the mandate (>54k by Feb 2026). [stated, 03 §4/§6; https://www.facebook.com/KementerianKerjaRaya/posts/779288537570690/ ; https://www.facebook.com/KementerianKerjaRaya/posts/937989055033970/]
- **i-Clean: operator-owned channel.** KDEB promoted it as its own complaint line; 36,800 resolved in 2022 shows an operator can drive adoption when reports feed its own crews. [stated, 03 §4/§6]

**LaporKaki playbook (proposal, [inferred] throughout):**

- Citizen side: (a) every ticket gets a public, WhatsApp-shareable link with photo + status — the FMS growth loop; (b) "your report got fixed" notification with before/after — the retention loop MyJalan reviews beg for; (c) campus/RTM champions seed the first 100 reports in one council area (demo: one Klang Valley neighbourhood); (d) QR stickers at problem sites linking to a pre-filled report — practical, but placing stickers on public assets may count as unauthorised posting/vandalism; legality not verified (open question). Safer variant: QR on community noticeboards with permission, or FMS-style printable posters.
- Agency side: (a) start with ONE willing council — a single inbox login, no integration needed, mirroring FMS's email-first zero-signup model; (b) sell the dashboard as incentive (showcase fast fixes) not shaming — league table ranks median days but celebrates improvements; (c) SISPAA escalation fallback so no report dies even if a body ignores the inbox (03 §3/§7); (d) the savings pitch: pre-routed, deduped tickets vs £7.12-equivalent manual handling (§4.9).
- How silos erode: shared ticket schema (problem, severity, GPS, body, status, timestamps) → one public dashboard across bodies → dedup/"me too" as the network effect (each new report makes the map more useful, each new body makes routing more complete). FMS Pro's "unify service areas by removing silos" pitch is the proven end-state; LaporKaki starts citizen-side because no Malaysian body will integrate on day one. [inferred; FMS pitch stated §1]
- Honest demo limits: we can prove the flow (photo → AI triage → routed ticket → inbox → dashboard → pledge) with demo data and one simulated council. We cannot prove real agency response, real fix times, or legal authority to route on behalf of bodies — those need partnerships (council MOU, KDEB/TNB/Air Selangor data or API access). Say this on the roadmap slide rather than overclaim. [inferred]

## Top 5 pitch-ready facts

1. FixMyStreet has logged 8,181,982 street problems and 3,223,161 fixes in the UK since 2007 — citizen reporting works at national scale (live dashboard, fetched 19 Nov 2026). https://www.fixmystreet.com/reports
2. SeeClickFix resolved 4M+ issues (~90% of reports) and became the official 311 tool of 300+ US cities by being cheaper than $3–$6-per-call phone centres (2018 figures). https://statescoop.com/seeclickfix-celebrates-10-years-with-new-version-of-app/
3. MyJalan's own app-store reviews describe reports closed as "Selesai" with "kindly contact JKR or TNB" — the agency bounce is the documented, unsolved Malaysian pain (2.3/5, 28 ratings, 2026). https://apps.apple.com/my/app/myjalan2-0-kkr/id6754416303?see-all=reviews&platform=iphone
4. About two-thirds of MyJalan road complaints were not on KKR roads — citizens cannot tell jurisdictions apart, so routing must be automatic (Astro Awani, via 03 §3). https://international.astroawani.com/malaysia-berita/beyond-pothole-when-simple-complaint-became-new-way-looking-malaysias-roads
5. Buckinghamshire Council says handling a report by email costs £7.12 versus 9p through FixMyStreet Pro — correct routing and dedup are a cost savings story for councils, not just a citizen convenience. https://www.societyworks.org/services/fixmystreet-pro/

## Open questions for the lead

1. Add "closure evidence" (after-photo or citizen confirm-fixed) to the ticket state machine? It directly answers the strongest MyJalan complaint; recommendation: yes, one extra status + photo slot. (Owner decision.)
2. Is "me too"/dedup in the current build contract? §3.4 assumes in-app dedup only; confirm scope before the dashboard claims it.
3. QR stickers at problem sites: legality unverified (possible unauthorised-posting rules). Recommendation: demo the QR flow on a community noticeboard, not public assets.
4. Which single council do we name as the pilot target in the pitch? Recommendation: one with a published SISPAA presence and reachable hotline (03 §1) — owner picks; do not imply an existing partnership.
5. SeeClickFix current (2024–26) adoption totals and BuitenBeter municipality count: not found (vendor sites blocked). Pitch uses dated 2018 figures — acceptable, or drop the number?