# Prompt for the implementation session

Copy the following into the next coding session from the repository root:

```text
Implement the static React educational website specified in signed-explanation/.
Read README.md, LESSONS.md, and BUILD-PLAN.md in that folder first.

Build inside signed-explanation using React + TypeScript + Vite + plain CSS
and original HTML/SVG illustrations. Preserve the planning documents.
Keep dependencies small and do not change the surrounding GitLab setup.

Follow the five implementation phases. Deliver all ten interactive chapters,
the troubleshooting playground, glossary, and sources. Use the written lesson
storyboards as the content contract. Do not stop at a landing page or a collection
of static explanation cards. Make the interactions demonstrate cause and effect.

Use a cute cream/pastel design, readable dark text, responsive diagrams,
keyboard-accessible controls, reduced-motion support, and optional technical
detail panels. A ten-year-old should be able to follow the main story.

Start with browser/server, HTTP/HTTPS, and SSL/TLS basics. Include the ZeroSSL
public-CA walkthrough, private CA trust, and self-signed leaf certificates.
Keep X.509, TLS 1.3, and mTLS technically distinct, and include the final
understanding check. Private keys never travel across a network arrow.
Use local fictional fixtures and label simulations. No backend, real key uploads,
external AI service, analytics, or changes to the machine's trust store.

Use hash routes and relative assets so the output can be publicly hosted as a
static site. Document installation/build/hosting commands and save a lockfile.
Use official documentation for dependency compatibility and additional technical
details. Ask only if a necessary decision cannot be resolved from these files.

Keep updates concise. If the session ends before completion, record completed
phases and exact next steps in signed-explanation/PROGRESS.md. Do not describe
unfinished chapters as complete. Do not add/run tests unless I request them.
At delivery, state what was implemented and what was actually checked.
```

For a shorter implementation session, replace “Deliver all ten…” with “Complete phase 1 only, then record the next steps in PROGRESS.md.” Continue later with “Read PROGRESS.md and complete the next phase from BUILD-PLAN.md.”
