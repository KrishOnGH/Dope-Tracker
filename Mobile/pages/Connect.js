import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ConnectScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>
          This page will host the area where the user can connect to their BCI chip. (Not yet developed)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 16,
    textAlign: 'center'
  },
});