# Implementation Plan - Dev Stories Image Update

## Goal Description
Add a hero image to the "Learning IT/AI Qualifications" article in the "Dev Stories" section. The image should represent the theme of challenging oneself to acquire new skills in AI and IT.

## Proposed Changes
### Content
#### [MODIFY] [episodes.ts](file:///d:/Dev/roastplus/data/dev-stories/episodes.ts)
- Update `imageUrl` for `episode-005` to point to the new image.

### Assets
#### [NEW] [qualifications_challenge.png](file:///d:/Dev/roastplus/public/dev-stories/qualifications_challenge.png)
- A new image generated using AI (Nano Banana style) featuring IT/AI study elements.

## Verification Plan
### Manual Verification
- Verify the file exists at `public/dev-stories/qualifications_challenge.png` after generation.
- Check `episodes.ts` to ensure the URL matches the filename.
