export const getDashboardRouteByRole = (role?: string | null): string => {
  if (!role) return '/'; // Default fallback

  const upperRole = role.toUpperCase();

  switch (upperRole) {
    case 'CUSTOMER':
      return '/';

    case 'ORGANIZATION_OWNER':
    case 'SUPER_ADMIN':
    case 'PLATFORM_ADMIN':
    case 'ADMIN':
    case 'FRANCHISE_OWNER':
      return '/admin';

    case 'BRANCH_MANAGER':
      return '/manager';

    case 'KITCHEN_STAFF':
    case 'HEAD_CHEF':
    case 'CHEF':
    case 'KITCHEN_MANAGER':
      return '/staff';

    case 'INVENTORY_MANAGER':
    case 'OPERATIONS_MANAGER':
      return '/inventory';

    case 'DELIVERY_PARTNER':
    case 'DELIVERY_MANAGER':
      return '/delivery';

    case 'CASHIER':
    case 'POS_OPERATOR':
      return '/pos';

    default:
      return '/'; // Fallback to customer landing page
  }
};
