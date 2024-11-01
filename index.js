const express = require('express');
const axios = require('axios');

class BlackboxAI {
  constructor(model = 'blackboxai') {
    this.apiUrl = 'https://www.blackbox.ai/api/chat';
    this.headers = {
      'Content-Type': 'application/json',
      // Add any necessary headers here, like Authorization if needed
    };
    this.conversationHistory = {}; // Use an object to manage conversation histories by ID
    this.defaultModel = 'blackboxai'; // Default model selection
    /*
    Available model
    gpt-4o
    claude-sonnet-3.5
    gemini-pro
    blackboxai
    */
  }

  async sendMessage(conversationId, content) {
    // Create conversation history if it does not exist
    if (!this.conversationHistory[conversationId]) {
      this.conversationHistory[conversationId] = [];
    }
    
    // First message in the conversation
    const message = { id: conversationId, content, role: 'user' };
    this.conversationHistory[conversationId].push(message);

    const payload = {
      messages: this.conversationHistory[conversationId],
      id: conversationId,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      userSystemPrompt: null,
      maxTokens: 1024,
      playgroundTopP: 0.9,
      playgroundTemperature: 0.5,
      isChromeExt: false,
      githubToken: null,
      clickedAnswer2: false,
      clickedAnswer3: false,
      clickedForceWebSearch: false,
      visitFromDelta: false,
      mobileClient: false,
      userSelectedModel: this.model // Dynamic model selection
    };

    try {
      const response = await axios.post(this.apiUrl, payload, { headers: this.headers });
      const assistantMessage = { id: `response-${Date.now()}`, content: response.data, role: 'assistant' };
      this.conversationHistory[conversationId].push(assistantMessage);
      return assistantMessage.content;
    } catch (error) {
      console.error('Error communicating with Blackbox.ai:', error);
      throw error;
    }
  }

  async continueConversation(conversationId, content) {
    // Check if conversation history exists
    if (!this.conversationHistory[conversationId]) {
      throw new Error('Conversation not found');
    }
    
    // Add user message to conversation history
    const userMessage = { id: conversationId, content, role: 'user' };
    this.conversationHistory[conversationId].push(userMessage);

    const payload = {
      messages: this.conversationHistory[conversationId],
      id: conversationId,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      userSystemPrompt: null,
      maxTokens: 1024,
      playgroundTopP: 0.9,
      playgroundTemperature: 0.5,
      isChromeExt: false,
      githubToken: null,
      clickedAnswer2: false,
      clickedAnswer3: false,
      clickedForceWebSearch: false,
      visitFromDelta: false,
      mobileClient: false,
      userSelectedModel: this.model // Dynamic model selection
    };

    try {
      const response = await axios.post(this.apiUrl, payload, { headers: this.headers });
      const assistantMessage = { id: `response-${Date.now()}`, content: response.data, role: 'assistant' };
      this.conversationHistory[conversationId].push(assistantMessage);
      return assistantMessage.content;
    } catch (error) {
      console.error('Error in continuing conversation with Blackbox.ai:', error);
      throw error;
    }
  }
}

// Create Express app
const app = express();
const port = 3000; // You can change this to any port you prefer

// Initialize BlackboxAI
const blackboxAI = new BlackboxAI();

// Define the API endpoint
app.get('/api/blackbox', async (req, res) => {
  const { text, conversationId, model } = req.query;

  if (!text || !conversationId) {
    return res.status(400).json({ error: 'Text and conversationId are required' });
  }

  // Use provided model or default
  const selectedModel = model || blackboxAI.defaultModel;
  blackboxAI.model = selectedModel;

  try {
    // Send or continue conversation based on the existence of previous messages
    let response;
    if (!blackboxAI.conversationHistory[conversationId]) {
      response = await blackboxAI.sendMessage(conversationId, text);
    } else {
      response = await blackboxAI.continueConversation(conversationId, text);
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`API Endpoint: /api/blackbox?text=${text}&conversationId=${cId}&model=${model}`);
});
