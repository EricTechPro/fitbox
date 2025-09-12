// Model exports
export { UserModel } from './user'
export { MealModel } from './meal'
export { WeeklyMenuModel, WeeklyMenuItemModel } from './weeklyMenu'
export { OrderModel, OrderItemModel } from './order'
export { DeliveryZoneModel } from './deliveryZone'
export { PaymentModel } from './payment'

export type {
  CreateUserData,
  UpdateUserData,
  UserWithAddresses,
  UserWithOrders,
} from './user'

export type {
  CreateMealData,
  UpdateMealData,
} from './meal'

export type {
  CreateWeeklyMenuData,
  UpdateWeeklyMenuData,
  WeeklyMenuWithItems,
  CreateWeeklyMenuItemData,
} from './weeklyMenu'

export type {
  CreateOrderData,
  UpdateOrderData,
  OrderWithRelations,
  PopularMeal,
} from './order'

export type {
  CreateDeliveryZoneData,
  UpdateDeliveryZoneData,
  PostalCodeValidationResult,
  ServiceabilityResult,
  DeliveryScheduleResult,
} from './deliveryZone'

export type {
  CreatePaymentData,
  UpdatePaymentData,
  PaymentWithOrder,
  PaymentStatistics,
} from './payment'

// Re-export Prisma generated types
export type {
  User,
  UserRole,
  Address,
  Meal,
  MealCategory,
  WeeklyMenu,
  WeeklyMenuItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  DeliveryZone,
  Payment,
  PaymentStatus,
} from '@prisma/client'