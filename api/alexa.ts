// Vercel Serverless Function for Amazon Alexa Skill
// Endpoint: https://<your-vercel-domain>/api/alexa

interface CuteQuote {
  text: string;
  emoji: string;
}

const AWARENESS_QUOTES: CuteQuote[] = [
  {
    text: "May your passwords be as complex as Mom’s rangoli and twice as hard to crack!",
    emoji: "🎨🔐"
  },
  {
    text: "Like a diya pushes darkness away, a little cyber awareness shields our entire fraternity.",
    emoji: "🪔✨"
  },
  {
    text: "True awareness is knowing that not all festive links come with actual Kaju Katli!",
    emoji: "🥮⚠️"
  },
  {
    text: "The strongest firewall ever built is human awareness. Guard your mind, guard your community.",
    emoji: "🧠🛡️"
  },
  {
    text: "Don't share your OTP with anyone, even if someone promises you lifetime free Diwali sweets!",
    emoji: "🍬🚫"
  },
  {
    text: "Burst eco-safe crackers with joy, but never let anyone burst through your multi-factor authentication!",
    emoji: "💥🛡️"
  },
  {
    text: "Lock your laptop screen before grabbing that samosa. Insider sweet-threats are real!",
    emoji: "🥟👀"
  },
  {
    text: "Update your software like Mom cleans the house before Diwali — thoroughly and without excuses!",
    emoji: "🧹💻"
  },
  {
    text: "Zero Trust with suspicious links, Infinite Trust with the CyberFrat family.",
    emoji: "🤝✨"
  },
  {
    text: "Phishers don't take holidays! Think twice before clicking 'Claim your 5000 rupee Diwali gift'.",
    emoji: "🎁🛑"
  },
  {
    text: "Protect your digital identity like Grandma protects the secret family laddu recipe!",
    emoji: "👵🍪"
  },
  {
    text: "A single careless click can cause a blackout; a single mindful moment protects thousands.",
    emoji: "💡🕊️"
  }
];

function getRandomQuote(): CuteQuote {
  const idx = Math.floor(Math.random() * AWARENESS_QUOTES.length);
  return AWARENESS_QUOTES[idx];
}

// In-memory queue of diyas added via Alexa (persists across warm serverless invocations)
// The frontend polls this list to display Alexa-lit lamps on the Wall of Flame!
const alexaDiyasQueue: Array<{
  id: string;
  name: string;
  message: string;
  timestamp: string;
  metalColor: string;
}> = [];

function buildResponse(
  speechText: string,
  shouldEndSession: boolean = false,
  sessionAttributes: Record<string, any> = {},
  repromptText?: string
) {
  return {
    version: "1.0",
    sessionAttributes,
    response: {
      outputSpeech: {
        type: "SSML",
        ssml: `<speak>${speechText}</speak>`,
      },
      card: {
        type: "Simple",
        title: "CyberFrat Wall of Flame",
        content: speechText.replace(/<[^>]+>/g, ''),
      },
      reprompt: repromptText
        ? {
            outputSpeech: {
              type: "SSML",
              ssml: `<speak>${repromptText}</speak>`,
            },
          }
        : undefined,
      shouldEndSession,
    },
  };
}

export default async function handler(req: any, res: any) {
  // Enable CORS for frontend polling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Health check & Polling endpoint for frontend web app
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      skill: 'CyberFrat Diwali Alexa Skill',
      totalAlexaDiyas: alexaDiyasQueue.length,
      diyas: alexaDiyasQueue,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const alexaReq = req.body;
    const requestType = alexaReq?.request?.type;
    const session = alexaReq?.session || {};
    const attributes = session.attributes || {};

    // -------------------------------------------------------------
    // 1. User arrives / greets: "Hello Alexa" or LaunchRequest
    // -------------------------------------------------------------
    if (requestType === 'LaunchRequest' || (requestType === 'IntentRequest' && alexaReq.request?.intent?.name === 'HelloIntent')) {
      const speech = `Hello! Welcome to CyberFrat's Festival of Lights. <break time="200ms"/> What is your name?`;
      const reprompt = `Please tell me your name so we can celebrate together.`;
      return res.status(200).json(
        buildResponse(speech, false, { step: 'AWAITING_NAME' }, reprompt)
      );
    }

    // -------------------------------------------------------------
    // 2. Intent Requests
    // -------------------------------------------------------------
    if (requestType === 'IntentRequest') {
      const intentName = alexaReq.request?.intent?.name;
      const slots = alexaReq.request?.intent?.slots || {};

      // User provides their Name
      if (intentName === 'ProvideNameIntent' || attributes.step === 'AWAITING_NAME') {
        let providedName = slots?.Name?.value || 'Friend';
        // Clean up capitalization
        providedName = providedName.trim().charAt(0).toUpperCase() + providedName.trim().slice(1);

        const speech = `Hello ${providedName}! <break time="200ms"/> Do you want to light a diya on the CyberFrat Wall of Flame?`;
        const reprompt = `${providedName}, do you want to light a diya on the CyberFrat Wall of Flame? Say yes or no.`;

        return res.status(200).json(
          buildResponse(speech, false, { step: 'AWAITING_CONFIRMATION', userName: providedName }, reprompt)
        );
      }

      // User answers YES
      if (intentName === 'AMAZON.YesIntent') {
        const userName = attributes.userName || 'Friend';
        const quote = getRandomQuote();

        // Add Diya to the live queue!
        const newDiya = {
          id: `alexa-${Date.now()}`,
          name: userName,
          message: `${quote.text} ${quote.emoji}`,
          timestamp: new Date().toISOString(),
          metalColor: 'brass',
        };
        alexaDiyasQueue.push(newDiya);

        const speech = `Wonderful, ${userName}! <break time="250ms"/> 
          Your diya has been lit and is now burning bright on the CyberFrat Wall of Flame! <break time="300ms"/> 
          A very Happy Diwali to you and your family! <break time="300ms"/> 
          Here is your festive awareness thought: <break time="200ms"/> 
          ${quote.text} <break time="400ms"/> 
          Keep shining, stay cyber safe, and enjoy the festival! Goodbye!`;

        return res.status(200).json(buildResponse(speech, true, {}));
      }

      // User answers NO
      if (intentName === 'AMAZON.NoIntent') {
        const userName = attributes.userName || 'Friend';
        const quote = getRandomQuote();

        const speech = `No problem, ${userName}! <break time="200ms"/> 
          Wishing you and your loved ones a very Happy Diwali! <break time="300ms"/> 
          Here is your festive awareness thought: <break time="200ms"/> 
          ${quote.text} <break time="400ms"/> 
          Have a wonderful celebration and stay safe! Goodbye!`;

        return res.status(200).json(buildResponse(speech, true, {}));
      }

      // Greet Everyone Intent (direct command)
      if (intentName === 'GreetEveryoneIntent') {
        const speech = `A very Happy and Blessed Diwali to the entire CyberFrat fraternity and all our wonderful guests! <break time="300ms"/> 
          Welcome to The Wall of Flame. What is your name?`;
        return res.status(200).json(
          buildResponse(speech, false, { step: 'AWAITING_NAME' }, `Please tell me your name.`)
        );
      }

      // Help Intent
      if (intentName === 'AMAZON.HelpIntent') {
        const speech = `Say hello, tell me your name, and I will help you light a diya on the CyberFrat Wall of Flame. What is your name?`;
        return res.status(200).json(buildResponse(speech, false, { step: 'AWAITING_NAME' }, speech));
      }

      // Stop / Cancel Intent
      if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        const speech = `Happy Diwali from CyberFrat! Keep your lights high and your passwords strong. Goodbye!`;
        return res.status(200).json(buildResponse(speech, true, {}));
      }
    }

    // Default Fallback
    const fallback = `Hello! Welcome to CyberFrat Diwali. What is your name?`;
    return res.status(200).json(
      buildResponse(fallback, false, { step: 'AWAITING_NAME' }, fallback)
    );
  } catch (error: any) {
    console.error('Error in Alexa handler:', error);
    return res.status(500).json(buildResponse('Happy Diwali from CyberFrat!', true, {}));
  }
}
