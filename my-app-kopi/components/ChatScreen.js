// components/ChatScreen.js
import { View } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native';
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // Importer auth og db fra firebase.js
import ChatFaceData from '../services/ChatDataFace';
import SendMessage from '../services/Request';

// Standard chatbot avatar
let CHAT_BOT_FACE = 'https://res.cloudinary.com/dknvsbuyy/image/upload/v1685678135/chat_1_c7eda483e3.png';

// Hovedkomponenten for chat-skærmen
export default function ChatScreen() {
  const [messages, setMessages] = useState([]); // State til chatbeskeder
  const [loading, setLoading] = useState(false); // State til at vise "is typing"-indikator
  const [chatFaceColor, setChatFaceColor] = useState('#671ddf'); // Standard farve for chat-bobler

  // Standard samtalehistorik
  const conversationHistory = [
    {
      role: 'system',
      content:
        'You are a helpful, friendly, and organized assistant focused on helping users with household chores and tasks...',
    },
    { role: 'assistant', content: 'Hello, I am your assistant. How can I help you?' },
  ];

  // Effekt der kører én gang ved komponentstart, for at tjekke valg af chatbot
  useEffect(() => {
    checkFaceId();
  }, []);

  // Funktion til at sætte chatbot-avatar og farve
  const checkFaceId = () => {
    // Hvis du ikke bruger AsyncStorage, skal du definere hvilken chatbot der skal bruges
    const selectedChatBot = ChatFaceData[0]; // Vælg den første chatbot som standard

    CHAT_BOT_FACE = selectedChatBot.image; // Sætter chatbot-avatar
    setChatFaceColor(selectedChatBot.primary); // Sætter farven på chat-boblerne

    // Initialiserer den første besked i chatten
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

  // Håndterer afsendelse af brugerbeskeder
  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    if (messages[0].text) {
      getBardResp(messages[0].text); // Kald API for chatbot svar
    }
  }, []);

  // Henter chatbot-svar via API-kald
  const getBardResp = (msg) => {
    setLoading(true); // Viser "is typing"-indikator

    const userMessage = { role: 'user', content: msg };
    conversationHistory.push(userMessage); // Tilføjer brugerens besked til samtalehistorik

    // Kalder API for at få chatbot-svar
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
          conversationHistory.push({ role: 'assistant', content: response.content }); // Tilføjer svar til historik
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
        console.error(error);
        setLoading(false);
      });
  };

  // Tilpasset boble-design
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

  // Tilpasset input-felt
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

  // Tilpasset send-knap
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <FontAwesome name="send" size={24} color="white" />
        </View>
      </Send>
    );
  };

  // Returnerer hele chat-interfacet
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
