// exampleData.js

const today = new Date().toISOString().split('T')[0];
const getRandomDate = () => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const productsData = [
  { id: 1, product_name: "Milk", product_price: 3.49 },
  { id: 2, product_name: "Bread", product_price: 2.99 },
  { id: 3, product_name: "Eggs", product_price: 4.99 },
  { id: 4, product_name: "Butter", product_price: 2.50 },
  { id: 5, product_name: "Cheese", product_price: 5.00 },
  { id: 6, product_name: "Apples", product_price: 1.20 },
  { id: 7, product_name: "Bananas", product_price: 0.99 },
  { id: 8, product_name: "Chicken Breast", product_price: 7.50 },
  { id: 9, product_name: "Orange Juice", product_price: 4.00 },
  { id: 10, product_name: "Cereal", product_price: 3.99 },
  { id: 11, product_name: "Tomatoes", product_price: 2.80 },
  { id: 12, product_name: "Potatoes", product_price: 3.00 },
  { id: 13, product_name: "Onions", product_price: 1.50 },
  { id: 14, product_name: "Garlic", product_price: 1.99 },
  { id: 15, product_name: "Lettuce", product_price: 1.99 },
  { id: 16, product_name: "Yogurt", product_price: 6.49 },
  { id: 17, product_name: "Rice", product_price: 2.75 },
  { id: 18, product_name: "Pasta", product_price: 1.89 },
];

const products = productsData.map((product, index) => ({
  ...product,
  product_updateDate: index < productsData.length / 4 ? today : getRandomDate()
}));

export const customers = [
  { id: 1, customer_name: "John Doe", customer_totaldebt: 25.00 },
  { id: 2, customer_name: "Jane Smith", customer_totaldebt: 0.00 },
  { id: 3, customer_name: "Bob Johnson", customer_totaldebt: 50.00 },
  { id: 4, customer_name: "Alice Brown", customer_totaldebt: 75.00 },
  { id: 5, customer_name: "Charlie Davis", customer_totaldebt: 20.00 },
];

export const receipts = [
  { id: 1, customer_id: 1, initialDebt: 50, remainingDebt: 25, dateCreated: "2024-07-01", dateLastPayment: "2024-07-10", isPaid: false },
  { id: 2, customer_id: 2, initialDebt: 75, remainingDebt: 0, dateCreated: "2024-07-02", dateLastPayment: "2024-07-12", isPaid: true },
  { id: 3, customer_id: 3, initialDebt: 100, remainingDebt: 50, dateCreated: "2024-07-03", dateLastPayment: "2024-07-13", isPaid: false },
  { id: 4, customer_id: 4, initialDebt: 30, remainingDebt: 0, dateCreated: "2024-07-04", dateLastPayment: "2024-07-14", isPaid: true },
  { id: 5, customer_id: 5, initialDebt: 20, remainingDebt: 20, dateCreated: "2024-07-05", dateLastPayment: null, isPaid: false },
];

export { products };
