const OpenAI = require('openai');

// ── NVIDIA NIM — sole AI provider ────────────────────────────────────────────
let nvidiaClient = null;

const getNvidiaClient = () => {
  if (!nvidiaClient) {
    if (!process.env.NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY is not set in .env');
    nvidiaClient = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return nvidiaClient;
};

module.exports = { getNvidiaClient };
