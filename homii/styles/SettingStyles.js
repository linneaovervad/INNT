import { StyleSheet } from "react-native";

const SettingStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#fff",
    },
    heading: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    label: {
      fontSize: 18,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 22,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 10,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: "80%",
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center",
      fontSize: 16,
    },
    input: {
      height: 40,
      borderColor: "gray",
      borderWidth: 1,
      paddingHorizontal: 10,
      marginBottom: 20,
      borderRadius: 5,
      width: "100%",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    button: {
      borderRadius: 5,
      padding: 10,
      elevation: 2,
      width: "45%",
      alignItems: "center",
    },
    buttonClose: {
      backgroundColor: "#bbb",
    },
    buttonDelete: {
      backgroundColor: "#FF6347",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
    },
  });

  export default SettingStyles;