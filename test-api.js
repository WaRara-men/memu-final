import axios from 'axios';

const API_KEY = "mu_lSRQjfTDMfVKwNoZrUbHRJ1NEACUZDnjQZ3m6MlbrJahVsIBwdxrAjZ_G8MNmBfIBEAW3Lm5lATaVpkG4G_50QFPlGi5f81etu8jtw";
const BASE_URL = "https://api.memu.so/api/v3/memory";

async function test() {
  try {
    console.log("Testing API...");
    const response = await axios.post(
      `${BASE_URL}/retrieve`,
      {
        user_id: "demo_user",
        agent_id: "demo_agent",
        query: "What are my hobbies?"
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    console.error("Status:", error.response ? error.response.status : "Unknown");
  }
}

test();
