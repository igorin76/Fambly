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
  Image as ImageIcon
} from 'lucide-react';

export default function ShoppingListView() {
  const {
    shoppingItems,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCompletedShoppingItems,
    clothingLogistics,
    updateClothingLogistics,
    wishlist = [],
    addWishlistItem,
    deleteWishlistItem,
    updateWishlistItem,
    members = [],
    wishlistCategories = [],
    addWishlistCategory,
    deleteWishlistCategory
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
  const [wishCategory, setWishCategory] = useState('');
  const [newWishCategory, setNewWishCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Estado de filtrado por categorías
  const [selectedFilterCategories, setSelectedFilterCategories] = useState([]);

  // Categorías de wishlist guardadas en base de datos
  const existingWishCategories = wishlistCategories.map(c => c.name);

  const filteredWishlist = wishlist.filter(item => {
    if (selectedFilterCategories.length === 0) return true;
    return selectedFilterCategories.includes(item.category);
  });

  const categories = ['Frescos', 'Despensa', 'Limpieza'];

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
      return;
    }
    if (wishMemberIds.includes(id)) {
      setWishMemberIds(wishMemberIds.filter(mid => mid !== id));
    } else {
      setWishMemberIds([...wishMemberIds, id]);
    }
  };

  const handleStartEditWishItem = (item) => {
    setEditingWishItem(item);
    setWishTitle(item.title);
    setWishUrl(item.url || '');
    setWishPrice(item.price > 0 ? String(item.price) : '');
    setWishPhoto(item.photoUrl || '');
    setWishPhotoFileName(item.photoUrl ? 'Imagen cargada' : '');
    setWishMemberIds(item.memberIds || (item.memberId ? [item.memberId] : []));
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
      category: wishCategory.trim() || null
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
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'supermercado'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <ShoppingCart size={14} />
          Supermercado
        </button>
        <button
          onClick={() => setActiveTab('ropa')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ropa'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Shirt size={14} />
          Ropa y Tallas
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'wishlist'
              ? 'segmented-btn-active'
              : 'segmented-btn-inactive'
          }`}
        >
          <Gift size={14} />
          Lista de Deseos
        </button>
      </div>

      {activeTab === 'supermercado' && (
        
        /* SUPERMERCADO MÓDULO */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Botón para expandir formulario de añadir artículo en móvil */}
          <button
            type="button"
            onClick={() => setShowAddShopItemMobile(!showAddShopItemMobile)}
            className="lg:hidden flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all mb-1 shadow-sm"
          >
            <Plus size={14} className={showAddShopItemMobile ? 'rotate-45 transition-transform' : 'transition-transform'} />
            {showAddShopItemMobile ? 'Cerrar Formulario' : 'Añadir Artículo Nuevo'}
          </button>

          {/* PANEL AÑADIR */}
          <div className={`flat-card p-5 border border-slate-200/60 bg-white h-fit ${showAddShopItemMobile ? 'block animate-fadeIn' : 'hidden lg:block'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Plus size={15} className="text-blue-500" /> Añadir Artículo
            </h3>
            
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoría</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewItemCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        newItemCategory === cat
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
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
                className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10"
              >
                Añadir Artículo
              </button>
            </form>
          </div>

          {/* LISTAS POR CATEGORÍAS */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Carrito de Compra</h3>
              {shoppingItems.some(i => i.completed) && (
                <button
                  onClick={clearCompletedShoppingItems}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-bold transition-colors"
                >
                  <Trash size={12} />
                  Vaciar Comprados
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const items = itemsByCategory(category);
                
                const categoryColor = 
                  category === 'Frescos' ? 'text-emerald-600 border-emerald-100 bg-emerald-50/15' :
                  category === 'Despensa' ? 'text-amber-600 border-amber-100 bg-amber-50/15' : 'text-blue-600 border-blue-100 bg-blue-50/15';

                return (
                  <div key={category} className="flat-card p-4 flex flex-col gap-3 h-fit min-h-[220px] border border-slate-200/60 bg-white">
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${categoryColor} border border-slate-200/30 px-2.5 py-1.5 rounded-xl text-center`}>
                      {category} ({items.length})
                    </h4>

                    {items.length > 0 ? (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {items.map((item) => (
                          <div 
                            key={item.id}
                            className={`flex items-center justify-between p-2 rounded-xl bg-slate-50/40 border border-slate-100 group transition-all ${
                              item.completed ? 'opacity-50' : ''
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer select-none min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleShoppingItem(item.id)}
                                className="custom-checkbox"
                              />
                              <span className={`text-xs truncate font-bold ${item.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700'}`}>
                                {item.name}
                              </span>
                            </label>
                            
                            <button
                              onClick={() => deleteShoppingItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition-opacity shrink-0 ml-1"
                              title="Eliminar"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                        <CheckCircle size={20} className="mb-1 text-slate-300" />
                        <p className="text-[10px] font-bold">Vacío</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
            className="lg:hidden flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all mb-1 shadow-sm"
          >
            <Plus size={14} className={showAddWishItemMobile ? 'rotate-45 transition-transform' : 'transition-transform'} />
            {showAddWishItemMobile ? 'Cerrar Formulario' : 'Añadir Nuevo Deseo / Regalo'}
          </button>

          {/* PANEL CREAR IDEA */}
          <div className={`flat-card p-5 border border-slate-200/60 bg-white h-fit shadow-sm ${showAddWishItemMobile ? 'block animate-fadeIn' : 'hidden lg:block'}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Gift size={15} className="text-blue-500" /> {editingWishItem ? 'Editar Deseo / Regalo' : 'Añadir Deseo / Regalo'}
            </h3>
            
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
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                <button
                  onClick={() => setSelectedFilterCategories([])}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
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
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
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
                          {item.category && (
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleStartEditWishItem(item)}
                            className="text-slate-400 hover:text-blue-500 p-0.5 bg-transparent border-0 cursor-pointer"
                            title="Editar Deseo"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWishlistItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 bg-transparent border-0 cursor-pointer"
                            title="Eliminar Deseo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-3">
                        {item.photoUrl ? (
                          <img src={item.photoUrl} alt={item.title} className="h-16 w-16 object-cover rounded-xl border border-slate-100 shrink-0" />
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

    </div>
  );
}
