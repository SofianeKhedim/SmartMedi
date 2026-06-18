import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal, StyleSheet } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../constants/Colors';
import ChatbotService from '../services/ChatbotService';

export default function ChatbotScreen() {
  const { isDarkMode } = useApp();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const BOT = { _id: 2, name: 'Dr. SmartMedi' };

  useEffect(() => {
    // Load any user-provided API key persisted in storage.
    ChatbotService.init();

    setMessages([
      {
        _id: 1,
        text: '👋 Bonjour ! Je suis votre assistant médical spécialisé en hypertension.\n\nJe peux vous aider avec :\n• 📊 Interpretation de vos mesures\n• 💊 Conseils sur les médicaments\n• 🥗 Recommandations nutritionnelles\n• 🏃‍♂️ Exercices adaptés\n• 😰 Gestion du stress\n\nComment puis-je vous aider aujourd\'hui ?',
        createdAt: new Date(),
        user: BOT,
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages = []) => {
    const userText = newMessages[0]?.text ?? '';

    // Build conversation history (oldest-first) from the prior turns so the
    // model keeps context. GiftedChat stores messages newest-first.
    const history = messages
      .slice()
      .reverse()
      .map(m => ({ role: m.user._id === 1 ? 'user' : 'model', text: m.text }));
    // Gemini requires the history to start with a user turn.
    while (history.length && history[0].role === 'model') history.shift();

    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);

    try {
      const response = await ChatbotService.sendMessage(userText, history);

      const botMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: response || 'Désolé, je n\'ai pas pu traiter votre message. Pouvez-vous reformuler ?',
        createdAt: new Date(),
        user: BOT,
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));
    } catch (error) {
      console.error('ChatScreen error:', error);

      const errorMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: 'Désolé, je rencontre des difficultés techniques. Mes services locaux restent disponibles pour vous aider avec vos questions sur l\'hypertension.',
        createdAt: new Date(),
        user: BOT,
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [errorMessage]));
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: theme.primary,
          },
          left: {
            backgroundColor: theme.surface,
          },
        }}
        textStyle={{
          right: {
            color: theme.background,
          },
          left: {
            color: theme.text,
          },
        }}
        timeTextStyle={{
          right: {
            color: theme.background,
          },
          left: {
            color: theme.textSecondary,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          paddingTop: 12,
          paddingHorizontal: 12,
          paddingBottom: 20,
          marginBottom: 60,
          elevation: 4,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        primaryStyle={{
          alignItems: 'center',
        }}
        textInputStyle={{
          backgroundColor: theme.surface,
          borderColor: inputFocused ? theme.primary : theme.border,
          borderWidth: inputFocused ? 2 : 1.5,
          borderRadius: 25,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontSize: 16,
          color: theme.text,
          marginRight: 8,
          marginLeft: 8,
          marginBottom: 30,
          maxHeight: 100,
          minHeight: 44,
          elevation: inputFocused ? 3 : 2,
          shadowOffset: { width: 0, height: inputFocused ? 2 : 1 },
          shadowOpacity: inputFocused ? 0.15 : 0.1,
          shadowRadius: inputFocused ? 3 : 2,
          shadowColor: inputFocused ? theme.primary : theme.shadow,
        }}
        textInputProps={{
          onFocus: () => setInputFocused(true),
          onBlur: () => setInputFocused(false),
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props} containerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={[styles.sendButton, { 
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
        }]}>
          <FeatherIcon name="send" size={18} color={theme.background} />
        </View>
      </Send>
    );
  };

  const handleConfigureGrok = () => {
    setShowApiModal(true);
  };

  const saveApiKey = async () => {
    if (apiKey.trim()) {
      await ChatbotService.setApiKey(apiKey.trim());
      Alert.alert(
        'Configuration sauvegardée',
        'L\'assistant utilisera maintenant Gemini AI (gratuit) pour des réponses plus avancées.'
      );
    }
    setShowApiModal(false);
    setApiKey('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🩺 Assistant Médical</Text>
        <TouchableOpacity onPress={handleConfigureGrok} style={styles.configButton}>
          <FeatherIcon name="settings" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        isTyping={isTyping}
        colorScheme={isDarkMode ? 'dark' : 'light'}
        placeholder="Tapez votre question..."
        placeholderTextColor={theme.placeholder}
        alwaysShowSend
        showUserAvatar={false}
        messagesContainerStyle={{
          backgroundColor: theme.background,
        }}
      />

      <Modal
        visible={showApiModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Configuration Gemini AI
            </Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Pour activer l'IA Gemini (GRATUIT), entrez votre clé API Google{'\n'}
              Créez un compte sur aistudio.google.com et obtenez votre clé API gratuite
            </Text>
            
            <TextInput
              style={[styles.apiInput, { 
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border 
              }]}
              placeholder="AIza..."
              placeholderTextColor={theme.placeholder}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setShowApiModal(false)}
                style={[styles.modalButton, { backgroundColor: theme.surface }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={saveApiKey}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.background }]}>
                  Sauvegarder
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  configButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  apiInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    marginRight: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
