# AGENTS: QuizBattle Repository

## Repo state
- Git already initialized and connected to `https://github.com/Mai-RTD/quizbattle.git`
- Branch `main` is up to date with origin
- No `.gitignore` — all project files are tracked

## Project structure (root only)
| File | Purpose |
|------|---------|
| `index.html.html` | Main HTML markup + embedded CSS/JS (Poki-style portal) |
| `style.css` | Visual styling (dark theme, accent #ff6b35, game-grid layout) |
| `script.js` | Portal interactivity + quiz game logic |
| `questions.js` | 5 quiz questions about the user (Q/A with correct indices) |
| `Lessons/` | Course materials — do not commit these unless relevant |

## Git notes
- `git config --global user.name "Mai-RTD"` and `git config --global user.email "mai.zonov@gmail.com"` are already set
- `git status` shows branch up to date with `origin/main` — push succeeded without errors
- No passwords, keys, phones, or addresses found in any source file

## How to run / verify
- Open `index.html.html` in a browser to launch the quiz portal
- Click "Начать игру" (Start Game) to begin the quiz
- Game features: 5 questions, 30s per question, solo/duel modes, scoring

## What to avoid
- Do not commit `Lessons/` contents unless explicitly needed — they contain unrelated course files
- Do not assume `index.html` exists; the file is named `index.html.html`
- Do not add `--force` to any git command — the repo already has a clean push history

## Commands you'll likely need
```bash
git --version                    # verify git is installed (2.56.0)
git config --global user.name    # => Mai-RTD
git config --global user.email   # => mai.zonov@gmail.com
git status                       # check branch/working tree
git add index.html.html script.js style.css questions.js
git commit -m "descriptive message"
git push                         # already configured for origin main
```