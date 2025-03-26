import React, { useState, useEffect } from 'react';
import { CheckCircle2, Truck, Package, Printer, Warehouse, X, Info, ShoppingBag, MapPin, RefreshCw, PlusCircle, Upload, Save } from 'lucide-react';

// 인쇄 유형 정의
const PrintTypes = {
  LASER: '레이저 인쇄',
  TRANSFER: '전사 인쇄',
  NO_PRINT: '인쇄 없음',
  SCREEN: '스크린 인쇄',
  DIGITAL: '디지털 인쇄'
};

// 배송 방법 정의
const DeliveryMethods = {
  DIRECT_PICKUP: '직접 인수',
  COURIER: '택배',
  QUICK_SERVICE: '퀵 서비스'
};

// 담당자 목록
const staff = [
  { id: 1, name: '김담당', department: '생산팀' },
  { id: 2, name: '이매니저', department: '영업팀' },
  { id: 3, name: '박실장', department: '디자인팀' },
  { id: 4, name: '최사원', department: '배송팀' }
];

// 현재 로그인한 사용자 (예시)
const currentUser = staff[0];

// 초기 데이터
const initialProducts = [
  {
    id: 'P001',
    name: '기업 노트북 가방',
    client: 'ABC 기업',
    quantity: 500,
    printType: PrintTypes.LASER,
    deliveryMethod: DeliveryMethods.COURIER,
    manager: staff[0],
    stages: [
      { name: '입고', completed: true, date: '2024-03-25', updatedBy: staff[0] },
      { name: '인쇄 컨펌', completed: true, date: '2024-03-26', updatedBy: staff[0] },
      { name: '인쇄 중', completed: true, date: '2024-03-27', updatedBy: staff[0] },
      { name: '포장', completed: true, date: '2024-03-28', updatedBy: staff[0] },
      { name: '발송', completed: true, date: '2024-03-29', updatedBy: staff[0] }
    ]
  },
  {
    id: 'P002',
    name: '판촉용 우산',
    client: '삼성전자',
    quantity: 200,
    printType: PrintTypes.TRANSFER,
    deliveryMethod: DeliveryMethods.DIRECT_PICKUP,
    manager: staff[2],
    stages: [
      { name: '입고', completed: true, date: '2024-03-24', updatedBy: staff[2] },
      { name: '인쇄 컨펌', completed: true, date: '2024-03-26', updatedBy: staff[0] },
      { name: '인쇄 중', completed: false, date: null, updatedBy: null },
      { name: '포장', completed: false, date: null, updatedBy: null },
      { name: '발송', completed: false, date: null, updatedBy: null }
    ]
  }
];

const ProductStatusTracker = () => {
  // 상태 변수들
  const [products, setProducts] = useState(initialProducts);
  const [completedShipments, setCompletedShipments] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    client: '',
    quantity: 1,
    printType: PrintTypes.LASER,
    deliveryMethod: DeliveryMethods.COURIER,
    manager: currentUser
  });
  
  // 초기화
  useEffect(() => {
    // 발송 완료된 상품 찾기
    const completed = initialProducts
      .filter(product => {
        const lastStage = product.stages[product.stages.length - 1];
        return lastStage.completed;
      })
      .slice(0, 5);
    
    setCompletedShipments(completed);
  }, []);

  // 상태 업데이트 함수
  const handleStatusUpdate = (productId, stageIndex) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          const updatedStages = [...product.stages];
          const newStatus = !updatedStages[stageIndex].completed;
          
          updatedStages[stageIndex] = {
            ...updatedStages[stageIndex],
            completed: newStatus,
            date: newStatus ? new Date().toISOString().split('T')[0] : null,
            updatedBy: currentUser
          };
          
          // 발송 단계 처리
          if (stageIndex === updatedStages.length - 1) {
            if (newStatus) {
              // 발송 완료되면 목록에 추가
              const updatedProduct = { ...product, stages: updatedStages };
              setCompletedShipments(prev => {
                const exists = prev.some(p => p.id === product.id);
                if (exists) return prev;
                return [updatedProduct, ...prev].slice(0, 5);
              });
            } else {
              // 발송 취소되면 목록에서 제거
              setCompletedShipments(prev => 
                prev.filter(p => p.id !== product.id)
              );
            }
          }
          
          return { ...product, stages: updatedStages };
        }
        return product;
      })
    );
  };
  
  // 새 상품 ID 생성
  const generateProductId = () => {
    const lastId = products.length > 0 
      ? parseInt(products[products.length - 1].id.replace('P', ''), 10) 
      : 0;
    return `P${String(lastId + 1).padStart(3, '0')}`;
  };
  
  // 수량 유효성 검사
  const validateQuantity = (value) => {
    const quantity = parseInt(value);
    return !isNaN(quantity) && quantity > 0 && quantity <= 10000;
  };
  
  // 새 상품 입력 필드 변경
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };
  
  // 담당자 선택 변경
  const handleManagerChange = (e) => {
    const selectedStaffId = parseInt(e.target.value);
    const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
    setNewProduct(prev => ({ ...prev, manager: selectedStaffMember }));
  };
  
  // 새 상품 추가
  const handleAddProduct = () => {
    // 필수 필드 검증
    if (!newProduct.name || !newProduct.client) {
      alert('상품명과 클라이언트는 필수 입력 항목입니다.');
      return;
    }
    
    // 수량 검증
    if (!validateQuantity(newProduct.quantity)) {
      alert('수량은 1~10000 사이의 숫자여야 합니다.');
      return;
    }

    const productId = generateProductId();
    const today = new Date().toISOString().split('T')[0];
    
    const product = {
      ...newProduct,
      id: productId,
      stages: [
        { name: '입고', completed: true, date: today, updatedBy: currentUser },
        { name: '인쇄 컨펌', completed: false, date: null, updatedBy: null },
        { name: '인쇄 중', completed: false, date: null, updatedBy: null },
        { name: '포장', completed: false, date: null, updatedBy: null },
        { name: '발송', completed: false, date: null, updatedBy: null }
      ]
    };

    setProducts(prev => [...prev, product]);
    
    // 폼 초기화
    setNewProduct({
      name: '',
      client: '',
      quantity: 1,
      printType: PrintTypes.LASER,
      deliveryMethod: DeliveryMethods.COURIER,
      manager: currentUser
    });
    
    setShowAddForm(false);
  };
  
  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    setFileUploadError('');
    const file = e.target.files[0];
    if (!file) return;

    alert('파일 업로드 기능은 실제 구현 시 파일 처리 라이브러리가 필요합니다.');
    setShowUploadForm(false);
  };

  // 아이콘 가져오기
  const stageIcons = {
    '입고': <Warehouse />,
    '인쇄 컨펌': <CheckCircle2 />,
    '인쇄 중': <Printer />,
    '포장': <Package />,
    '발송': <Truck />
  };

  // 아이콘 함수
  const getPrintTypeIcon = (printType) => {
    switch (printType) {
      case PrintTypes.LASER: return <Printer className="text-blue-500" />;
      case PrintTypes.TRANSFER: return <Info className="text-green-500" />;
      case PrintTypes.NO_PRINT: return <X className="text-red-500" />;
      case PrintTypes.SCREEN: return <Printer className="text-purple-500" />;
      case PrintTypes.DIGITAL: return <Printer className="text-orange-500" />;
      default: return <Printer />;
    }
  };

  // 아이콘 함수
  const getDeliveryMethodIcon = (deliveryMethod) => {
    switch (deliveryMethod) {
      case DeliveryMethods.DIRECT_PICKUP: return <ShoppingBag className="text-blue-500" />;
      case DeliveryMethods.COURIER: return <Truck className="text-green-500" />;
      case DeliveryMethods.QUICK_SERVICE: return <MapPin className="text-red-500" />;
      default: return <Truck />;
    }
  };

  // 진행 중인 상품 목록 (발송 완료되지 않은 상품)
  const uncompletedProducts = products.filter(product => 
    !product.stages[product.stages.length - 1].completed
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">판촉물 생산 추적 대시보드</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <PlusCircle size={18} />
            <span className="text-sm">신규 상품 추가</span>
          </button>
          
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center space-x-2 p-2 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200"
          >
            <Upload size={18} />
            <span className="text-sm">파일에서 가져오기</span>
          </button>
          
          <button
            onClick={() => {
              setIsUpdating(true);
              setTimeout(() => setIsUpdating(false), 500);
            }}
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isUpdating ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RefreshCw size={18} className={isUpdating ? "animate-spin" : ""} />
            <span className="text-sm">
              {isUpdating ? '업데이트 중...' : '상태 업데이트'}
            </span>
          </button>
        </div>
      </div>
      
      {/* 발송 완료된 상품 표시 */}
      {completedShipments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-green-700">최근 발송 완료 상품</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {completedShipments.map(product => (
              <div key={`completed-${product.id}`} className="flex-shrink-0 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="text-green-600" size={16} />
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.client}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {product.deliveryMethod} · {product.stages[product.stages.length - 1].date}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleStatusUpdate(product.id, product.stages.length - 1)}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  발송 취소
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 새 상품 추가 폼 */}
      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">신규 상품 추가</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="상품명 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">클라이언트 *</label>
              <input
                type="text"
                name="client"
                value={newProduct.client}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="클라이언트명 입력"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수량 *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                max="10000"
                value={newProduct.quantity}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="수량 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
              <select
                name="manager"
                value={newProduct.manager ? newProduct.manager.id : ''}
                onChange={handleManagerChange}
                className="w-full p-2 border rounded"
              >
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.department})
                    {person.id === currentUser.id ? ' (나)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인쇄 타입</label>
              <select
                name="printType"
                value={newProduct.printType}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
              >
                {Object.entries(PrintTypes).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배송 방법</label>
              <select
                name="deliveryMethod"
                value={newProduct.deliveryMethod}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
              >
                {Object.entries(DeliveryMethods).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <Save size={18} className="mr-1" /> 저장
            </button>
          </div>
        </div>
      )}

      {/* 파일 업로드 폼 */}
      {showUploadForm && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">파일에서 상품 가져오기</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              CSV 또는 Excel 파일을 업로드하세요. 파일은 다음 열을 포함해야 합니다:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>name (필수): 상품명</li>
              <li>client (필수): 클라이언트</li>
              <li>quantity (선택): 수량 (1~10000 사이의 숫자, 입력하지 않으면 기본값 1)</li>
              <li>manager_id (선택): 담당자 ID (1~4, 입력하지 않으면 랜덤 배정)</li>
              <li>printType (선택): 인쇄 타입 (레이저 인쇄, 전사 인쇄, 인쇄 없음 등)</li>
              <li>deliveryMethod (선택): 배송 방법 (직접 인수, 택배, 퀵 서비스)</li>
            </ul>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">클릭하여 파일 선택</span></p>
                  <p className="text-xs text-gray-500">CSV 또는 Excel 파일 (XLSX, XLS)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {fileUploadError && (
              <div className="text-red-500 text-sm mt-2">{fileUploadError}</div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowUploadForm(false);
                setFileUploadError('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      {/* 제품 목록 - 발송되지 않은 상품만 표시 */}
      {uncompletedProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          현재 진행 중인 제품이 없습니다.
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2">당일 발송 진행중인 판촉물</h2>
          {uncompletedProducts.map(product => (
            <div key={product.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-gray-500">클라이언트: {product.client}</p>
                  <p className="text-gray-500">수량: {product.quantity.toLocaleString()}개</p>
                  <p className="text-gray-500">담당자: {product.manager.name} ({product.manager.department})</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-600 mb-2">제품 ID: {product.id}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-gray-100 p-2 rounded-md">
                      {getPrintTypeIcon(product.printType)}
                      <span className="text-sm ml-1">{product.printType}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 p-2 rounded-md">
                      {getDeliveryMethodIcon(product.deliveryMethod)}
                      <span className="text-sm ml-1">{product.deliveryMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 items-center overflow-x-auto pb-4">
                {product.stages.map((stage, index) => (
                  <div key={stage.name} className="flex flex-col items-center">
                    <button 
                      onClick={() => handleStatusUpdate(product.id, index)}
                      className={`p-2 rounded-full ${
                        stage.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      } hover:bg-blue-100 hover:text-blue-600 transition-colors`}
                      title={stage.completed ? '완료 취소하기' : '완료로 표시하기'}
                    >
                      {stageIcons[stage.name]}
                    </button>
                    <span className={`text-xs mt-1 ${stage.completed ? 'text-green-600' : 'text-gray-400'}`}>
                      {stage.name}
                    </span>
                    {stage.date && (
                      <span className="text-xs text-gray-500 mt-1">
                        {stage.date}
                      </span>
                    )}
                    {stage.updatedBy && (
                      <span className="text-xs text-gray-500 mt-1">
                        {stage.updatedBy.name}
                      </span>
                    )}
                    {index < product.stages.length - 1 && (
                      <div className={`h-8 w-0.5 ${stage.completed ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ProductStatusTracker;