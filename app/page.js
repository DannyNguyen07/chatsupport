"use client";
import { useState } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi I'm the Headstarter AI Support. How may I help you today?` }
  ]);

  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      assistantMessage += text;
      setMessages((messages) => {
        const lastMessage = messages[messages.length - 1];
        const otherMessages = messages.slice(0, messages.length - 1);
        return [...otherMessages, { ...lastMessage, content: assistantMessage }];
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); 
      sendMessage();
    }
  };

  return (
    <Box
      width='100vw'
      height='100vh'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems="center"
    >
      <Stack direction='column' width='700px' height='500px' border = '1px solid black' p = {4} spacing = {4}>
        <Stack direction='column' spacing={2} flexGrow={1} overflow="auto">
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color='white'
                borderRadius={16}
                p={3}
                sx={{ 
                  maxWidth: '75%', 
                  wordBreak: 'break-word', 
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction='row' spacing = {2}>
          <TextField 
            label="Message" 
            fullWidth 
            value = {message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          >
          </TextField>
          <Button variant ='contained' onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
