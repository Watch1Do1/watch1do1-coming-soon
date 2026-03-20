export const bigCommerceService = {
    createCart: async (items: any[]) => {
        return { cartId: 'mock_cart_id' };
    },
    searchInventory: async (query: string) => {
        return []; // Mock empty inventory for now
    }
};
