import { StyleSheet } from "react-native";

const NewChoreStyles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  dropdownButtonText: { fontSize: 16, color: "#333" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EBF5FB",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputField: {
    fontSize: 16,
    color: "black",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  description: {
    fontSize: 16,
    color: "black",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  takenImage: {
    width: "100%",
    height: 200,
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 8,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  flipButton: {
    justifyContent: "center",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 50,
    height: 50,
  },
  snapButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 50,
    height: 50,
  },
  snapButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  safeview: {
    flex: 1,
  },
  choreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  choreInfo: {
    flex: 1,
  },
  choreName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  choreAssigned: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  choreDeadline: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  choreActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 15,
  },
  dropdownContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
  },
  dropdownTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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

export default NewChoreStyles;

