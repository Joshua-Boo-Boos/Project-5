import { useState, useEffect, useRef } from 'react'
import './Chat.css'

interface Message {
    type: string;
    chat_message?: string;
}

const Chat: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [confirmedUsername, setConfirmedUsername] = useState<boolean>(false);
    const ws = useRef<WebSocket | null>(null);

    const submitChatMessage = () => {
        try {
            if (ws.current && inputMessage !== '' && username !== '') {
                ws.current.send(JSON.stringify({type: 'chat', chat_message: `${username}: ${inputMessage}`}));
            }
        } catch (error) {
            console.error('Error submitting chat message:', error);
        }
    }

    useEffect(() => {
        try {
            if (!ws.current && username && confirmedUsername) {
                ws.current = new WebSocket('wss://192.168.1.210:8000/ws/' + username);
            }
            if (ws.current && username && confirmedUsername) {
                ws.current.onmessage = (event) => {
                    const message: Message = JSON.parse(event.data);
                    if (message.type === 'chat') {
                        if (message.chat_message && message.chat_message !== '') {
                            setMessages(prevMessages => [...prevMessages, message.chat_message!]);
                        }
                    }
                }
            }
        } catch (error) {
            alert('Error establishing chat connection');
        }
        
    }, [confirmedUsername])
    const confirmUsername = () => {
        setConfirmedUsername(() => true);
    }
    return (
        <div className="chat-container">
            <div className="username-container">
                <label className="username-label">Username:</label>
                <input style={confirmedUsername ? {backgroundColor: 'green'} : {backgroundColor: 'red'}} disabled={confirmedUsername} onChange={e => setUsername(e.target.value)} type="text" className="username-input" />
                <button disabled={confirmedUsername} onClick={() => confirmUsername()} className="lock-username">Lock</button>
            </div>
            <textarea disabled={true} value={messages.join('\n')} className="messages-container" />
            <div className="submit-message-container">
                <div className="message-input-container">
                    <label className="message-label">Message:</label>
                    <input onChange={e => setInputMessage(e.target.value)} type="text" className="message-input" />
                </div>
                <button onClick={() => submitChatMessage()} className="message-submit-button">Submit</button>
            </div>
        </div>
    )
}

export default Chat