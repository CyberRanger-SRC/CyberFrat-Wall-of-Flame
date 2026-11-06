# CyberFrat Diwali Alexa Skill Integration Guide

Connect your **Amazon Alexa Skill** to your Vercel deployment to welcome guests, ask for their name, offer to light a diya on **The CyberFrat Wall of Flame**, and deliver a witty/thoughtful cybersecurity awareness quote!

---

## 🎙️ The Exact Alexa Conversational Flow

```
User:  "Hello Alexa" (or "Alexa, open CyberFrat Diwali")
Alexa: "Hello! Welcome to CyberFrat's Festival of Lights. What is your name?"

User:  "My name is Sagar"
Alexa: "Hello Sagar! Do you wanna light a diya on the CyberFrat Wall of Flame?"

[CASE 1: User says YES]
User:  "Yes" (or "Light a diya", "Sure")
Alexa: "Wonderful, Sagar! Your diya has been lit and is now burning bright on the CyberFrat Wall of Flame! 
        A very Happy Diwali to you and your family! 
        Here is your festive awareness thought: May your passwords be as complex as Mom's rangoli and twice as hard to crack! 
        Keep shining, stay cyber safe, and enjoy the festival! Goodbye!"
--> Result: Sagar's lamp automatically ignites on the Ultrawide Wall of Flame and the 65-inch TV fluid rises!

[CASE 2: User says NO]
User:  "No" (or "No thanks", "Not now")
Alexa: "No problem, Sagar! Wishing you and your loved ones a very Happy Diwali! 
        Here is your festive awareness thought: The strongest firewall ever built is human awareness. Guard your mind, guard your community. 
        Have a wonderful celebration and stay safe! Goodbye!"
```

---

## 🛠️ Step-by-Step Alexa Console Setup (Takes ~3 Minutes)

### Step 1: Create Skill in Alexa Developer Console
1. Go to the [Amazon Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) and sign in.
2. Click **Create Skill**.
3. Name your skill: **`CyberFrat Diwali`**.
4. Choose Primary Locale: **English (IN)** or **English (US)**.
5. Choose Model: **Custom**.
6. Choose Hosting: **Provision your own** (backend runs on your Vercel deployment).
7. Click **Create Skill**.

---

### Step 2: Paste Interaction Model
1. In the left sidebar, click **Interaction Model** &rarr; **JSON Editor**.
2. Replace the JSON with the contents of [`alexa/interaction-model.json`](./interaction-model.json).
   - *Note: Uses `AMAZON.FirstName` for the `{Name}` slot so participants can say either just their name (e.g., "Sagar") or carrier phrases ("My name is Sagar") without validation errors.*
3. Click **Save Model** and then **Build Model**.

---

### Step 3: Configure Endpoint to your Vercel URL
1. In the left sidebar, click **Endpoint**.
2. Select **HTTPS**.
3. Under **Default Region**, paste your Vercel URL:
   ```
   https://<your-project>.vercel.app/api/alexa
   ```
4. In the SSL certificate dropdown, select:  
   **"My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority"** (Vercel provides this automatically).
5. Click **Save Endpoints**.

---

### Step 4: Test in Alexa Simulator
1. In the top navigation, click the **Test** tab.
2. Enable skill testing in **Development**.
3. In the Alexa Simulator, type or speak:
   - `open cyberfrat diwali`
   - Alexa will ask for your name &rarr; type `Sagar`
   - Alexa will ask if you want to light a diya &rarr; type `yes`
   - Alexa will confirm, wish Happy Diwali, recite the quote, and add your diya to the wall!

---

## 💡 In-Browser Interactive Alexa Testing (No Echo Device Needed!)
You can also run this exact conversation directly in your browser:
- Open the **Ultrawide Wall of Flame** &rarr; Click **"Talk to Alexa"** in the top right.
- The interactive modal simulates the exact voice dialogue, plays Alexa's speech through your speakers, and lights the diya on screen!
