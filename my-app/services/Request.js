import OpenAI from "openai/index.mjs";
import openaiKey from "../env" // Importerer API-nøglen fra miljøfil

// Opretter en ny instans af OpenAI-klassen med API-nøglen
const openai = new OpenAI({apiKey: openaiKey });
// Sender forespørgsel til OpenAI's chat-model med beskeder fra messageArray
export default async function SendMessage(messageArray) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", 
        messages: messageArray, // Sender brugerens samtalehistorik som input
    });

    // Udtrækker AI'ens svar fra svaret (første svar i responsen)
    const result = response.choices[0]?.message?.content || "";
    // Returnerer AI'ens svar med rolle og indhold
    return { role: "assistant", content: result };
}