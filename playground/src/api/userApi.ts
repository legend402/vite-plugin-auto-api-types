// 用户API服务

// 获取用户列表
export const getUsers = async (): Promise<Users> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  return response.json();
};

// 获取单个用户
export const getUserById = async (id: number) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return response.json();
};

export const getSysConfig = async () => {
  const response = await fetch('http://192.168.110.121:3000/prod/sys/SystemVersion/api')
  return response.json();
}