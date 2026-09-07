# Replace repository checklist

1. Back up current branch or create a tag.
2. Remove:
   - root `app.js`
   - root `styles.css`
   - `fitos_phase1_nutrition/`
3. Copy all files/folders from this package to the repository root.
4. Commit:
   `git add . && git commit -m "Integrate FitOS nutrition intelligence v3"`
5. Push:
   `git push origin main`
6. Wait for GitHub Pages deployment.
7. Test:
   - `3 eggs breakfast`
   - `150g chicken` -> cut clarification -> raw/cooked clarification
   - `150g cooked chicken breast`
   - `1 banana`
   - `2 chapati`
   - food delete/clear
   - profile target calculation
   - program switching
   - weight logging
