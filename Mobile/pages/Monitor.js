import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@dopamine_data';
const DATA_INTERVAL = 1000; // 1 second
const DATA_RETENTION = 600000; // 10 minutes

const generateRealisticData = (lastLevel) => {
  const baseLevel = lastLevel || 17.5;
  const change = (Math.random() - 0.5) * 2; // Change between -1 and 1
  let newLevel = baseLevel + change;
  newLevel = Math.max(0, Math.min(30, newLevel)); // Clamp between 0 and 30
  return parseFloat(newLevel.toFixed(2));
};

export default function MonitorScreen() {
  const [data, setData] = useState([]);
  const lastLevelRef = useRef(17.5);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    const interval = setInterval(() => {
      const now = Date.now();
      const newLevel = generateRealisticData(lastLevelRef.current);
      lastLevelRef.current = newLevel;

      setData(prevData => {
        const newData = [
          ...prevData.filter(item => now - item.timestamp < DATA_RETENTION),
          { timestamp: now, level: newLevel }
        ];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData)).catch(error => {
          console.error('Error saving data:', error);
        });
        return newData;
      });
    }, DATA_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: [], // Empty array for x-axis labels
    datasets: [{
      data: data.length > 0 ? data.slice(-60).map(item => item.level) : [17.5]
    }]
  };

  const currentLevel = data.length > 0 ? data[data.length - 1].level : 17.5;
  let statusColor = '#4CAF50'; // Green for normal
  if (currentLevel < 5 || currentLevel > 30) {
    statusColor = '#F44336'; // Red for danger zone
  } else if (currentLevel < 15 || currentLevel > 20) {
    statusColor = '#FFC107'; // Yellow for borderline
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dopamine Monitor</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#e8d0ff',
            backgroundGradientFrom: '#e8d0ff',
            backgroundGradientTo: '#f3e6ff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#8b00ff' },
            yAxisSuffix: ' pg/mL',
            yAxisInterval: 6,
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
          withHorizontalLines={true}
          withVerticalLines={false}
          withDots={false}
          yAxisLabel=""
          fromZero
          yLabels={['0', '6', '12', '18', '24', '30']}
        />
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Current Level:</Text>
        <Text style={[styles.statusValue, { color: statusColor }]}>{currentLevel.toFixed(2)} pg/mL</Text>
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Normal (15-20 pg/mL)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Borderline (5-15 or 20-30 pg/mL)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Danger Zone ({'<'}5 or {'>'}30 pg/mL)</Text>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    marginRight: 10,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
  },
});