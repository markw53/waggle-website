// src/utils/validation.ts
export const validation = {
  dogName: (name: string): boolean => {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z0-9\s'-]+$/.test(name);
  },
  
  age: (age: number): boolean => {
    return age >= 0 && age <= 25;
  },
  
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  postcode: (postcode: string): boolean => {
    return /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i.test(postcode);
  },
  
  phoneNumber: (phone: string): boolean => {
    return /^(\+44|0)[1-9]\d{9,10}$/.test(phone.replace(/\s/g, ''));
  }
};