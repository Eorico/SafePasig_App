export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Police':
      return '#DBEAFE';
    case 'Disaster':
      return '#FEE2E2';
    case 'Fire':
      return '#FFEDD5';
    case 'Medical':
      return '#FECACA';
    default:
      return '#F3F4F6';
  }
};