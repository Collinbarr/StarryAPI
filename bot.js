const { Client, GatewayIntentBits } = require('discord.js');

const DISCORD_TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
const DASHBOARD_API = 'YOUR_BASE44_APP_URL'; // Optional: to log conversations

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Bot configuration
const CONFIG = {
  model: 'llama-3.3-70b-versatile',
  systemPrompt: 'You are Starry, a helpful and friendly AI assistant in a Discord server. Be conversational, helpful, and engaging.',
  maxTokens: 1024,
  temperature: 0.7
};

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is now online!`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages and only respond to DMs
  if (message.author.bot || !message.channel.isDMBased()) return;

  try {
    // Show typing indicator
    await message.channel.sendTyping();

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        messages: [
          { role: 'system', content: CONFIG.systemPrompt },
          { role: 'user', content: message.content }
        ],
        max_tokens: CONFIG.maxTokens,
        temperature: CONFIG.temperature
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    // Send response
    await message.reply(aiResponse);

    console.log(`✅ Responded to ${message.author.tag}`);
  } catch (error) {
    console.error('Error:', error);
    await message.reply('Sorry, something went wrong! Please try again.');
  }
});

client.login(DISCORD_TOKEN);
