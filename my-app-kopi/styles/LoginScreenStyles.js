import { StyleSheet } from "react-native";

const LoginScreenStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#FDFEFE",
      justifyContent: "center",
    },
    heading: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 30,
      textAlign: "center",
      color: "#2E4053",
    },
    input: {
      height: 50,
      borderColor: "#AAB7B8",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      backgroundColor: "#EBF5FB",
    },
    button: {
      backgroundColor: "#2874A6",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    signupText: {
      color: "#28B463",
      textAlign: "center",
      fontSize: 16,
    },
  });

  export default LoginScreenStyles;