export interface Store {
    storeID: string;
    storeName: string;
    isActive: number;
    images: {
      banner: string;
      logo: string;
      icon: string;
    };
  }
  
export type Stores = Store[];