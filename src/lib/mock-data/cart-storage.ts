import type { CartItem } from '@/types/common'

export class LocalStorageCart {
  private storageKey = 'fitbox-cart'

  getItems(): CartItem[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []

      const items = JSON.parse(stored)
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }))
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error)
      return []
    }
  }

  setItems(items: CartItem[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }

  addItem(item: CartItem): void {
    const items = this.getItems()
    const existingIndex = items.findIndex(i => i.meal.id === item.meal.id)

    if (existingIndex >= 0) {
      // Update existing item quantity
      items[existingIndex].quantity += item.quantity
    } else {
      // Add new item
      items.push(item)
    }

    this.setItems(items)
  }

  updateItem(mealId: string, quantity: number): void {
    const items = this.getItems()
    const itemIndex = items.findIndex(i => i.meal.id === mealId)

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0
        items.splice(itemIndex, 1)
      } else {
        // Update quantity
        items[itemIndex].quantity = quantity
      }
      this.setItems(items)
    }
  }

  removeItem(mealId: string): void {
    const items = this.getItems()
    const filteredItems = items.filter(i => i.meal.id !== mealId)
    this.setItems(filteredItems)
  }

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.storageKey)
  }

  getItemCount(): number {
    return this.getItems().reduce((total, item) => total + item.quantity, 0)
  }

  getSubtotal(): number {
    return this.getItems().reduce((total, item) => total + (item.meal.price * item.quantity), 0)
  }
}