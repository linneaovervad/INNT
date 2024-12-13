// components/PaymentWebView.js
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentWebView({ route, navigation }) {
  const { url } = route.params;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            color="#009b88"
            size="large"
            style={styles.loader}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});
