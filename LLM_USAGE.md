    # LLM usage

## Summary

## Approach

## Guardrails

## Example prompts

## Log
| Date | Task | What happened | What I did |
|---|---|---|---|
| 10-12 | Scaffold | Claude flagged that Git converts files to CRLF on Windows (core.autocrlf), which would make the Prettier check fail on a fresh clone | Checked the warning, accepted the fix: .gitattributes with `* text=auto eol=lf` and renormalised the files; lint passes |
| 10-12 | CI | Claude added two unrequested settings: read-only workflow token (least privilege) and failing the run when build output is missing | Checked both, kept them: limits damage from a compromised dependency, and a broken build can't pass silently |
| 10-12 | Pricing tests | Let Claude write the tests from my rules, no implementation | Checked every expected value myself before building |
| 10-12 | Pricing tests | Claude asked 5 design questions | I decided: reason codes, no throwing, kind + amount, extra edge cases |
| 10-12 | Pricing tests | Claude saw 0 guests had no code and rule order was unclear | Moved 0 guests to Zod, fixed the order + added a test |
| 10-12 | Pricing tests | Claude saw the clock-change test would pass in CI even with a bug | Set the time zone for shared tests and checked it really fails on buggy code |
| 10-12 | Availability tests | Claude found gaps: back-to-back only tested one side, no test with 2+ bookings | Added both tests |
| 10-12 | Availability tests | Claude noticed past check-in had no reason code | Decided CHECK_IN_IN_PAST + the API check order |
| 10-12 | Domain logic | Claude implemented all functions against my tests without changing them; all 38 pass | Reviewed the code and the work score choices |
| 10-12 | Work score | Claude invented workspace types (none/table/desk) that didn't match my plan | Corrected to desk / desk_monitor / office with my own scores |
| 10-12 | Domain tests | Broke the code on purpose (minNights, city tax, guest limit, rule order, cleaning fee) | Every change made a test fail; tests are trustworthy |
| 10-12 | Seed data | Claude left out country ("can be derived from city") | Added it: Benelux spans 3 countries; a seed test keeps city and country consistent |
| 10-12 | Seed data | Claude broke 2 records on purpose to prove the seed test catches errors | Checked the output; kept the strict per-record test |
| 10-12 | API | Claude asked before adding dependencies (as CLAUDE.md says) | Approved both + peers; rejected --legacy-peer-deps because CI would need it too |
| 10-12 | API | Claude offered a card number field in the booking | Said no: card data never goes to my API, payment stays mocked in the UI |
| 10-12 | API | Claude asked how search handles unbookable stays and what seed bookings look like | Hide booked/too small, show min-night reason; full seed bookings with fake data |
| 10-12 | API checks | Let Claude run the manual API checks and show real output; no code changes allowed | Checked each result myself; kept api.http to rerun them |