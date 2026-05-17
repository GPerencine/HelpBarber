export const getFirestore = jest.fn();
export const collection = jest.fn();
export const getDocs = jest.fn(() => ({
  docs: [{ id: '1', data: () => ({}) }],
}));
