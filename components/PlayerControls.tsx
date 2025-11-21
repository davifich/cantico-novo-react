import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AVPlaybackStatus } from 'expo-av'; // Corrigido
import { Play, Pause, Rewind, FastForward } from 'lucide-react-native';

interface PlayerControlsProps {
  status?: AVPlaybackStatus; 
  onPlayPause: () => void;
  onSkip: (seconds: number) => void;
}

const formatTime = (millis: number) => {
  if (!millis) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = ({ status, onPlayPause, onSkip }) => {
  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 0;

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={() => onSkip(-10)} style={styles.controlButton}>
          <Rewind size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onPlayPause} style={[styles.controlButton, styles.playButton]}>
          {isPlaying ? (
            <Pause size={38} color="black" fill="black" />
          ) : (
            <Play size={38} color="black" fill="black" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => onSkip(10)} style={styles.controlButton}>
          <FastForward size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerControls;
