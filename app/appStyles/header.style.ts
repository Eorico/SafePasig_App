import { StyleSheet } from "react-native";

export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: '#0922b1',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

   overlay: {
    ...StyleSheet.absoluteFillObject, // fill entire header
    backgroundColor: 'rgba(59, 130, 246, 0.6)', // semi-transparent blue
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 5,
  },

  menuButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#DBEAFE',
    fontSize: 12,
    fontWeight: '400',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
});
