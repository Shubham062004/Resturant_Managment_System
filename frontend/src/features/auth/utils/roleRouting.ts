export const getDashboardRouteByRole = (role?: string | null): string => {
  if (!role) return '/profile'; // Default fallback if no role is provided

  const upperRole = role.toUpperCase();

  switch (upperRole) {
    case 'CUSTOMER':
      return '/profile';

    case 'SUPER_ADMIN':
    case 'PLATFORM_ADMIN':
      return '/super-admin';

    case 'ORGANIZATION_OWNER':
    case 'FRANCHISE_OWNER':
    case 'ADMIN':
    case 'SUPPORT_STAFF':
    case 'BRANCH_MANAGER':
      return '/admin';

    case 'KITCHEN_STAFF':
    case 'CHEF':
    case 'HEAD_CHEF':
    case 'KITCHEN_MANAGER':
      return '/kitchen';

    case 'CASHIER':
    case 'POS_OPERATOR':
      return '/pos';

    case 'DELIVERY_PARTNER':
    case 'DELIVERY_MANAGER':
      return '/delivery';

    case 'INVENTORY_MANAGER':
    case 'OPERATIONS_MANAGER':
      return '/admin/inventory';

    case 'RESERVATION_MANAGER':
      return '/admin/reservations';

    case 'MARKETING_MANAGER':
      return '/admin/campaigns';

    case 'ANALYTICS_MANAGER':
    case 'FINANCE_MANAGER':
      return '/admin/analytics';

    default:
      return '/profile';
  }
};
