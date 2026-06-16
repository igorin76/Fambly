import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Trash, 
  Shirt, 
  Save, 
  Edit,
  CheckCircle,
  Gift,
  ExternalLink,
  Tag,
  Users,
  UploadCloud,
  X,
  Image as ImageIcon,
  Check,
  RotateCcw
} from 'lucide-react';

export default function ShoppingListView() {
  const {
    shoppingItems,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCompletedShoppingItems,
    toggleAllShoppingItems,
    toggleCategoryShoppingItems,
    clothingLogistics,
    updateClothingLogistics,
    wishlist = [],
    addWishlistItem,
    deleteWishlistItem,
    updateWishlistItem,
    members = [],
    wishlistCategories = [],
    addWishlistCategory,
    deleteWishlistCategory,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState('supermercado'); 
  
  // Mobile Collapsible Forms States
  const [showAddShopItemMobile, setShowAddShopItemMobile] = useState(false);
  const [showAddWishItemMobile, setShowAddWishItemMobile] = useState(false);
  
  // Supermercado Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Frescos');

  // Estado edición tallas
  const [editingChildId, setEditingChildId] = useState(null);
  const [editedSize, setEditedSize] = useState('');
  const [editedNeeds, setEditedNeeds] = useState('');

  // Wishlist Form y Edición
  const [editingWishItem, setEditingWishItem] = useState(null);
  const [wishTitle, setWishTitle] = useState('');
  const [wishUrl, setWishUrl] = useState('');
  const [wishPrice, setWishPrice] = useState('');
  const [wishPhoto, setWishPhoto] = useState('');
  const [wishPhotoFileName, setWishPhotoFileName] = useState('');
  const [wishMemberIds, setWishMemberIds] = useState([]);
  const [hideFromTarget, setHideFromTarget] = useState(false);
  const [wishCategory, setWishCategory] = useState('');
  const [newWishCategory, setNewWishCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Estado de filtrado por categorías
  const [selectedFilterCategories, setSelectedFilterCategories] = useState([]);

  // Visor Lightbox para imágenes de la wishlist
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  // Categorías de wishlist guardadas en base de datos
  const existingWishCategories = wishlistCategories.map(c => c.name);

  const activeMember = members.find(m => m.firstName === currentUser);

  // Comprobar si hay otros administradores seleccionados en los destinatarios de la wishlist
  const otherAdminsSelected = members.filter(m => m.isAdmin && m.id !== activeMember?.id && wishMemberIds.includes(m.id));
  const showPrivacyToggle = activeMember?.isAdmin && otherAdminsSelected.length > 0;
  const otherAdminsNames = otherAdminsSelected.map(a => a.firstName).join(' y ');
  const toggleLabel = `Ocultar a ${otherAdminsNames} (Sorpresa 🎁)`;

  const filteredWishlist = wishlist.filter(item => {
    // Si el regalo está marcado para ocultarse del destinatario, y el destinatario es el miembro activo actual, lo ocultamos.
    if (item.hideFromTarget && activeMember && item.memberIds && item.memberIds.includes(activeMember.id)) {
      return false;
    }
    // Compatibilidad con campo memberId (legacy/singular)
    if (item.hideFromTarget && activeMember && item.memberId && item.memberId === activeMember.id) {
      return false;
    }

    if (selectedFilterCategories.length === 0) return true;
    return selectedFilterCategories.includes(item.category);
  });

  const categories = ['Frescos', 'Lácteos', 'Refrigerados', 'Despensa', 'Congelados', 'Limpieza', 'Higiene'];

  const itemsByCategory = (category) => {
    return shoppingItems.filter(item => item.category === category);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addShoppingItem(newItemName.trim(), newItemCategory);
    setNewItemName('');
    setShowAddShopItemMobile(false);
  };

  const handleStartEditChild = (child) => {
    setEditingChildId(child.id);
    setEditedSize(child.currentSize);
    setEditedNeeds(child.neededItems);
  };

  const handleSaveChildLogistics = (id) => {
    updateClothingLogistics(id, editedSize, editedNeeds);
    setEditingChildId(null);
  };

  // Manejo de la imagen desde el dispositivo
  const handleWishPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen supera el límite de 5 MB.");
      return;
    }

    setWishPhotoFileName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setWishPhoto(reader.result);
    };
  };

  const handleWishMemberToggle = (id) => {
    if (id === 'todos') {
      setWishMemberIds([]);
      setHideFromTarget(false);
      return;
    }

    let nextIds;
    if (wishMemberIds.includes(id)) {
      nextIds = wishMemberIds.filter(mid => mid !== id);
    } else {
      nextIds = [...wishMemberIds, id];
    }

    let finalIds = nextIds;
    if (nextIds.length === members.length) {
      finalIds = [];
    }
    setWishMemberIds(finalIds);

    // Si hay otro administrador seleccionado, activar hideFromTarget por defecto si es una nueva selección
    const activeMember = members.find(m => m.firstName === currentUser);
    const hasOtherAdmin = members.some(m => m.isAdmin && m.id !== activeMember?.id && finalIds.includes(m.id));
    if (hasOtherAdmin) {
      const hadOtherAdminBefore = members.some(m => m.isAdmin && m.id !== activeMember?.id && wishMemberIds.includes(m.id));
      if (!hadOtherAdminBefore) {
        setHideFromTarget(true);
      }
    } else {
      setHideFromTarget(false);
    }
  };

  const handleStartEditWishItem = (item) => {
    setEditingWishItem(item);
    setWishTitle(item.title);
    setWishUrl(item.url || '');
    setWishPrice(item.price > 0 ? String(item.price) : '');
    setWishPhoto(item.photoUrl || '');
    setWishPhotoFileName(item.photoUrl ? 'Imagen cargada' : '');
    const mIds = item.memberIds || (item.memberId ? [item.memberId] : []);
    setWishMemberIds(mIds);
    setHideFromTarget(item.hideFromTarget || false);
    setWishCategory(item.category || '');
    setShowNewCategoryInput(false);
    setNewWishCategory('');
    setShowAddWishItemMobile(true);
  };

  const handleCancelEditWishItem = () => {
    setEditingWishItem(null);
    setWishTitle('');
    setWishUrl('');
    setWishPrice('');
    setWishPhoto('');
    setWishPhotoFileName('');
    setWishMemberIds([]);
    setHideFromTarget(false);
    setWishCategory('');
    setNewWishCategory('');
    setShowNewCategoryInput(false);
    setShowAddWishItemMobile(false);
  };

  const handleAddWishItem = (e) => {
    e.preventDefault();
    if (!wishTitle.trim()) return;

    const itemData = {
      title: wishTitle.trim(),
      url: wishUrl.trim(),
      price: wishPrice ? Number(wishPrice) : 0,
      photoUrl: wishPhoto,
      memberIds: wishMemberIds.length > 0 ? wishMemberIds : null,
      memberId: wishMemberIds.length === 1 ? wishMemberIds[0] : null,
      category: wishCategory.trim() || null,
      hideFromTarget: hideFromTarget
    };

    if (editingWishItem) {
      updateWishlistItem(editingWishItem.id, itemData);
    } else {
      addWishlistItem(itemData);
    }

    handleCancelEditWishItem();
  };

  const handleCreateCategory = () => {
    const trimmed = newWishCategory.trim();
    if (trimmed) {
      if (!existingWishCategories.includes(trimmed)) {
        addWishlistCategory(trimmed);
      }
      setWishCategory(trimmed);
      setShowNewCategoryInput(false);
      setNewWishCategory('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Listas y Compras</h2>
          <p className="text-sm text-slate-500">Planifica la despensa de alimentos, las prendas de los niños y las ideas de regalos.</p>
        </div>
      </div>

      {/* SELECTOR SEGMENTADO */}
      <div className="segmented-container max-w-xl">
        <button
          onClick={() => setActiveTab('supermercado')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-btn ${
            activeTab === 'supermercado'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <ShoppingCart size={14} />
          <span className="hidden min-[360px]:inline">Supermercado</span>
          <span className="inline min-[360px]:hidden">Súper</span>
        </button>
        <button
          onClick={() => setActiveTab('ropa')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-btn ${
            activeTab === 'ropa'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Shirt size={14} />
          <span className="hidden min-[360px]:inline">Ropa y Tallas</span>
          <span className="inline min-[360px]:hidden">Ropa</span>
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 touch-btn ${
            activeTab === 'wishlist'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Gift size={14} />
          <span className="hidden min-[360px]:inline">Lista de Deseos</span>
          <span className="inline min-[360px]:hidden">Deseos</span>
        </button>
      </div>

      {activeTab === 'supermercado' && (
        
        /* SUPERMERCADO MÓDULO */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Botón para expandir formulario de añadir artículo en móvil */}
          <button
            type="button"
            onClick={() => setShowAddShopItemMobile(!showAddShopItemMobile)}
            className="lg:hidden flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all mb-1 shadow-sm touch-btn"
          >
            <Plus size={14} className={showAddShopItemMobile ? 'rotate-45 transition-transform' : 'transition-transform'} />
            {showAddShopItemMobile ? 'Cerrar Formulario' : 'Añadir Artículo Nuevo'}
          </button>

          {/* Backdrop para mobile bottom sheet */}
          {showAddShopItemMobile && (
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 lg:hidden animate-fadeIn"
              onClick={() => setShowAddShopItemMobile(false)}
            />
          )}

          {/* PANEL AÑADIR */}
          <div 
            className={`flat-card p-5 border border-slate-200/60 bg-white h-fit 
              fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 p-6 pb-10 max-h-[85vh] overflow-y-auto animate-slideUp
              lg:relative lg:inset-auto lg:z-0 lg:rounded-2xl lg:p-5 lg:pb-5 lg:max-h-none lg:overflow-visible lg:animate-fadeIn lg:shadow-sm
              ${showAddShopItemMobile ? 'block' : 'hidden lg:block'}`}
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 lg:border-none lg:pb-0 lg:mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Plus size={15} className="text-blue-500" /> Añadir Artículo
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddShopItemMobile(false)}
                className="lg:hidden text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1 touch-btn"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nombre del artículo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Leche desnatada..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoría</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewItemCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        newItemCategory === cat
                          ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer border-0"
              >
                Añadir Artículo
              </button>
            </form>
          </div>

          {/* LISTAS POR CATEGORÍAS */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Carrito de Compra</h3>
              {shoppingItems.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/40 shadow-sm">
                  <button
                    onClick={() => toggleAllShoppingItems(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-white transition-all duration-150 cursor-pointer border-0 bg-transparent"
                    title="Marcar todo como comprado"
                  >
                    <Check size={11} className="stroke-[2.5]" />
                    <span>Marcar todo</span>
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200" />
                  <button
                    onClick={() => toggleAllShoppingItems(false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-white transition-all duration-150 cursor-pointer border-0 bg-transparent"
                    title="Desmarcar todos los artículos"
                  >
                    <RotateCcw size={11} className="stroke-[2.5]" />
                    <span>Desmarcar todo</span>
                  </button>
                  {shoppingItems.some(i => i.completed) && (
                    <>
                      <div className="w-[1px] h-3 bg-slate-200" />
                      <button
                        onClick={clearCompletedShoppingItems}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-white transition-all duration-150 cursor-pointer border-0 bg-transparent"
                        title="Vaciar artículos comprados"
                      >
                        <Trash size={11} />
                        <span>Vaciar</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flat-card p-6 border border-slate-200/60 bg-white flex flex-col gap-6">
              {shoppingItems.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {categories.map((category) => {
                    const items = itemsByCategory(category);
                    if (items.length === 0) return null;
                    
                    const categoryColors = 
                      category === 'Frescos' ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' } :
                      category === 'Lácteos' ? { bg: 'bg-sky-50 text-sky-700 border-sky-100', dot: 'bg-sky-500' } :
                      category === 'Refrigerados' ? { bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', dot: 'bg-cyan-500' } :
                      category === 'Despensa' ? { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' } :
                      category === 'Congelados' ? { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' } :
                      category === 'Limpieza' ? { bg: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-500' } :
                      { bg: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' }; // Higiene

                    return (
                      <div key={category} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                          <span className={`w-2 h-2 rounded-full ${categoryColors.dot}`} />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                            {category}
                          </span>
                          
                          {/* Controles de marcación por categoría */}
                          <div className="flex items-center gap-0.5 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/20 ml-2">
                            <button
                              onClick={() => toggleCategoryShoppingItems(category, true)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white transition-all duration-150 cursor-pointer border-0 bg-transparent flex"
                              title={`Marcar todo en ${category} como comprado`}
                            >
                              <Check size={11} className="stroke-[2.5]" />
                            </button>
                            <button
                              onClick={() => toggleCategoryShoppingItems(category, false)}
                              className="p-1 rounded text-slate-400 hover:text-slate-650 hover:bg-white transition-all duration-150 cursor-pointer border-0 bg-transparent flex"
                              title={`Desmarcar todo en ${category}`}
                            >
                              <RotateCcw size={11} className="stroke-[2.5]" />
                            </button>
                          </div>
                          
                          <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryColors.bg}`}>
                            {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {items.map((item) => (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/80 group transition-all duration-200 ${
                                item.completed ? 'opacity-60 bg-slate-50/30' : ''
                              }`}
                            >
                              <label className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => toggleShoppingItem(item.id)}
                                  className="custom-checkbox"
                                />
                                <span className={`text-xs font-bold break-words pr-2 ${item.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700'}`}>
                                  {item.name}
                                </span>
                              </label>
                              <button
                                onClick={() => deleteShoppingItem(item.id)}
                                className="action-btn-mobile text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0 ml-1 touch-btn"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300 border border-slate-100">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-500">El carrito está vacío</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                    Añade artículos desde el formulario para planificar tu próxima compra familiar.
                  </p>
                </div>
              )}
            </div>
            
          </div>

        </div>
      )}

      {activeTab === 'ropa' && (
        
        /* MÓDULO ROPA NIÑOS */
        <div className="flat-card p-5 flex flex-col gap-5 border border-slate-200/60 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Shirt className="text-orange-500 h-4 w-4" /> Registro de tallas y logística de ropa
            </h3>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Control de temporada
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clothingLogistics.map((child) => {
              const isEditing = editingChildId === child.id;
              
              return (
                <div 
                  key={child.id}
                  className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 flex flex-col justify-between min-h-[290px] shadow-sm hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                        <h4 className="font-extrabold text-slate-700 text-sm">{child.childName}</h4>
                      </div>
                      
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEditChild(child)}
                          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                        >
                          <Edit size={12} />
                          Editar
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tallas de referencia</label>
                          <input
                            type="text"
                            value={editedSize}
                            onChange={(e) => setEditedSize(e.target.value)}
                            className="px-2.5 py-1.5 text-xs flat-input font-bold text-slate-700"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prendas que necesita</label>
                          <textarea
                            rows={3}
                            value={editedNeeds}
                            onChange={(e) => setEditedNeeds(e.target.value)}
                            className="px-2.5 py-1.5 text-xs flat-input text-slate-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tallas y Calzado</p>
                          <p className="text-xs font-black text-slate-800 mt-1">{child.currentSize}</p>
                        </div>
                        
                        <div className="p-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Necesidades:</p>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-white border border-slate-200/45 rounded-lg p-2.5 min-h-[80px]">
                            {child.neededItems || "Sin necesidades pendientes."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center justify-end gap-1.5 mt-4 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => setEditingChildId(null)}
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-600 px-2 py-1 uppercase tracking-wider"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveChildLogistics(child.id)}
                        className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 uppercase tracking-wider"
                      >
                        Guardar
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      )}

      {activeTab === 'wishlist' && (
        
        /* MÓDULO WISHLIST (Ideas de regalos) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Botón para expandir formulario de añadir deseo en móvil */}
          <button
            type="button"
            onClick={() => setShowAddWishItemMobile(!showAddWishItemMobile)}
            className="lg:hidden flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all mb-1 shadow-sm touch-btn"
          >
            <Plus size={14} className={showAddWishItemMobile ? 'rotate-45 transition-transform' : 'transition-transform'} />
            {showAddWishItemMobile ? 'Cerrar Formulario' : 'Añadir Nuevo Deseo / Regalo'}
          </button>

          {/* Backdrop para mobile bottom sheet */}
          {showAddWishItemMobile && (
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 lg:hidden animate-fadeIn"
              onClick={handleCancelEditWishItem}
            />
          )}

          {/* PANEL CREAR IDEA */}
          <div 
            className={`flat-card p-5 border border-slate-200/60 bg-white h-fit shadow-sm
              fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-slate-200 p-6 pb-10 max-h-[85vh] overflow-y-auto animate-slideUp
              lg:relative lg:inset-auto lg:z-0 lg:rounded-2xl lg:p-5 lg:pb-5 lg:max-h-none lg:overflow-visible lg:animate-fadeIn
              ${showAddWishItemMobile ? 'block' : 'hidden lg:block'}`}
            style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 16px) + 16px)' }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 lg:border-none lg:pb-0 lg:mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Gift size={15} className="text-blue-500" /> {editingWishItem ? 'Editar Deseo / Regalo' : 'Añadir Deseo / Regalo'}
              </h3>
              <button 
                type="button"
                onClick={handleCancelEditWishItem}
                className="lg:hidden text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-1 touch-btn"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddWishItem} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">¿Qué es? (Título) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lego Star Wars"
                  value={wishTitle}
                  onChange={(e) => setWishTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              {/* CATEGORÍA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoría</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWishCategory('')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      wishCategory === ''
                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sin categoría
                  </button>
                  {existingWishCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWishCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        wishCategory === cat
                          ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {!showNewCategoryInput ? (
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-dashed border-slate-300 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center gap-0.5"
                    >
                      <Plus size={10} />
                      Nueva
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 w-full mt-1">
                      <input
                        type="text"
                        placeholder="Nombre de la categoría..."
                        value={newWishCategory}
                        onChange={(e) => setNewWishCategory(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                        className="flex-1 px-2.5 py-1.5 flat-input text-[10px]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={!newWishCategory.trim()}
                        className="px-2 py-1.5 rounded-lg bg-blue-600 text-white text-[9px] font-bold disabled:opacity-40"
                      >
                        Crear
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNewCategoryInput(false); setNewWishCategory(''); }}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Precio (€)</label>
                <input
                  type="number"
                  placeholder="Ej: 50"
                  value={wishPrice}
                  onChange={(e) => setWishPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              {/* PARA MIEMBROS - PILLS MULTI-SELECT */}
              <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Para miembro(s)</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleWishMemberToggle('todos')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${
                      wishMemberIds.length === 0
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    Todos
                  </button>
                  {members.map((m) => {
                    const isSelected = wishMemberIds.includes(m.id);
                    const isKid = m.role === 'Hijo' || m.role === 'Hija';
                    const pillBg = isSelected 
                      ? isKid ? 'bg-orange-500 border-orange-500 text-white' : 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300';

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleWishMemberToggle(m.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 shrink-0 ${pillBg}`}
                      >
                        {m.firstName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opciones de Privacidad (Sorpresa) */}
              {showPrivacyToggle && (
                <div className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100/70 rounded-xl animate-fadeIn">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-extrabold text-amber-800 flex items-center gap-1">
                      <span>🎁</span> {toggleLabel}
                    </span>
                    <span className="text-[8px] text-amber-600 font-semibold leading-normal">
                      El destinatario no verá esta idea de regalo en su cuenta.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideFromTarget}
                      onChange={(e) => setHideFromTarget(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Enlace Web del producto</label>
                <input
                  type="url"
                  placeholder="https://tienda.com/lego-star-wars"
                  value={wishUrl}
                  onChange={(e) => setWishUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 flat-input text-xs"
                />
              </div>

              {/* IMAGEN - SELECCIONAR DESDE DISPOSITIVO */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Imagen</label>
                <div className="relative border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 transition-colors bg-white flex flex-col items-center justify-center text-center group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWishPhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {wishPhoto ? (
                    <div className="flex flex-col items-center gap-1.5 w-full">
                      <img src={wishPhoto} alt="Preview" className="max-h-20 object-contain rounded border border-slate-100 p-0.5 bg-slate-50" />
                      <div className="text-[10px] font-bold text-slate-700 truncate max-w-[180px]">
                        {wishPhotoFileName || 'Imagen cargada'}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setWishPhoto('');
                          setWishPhotoFileName('');
                        }}
                        className="text-[9px] text-red-500 font-bold hover:underline"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={20} className="text-slate-400 group-hover:scale-110 transition-transform shadow-sm mb-1" />
                      <p className="text-[10px] font-bold text-slate-600">Seleccionar imagen</p>
                      <p className="text-[8px] text-slate-400 font-bold">JPG, PNG, WebP... (Máx. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {editingWishItem && (
                  <button
                    type="button"
                    onClick={handleCancelEditWishItem}
                    className="flex-1 mt-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer border-0"
                >
                  {editingWishItem ? 'Guardar Cambios' : 'Añadir a la Wishlist'}
                </button>
              </div>
            </form>

            {/* GESTOR DE CATEGORÍAS */}
            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Categorías Guardadas</span>
                <span className="text-[9px] text-slate-400 font-normal">({wishlistCategories.length})</span>
              </h4>
              {wishlistCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {wishlistCategories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-1 bg-white pl-2.5 pr-1.5 py-1 rounded-lg border border-slate-200/60 text-[10px] font-bold text-slate-700 shadow-sm animate-fadeIn">
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => { if (confirm(`¿Borrar la categoría "${cat.name}"? Los deseos asociados pasarán a estar sin categoría.`)) deleteWishlistCategory(cat.id); }}
                        className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar categoría"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-bold text-center py-1">No hay categorías creadas.</p>
              )}
            </div>

          </div>

          {/* LISTADO DE IDEAS */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cuaderno de Ideas y Deseos ({filteredWishlist.length} de {wishlist.length})
              </h3>
            </div>

            {/* PÍLDORAS DE FILTRADO POR CATEGORÍA */}
            {existingWishCategories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory scroll-smooth w-full lg:flex-wrap lg:overflow-x-visible lg:pb-0">
                <button
                  onClick={() => setSelectedFilterCategories([])}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap snap-start ${
                    selectedFilterCategories.length === 0
                      ? 'bg-slate-800 border-slate-800 text-white shadow shadow-slate-800/10 scale-105'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:scale-[1.01]'
                  }`}
                >
                  Todas
                </button>
                {existingWishCategories.map((cat) => {
                  const isActive = selectedFilterCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        if (isActive) {
                          setSelectedFilterCategories(selectedFilterCategories.filter(c => c !== cat));
                        } else {
                          setSelectedFilterCategories([...selectedFilterCategories, cat]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap snap-start ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white shadow shadow-blue-500/10 scale-105'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:scale-[1.01]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredWishlist.map((item) => {
                // Compatibilidad: soportar tanto memberIds (nuevo) como memberId (legacy)
                const assignedNames = item.memberIds && item.memberIds.length > 0
                  ? item.memberIds.map(mid => members.find(m => m.id === mid)?.firstName).filter(Boolean).join(', ')
                  : item.memberId
                    ? members.find(m => m.id === item.memberId)?.firstName || null
                    : null;

                return (
                  <div key={item.id} className="flat-card p-4 border border-slate-200/60 bg-white flex flex-col justify-between shadow-sm relative group min-h-[160px]">
                    <div>
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                            <Gift size={15} />
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {assignedNames ? `Para: ${assignedNames}` : 'Familiar'}
                          </span>
                          {item.hideFromTarget && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100" title="Este regalo está oculto para el destinatario">
                              <span>Sorpresa</span>
                              <span>🎁</span>
                            </span>
                          )}
                          {item.category && (
                            <span 
                              onClick={() => {
                                if (selectedFilterCategories.includes(item.category)) {
                                  setSelectedFilterCategories(selectedFilterCategories.filter(c => c !== item.category));
                                } else {
                                  setSelectedFilterCategories([...selectedFilterCategories, item.category]);
                                }
                              }}
                              className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded cursor-pointer transition-all hover:scale-105 ${
                                selectedFilterCategories.includes(item.category)
                                  ? 'bg-blue-600 text-white border border-blue-600 shadow-sm font-black'
                                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                              }`}
                              title={`Filtrar por ${item.category}`}
                            >
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 action-btn-mobile transition-all">
                          <button
                            type="button"
                            onClick={() => handleStartEditWishItem(item)}
                            className="text-slate-500 hover:text-blue-600 p-1.5 bg-transparent border-0 cursor-pointer touch-btn"
                            title="Editar Deseo"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWishlistItem(item.id)}
                            className="text-slate-550 hover:text-red-600 p-1.5 bg-transparent border-0 cursor-pointer touch-btn"
                            title="Eliminar Deseo"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-3">
                        {item.photoUrl ? (
                          <img 
                            src={item.photoUrl} 
                            alt={item.title} 
                            onClick={() => setActiveImagePreview({ title: item.title, photoUrl: item.photoUrl })}
                            className="h-16 w-16 object-cover rounded-xl border border-slate-100 shrink-0 cursor-zoom-in hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-300">
                            <Gift size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">{item.title}</h4>
                          {item.price > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-1">
                              <Tag size={10} className="text-slate-400" />
                              <span>{item.price}€</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.url && (
                      <div className="mt-4 pt-2.5 border-t border-slate-50">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center gap-1 text-[9px] font-black text-slate-600 uppercase tracking-wider transition-colors"
                        >
                          Ver Tienda
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}

              {wishlist.length === 0 && (
                <div className="col-span-full flat-card p-10 text-center border border-slate-200/50 bg-white">
                  <Gift className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Wishlist vacía</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Captura ideas de regalos para los cumpleaños de los niños o compras deseadas.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VISOR LIGHTBOX IMÁGENES (PANTALLA COMPLETA) */}
      {activeImagePreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn cursor-zoom-out"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImagePreview(null)}
              className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border-0 cursor-pointer"
            >
              <X size={20} />
            </button>
            
            <img 
              src={activeImagePreview.photoUrl} 
              alt={activeImagePreview.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  try {
                    const link = document.createElement('a');
                    link.href = activeImagePreview.photoUrl;
                    link.download = `${activeImagePreview.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    alert("Error al descargar la imagen.");
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow border-0 cursor-pointer"
              >
                <Save size={12} />
                Descargar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
