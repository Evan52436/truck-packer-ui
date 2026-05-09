# Truck Packer UI

A simple truck-loading simulator with a React frontend and Flask backend.  
You can define box dimensions and quantities, run a packing simulation, and view 3D results with utilization stats.

## Features

- 3D truck visualization using React Three Fiber
- Dynamic box-type input cards
- **Three default box templates** on startup:
  - Type 1: `1 x 1 x 1` (qty `12`)
  - Type 2: `2 x 2 x 2` (qty `4`)
  - Type 3: `1.5 x 1.5 x 1.5` (qty `8`)
- Packing simulation via Flask + `py3dbp`
- Result metrics: utilization %, packed count, unplaced count

## Project Structure

- `src/` - React app (`App.jsx` contains UI and simulation flow)
- `api/` - Flask API (`index.py` exposes `/api/simulate`)

## Requirements

- Node.js 18+ (recommended)
- Python 3.10+ (recommended)

## Install

### Frontend

```bash
npm install
```

### Backend

```bash
cd api
pip install -r requirements.txt
```

## Run Locally

Open two terminals.

### Terminal 1: Flask API

```bash
cd api
python index.py
```

Backend runs on `http://localhost:5000`.

### Terminal 2: React app

```bash
npm run dev
```

Frontend runs on Vite's local dev URL (usually `http://localhost:5173`).

## How To Use

1. Edit any box type dimensions (`P`, `L`, `T`) and `Quantity`
2. Click **Add Box Type** if you need more templates
3. Click **Simulate Packing**
4. Inspect the 3D arrangement and utilization stats
5. Click **Clear Truck** to reset the visualization

## API

### `POST /api/simulate`

Request body:

```json
{
  "box_types": [
    { "p": 1, "l": 1, "t": 1, "quantity": 12 }
  ]
}
```

Response shape:

```json
{
  "boxes": [],
  "utilization": 0,
  "packed_count": 0,
  "unplaced_count": 0
}
```
