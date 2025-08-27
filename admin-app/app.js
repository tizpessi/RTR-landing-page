// Configuration - Update these with your actual webhook URLs
const WEBHOOKS = {
    getAllData: '/.netlify/functions/get-all-data',
    updateAI: '/.netlify/functions/update-ai',
    sendReply: '/.netlify/functions/send-reply'
};

// State management
let allData = [];
let currentConversationId = null;
let currentConversationType = null;

// DOM elements
const homepage = document.getElementById('homepage');
const conversationView = document.getElementById('conversationView');
const conversationList = document.getElementById('conversationList');
const messagesContainer = document.getElementById('messagesContainer');
const conversationTitle = document.getElementById('conversationTitle');
const messageInput = document.getElementById('messageInput');
const aiReplyingCheckbox = document.getElementById('aiReplying');

// Event listeners
document.getElementById('refreshHome').addEventListener('click', loadAllData);
document.getElementById('refreshConversation').addEventListener('click', () => {
    if (currentConversationId) {
        loadAllData().then(() => showConversation(currentConversationId));
    }
});
document.getElementById('backButton').addEventListener('click', showHomepage);
document.getElementById('sendButton').addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
aiReplyingCheckbox.addEventListener('change', handleAICheckboxChange);

// Load all data from webhook
async function loadAllData() {
    try {
        const response = await fetch(WEBHOOKS.getAllData, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Failed to fetch data');
        
        allData = await response.json();
        displayConversations();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please check your webhook URL.');
    }
}

// Display conversations on homepage
function displayConversations() {
    const conversationMap = new Map();
    
    // Group messages by ID
    allData.forEach(row => {
        const id = row.id;
        if (!conversationMap.has(id)) {
            conversationMap.set(id, []);
        }
        conversationMap.get(id).push(row);
    });
    
    conversationList.innerHTML = '';
    
    // Build a list of conversations with latest timestamp and sort desc
    const sortedConversations = Array.from(conversationMap.entries())
        .map(([id, messages]) => ({
            id,
            messages,
            latestTs: Math.max(
                ...messages.map(m => {
                    const t = new Date(m.created_at).getTime();
                    return isNaN(t) ? 0 : t;
                })
            )
        }))
        .sort((a, b) => b.latestTs - a.latestTs);

    sortedConversations.forEach(({ messages, id }) => {
        // Sort messages by row_num to get the first one
        messages.sort((a, b) => a.row_num - b.row_num);
        // Latest message is the one with the highest row_num
        const latestMessage = messages[messages.length - 1];
        const latestDate = new Date(latestMessage?.created_at);
        const latestDateStr = isNaN(latestDate.getTime()) ? '' : formatRelativeTime(latestDate);
        
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        
        // Check if it's email (threadId format) or phone number
        const isEmail = messages.some(m => m.theType === 'email');
        
        if (isEmail) {
            // Extract email info from first message
            const firstMessage = messages[0];
            const bodyLines = firstMessage.body.split('\n');
            let subject = 'No subject';
            let from = 'Unknown sender';
            
            bodyLines.forEach(line => {
                if (line.startsWith('Email subject:')) {
                    subject = line.replace('Email subject:', '').trim();
                } else if (line.startsWith('From address:')) {
                    from = line.replace('From address:', '').trim();
                }
            });
            
            conversationItem.innerHTML = `
                <div class="conversation-info">
                    <div class="conversation-name">${from}</div>
                    <div class="conversation-meta">Subject: ${subject}</div>
                    <div class="conversation-date">${latestDateStr}</div>
                    <span class="type-badge email">Email</span>
                </div>
            `;
        } else {
            // Phone number - check if SMS or iMessage
            const hasIMessage = messages.some(m => m.theType === 'iMessage');
            const type = hasIMessage ? 'iMessage' : 'SMS';
            const typeClass = hasIMessage ? 'imessage' : 'sms';
            
            conversationItem.innerHTML = `
                <div class="conversation-info">
                    <div class="conversation-name">${id}</div>
                    <div class="conversation-date">${latestDateStr}</div>
                    <span class="type-badge ${typeClass}">${type}</span>
                </div>
            `;
        }
        
        conversationItem.addEventListener('click', () => showConversation(id));
        conversationList.appendChild(conversationItem);
    });
}

// Show conversation detail view
function showConversation(id) {
    currentConversationId = id;
    const messages = allData.filter(row => row.id === id);
    
    if (messages.length === 0) return;
    
    // Sort messages by row_num
    messages.sort((a, b) => a.row_num - b.row_num);
    
    // Determine conversation type
    const hasIMessage = messages.some(m => m.theType === 'iMessage');
    const isEmail = messages.some(m => m.theType === 'email');
    
    if (isEmail) {
        currentConversationType = 'email';
        // Extract email details from the first message to show in the header
        const bodyLines = messages[0].body.split('\n');
        let subject = 'No subject';
        let from = 'Unknown sender';
        bodyLines.forEach(line => {
            if (line.startsWith('Email subject:')) {
                subject = line.replace('Email subject:', '').trim();
            } else if (line.startsWith('From address:')) {
                from = line.replace('From address:', '').trim();
            }
        });
        conversationTitle.textContent = `${from} — Subject: ${subject}`;
    } else {
        currentConversationType = hasIMessage ? 'imessage' : 'sms';
        conversationTitle.textContent = id;
    }
    
    // Check AI replying status (look at first message's processed field)
    const firstMessage = messages[0];
    aiReplyingCheckbox.checked = firstMessage.processed !== null;
    
    // Display messages
    messagesContainer.innerHTML = '';
    messagesContainer.className = `messages-container ${currentConversationType}`;
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        
        // Determine message type based on prefix
        const isJordan = message.body.startsWith('Jordan: ');
        const isClient = message.body.startsWith('Client: ');
        const isBaba = message.body.startsWith('Baba: ');
        
        // Check if this is the first message (lowest row_num) in the thread
        const isFirstMessage = message.row_num === messages[0].row_num;
        // Treat the first message as a buffer/system entry for alignment purposes
        const isBufferMessage = isFirstMessage;
        
        let messageType;
        if (isClient || isBufferMessage) {
            messageType = 'user'; // Client messages and buffer messages on left
        } else if (isJordan || isBaba) {
            messageType = 'ai'; // Jordan and Baba messages on right
        } else {
            // Fallback for messages without prefixes (treat as client)
            messageType = 'user';
        }
        
        messageDiv.className = `message ${messageType}`;
        
        // Add special class for Baba messages (orange color)
        if (isBaba) {
            messageDiv.classList.add('baba');
        }
        
        // Clean up message body for display
        let displayBody = message.body;
        if (isEmail && message.row_num === messages[0].row_num) {
            // For first email message, extract just the content
            const lines = displayBody.split('\n');
            displayBody = lines.filter(line => 
                !line.startsWith('Email subject:') && 
                !line.startsWith('From address:')
            ).join('\n').trim();
        }
        // For first SMS/iMessage buffer message, always blank the body
        if (!isEmail && message.row_num === messages[0].row_num) {
            displayBody = '';
        }
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-text">${escapeHtml(displayBody)}</div>
                <div class="message-time">${new Date(message.created_at).toLocaleString('en-US', { timeZone: 'America/Denver' })}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Switch views
    homepage.classList.remove('active');
    conversationView.classList.add('active');
}

// Handle AI checkbox change
async function handleAICheckboxChange() {
    // Anti-spam cooldown: disable toggle for 4 seconds after each change
    if (aiReplyingCheckbox.disabled) return;
    const COOLDOWN_MS = 4000;
    aiReplyingCheckbox.disabled = true;
    setTimeout(() => {
        aiReplyingCheckbox.disabled = false;
    }, COOLDOWN_MS);

    const messages = allData.filter(row => row.id === currentConversationId);
    if (messages.length === 0) return;
    
    messages.sort((a, b) => a.row_num - b.row_num);
    const firstMessage = messages[0];
    
    const newValue = aiReplyingCheckbox.checked ? true : null;
    
    try {
        const response = await fetch(WEBHOOKS.updateAI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                row_num: firstMessage.row_num,
                processed: newValue
            })
        });
        
        const result = await response.json();
        
        if (!result.result) {
            // Revert checkbox if update failed
            aiReplyingCheckbox.checked = !aiReplyingCheckbox.checked;
            alert('Failed to update AI replying status');
        }
    } catch (error) {
        console.error('Error updating AI status:', error);
        aiReplyingCheckbox.checked = !aiReplyingCheckbox.checked;
        alert('Failed to update AI replying status');
    }
}

// Send message
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentConversationId) return;
    
    const sendButton = document.getElementById('sendButton');
    
    // Clear input and update button immediately
    messageInput.value = '';
    sendButton.textContent = 'Sending...';
    sendButton.disabled = true;
    
    try {
        const theType = currentConversationType === 'imessage' ? 'iMessage' : currentConversationType;
        const response = await fetch(WEBHOOKS.sendReply, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentConversationId,
                text: text,
                theType: theType
            })
        });
        
        const result = await response.json();
        
        if (result.result === true) {
            sendButton.textContent = 'Success';
        } else {
            sendButton.textContent = 'Failure';
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        sendButton.textContent = 'Failure';
    }
    
    // Reset button after 1 second
    setTimeout(() => {
        sendButton.textContent = 'Send';
        sendButton.disabled = false;
    }, 1000);
}

// Show homepage
function showHomepage() {
    homepage.classList.add('active');
    conversationView.classList.remove('active');
    currentConversationId = null;
    currentConversationType = null;
}

// Utility function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
} 

// Relative time formatter (e.g., "2h ago")
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 0) return 'just now';
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

// Auto-load conversations on entry
loadAllData();

