// src/pages/SmartList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSmartLists } from "./SmartListContext";
import SmartListDrawer from "./SmartListDrawer";
import toast from "react-hot-toast";
import TransactionPinModal from "../components/TransactionPinModal";
import SetTransactionPinModal from "../components/SetTransactionPinModal";
import { imageUrl, PLACEHOLDER } from "../utils/image";
import "./Lists.css";
import "./SmartListDrawer.css";

// Icons
import {
  FiPlus,
  FiTrash2,
  FiEye,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiX,
  FiCheck,
  FiPackage,
  FiList,
  FiClock,
  FiMinus,
  FiAlertCircle,
  FiMoreVertical,
  FiCopy,
  FiShare2,
  FiHeart,
  FiBookOpen,
} from "react-icons/fi";
import { HiOutlineSparkles, HiOutlineClipboardList } from "react-icons/hi";

// ============ HELPER FUNCTIONS ============
const getItemName = (item) => item?.product?.name || item?.name || "Unnamed Product";

const getItemImage = (item) =>
  imageUrl(
    item?.product?.image ||
    item?.product?.image_url ||
    item?.image ||
    item?.image_url ||
    ''
  );

const getItemPrice = (item) => item?.product?.price || item?.price || 0;

const getItemCategory = (item) => {
  const candidates = [
    item?.product?.category,
    item?.product?.category?.name,
    item?.category,
    item?.category?.name,
    item?.product_category,
    item?.product?.product_category,
  ];

  const raw = candidates.find(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );

  if (!raw) return "";

  const s = String(raw).trim().toLowerCase();
  if (["uncategorized", "unknown", "n/a", "none", "null"].includes(s)) return "";
  if (["beverage", "beverages", "drink", "drinks"].includes(s)) return "Beverage";
  if (["care", "personal care", "personal-care", "care products"].includes(s)) return "Care";
  if (["food", "foods", "grocery"].includes(s)) return "Food";
  if (["zizou"].includes(s)) return "Zizou";
  if (["beauty", "cosmetics", "cosmetic"].includes(s)) return "Beauty";

  const words = String(raw).trim().split(/\s+/);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const formatCurrency = (val) =>
  `₦${Number(val || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

// ============ SUB-COMPONENTS ============

// Header Component - UPDATED WITH LIST ICON AND TOOLTIP
const ListsHeader = ({ onBack, onAdd, listCount }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="sl-header">
      <button className="sl-back-btn" onClick={onBack} aria-label="Go back">
        <FiChevronLeft />
      </button>
      <div className="sl-header-center">
        <h1 className="sl-title">Smart Lists</h1>
        {listCount > 0 && (
          <span className="sl-list-count">{listCount} lists</span>
        )}
      </div>
      <div className="sl-header-right">
        <div 
          className="sl-add-btn-wrapper"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button 
            className="sl-add-btn" 
            onClick={onAdd} 
            aria-label="Create new list"
          >
            <FiBookOpen />
            <FiPlus className="sl-add-plus" />
          </button>
          {showTooltip && (
            <div className="sl-tooltip">
              <span>Create a new list</span>
              <div className="sl-tooltip-arrow"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Empty State Component
const EmptyState = ({ onCreateList }) => (
  <div className="sl-empty">
    <div className="sl-empty-icon">
      <HiOutlineClipboardList />
    </div>
    <h2 className="sl-empty-title">No Smart Lists Yet</h2>
    <p className="sl-empty-text">
      Create smart lists to quickly reorder your favorite products
    </p>
    <button className="sl-empty-btn" onClick={onCreateList}>
      <FiPlus />
      Create Your First List
    </button>
  </div>
);

// Create List Modal
const CreateListModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    setIsCreating(true);
    try {
      await onCreate(name);
      setName("");
      onClose();
    } catch (err) {
      toast.error("Failed to create list");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sl-modal-overlay" onClick={onClose}>
      <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sl-modal-header">
          <h3 className="sl-modal-title">Create New List</h3>
          <button className="sl-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="sl-modal-body">
          <div className="sl-input-group">
            <label className="sl-input-label">List Name</label>
            <input
              type="text"
              className="sl-input"
              placeholder="e.g., Weekly Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="sl-modal-footer">
          <button className="sl-modal-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="sl-modal-btn create"
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
          >
            {isCreating ? (
              <span className="sl-btn-loader"></span>
            ) : (
              <>
                <FiCheck />
                Create List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// List Card Component
const ListCard = ({
  list,
  orderedAt,
  onView,
  onDelete,
  onOrderAll,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const itemCount = list.items?.length || 0;

  // Calculate total
  const total = (list.items || []).reduce((sum, item) => {
    return sum + (getItemPrice(item) * (item.quantity || 1));
  }, 0);

  // Get first 3 items for preview
  const previewItems = (list.items || []).slice(0, 3);
  const remainingCount = itemCount > 3 ? itemCount - 3 : 0;

  return (
    <div className="sl-card">
      <div className="sl-card-header">
        <div className="sl-card-icon">
          <FiList />
        </div>
        <div className="sl-card-info">
          <h3 className="sl-card-title">{list.name}</h3>
          <div className="sl-card-meta">
            <span className="sl-card-count">
              <FiPackage />
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            {orderedAt && (
              <span className="sl-card-ordered">
                <FiClock />
                Ordered {orderedAt}
              </span>
            )}
          </div>
        </div>
        <button
          className="sl-card-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FiMoreVertical />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div className="sl-menu-overlay" onClick={() => setShowMenu(false)} />
            <div className="sl-dropdown-menu">
              <button className="sl-menu-item" onClick={() => { onView(list); setShowMenu(false); }}>
                <FiEye />
                View List
              </button>
              <button className="sl-menu-item" onClick={() => setShowMenu(false)}>
                <FiCopy />
                Duplicate
              </button>
              <button className="sl-menu-item" onClick={() => setShowMenu(false)}>
                <FiShare2 />
                Share
              </button>
              <button
                className="sl-menu-item danger"
                onClick={() => { onDelete(list.id); setShowMenu(false); }}
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Item Preview */}
      {itemCount > 0 && (
        <div className="sl-card-preview">
          <div className="sl-preview-items">
            {previewItems.map((item, i) => (
              <div key={i} className="sl-preview-item">
                <img
                  src={getItemImage(item)}
                  alt={getItemName(item)}
                  className="sl-preview-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                />
                <div className="sl-preview-info">
                  <span className="sl-preview-name">{getItemName(item)}</span>
                  <span className="sl-preview-qty">×{item.quantity || 1}</span>
                </div>
                <span className="sl-preview-price">
                  {formatCurrency(getItemPrice(item) * (item.quantity || 1))}
                </span>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="sl-preview-more">
                +{remainingCount} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="sl-card-footer">
        <div className="sl-card-total">
          <span className="sl-total-label">Total</span>
          <span className="sl-total-amount">{formatCurrency(total)}</span>
        </div>
        <div className="sl-card-actions">
          <button className="sl-action-btn view" onClick={() => onView(list)}>
            <FiEye />
            View
          </button>
          <button
            className="sl-action-btn order"
            onClick={() => onOrderAll(list)}
            disabled={itemCount === 0}
          >
            <FiShoppingCart />
            Order All
          </button>
        </div>
      </div>
    </div>
  );
};

// View List Modal
const ViewListModal = ({
  list,
  isOpen,
  onClose,
  isEditing,
  onToggleEdit,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  onAddMore,
}) => {
  if (!isOpen || !list) return null;

  const total = (list.items || []).reduce((sum, item) => {
    return sum + (getItemPrice(item) * (item.quantity || 1));
  }, 0);

  return (
    <div className="sl-modal-overlay" onClick={onClose}>
      <div className="sl-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sl-view-header">
          <button className="sl-view-back" onClick={onClose}>
            <FiChevronLeft />
          </button>
          <h2 className="sl-view-title">{list.name}</h2>
          <button
            className={`sl-view-edit ${isEditing ? "active" : ""}`}
            onClick={onToggleEdit}
          >
            {isEditing ? <FiCheck /> : <FiEdit3 />}
          </button>
        </div>

        <div className="sl-view-content">
          {(!list.items || list.items.length === 0) ? (
            <div className="sl-view-empty">
              <FiPackage />
              <p>No items in this list</p>
              <button className="sl-add-items-btn" onClick={onAddMore}>
                <FiPlus />
                Add Products
              </button>
            </div>
          ) : (
            <div className="sl-view-items">
              {list.items.map((item, i) => {
                const name = getItemName(item);
                const image = getItemImage(item);
                const price = getItemPrice(item);
                const category = getItemCategory(item);
                const qty = item.quantity || 1;

                return (
                  <div key={i} className={`sl-view-item ${isEditing ? "editing" : ""}`}>
                    <img
                      src={image}
                      alt={name}
                      className="sl-view-item-image"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
                    />
                    <div className="sl-view-item-content">
                      <h4 className="sl-view-item-name">{name}</h4>
                      {category && (
                        <span className="sl-view-item-category">{category}</span>
                      )}
                      <div className="sl-view-item-footer">
                        <span className="sl-view-item-price">
                          {formatCurrency(price)}
                        </span>
                        {isEditing ? (
                          <div className="sl-qty-controls">
                            <button
                              className="sl-qty-btn"
                              onClick={() => onDecreaseQty(list.id, item.id)}
                              disabled={qty <= 1}
                            >
                              <FiMinus />
                            </button>
                            <span className="sl-qty-value">{qty}</span>
                            <button
                              className="sl-qty-btn"
                              onClick={() => onIncreaseQty(list.id, item.id)}
                            >
                              <FiPlus />
                            </button>
                            <button
                              className="sl-qty-btn delete"
                              onClick={() => onRemoveItem(list.id, item.id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ) : (
                                                    <span className="sl-view-item-qty">Qty: {qty}</span>
                        )}
                      </div>
                    </div>
                    <span className="sl-view-item-total">
                      {formatCurrency(price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isEditing && list.items?.length > 0 && (
          <button className="sl-add-more-btn" onClick={onAddMore}>
            <FiPlus />
            Add More Products
          </button>
        )}

        <div className="sl-view-footer">
          <div className="sl-view-total">
            <span>Total ({list.items?.length || 0} items)</span>
            <span className="sl-view-total-amount">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, listName }) => {
  if (!isOpen) return null;

  return (
    <div className="sl-modal-overlay" onClick={onClose}>
      <div className="sl-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sl-confirm-icon">
          <FiAlertCircle />
        </div>
        <h3 className="sl-confirm-title">Delete List?</h3>
        <p className="sl-confirm-text">
          Are you sure you want to delete "{listName}"? This action cannot be undone.
        </p>
        <div className="sl-confirm-actions">
          <button className="sl-confirm-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="sl-confirm-btn delete" onClick={onConfirm}>
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function SmartList() {
  const navigate = useNavigate();
  const {
    lists,
    deleteList,
    createList,
    orderAll,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useSmartLists();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingList, setViewingList] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orderedAt, setOrderedAt] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // PIN Modal States
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  // Customer info
  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const customerId = authUser?.id;

  // Create new list
  const handleCreateList = async (name) => {
    try {
      const newList = await createList(name);
      const safeList = { ...newList, items: newList.items || [] };
      toast.success(`"${name}" created successfully!`);
      setTimeout(() => setDrawerOpen(safeList.id), 300);
    } catch (err) {
      console.error("Error creating list:", err);
      throw err;
    }
  };

  // Handle delete
  const handleDeleteList = (listId) => {
    const list = lists.find((l) => l.id === listId);
    setDeleteConfirm(list);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteList(deleteConfirm.id);
      toast.success("List deleted");
      setDeleteConfirm(null);
    }
  };

  // Handle Order All
  const handleOrderAllClick = (list) => {
    if (!list.items || list.items.length === 0) {
      toast.error("This list is empty");
      return;
    }
    setSelectedList(list);
    setShowPinModal(true);
  };

  // PIN Success Handler
  const handlePinSuccess = async () => {
    if (!selectedList) return;
    try {
      const newOrder = await orderAll(selectedList.id);
      if (newOrder) {
        toast.success(`Order #${newOrder.id} placed successfully!`, {
          icon: "🎉",
          duration: 4000,
        });
        setOrderedAt((prev) => ({
          ...prev,
          [selectedList.id]: new Date().toLocaleString(),
        }));
        setShowPinModal(false);
        setTimeout(() => navigate("/orders"), 1500);
      } else {
        toast.error("Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Something went wrong");
    }
  };

  // View list handlers
  const handleViewList = (list) => {
    setViewingList(list);
    setIsEditing(false);
  };

  const handleCloseView = () => {
    setViewingList(null);
    setIsEditing(false);
  };

  const handleAddMore = () => {
    if (viewingList) {
      setDrawerOpen(viewingList.id);
      setViewingList(null);
    }
  };

  return (
    <div className="sl-page">
      {/* Header */}
      <ListsHeader
        onBack={() => navigate(-1)}
        onAdd={() => setShowCreateModal(true)}
        listCount={lists?.length || 0}
      />

      {/* Main Content */}
      <div className="sl-content">
        {/* Info Banner */}
        {lists && lists.length > 0 && (
          <div className="sl-info-banner">
            <HiOutlineSparkles />
            <span>Save time by reordering your favorite products instantly</span>
          </div>
        )}

        {/* Lists */}
        {!lists || lists.length === 0 ? (
          <EmptyState onCreateList={() => setShowCreateModal(true)} />
        ) : (
          <div className="sl-lists">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                orderedAt={orderedAt[list.id]}
                onView={handleViewList}
                onDelete={handleDeleteList}
                onOrderAll={handleOrderAllClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />

      {/* View List Modal */}
      <ViewListModal
        list={viewingList}
        isOpen={!!viewingList}
        onClose={handleCloseView}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onIncreaseQty={increaseQty}
        onDecreaseQty={decreaseQty}
        onRemoveItem={removeItem}
        onAddMore={handleAddMore}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        listName={deleteConfirm?.name || ""}
      />

      {/* Drawer */}
      {drawerOpen && (
        <SmartListDrawer
          onClose={() => setDrawerOpen(null)}
          targetListId={drawerOpen}
        />
      )}

      {/* Transaction PIN Modals */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        customerId={customerId}
        onSuccess={handlePinSuccess}
        onRequestSetPin={() => {
          setShowPinModal(false);
          setShowSetPinModal(true);
        }}
      />

      <SetTransactionPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        customerId={customerId}
        onSuccess={() => {
          toast.success("PIN set successfully!");
          setShowSetPinModal(false);
          setShowPinModal(true);
        }}
      />

      {/* Bottom Spacer */}
      <div className="sl-bottom-spacer"></div>
    </div>
  );
}