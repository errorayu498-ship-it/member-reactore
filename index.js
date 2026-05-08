const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.once('ready', () => {
    console.log(`🟢Logged in as ${client.user.tag}!`);
    console.log(`🟢Monitoring ${config.memberIds.length} members`);
    console.log(`🟢Custom emojis loaded: ${config.emojiIds.length}`);
    console.log('🟢Bot is ready to react!');
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message mentions any of the configured members
    const mentionedMembers = message.mentions.users;
    
    if (mentionedMembers.size === 0) return;
    
    // Check if any mentioned user is in our config list
    const hasTargetMember = mentionedMembers.some(user => 
        config.memberIds.includes(user.id)
    );
    
    if (!hasTargetMember) return;
    
    console.log(`Target member mentioned in channel #${message.channel.name}`);
    
    // React with all configured emojis
    for (const emojiId of config.emojiIds) {
        try {
            await message.react(emojiId);
            console.log(`Reacted with emoji: ${emojiId}`);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.code === 10014) {
                console.error(`❌ Invalid emoji ID: ${emojiId}`);
            } else if (error.code === 30001) {
                console.error(`❌ Max reactions reached for this message`);
                break;
            } else {
                console.error(`❌ Error reacting with emoji ${emojiId}:`, error.message);
            }
        }
    }
});

// Handle errors
client.on('error', error => {
    console.error('Bot error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
