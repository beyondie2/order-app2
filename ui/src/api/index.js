const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 공통 fetch 함수
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '요청에 실패했습니다.');
  }

  return data;
}

// 메뉴 API
export const menuApi = {
  // 메뉴 목록 조회
  getAll: () => fetchApi('/menus'),
  
  // 메뉴 상세 조회
  getById: (id) => fetchApi(`/menus/${id}`),
  
  // 재고 수정
  updateStock: (id, stock) => fetchApi(`/menus/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  }),
};

// 옵션 API
export const optionApi = {
  // 옵션 목록 조회
  getAll: (menuId) => {
    const query = menuId ? `?menu_id=${menuId}` : '';
    return fetchApi(`/options${query}`);
  },
};

// 주문 API
export const orderApi = {
  // 주문 목록 조회
  getAll: (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchApi(`/orders${query}`);
  },
  
  // 주문 생성
  create: (items) => fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  }),
  
  // 주문 상세 조회
  getById: (id) => fetchApi(`/orders/${id}`),
  
  // 주문 상태 변경
  updateStatus: (id, status) => fetchApi(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

