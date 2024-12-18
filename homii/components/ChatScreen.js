import { View } from 'react-native'; // Importer View fra react-native
import React, { useState, useEffect, useCallback } from 'react';  // Importer React, useState, useEffect og useCallback fra react
import { SafeAreaView } from 'react-native'; // Importer SafeAreaView fra react-native
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';  // Importer Bubble, GiftedChat, InputToolbar og Send fra react-native-gifted-chat
import { FontAwesome } from '@expo/vector-icons'; // Importer FontAwesome fra expo/vector-icons
import { signOut } from 'firebase/auth'; // Importer signOut fra firebase/auth
import ChatFaceData from '../services/ChatDataFace';  // Importer ChatFaceData fra services/ChatDataFace
import SendMessage from '../services/Request'; // Importer SendMessage fra services/Request

// Standard chatbot avatar
let CHAT_BOT_FACE = 'https://res.cloudinary.com/dknvsbuyy/image/upload/v1685678135/chat_1_c7eda483e3.png';

// Chat screen komponent
export default function ChatScreen() { // Funktion til at vise chat skærmen
  const [messages, setMessages] = useState([]); // State til chatbeskeder
  const [loading, setLoading] = useState(false); // State til at vise "is typing"-indikator
  const [chatFaceColor, setChatFaceColor] = useState('#671ddf'); // Standard farve for chat-bobler
  const [userMessageColor, setUserMessageColor] = useState('#1B4F72'); // Besked farve 

  //Chat historik for samtalen / prompt til AI chatbot
  const conversationHistory = [
    {
      role: 'system',
      content:
        'You are a helpful, friendly, and organized assistant focused on helping users with household chores and tasks..',
    },
    { role: 'assistant', content: 'Hello, I am your assistant. How can I help you?' },
  ];

  // Vælg chatbot og initialiser chat
  useEffect(() => { // Vælg chatbot og initialiser chat
    checkFaceId(); // Funktion til at vælge chatbot og initialisere chat
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
        text: `Hello, I am ${selectedChatBot.name}, how can I help you?`, // Chatbot velkomstbesked
        createdAt: new Date(), // Oprettelsesdato
        user: {
          _id: 2, // Chatbot ID
          name: 'React Native', //chatbot navn
          avatar: CHAT_BOT_FACE, //chatbot avatar
        },
      },
    ]);
  };

  // Funktion til at sende beskeder
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages)); // Tilføj brugerbesked til chat
    if (messages[0].text) { // Hvis der er en besked
      getBardResp(messages[0].text); // Kald API for chatbot svar
    }
  }, []);

  // Funktion til at hente chatbot svar
  const getBardResp = (msg) => {
    setLoading(true); // Vis "is typing" bobler 
    const userMessage = { role: 'user', content: msg };
    conversationHistory.push(userMessage); // Tilføj brugerbesked til historik

   // Kald API til chatbot svar
    SendMessage(conversationHistory) // Kald API til chatbot svar
      .then((response) => { // Hvis der er et svar
        if (response.content) { // Hvis der er et svar
          setLoading(false); // Skjul "is typing" bobler
          const chatAIResp = { // Chatbot svar
            _id: Math.random() * (9999999 - 1), // Tilføj chatbot svar til historik
            text: response.content, // Chatbot svar
            createdAt: new Date(), // Oprettelsesdato
            user: {
              _id: 2,
              name: 'React Native',
              avatar: CHAT_BOT_FACE,
            },
          };
          conversationHistory.push({ role: 'assistant', content: response.content }); // Tilføj chatbot svar til historik
          setMessages((previousMessages) => GiftedChat.append(previousMessages, chatAIResp)); // Tilføj chatbot svar til historik
        } else {
          setLoading(false); // Skjul "is typing" bobler
          const chatAIResp = { 
            _id: Math.random() * (9999999 - 1), // Tilføj chatbot svar til historik
            text: 'Sorry, I cannot help with it', // Besked hvis chatbot ikke kan hjælpe
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: CHAT_BOT_FACE,
            },
          };
          // Tilføj chatbot svar til historik
          setMessages((previousMessages) => GiftedChat.append(previousMessages, chatAIResp)); // Tilføj chatbot svar til historik
        }
      })
      .catch((error) => {
        console.error('Error fetching chatbot response:', error); // Hvis der er en fejl
        setLoading(false); // Skjul "is typing" bobler
      });
  };

 // Funktion til at generere chatbobler
  const renderBubble = (props) => { // Funktion til at generere chatbobler
    return (
      <Bubble // Returner chatbobler
        {...props}
        wrapperStyle={{ // Chatboble stil
          right: { // Højre side
            backgroundColor: chatFaceColor,  
          },
        }}
        textStyle={{ // Tekst stil
          right: {
            padding: 2,
            color: userMessageColor,
          },
        }}
      />
    );
  };

  // Funktion til at lave input feltet
  const renderInputToolbar = (props) => { // Funktion til at lave input feltet
    return ( // Returner input feltet
      <InputToolbar // Input felt
        {...props} // Props
        containerStyle={{  // Container stil
          padding: 3,
          backgroundColor: chatFaceColor, 
        }}
        textInputProps={{
          placeholderTextColor: '#1B4F72',
        }}
      />
    );
  };

  // Funktion til at lave send knappen
  const renderSend = (props) => { 
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}> 
          <FontAwesome name="send" size={24} color="#1B4F72" />
        </View>
      </Send>
    );
  };

  // Vis chat skærmen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: chatFaceColor }}>  
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <GiftedChat
          messages={messages} // Chatbeskeder
          isTyping={loading} // Vis "is typing" bobler
          multiline={true} // Flere linjer
          onSend={(messages) => onSend(messages)} // Funktion til at sende beskeder
          user={{
            _id: 1,
          }}
          renderBubble={renderBubble} // Funktion til at generere chatbobler
          renderInputToolbar={renderInputToolbar} // Funktion til at lave input feltet
          renderSend={renderSend} // Funktion til at lave send knappen
        />
      </View>
    </SafeAreaView>
  );
}
