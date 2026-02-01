import { StyleSheet } from "react-native";

export const drawerStyles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB', // light gray background for subtle contrast
  },

  // Section card style
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 10,
    color: '#111827',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F3F4F6', // subtle row background
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },

  rowText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#0922b1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
});
