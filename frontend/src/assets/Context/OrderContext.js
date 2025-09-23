import React, { createContext, useState } from 'react';
import orderService from '../services/orderService';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const userOrders = await orderService.getOrders();
    setOrders(userOrders);
  };

  const placeOrder = async (orderData) => {
    const newOrder = await orderService.placeOrder(orderData);
    setOrders((prev) => [...prev, newOrder]);
  };

  return (
    <OrderContext.Provider value={{ orders, fetchOrders, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
