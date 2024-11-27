import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const dopamineData = [
    { timestamp: "2024-01-01T08:00:00", level: 15 },
    { timestamp: "2024-01-02T12:30:00", level: 22 },
    { timestamp: "2024-01-15T09:15:00", level: 18 },
    { timestamp: "2024-02-01T14:45:00", level: 25 },
    { timestamp: "2024-02-15T10:00:00", level: 12 },
    { timestamp: "2024-03-01T16:20:00", level: 28 },
    { timestamp: "2024-03-15T11:30:00", level: 20 },
    { timestamp: "2024-04-01T13:00:00", level: 17 },
    { timestamp: "2024-04-15T09:45:00", level: 23 },
    { timestamp: "2024-05-01T15:30:00", level: 19 },
    { timestamp: "2024-10-29T08:00:00", level: 21 },
    { timestamp: "2024-11-08T12:00:00", level: 26 },
    { timestamp: "2024-11-15T10:30:00", level: 16 },
  ];

const timeRanges = ['Day', 'Week', 'Month', 'Year'];

const calculateDatePoints = (dates, range) => {
  const uniqueDates = [...new Set(dates.map(d => d.split('T')[0]))];
  const format = (date) => {
    if (range === 'Day') {
      return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return new Date(date).toLocaleDateString([], { month: '2-digit', day: '2-digit' });
  };

  if (uniqueDates.length <= 5) {
    return uniqueDates.map(format);
  }

  const step = (uniqueDates.length - 1) / 4;
  return [0, 1, 2, 3, 4].map(i => format(uniqueDates[Math.round(i * step)]));
};

const calculateYPoints = (levels) => {
  const uniqueLevels = [...new Set(levels)].sort((a, b) => a - b);
  if (uniqueLevels.length <= 5) {
    return uniqueLevels;
  }

  const step = (uniqueLevels.length - 1) / 4;
  return [0, 1, 2, 3, 4].map(i => uniqueLevels[Math.round(i * step)]);
};

const createChartComponent = (dataPoints, range) => {
  const screenWidth = Dimensions.get('window').width;

  const sortedDataPoints = [...dataPoints].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const xPoints = calculateDatePoints(sortedDataPoints.map(d => d.timestamp), range);
  const yPoints = calculateYPoints(sortedDataPoints.map(d => d.level));

  const chartData = {
    labels: xPoints,
    datasets: [{
      data: sortedDataPoints.map(d => d.level),
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 2
    }]
  };

  return (
    <LineChart
      data={chartData}
      width={screenWidth - 60}
      height={220}
      chartConfig={{
        backgroundColor: '#e8d0ff',
        backgroundGradientFrom: '#e8d0ff',
        backgroundGradientTo: '#f3e6ff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
          borderRadius: 16
        },
        propsForDots: {
          r: '6',
          strokeWidth: '2',
          stroke: '#8b00ff'
        },
        yAxisMin: Math.min(...yPoints) - 1,
        yAxisMax: Math.max(...yPoints) + 1,
      }}
      bezier
      style={styles.chart}
      yLabelsOffset={10}
      xLabelsOffset={-10}
    />
  );
};

export default function AnalyticsScreen() {
  const [selectedRange, setSelectedRange] = useState('Month');

  const filteredData = useMemo(() => {
    const now = new Date();
    const rangeInDays = {
      'Day': 1,
      'Week': 7,
      'Month': 30,
      'Year': 365
    };
    const startDate = new Date(now.getTime() - rangeInDays[selectedRange] * 24 * 60 * 60 * 1000);
    return dopamineData.filter(d => new Date(d.timestamp) >= startDate);
  }, [selectedRange]);

  const chartComponent = useMemo(() => createChartComponent(filteredData, selectedRange), [filteredData, selectedRange]);

  const stats = useMemo(() => {
    const levels = filteredData.map(d => d.level);
    return {
      average: levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 0,
      max: levels.length ? Math.max(...levels) : 0,
      min: levels.length ? Math.min(...levels) : 0,
      peaks: levels.filter(l => l > 25),
      lows: levels.filter(l => l < 15)
    };
  }, [filteredData]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dopamine Level Analytics</Text>
      
      <View style={styles.rangeSelector}>
        {timeRanges.map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.rangeButton, selectedRange === range && styles.selectedRange]}
            onPress={() => setSelectedRange(range)}
          >
            <Text style={[styles.rangeButtonText, selectedRange === range && styles.selectedRangeText]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartSecondary}>
          {filteredData.length > 0 ? (
            chartComponent
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="alert-circle-outline" size={24} color="#888" />
              <Text style={styles.noDataText}>No Data Points Available</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Statistics:</Text>
        <Text>Average: {stats.average.toFixed(2)} pg/mL</Text>
        <Text>Maximum: {stats.max} pg/mL</Text>
        <Text>Minimum: {stats.min} pg/mL</Text>
        <Text>Number of peaks ({'>'}25 pg/mL): {stats.peaks.length}</Text>
        <Text>Number of lows ({'<'}15 pg/mL): {stats.lows.length}</Text>
      </View>

      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Raw Data:</Text>
        {filteredData.map((data, index) => (
          <Text key={index}>
            {new Date(data.timestamp).toLocaleString()}: {data.level} pg/mL
          </Text>
        ))}
      </View>
    </ScrollView>
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
  rangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedRange: {
    backgroundColor: '#8b00ff',
  },
  rangeButtonText: {
    color: '#333',
  },
  selectedRangeText: {
    color: '#fff',
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
  chartSecondary: {
    backgroundColor: '#e8d0ff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    width: Dimensions.get('window').width - 60,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#888',
    marginTop: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataContainer: {
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});