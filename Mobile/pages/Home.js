import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const STORAGE_KEY = '@dopamine_data';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getDopamineStatus = (level) => {
  if (level < 5 || level > 30) return 'in the danger zone';
  if (level < 15 || level > 20) return 'approaching danger';
  return 'normal';
};

export default function HomeScreen() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const data = JSON.parse(storedData);
          const latestLevel = data[data.length - 1]?.level || 17.5;
          setCurrentLevel(latestLevel);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}, John Doe</Text>
      {currentLevel !== null && (
        <Text style={styles.levelInfo}>
          Your current dopamine level is{' '}
          <Text style={styles.levelValue}>{currentLevel.toFixed(2)}</Text> which is{' '}
          <Text style={styles.levelStatus}>{getDopamineStatus(currentLevel)}</Text>
        </Text>
      )}
      <Text style={styles.statusMessage}>
        You have been <Text style={styles.onTrack}>on track</Text> this week.
      </Text>

      <View style={styles.boxContainer}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text style={styles.boxTitle}>Analytics</Text>
          <Text style={styles.boxSubtitle}>Analyze your performance over time</Text>
          <Icon name="arrow-forward" size={24} color="#000" style={styles.boxIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('Monitor')}
        >
          <Text style={styles.boxTitle}>Monitor</Text>
          <Text style={styles.boxSubtitle}>See your current dopamine level in depth</Text>
          <Icon name="arrow-forward" size={24} color="#000" style={styles.boxIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  levelInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  levelValue: {
    fontWeight: 'bold',
  },
  levelStatus: {
    fontStyle: 'italic',
  },
  statusMessage: {
    fontSize: 18,
    marginBottom: 30,
  },
  onTrack: {
    color: 'green',
    fontWeight: 'bold',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'space-between',
    height: 150,
  },
  boxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boxSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  boxIcon: {
    alignSelf: 'flex-end',
  },
});