// pages/api/llmDistribution.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PatternData } from '@/types/dependenciesData';

type Data = {
  result?: PatternData[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { totalBudget, activeGraph } = req.body;
  if (!totalBudget || !activeGraph) {
    res.status(400).json({ error: 'Missing totalBudget or activeGraph data.' });
    return;
  }

  // Construct the prompt for the LLM.
  const prompt = `
You are a helpful assistant that generates reward distribution patterns in the form of a JavaScript function based on dependency graph data.

Input Data:
Total Budget: ${totalBudget} USDC
Distribution Concept: weighted
Dependency Graph Data:
${JSON.stringify(activeGraph, null, 2)}

Please generate three distribution patterns as a JSON array. Each element in the array should be an object with the following properties:
- resultId: number (should match the activeGraph resultId)
- name: string (a short pattern name)
- description: string (a brief description of the pattern)
- JavaScriptFunction: string (a complete JavaScript function that performs an update on transactions, nodeMap, and edgeMap; for example, a function that iterates over transactions and adjusts node sizes and edge widths)
- reason: string (explain why this pattern was chosen)

Return only valid JSON.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates reward distribution patterns in the form of a JavaScript function based on dependency graph data.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }

    const data = await response.json();
    const llmOutput = data.choices[0].message.content;

    // Parse the LLM's output (which should be valid JSON)
    let patterns: PatternData[];
    try {
      patterns = JSON.parse(llmOutput);
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse LLM output as JSON.' });
      return;
    }

    res.status(200).json({ result: patterns });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: "Internal server error while calling OpenAI API" });
  }
}
