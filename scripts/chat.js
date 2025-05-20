class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        
        // Initialize conversation history with welcome message
        this.messageHistory = [{
            role: 'system',
            content: `You are a knowledgeable and enthusiastic travel assistant. Provide helpful travel advice and recommendations.`
        }];
        
        this.setupEventListeners();
        
        // Add welcome message
        this.addMessage("Hi! I'm here to help with your travel plans! 👋", false);
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
        });
    }

    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'} clearfix`;
        const formattedText = this.formatMessage(text);
        messageDiv.innerHTML = formattedText;
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatMessage(text) {
        // Convert URLs to clickable links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert markdown-style formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert bullet points
        text = text.replace(/\n- /g, '<br>• ');
        
        return text;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, true);
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Add user message to history
        this.messageHistory.push({
            role: 'user',
            content: message
        });

        // Simulate AI response (replace with actual API call)
        const response = await this.getAIResponse(message);
        
        // Add AI response to chat
        this.addMessage(response, false);
        
        // Add AI response to history
        this.messageHistory.push({
            role: 'assistant',
            content: response
        });
    }

    async getAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple response logic (replace with actual AI integration)
        if (message.toLowerCase().includes('algeria')) {
            return "Algeria is a really good place with rich history and beautiful landscapes. For more details, check this website: [Algeria Info](https://honeydew-worm-328764.hostingersite.com/accueil/)";
        }
        
        return "I can help you plan your trip! What specific information are you looking for?";
    }
}

// Initialize chat interface
const chat = new ChatInterface();
