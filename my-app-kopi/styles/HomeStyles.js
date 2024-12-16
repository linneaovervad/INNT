import { StyleSheet } from "react-native";

const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDFEFE",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#EBF5FB",
    borderRadius: 8,
    marginBottom: 10,
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E4053",
  },
  taskDone: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  taskDeadline: {
    fontSize: 14,
    color: "gray",
  },
  taskAssigned: {
    fontSize: 14,
    color: "gray",
  },
  taskDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  choreImage: {
    width: 125,
    height: 175,
    marginTop: 10,
    borderRadius: 8,
  },
  enlargedImage: {
    width: 300,
    height: 400,
  },
});

export default HomeStyles;
