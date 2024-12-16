import { StyleSheet } from "react-native";

const HouseholdDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDFEFE",
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2E4053",
  },
  addUserContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#D6EAF8",
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#AAB7B8",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#EBF5FB",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2874A6",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  searchResultContainer: {
    padding: 10,
    backgroundColor: "#D4EFDF",
    borderRadius: 8,
    marginTop: 10,
  },
  resultText: {
    color: "#1E8449",
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28B463",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#5D6D7E",
    fontSize: 16,
    marginTop: 10,
  },
  colorLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorCircle: {
    borderColor: "#000",
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#D5F5E3",
    borderRadius: 8,
    marginBottom: 10,
  },
  memberText: {
    fontSize: 16,
    color: "#196F3D",
  },
  removeButton: {
    padding: 5,
  },
});

export default HouseholdDetailStyles;
