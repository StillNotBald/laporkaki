Research task. Use web search and web fetch. Write your findings to `research/03-routing.md`. Touch no other file. Read `AGENTS.md` and `docs/SUBMISSION.md` first.

## Context
Our hackathon idea: a citizen snaps a photo of a public problem (pothole, broken streetlight, clogged drain, rubbish dumping, fallen tree, faded road paint, broken playground, flooding, abandoned car). AI names the problem, finds the place, suggests a fix, and routes the ticket to **the body that actually fixes it**. Routing to the wrong body is the main reason complaints die today. Start with the Klang Valley (Selangor + Kuala Lumpur).

## Questions (mark every line `[stated]` with its URL, or `[inferred]`)
1. **Local councils** in the Klang Valley: full name, short name (MBPJ, MBSJ, DBKL, MBSA, MPS / MBS Selayang, MPAJ, MPKj / MBKj Kajang, MPSepang, MBDK Klang, etc.), the main towns or areas each covers (enough for a lookup by town or postcode area), and the official complaint channel (web form, app, hotline, WhatsApp). Note the councils that were upgraded to city status recently (names changed).
2. **Who fixes what:** for each problem type above, which body is responsible and when it changes: council roads vs state roads (JKR Negeri) vs federal roads (JKR / LLM for highways and concessionaires); streetlights (council vs TNB vs highway concessionaire); drains (council) vs rivers (JPS); water pipes (Air Selangor); sewerage (IWK); rubbish collection (SWCorp in KL / council contractors or KDEB Waste Management in Selangor); fallen trees; illegal dumping; abandoned vehicles; traffic lights.
3. **The national channel:** SISPAA (Sistem Pengurusan Aduan Awam) and any state system (e.g. Selangor's). What they do, and their known pain points (public reviews or news). Do they show resolution statistics publicly?
4. **Existing apps** that do photo complaints in Malaysia or nearby (council apps, FixMyStreet-style, Waze reports). What they lack. One line each.
5. **Volunteer and donation angle:** any Malaysian community groups that fix public things themselves (e.g. pothole patching, gotong-royong groups) and any legal limits on fixing public property yourself. Rules for public fundraising in Malaysia (permit needs) in one paragraph.
6. **Public data:** any open data on complaint volumes or resolution times per council (data.gov.my, council annual reports).

## Output shape
Section per question. Then a final table **"Routing table v1"**: problem type | default body | when it goes elsewhere | channel. Keep it under 160 lines. Write `not found` rather than guessing. End with a report under 120 words.
