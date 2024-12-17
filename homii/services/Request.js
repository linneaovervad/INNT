import OpenAI from "openai/index.mjs";
const openaiKey = "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"//Indsæt din API-nøgle til OpenAI

// Opretter en ny instans af OpenAI-klassen med API-nøglen
const openai = new OpenAI({ apiKey: openaiKey });
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

