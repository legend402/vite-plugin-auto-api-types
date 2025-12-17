import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getSysConfig, getUsers } from './api/userApi'
import { getProducts, searchProducts } from './api/productApi'

function App() {
  const [users, setUsers] = useState<Users>([]);
  const [products, setProducts] = useState<Posts>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取post列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('获取产品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索post
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      const data = await searchProducts(searchQuery);
      if (data) {
        setProducts([data]);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('搜索产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchUsers();
    fetchProducts();
    getSysConfig();
  }, []);

  return (
    <div className="App">
      <div className="header">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>API Type Generator Playground</h1>
      </div>

      <div className="content">
        {/* 用户管理区域 */}
        <div className="section">
          <h2>用户管理</h2>
          <button onClick={fetchUsers} disabled={loading}>
            {loading ? '加载中...' : '刷新用户列表'}
          </button>
          
          <div className="list">
            {users.map(user => (
              <div key={user.id} className="item">
                <strong>{user.name}</strong> {user.email}
              </div>
            ))}
          </div>
        </div>

        {/* post管理区域 */}
        <div className="section">
          <h2>post管理</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="搜索post..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch} disabled={loading}>
              搜索
            </button>
          </div>
          
          <button onClick={fetchProducts} disabled={loading}>
            {loading ? '加载中...' : '刷新post列表'}
          </button>
          
          <div className="list">
            {products.map(product => (
              <div key={product.id} className="item">
                <div>
                  <strong>{product.title}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>使用 <strong>vite-plugin-auto-api-types</strong> 插件自动生成API类型</p>
      </footer>
    </div>
  )
}

export default App
