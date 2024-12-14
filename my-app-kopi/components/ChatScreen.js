import { View } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native';
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import ChatFaceData from '../services/ChatDataFace';
import SendMessage from '../services/Request';

// Standard chatbot avatar
let CHAT_BOT_FACE = 'https://res.cloudinary.com/dknvsbuyy/image/upload/v1685678135/chat_1_c7eda483e3.png';

// Chat screen komponent
export default function ChatScreen() {
  const [messages, setMessages] = useState([]); // State til chatbeskeder
  const [loading, setLoading] = useState(false); // State til at vise "is typing"-indikator
  const [chatFaceColor, setChatFaceColor] = useState('#671ddf'); // Standard farve for chat-bobler

  //Chat historik for samtalen / prompt til AI chatbot
  const conversationHistory = [
    {
      role: 'system',
      content:
        'You are a helpful, friendly, and organized assistant focused on helping users with household chores and tasks...',
    },
    { role: 'assistant', content: 'Hello, I am your assistant. How can I help you?' },
  ];

  // Vælg chatbot og initialiser chat
  useEffect(() => {
    checkFaceId();
  }, []);

  // Funktion til at vælge chatbot og initialisere chat
  const checkFaceId = () => {
    const selectedChatBot = ChatFaceData[0]; // Vælg chatbot

    CHAT_BOT_FACE = selectedChatBot.image; // Chatbot avatar
    setChatFaceColor(selectedChatBot.primary); // Chatbot farve

    // Initialiser chat
    setMessages([
      {
        _id: 1,
        text: `Hello, I am ${selectedChatBot.name}, how can I help you?`,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: CHAT_BOT_FACE,
        },
      },
    ]);
  };

  // Funktion til at sende beskeder
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    if (messages[0].text) {
      getBardResp(messages[0].text); // Kald API for chatbot svar
    }
  }, []);

  // Funktion til at hente chatbot svar
  const getBardResp = (msg) => {
    setLoading(true); // Vis "is typing" bobler
    const userMessage = { role: 'user', content: msg };
    conversationHistory.push(userMessage); // Tilføj brugerbesked til historik

   // Kald API til chatbot svar
    SendMessage(conversationHistory)
      .then((response) => {
        if (response.content) {
          setLoading(false);
          const chatAIResp = {
            _id: Math.random() * (9999999 - 1),
            text: response.content,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: CHAT_BOT_FACE,
            },
          };
          conversationHistory.push({ role: 'assistant', content: response.content }); // Tilføj chatbot svar til historik
          setMessages((previousMessages) => GiftedChat.append(previousMessages, chatAIResp));
        } else {
          setLoading(false);
          const chatAIResp = {
            _id: Math.random() * (9999999 - 1),
            text: 'Sorry, I cannot help with it',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: CHAT_BOT_FACE,
            },
          };
          setMessages((previousMessages) => GiftedChat.append(previousMessages, chatAIResp));
        }
      })
      .catch((error) => {
        console.error('Error fetching chatbot response:', error);
        setLoading(false);
      });
  };

 // Funktion til at generere chatbobler
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: chatFaceColor,
          },
        }}
        textStyle={{
          right: {
            padding: 2,
          },
        }}
      />
    );
  };

  // Funktion til at lave input feltet
  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          padding: 3,
          backgroundColor: chatFaceColor, 
        }}
        textInputStyle={{ color: '#fff' }}
      />
    );
  };

  // Funktion til at lave send knappen
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <FontAwesome name="send" size={24} color="white" />
        </View>
      </Send>
    );
  };

  // Vis chat skærmen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: chatFaceColor }}> 
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <GiftedChat
          messages={messages}
          isTyping={loading}
          multiline={true}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble}
          renderInputToolbar={renderInputToolbar}
          renderSend={renderSend}
        />
      </View>
    </SafeAreaView>
  );
}
