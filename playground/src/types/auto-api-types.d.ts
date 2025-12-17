// 自动生成的API类型声明 - 2025/12/17 09:18:35

/* eslint-disable */

declare global {

type Api_posts = {
  userId: number;
  id: number;
  title: string;
  body: string;
}[];


type Api_users = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}[];


}

export {};