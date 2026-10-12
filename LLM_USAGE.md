# LLM usage

## Summary

## Approach

## Guardrails

## Example prompts

## Log
| Date | Task | What happened | What I did |
|---|---|---|---|
| 10-12 | Scaffold | Claude flagged that Git converts files to CRLF on Windows (core.autocrlf), which would make the Prettier check fail on a fresh clone | Checked the warning, accepted the fix: .gitattributes with `* text=auto eol=lf` and renormalised the files; lint passes |