export const formatCurrency = (amount: number | string): string => {
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '₹ 0';

  const isInteger = numericAmount % 1 === 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: isInteger ? 0 : 2,
  }).format(numericAmount);

  return `₹ ${formatted}`;
};
