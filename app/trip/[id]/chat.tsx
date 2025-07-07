import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../../hooks/useTripData';
import { useAuth } from '../../../components/contexts/AuthContext';
import { ChatRoom } from '../../../components/trip/ChatRoom';
import { ChatMessage, PollData } from '../../../lib/types';

const ChatTabScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trip, addChatMessage } = useTrip(id);
  const { user } = useAuth();

  if (!trip || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSendMessage = async (messageData: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    try {
      await addChatMessage(newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreatePoll = async (pollData: Omit<PollData, 'id' | 'voters'>) => {
    const poll: PollData = {
      ...pollData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      voters: {},
    };

    const pollMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      poll,
      createdAt: new Date(),
    };

    try {
      await addChatMessage(pollMessage);
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  const handleVotePoll = async (messageId: string, pollId: string, optionId: string) => {
    try {
      // Find the message with the poll
      const message = trip.chatMessages?.find(m => m.id === messageId);
      if (!message || !message.poll) return;

      // Update poll with the vote
      const updatedPoll = { ...message.poll };
      
      // Remove previous vote if exists
      const previousVote = updatedPoll.voters[user.uid];
      if (previousVote) {
        const previousOption = updatedPoll.options.find(o => o.id === previousVote);
        if (previousOption) {
          previousOption.votes = Math.max(0, previousOption.votes - 1);
        }
      }

      // Add new vote
      updatedPoll.voters[user.uid] = optionId;
      const newOption = updatedPoll.options.find(o => o.id === optionId);
      if (newOption) {
        newOption.votes += 1;
      }

      // Update the message
      const updatedMessage = { ...message, poll: updatedPoll };
      
      // Update chat messages array
      const updatedMessages = trip.chatMessages.map(m => 
        m.id === messageId ? updatedMessage : m
      );

      // Update trip with new messages (this would need to be implemented in the trip service)
      // For now, we'll just log it
      console.log('Poll vote updated:', updatedPoll);
      
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ChatRoom
        messages={trip.chatMessages || []}
        onSendMessage={handleSendMessage}
        onCreatePoll={handleCreatePoll}
        onVotePoll={handleVotePoll}
        currentUserId={user.uid}
        currentUserName={user.displayName || 'Anonymous'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ChatTabScreen;