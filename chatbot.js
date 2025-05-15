class MedSyncChatBot {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Create and append chatbot HTML
        const chatbotHTML = `
            <div class="chat-bot-container">
                <div class="chat-bot-button">
                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="MedSync Bot">
                </div>
                <div class="chat-bot-window">
                    <div class="chat-header">
                        <h3>MedSync Assistant</h3>
                        <span class="close-chat">&times;</span>
                    </div>
                    <div class="chat-messages">
                        <div class="message bot-message">Hello! I am MedSync. How can I help you today?</div>
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Type your message...">
                        <button>Send</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);

        // Get DOM elements
        this.chatButton = document.querySelector('.chat-bot-button');
        this.chatWindow = document.querySelector('.chat-bot-window');
        this.closeButton = document.querySelector('.close-chat');
        this.messageInput = document.querySelector('.chat-input input');
        this.sendButton = document.querySelector('.chat-input button');
        this.messagesContainer = document.querySelector('.chat-messages');

        // Add event listeners
        this.chatButton.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.toggleChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.chatWindow.classList.toggle('active');
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Simulate bot response
        setTimeout(() => {
            this.handleBotResponse(message);
        }, 1000);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    handleBotResponse(userMessage) {
        // Simple response logic - can be expanded with more sophisticated AI/API integration
        let botResponse = "I'm here to help! Please contact our medical staff for specific medical advice.";
        
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            botResponse = "Hello! How can I assist you today?";
        } else if (lowerMessage.includes('emergency')) {
            botResponse = "If this is a medical emergency, please call emergency services immediately!";
        } else if (lowerMessage.includes('appointment')) {
            botResponse = "Would you like me to help you schedule an appointment with one of our doctors?";
        } else if (lowerMessage.includes('hours')) {
            botResponse = "Our medical facility is open 24/7 for emergencies. Regular consultation hours are 9 AM to 5 PM, Monday to Friday.";
        }

        this.addMessage(botResponse, 'bot');
    }
}

// Initialize chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MedSyncChatBot();
}); 