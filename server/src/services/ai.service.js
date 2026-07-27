const analyseListing = async (imageUrl, materialType, quantityKg) => {
  const prompt = `You are a waste assessment expert for the Nairobi, Kenya recycling market in 2026.

A seller has uploaded a photo of ${quantityKg}kg of ${materialType.toLowerCase()} waste they want to sell.

Analyse the image and respond ONLY with valid JSON in this exact format, no other text:
{
  "condition": "one of: Excellent | Good | Fair | Poor",
  "conditionNote": "one sentence describing the condition",
  "materialMatch": true or false,
  "materialNote": "one sentence confirming or correcting the material type",
  "priceMin": number in KES,
  "priceMax": number in KES,
  "priceNote": "one sentence explaining the price estimate"
}

Base the price on current Nairobi 2026 market rates for recyclable materials.
If you cannot clearly see the material in the image, set materialMatch to false and explain.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://takasmart.ai',
      'X-Title': 'TakaSmart AI',
    },
    body: JSON.stringify({
      model: 'google/gemma-4-31b-it:free',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error(data.error?.message || 'AI analysis failed.');
  }

  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = { analyseListing };

module.exports = { analyseListing };