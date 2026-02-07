import axios from 'axios';

const API_KEY = "mu_lSRQjfTDMfVKwNoZrUbHRJ1NEACUZDnjQZ3m6MlbrJahVsIBwdxrAjZ_G8MNmBfIBEAW3Lm5lATaVpkG4G_50QFPlGi5f81etu8jtw";
const BASE_URL = "/api/v3/memory";

// Types
export interface MemoryItem {
  memory_type: string;
  content: string;
}

export interface RetrieveResponse {
  rewritten_query: string;
  items: MemoryItem[];
}

// API Service
export const memuApi = {
  retrieve: async (query: string): Promise<RetrieveResponse> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/retrieve`,
        {
          user_id: "demo_user",
          agent_id: "demo_agent",
          query: query
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("MemU API Error:", error);
      throw error;
    }
  },

  memorize: async (content: string): Promise<any> => {
    try {
      const response = await axios.post(
        `${BASE_URL}/memorize`,
        {
          user_id: "demo_user",
          agent_id: "demo_agent",
          conversation: [
            { role: "user", content: content },
            { role: "assistant", content: "I have noted that down." },
            { role: "user", content: "Great, please remember it." }
          ]
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("MemU Memorize Error:", error);
      throw error;
    }
  }
};
