import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { connectWebSocket, sendWebSocketMessage, closeWebSocket } from './src/WebSocketService';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const App = () => {
  const [isOn, setIsOn] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(1);
  const [selectedGraph, setSelectedGraph] = useState<'power' | 'pressure' | 'speed'>('power');
  const [socketData, setSocketData] = useState('No data yet');

  useEffect(() => {
    connectWebSocket(
      (data) => setSocketData(data),
      () => console.log('WebSocket Açıldı'),
      () => console.log('WebSocket Kapandı'),
      (err) => console.log('WebSocket Hatası:', err)
    );

    return () => {
      closeWebSocket();
    };
  }, []);

  const handleFanSpeedChange = (speed: number) => {
    setFanSpeed(speed);
    sendWebSocketMessage(JSON.stringify({ type: 'set_fan_speed', value: speed }));
  };

  const toggleSwitch = () => {
    setIsOn((prev) => {
      const newValue = !prev;
      sendWebSocketMessage(JSON.stringify({ type: 'toggle_fan', value: newValue }));
      return newValue;
    });
  };

  const graphData: Record<'power' | 'pressure' | 'speed', number[]> = {
    power: [5, 6, 3, 7, 4],
    pressure: [2, 4, 3, 6, 5],
    speed: [10, 8, 6, 7, 9],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: () => '#0067FC',
    labelColor: () => '#333',
    style: { borderRadius: 16 },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#0067FC',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select the Results</Text>

      <View style={styles.graphButtons}>
        <TouchableOpacity
          style={[
            styles.graphButton,
            selectedGraph === 'power' && styles.activeGraphButton,
          ]}
          onPress={() => setSelectedGraph('power')}
        >
          <Text style={styles.graphButtonText}>Power Graph</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.graphButton,
            selectedGraph === 'pressure' && styles.activeGraphButton,
          ]}
          onPress={() => setSelectedGraph('pressure')}
        >
          <Text style={styles.graphButtonText}>Pressure Graph</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.graphButton,
            selectedGraph === 'speed' && styles.activeGraphButton,
          ]}
          onPress={() => setSelectedGraph('speed')}
        >
          <Text style={styles.graphButtonText}>Speed Graph</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Selected: {selectedGraph.charAt(0).toUpperCase() + selectedGraph.slice(1)} Graph</Text>
        <Text style={styles.resultLabel}>Incoming Data:</Text>
        <Text style={styles.resultText}>{socketData}</Text>
      </View>

      {isOn && (
        <LineChart
          data={{
            labels: ['0s', '1s', '2s', '3s', '4s'],
            datasets: [
              {
                data: graphData[selectedGraph],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>On/Off Button</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isOn ? '#0067FC' : '#f4f3f4'}
          onValueChange={toggleSwitch}
          value={isOn}
        />
      </View>

      {/* Adjust Fan Speed Title + Icon */}
      <View style={styles.fanLabelRow}>
        <Image
          source={require('./assets/ventilation-system.gif')}
          style={styles.fanLabelIcon}
          resizeMode="contain"
        />
        <Text style={styles.label}>Adjust Fan Speed</Text>
      </View>

      {/* Slider with icon on both sides */}
      <View style={styles.sliderRow}>
        <Image
          source={require('./assets/remove.gif')}
          style={styles.sliderIcon}
          resizeMode="contain"
        />
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={fanSpeed}
          onValueChange={(value) => handleFanSpeedChange(Math.round(value))}
          minimumTrackTintColor="#0067FC"
          maximumTrackTintColor="#aaa"
          thumbTintColor="#0067FC"
        />
        <Image
          source={require('./assets/add.gif')}
          style={styles.sliderIcon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  graphButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  graphButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  activeGraphButton: {
    backgroundColor: '#0067FC',
  },
  graphButtonText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: '600',
  },
  resultBox: {
    borderWidth: 1,
    borderColor: '#aaa',
    marginVertical: 10,
    borderRadius: 10,
    padding: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  fanLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fanLabelIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sliderIcon: {
    width: 30,
    height: 30,
    marginHorizontal: 8,
  },
});
