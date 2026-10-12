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