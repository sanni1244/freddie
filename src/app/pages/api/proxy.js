import axios from "axios";

export default async function handler(req, res) {
  const targetUrl = `https://api-freddie.ai-wk.com${req.url.replace("/api/proxy", "")}`;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        // Add auth headers if needed (e.g., API keys)
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}