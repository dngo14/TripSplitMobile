import React, { useState, useRef, useEffect } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage, PollData, PollOption } from '../../lib/types';
import { timestampToDate } from '../../lib/firestore-utils';

interface ChatRoomProps {
  messages: ChatMessage[];
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  onCreatePoll: (poll: Omit<PollData, 'id' | 'voters'>) => void;
  onVotePoll: (messageId: string, pollId: string, optionId: string) => void;
  currentUserId: string;
  currentUserName: string;
}

interface MessageItemProps {
  message: ChatMessage;
  currentUserId: string;
  onVotePoll: (messageId: string, pollId: string, optionId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId, onVotePoll }) => {
  const isMyMessage = message.senderId === currentUserId;
  const messageDate = timestampToDate(message.createdAt);

  const handleVote = (optionId: string) => {
    if (message.poll) {
      onVotePoll(message.id, message.poll.id, optionId);
    }
  };

  const hasVoted = message.poll?.voters?.[currentUserId];
  const totalVotes = message.poll?.options.reduce((sum, option) => sum + option.votes, 0) || 0;

  return (
    <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
      <View style={[styles.messageBubble, isMyMessage && styles.myMessageBubble]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        
        {message.text && (
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {message.text}
          </Text>
        )}

        {message.poll && (
          <View style={styles.pollContainer}>
            <Text style={[styles.pollQuestion, isMyMessage && styles.myPollQuestion]}>
              📊 {message.poll.question}
            </Text>
            
            <View style={styles.pollOptions}>
              {message.poll.options.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const userVoted = hasVoted === option.id;
                
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.pollOption,
                      userVoted && styles.pollOptionVoted,
                      hasVoted && !userVoted && styles.pollOptionDisabled,
                    ]}
                    onPress={() => !hasVoted && handleVote(option.id)}
                    disabled={!!hasVoted}
                  >
                    <View style={styles.pollOptionContent}>
                      <Text style={[
                        styles.pollOptionText,
                        userVoted && styles.pollOptionTextVoted,
                      ]}>
                        {option.text}
                      </Text>
                      <Text style={styles.pollVotes}>
                        {option.votes} vote{option.votes !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                      </Text>
                    </View>
                    {percentage > 0 && (
                      <View
                        style={[
                          styles.pollBar,
                          { width: `${percentage}%` },
                          userVoted && styles.pollBarVoted,
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
            
            <Text style={styles.pollFooter}>
              {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Text style={[styles.timestamp, isMyMessage && styles.myTimestamp]}>
          {messageDate?.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </Text>
      </View>
    </View>
  );
};

export const ChatRoom: React.FC<ChatRoomProps> = ({
  messages,
  onSendMessage,
  onCreatePoll,
  onVotePoll,
  currentUserId,
  currentUserName,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        text: inputText.trim(),
      });
      setInputText('');
    }
  };

  const handleCreatePoll = () => {
    Alert.prompt(
      'Create Poll',
      'Enter poll question:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: (question) => {
            if (question && question.trim()) {
              createPollOptions(question.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const createPollOptions = (question: string) => {
    const options: string[] = [];
    
    const addOption = (optionNumber: number) => {
      Alert.prompt(
        `Poll Option ${optionNumber}`,
        `Enter option ${optionNumber} (or leave empty to finish):`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: optionNumber <= 2 ? 'Next' : 'Add Another',
            onPress: (option) => {
              if (option && option.trim()) {
                options.push(option.trim());
                addOption(optionNumber + 1);
              } else if (options.length >= 2) {
                finalizePoll(question, options);
              } else {
                Alert.alert('Error', 'Please add at least 2 options');
                addOption(optionNumber);
              }
            },
          },
          ...(options.length >= 2 ? [{
            text: 'Finish',
            onPress: () => finalizePoll(question, options),
          }] : []),
        ],
        'plain-text'
      );
    };

    addOption(1);
  };

  const finalizePoll = (question: string, optionTexts: string[]) => {
    const pollOptions: PollOption[] = optionTexts.map((text, index) => ({
      id: `option_${index}_${Date.now()}`,
      text,
      votes: 0,
    }));

    const poll: Omit<PollData, 'id' | 'voters'> = {
      question,
      options: pollOptions,
    };

    onCreatePoll(poll);
  };

  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = timestampToDate(a.createdAt) || new Date(0);
    const dateB = timestampToDate(b.createdAt) || new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            currentUserId={currentUserId}
            onVotePoll={onVotePoll}
          />
        )}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <Pressable style={styles.pollButton} onPress={handleCreatePoll}>
          <Ionicons name="bar-chart" size={24} color="#007AFF" />
        </Pressable>
        
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />
        
        <Pressable 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? "#fff" : "#ccc"} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pollContainer: {
    marginTop: 8,
    minWidth: 200,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  myPollQuestion: {
    color: '#fff',
  },
  pollOptions: {
    gap: 8,
  },
  pollOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  pollOptionVoted: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  pollOptionDisabled: {
    opacity: 0.7,
  },
  pollOptionContent: {
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  pollOptionTextVoted: {
    color: '#007AFF',
    fontWeight: '600',
  },
  pollVotes: {
    fontSize: 12,
    color: '#666',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
  },
  pollBarVoted: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  pollFooter: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pollButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});