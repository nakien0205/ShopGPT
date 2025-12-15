# 🚀 How to Run the Shopping Assistant

This guide is created by **<u>AI</u>** and refined by me so if you have a hardtime understanding then ask AI to do it for you.

## 📋 Prerequisites

Before running the project, ensure you have:

- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed
- **Git** (if cloning from repository)

## 🔧 Setup

### 1. Install Backend Dependencies

Open a terminal in the project root directory:

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd front_end

# Install npm packages
npm install

# Return to project root
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the project root nessasary credentials are in **.env_example.txt:**

```bash
Please read the .env_example.txt file
Then create a .env file
```

If you are too lazy then here is what the `.env` looks like:

```bash
# OpenRouter API Key
API=sk-or-v1-something

# Supabase Configuration
SUPABASE_URL=https://perhaps?.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9?????
SUPABASE_CONTROL_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9????  (This is the anon secret key)

# Supabase Auth (optional)
EMAIL=Meomeosir@gmail.com
PASSWORD=yeah_right
```

**Note that**: the `.env` file <U>must</u> also be inside these folder `/crawler`, `/database`, `/main`

**Where to get credentials:**
- **OpenRouter API Key**: get api at https://openrouter.ai/ (choose free model if you're broke)
- **Supabase**: Create project at https://supabase.com/

## ▶️ Running the Project

You need to run **TWO servers** simultaneously:

### Option 1: Run them seperately

#### Terminal 1 - Backend Server

```bash
# From project root
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

**Backend will run at:** http://localhost:8000

#### Terminal 2 - Frontend Server

```bash
# Navigate to frontend
cd front_end

# Start development server
npm run dev
```

**Frontend will run at:** http://localhost:8080

### Option 2: Use the run.ps1

Run the `run.ps1` in the **terminal**:

```terminal
.\run.ps1
```


If you don't have API credentials yet, you can run in test mode:

#### Terminal 1 - Test Backend
```bash
python api_test.py
```

#### Terminal 2 - Frontend
```bash
cd front_end
npm run dev
```

## 🎯 Accessing the Application

Once both servers are running:

1. **Open your browser** to http://localhost:8080
2. **Start chatting** with the shopping assistant
3. **Ask for products** like "Find me running shoes under $100"


**Note**: The code will <u>find/scrape</u> **data online** if the data is not found in your **supabase** database so don't expect much

## 🛑 Stopping the Servers

Press `Ctrl + C` in each terminal window to stop the servers or close it.



**Need help?** Just contact me through ntk241205@gmail.com or use AI.