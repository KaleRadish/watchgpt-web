// functions/chat.js   (Node 18 runtime by default)
export async function handler(event, context) {
  try {
    const { messages, model = "o3-mini" } = JSON.parse(event.body || "{}");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await openaiRes.json();
    return {
      statusCode: openaiRes.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}