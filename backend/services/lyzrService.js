const axios = require('axios');

const LYZR_API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const LYZR_API_KEY = process.env.LYZR_API_KEY;
const AGENT_ID = process.env.LYZR_AGENT_ID;
const USER_ID = process.env.LYZR_USER_ID;

async function generateAdaptiveContent({ sessionId, message }) {
  const payload = {
    user_id: USER_ID,
    agent_id: AGENT_ID,
    session_id: sessionId,
    message
  };

  const response = await axios.post(LYZR_API_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LYZR_API_KEY
    }
  });

  return response.data;
}

module.exports = { generateAdaptiveContent };