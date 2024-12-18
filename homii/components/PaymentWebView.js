import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentWebView({ route }) { // Modtager route som prop
  const { url } = route.params; // Henter url fra route

  return (
    <View style={styles.container}>
      <WebView // Viser en WebView med url fra route
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

const styles = StyleSheet.create({ // Styles
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
});
