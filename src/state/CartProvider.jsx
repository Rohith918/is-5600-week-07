import React, { useReducer, useContext } from 'react'

// Initialize the context
const CartContext = React.createContext()

// Definte the default state
const initialState = {
  itemsById: {},
  allItems: [],
}

// Define reducer actions
const ADD_ITEM = 'ADD_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const UPDATE_ITEM_QUANTITY = 'UPDATE_ITEM_QUANTITY'

// Define the reducer
const cartReducer = (state, action) => {
  const { payload } = action;
  switch (action.type) {
    case ADD_ITEM:
      console.log({state, action})
      const newState = {
        ...state,
        itemsById: {
          ...state.itemsById,
          [payload._id]: {
            ...payload,
            quantity: state.itemsById[payload._id]
              ? state.itemsById[payload._id].quantity + 1
              : 1,
          },
        },
        // Use `Set` to remove all duplicates
        allItems: Array.from(new Set([...state.allItems, action.payload._id])),
      };
      return newState
    case REMOVE_ITEM:
      const updatedState = {
        ...state,
        itemsById: Object.entries(state.itemsById)
          .filter(([key, value]) => key !== action.payload._id)
          .reduce((obj, [key, value]) => {
            obj[key] = value
            return obj
          }, {}),
        allItems: state.allItems.filter(
          (itemId) => itemId !== action.payload._id
        ),
      }
      return updatedState
    case UPDATE_ITEM_QUANTITY:
      {
        const { id, quantity } = payload;
        const existing = state.itemsById[id] || { _id: id, quantity: 0 };
        const newQuantity = (Number(existing.quantity) || 0) + Number(quantity);

        // If the resulting quantity is <= 0 remove the item entirely
        if (newQuantity <= 0) {
          const removed = {
            ...state,
            itemsById: Object.entries(state.itemsById)
              .filter(([key]) => key !== id)
              .reduce((obj, [key, value]) => {
                obj[key] = value
                return obj
              }, {}),
            allItems: state.allItems.filter((itemId) => itemId !== id),
          }
          return removed
        }

        const updated = {
          ...state,
          itemsById: {
            ...state.itemsById,
            [id]: {
              ...existing,
              quantity: newQuantity,
            },
          },
          allItems: Array.from(new Set([...state.allItems, id])),
        }
        return updated
      }
    
    default:
      return state
  }
}

// Define the provider
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Remove an item from the cart
  const removeFromCart = (product) => {
    dispatch({ type: REMOVE_ITEM, payload: product })
  }

  // Add an item to the cart
  const addToCart = (product) => {
    dispatch({ type: ADD_ITEM, payload: product })
  }

  // todo Update the quantity of an item in the cart
  const updateItemQuantity = (productId, quantity) => {
    dispatch({ type: UPDATE_ITEM_QUANTITY, payload: { id: productId, quantity } })
  }

  // todo Get the total price of all items in the cart
  const getCartTotal = () => {
    const items = Object.values(state.itemsById || {})
    const total = items.reduce((acc, item) => {
      const price = Number(item.price) || 0
      const qty = Number(item.quantity) || 0
      return acc + price * qty
    }, 0)
    return total
  }

  const getCartItems = () => {
    return state.allItems.map((itemId) => state.itemsById[itemId]) ?? [];
  }

  return (
    <CartContext.Provider
      value={{
        cartItems: getCartItems(),
        addToCart,
        updateItemQuantity,
        removeFromCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

const useCart = () => useContext(CartContext)

export { CartProvider, useCart }