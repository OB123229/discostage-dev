# Discover Stage

A web app for discovering local artists and upcoming music events.

---


## Launch the App

### Step 1 — Clone the repo (first time only): This just downloads all files
git clone https://github.com/OB123229/discostage-dev.git
cd discostage-dev

### Step 2 — Install Python packages (first time only)
pip3 install fastapi uvicorn pydantic aiofiles

### Step 3 — Start the backend server
uvicorn server:app --reload

### Step 4 — Start the frontend (seprate terminal)
python3 -m http.server 3000

### Step 5 — Open the app
http://localhost:3000

---

## Updating github

Before starting work:
git pull origin main

After finishing work:
git add .
git commit -m "describe what you built"
git push origin v2
