import { StyleSheet } from "react-native";

export const SosStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  sosSection: {
    marginVertical: 24,
  },
  sosButton: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FFFFFF',
  },
  sosButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#475569',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerNote: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  featuresCard: {
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  featureText: {
    fontSize: 14,
    color: '#065F46',
  },
});