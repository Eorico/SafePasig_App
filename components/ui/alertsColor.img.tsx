export const getAlertColor = (alert: any) => {
  const text = `${alert.title} ${alert.category} ${alert.description}`.toLowerCase();

  if (
    alert.type === 'critical' ||
    text.includes('critical') ||
    text.includes('evacuate') ||
    text.includes('landfall')
  ) {
    return ALERT_COLORS.critical;  
  }

  if (
    text.includes('warning') ||
    text.includes('typhoon') ||
    text.includes('storm')
  ) {
    return ALERT_COLORS.warning;  
  }

  if (
    alert.type === 'fire' ||
    text.includes('fire')
  ) {
    return ALERT_COLORS.fire;  
  }

  return ALERT_COLORS.info;  // Always return actual color code
};

export const ALERT_COLORS: any = {
  critical: '#DC2626',
  warning: '#F97316',
  fire: '#F59E0B',
  info: '#2563EB',
};