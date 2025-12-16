// post API服务

// 获取post列表
export const getProducts = async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  return response.json();
};

// 搜索post
export const searchProducts = async (keyword: string) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${keyword}`);
  return response.json();
};