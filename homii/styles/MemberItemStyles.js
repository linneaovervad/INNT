import { StyleSheet } from "react-native";

const MemberItemStyles = StyleSheet.create({
    memberItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: "#D5F5E3",
      borderRadius: 8,
      marginBottom: 10,
    },
    memberInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    memberText: {
      fontSize: 16,
      color: "#196F3D",
    },
    colorIndicator: {
      width: 15,
      height: 15,
      borderRadius: 7.5,
      marginRight: 10,
    },
  });

  export default MemberItemStyles;