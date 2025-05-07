export default async function handler(req, res) {
  const body = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'o3-mini',
      messages: body.messages
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}