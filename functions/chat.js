export async function handler(event) {
  try {
    const { messages, model = "gpt-4.1" } = JSON.parse(event.body || "{}");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const raw = await res.text();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `OpenAI error ${res.status}: ${raw}` }),
      };
    }

    return {
      statusCode: 200,
      body: raw,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Function error: ${err.message}` }),
    };
  }
}