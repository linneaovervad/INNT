import { StyleSheet } from "react-native";

const HouseholdListStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDFEFE",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2E4053",
  },
  createContainer: {
    flexDirection: "row",
    marginBottom: 20,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28B463",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  householdItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#AED6F1",
    borderRadius: 8,
    marginBottom: 10,
  },
  householdName: {
    fontSize: 18,
    color: "#1B4F72",
  },
  deleteButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#5D6D7E",
    fontSize: 16,
    marginTop: 20,
  },
});

export default HouseholdListStyles;
