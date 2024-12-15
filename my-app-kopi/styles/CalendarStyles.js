import { StyleSheet } from "react-native";

const CalendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  choresContainer: {
    marginTop: 20,
    flex: 1,
  },
  choresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  choreItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  choreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  choreText: {
    fontSize: 16,
    color: "#333",
  },
  choreImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 10,
  },
  enlargedImage: {
    width: 240,
    height: 240,
  },
  noChoresText: {
    fontSize: 16,
    color: "gray",
  },
  colorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
  flatList: {
    flex: 1,
  },
});

export default CalendarStyles;
