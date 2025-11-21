import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';

interface HeartbeatProps {
  isPlaying: boolean;
  bpm: number;
}

const Heartbeat: React.FC<HeartbeatProps> = ({ isPlaying, bpm }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPlaying && bpm > 0) {
      const duration = (60 / bpm) * 1000; // Duração de uma batida em ms
      scale.value = withRepeat(
        withTiming(1.3, { duration: duration / 2 }),
        -1, // Repete infinitamente
        true // Faz o efeito reverso (yoyo)
      );
    } else {
      scale.value = withTiming(1, { duration: 300 }); // Retorna ao normal
    }
  }, [isPlaying, bpm, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Heart size={48} color="#c0392b" fill="#e74c3c" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Heartbeat;
