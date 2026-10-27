'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Copy,
  Check,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Ban,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from './orderDetails.module.css';

interface OrderItem {
  productId: string;
  variantSku: string;
  title: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  thumbnailImage: string;
}

interface AddressSnapshot {
  recipientName: string;
  phone: string;
  house?: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType?: string;
}

interface StatusHistoryItem {
  status: string;
  previousStatus?: string;
  timestamp: string;
  note?: string;
  description?: string;
  updatedBy?: string;
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: AddressSnapshot;
  billingAddress?: AddressSnapshot;
  pricing: {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    shippingFee: number;
    giftWrapFee?: number;
    grandTotal: number;
    currency: string;
  };
  giftPackaging?: boolean;
  paymentMethod: 'ONLINE_GATEWAY' | 'COD';
  paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  fulfillmentStatus: string;
  orderStatus?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  statusHistory?: StatusHistoryItem[];
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  stockRestored?: boolean;
  invoiceNumber?: string;
  invoiceIssuedAt?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Status update form state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Email Invoice Modal state
  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    loading: boolean;
    success?: boolean;
    message?: string;
    configured?: boolean;
  }>({ open: false, loading: false });

  // Load Order
  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      if (res.status === 401 || res.status === 403) {
        setError('Unauthorized: Admin access required.');
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load order.');
      }
      const ord: OrderDetail = data.data.order;
      setOrder(ord);
      setSelectedStatus(ord.fulfillmentStatus);
      setCarrier(ord.carrier || 'Delhivery');
      setTrackingNumber(ord.trackingNumber || '');
      setTrackingUrl(ord.trackingUrl || '');
    } catch (err: any) {
      setError(err.message || 'Error fetching order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Copy order number to clipboard
  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format Date in IST
  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    }) + ' IST';
  };

  // Allowed transitions definition
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
    PENDING_CONFIRMATION: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
    UNFULFILLED: ['CONFIRMED', 'PROCESSING', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'PACKED', 'CANCELLED'],
    PROCESSING: ['PACKED', 'SHIPPED', 'CANCELLED'],
    PACKED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'RETURN_REQUESTED', 'RETURNED'],
    DELIVERED: ['RETURN_REQUESTED', 'RETURNED'],
    RETURN_REQUESTED: ['RETURNED', 'REFUNDED'],
    RETURNED: ['REFUNDED'],
    CANCELLED: [],
    REFUNDED: [],
  };

  const currentFulfillment = order?.fulfillmentStatus || 'UNFULFILLED';
  const nextAllowed = ALLOWED_TRANSITIONS[currentFulfillment] || [];
  // Status dropdown options: current status + allowed next transitions
  const statusOptions = Array.from(new Set([currentFulfillment, ...nextAllowed]));

  // Submit Status Update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsUpdatingStatus(true);
    setUpdateSuccessMessage(null);
    setUpdateErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order._id || order.orderNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentStatus: selectedStatus,
          carrier: carrier.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
          statusNote: statusNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status.');
      }

      setUpdateSuccessMessage('Order status and fulfillment details updated successfully.');
      setStatusNote('');
      fetchOrder();
    } catch (err: any) {
      setUpdateErrorMessage(err.message || 'Status update failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Submit Cancellation
  const handleConfirmCancel = async () => {
    if (!order) return;
    if (!cancelReason.trim()) {
      alert('Please enter a cancellation reason.');
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order._id || order.orderNumber)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillmentStatus: 'CANCELLED',
          cancellationReason: cancelReason.trim(),
          statusNote: `Cancelled by admin: ${cancelReason.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel order.');
      }

      setShowCancelModal(false);
      setCancelReason('');
      setUpdateSuccessMessage('Order has been cancelled and inventory restored.');
      fetchOrder();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Dispatch Email Invoice
  const handleSendInvoiceEmail = async () => {
    if (!order) return;
    setEmailModal({ open: true, loading: true });

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(order._id || order.orderNumber)}/send-invoice`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.status === 422 || data.configured === false) {
        setEmailModal({
          open: true,
          loading: false,
          success: false,
          configured: false,
          message: data.error || 'Email service is not yet configured.',
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email.');
      }

      setEmailModal({
        open: true,
        loading: false,
        success: true,
        configured: true,
        message: data.message || `Invoice sent successfully to ${order.customerEmail}.`,
      });
      fetchOrder();
    } catch (err: any) {
      setEmailModal({
        open: true,
        loading: false,
        success: false,
        message: err.message || 'Failed to send invoice email.',
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717A' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>Loading authentic order data from database...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <Link href="/admin/orders" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className={styles.card} style={{ textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>ORDER NOT FOUND</h2>
          <p style={{ color: '#71717A', margin: '0 0 20px' }}>
            {error || 'The requested order could not be located in the database.'}
          </p>
          <div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                RETURN TO ORDER QUEUE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.fulfillmentStatus === 'CANCELLED';
  const isDelivered = order.fulfillmentStatus === 'DELIVERED';
  const canCancel = !isCancelled && !isDelivered && order.fulfillmentStatus !== 'RETURNED';

  return (
    <div className={styles.container}>
      {/* 1. Breadcrumb navigation */}
      <div className={styles.topNav}>
        <Link href="/admin/orders" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>

      {/* 2. Top Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.orderNumber}>{order.orderNumber}</h1>
            <button
              onClick={handleCopyOrderNumber}
              className={styles.copyBtn}
              title="Copy order number"
            >
              {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
            <div className={styles.badgeGroup}>
              <span
                className={`${styles.statusPill} ${
                  isDelivered
                    ? styles.pillDelivered
                    : isCancelled
                    ? styles.pillCancelled
                    : order.fulfillmentStatus === 'PROCESSING' || order.fulfillmentStatus === 'PACKED'
                    ? styles.pillProcessing
                    : order.fulfillmentStatus === 'SHIPPED'
                    ? styles.pillShipped
                    : styles.pillDefault
                }`}
              >
                <span className={styles.pillDot} />
                {order.fulfillmentStatus.replace('_', ' ')}
              </span>

              <span
                className={`${styles.statusPill} ${
                  order.paymentStatus === 'PAID' ? styles.pillDelivered : styles.pillProcessing
                }`}
              >
                <span className={styles.pillDot} />
                {order.paymentStatus} ({order.paymentMethod === 'ONLINE_GATEWAY' ? 'PREPAID' : 'COD'})
              </span>
            </div>
          </div>
          <p className={styles.orderMetaSubline}>
            <span>Database Ref:</span>
            <span className={styles.orderRefId}>{order._id}</span>
            <span>•</span>
            <span>Placed on <strong>{formatDateTime(order.createdAt)}</strong></span>
          </p>
        </div>

        {/* Action Buttons: PDF, Print, Email, Cancel */}
        <div className={styles.headerActions}>
          <a
            href={`/api/admin/orders/${order._id || order.orderNumber}/invoice?download=true`}
            className={styles.btnPrimary}
            title="Download authentic PDF invoice"
          >
            <Download size={14} />
            <span>DOWNLOAD INVOICE</span>
          </a>

          <a
            href={`/api/admin/orders/${order._id || order.orderNumber}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
            title="Preview or print PDF invoice"
          >
            <Printer size={14} />
            <span>PRINT INVOICE</span>
          </a>

          <button
            onClick={handleSendInvoiceEmail}
            className={styles.btnSecondary}
            title="Send PDF invoice to customer"
          >
            <Mail size={14} />
            <span>EMAIL INVOICE</span>
          </button>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className={styles.btnDanger}
              title="Cancel order and restore inventory"
            >
              <Ban size={14} />
              <span>CANCEL ORDER</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. High-Density KPI Metrics Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Payable</span>
            <CreditCard size={15} className={styles.kpiIcon} />
          </div>
          <p className={styles.kpiValue}>₹{Number(order.pricing?.grandTotal || 0).toLocaleString('en-IN')}</p>
          <p className={styles.kpiSubtitle}>
            {order.items?.length || 0} line item{order.items?.length === 1 ? '' : 's'} • Incl. taxes & shipping
          </p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Payment Status</span>
            <CheckCircle2 size={15} className={styles.kpiIcon} />
          </div>
          <p
            className={styles.kpiValue}
            style={{ color: order.paymentStatus === 'PAID' ? '#059669' : '#D97706' }}
          >
            {order.paymentStatus}
          </p>
          <p className={styles.kpiSubtitle}>
            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid (Online Gateway)'}
          </p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Fulfillment Status</span>
            <Truck size={15} className={styles.kpiIcon} />
          </div>
          <p className={styles.kpiValue}>{order.fulfillmentStatus.replace('_', ' ')}</p>
          <p className={styles.kpiSubtitle}>
            {order.carrier ? `${order.carrier} ${order.trackingNumber ? `(${order.trackingNumber})` : ''}` : 'Unassigned Carrier'}
          </p>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Invoice Reference</span>
            <FileText size={15} className={styles.kpiIcon} />
          </div>
          <p className={styles.kpiValue} style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>
            {order.invoiceNumber || 'Ready to Issue'}
          </p>
          <p className={styles.kpiSubtitle}>
            {order.invoiceIssuedAt ? `Issued ${formatDateTime(order.invoiceIssuedAt)}` : 'On demand generation'}
          </p>
        </div>
      </div>

      {/* 4. Main Two-Column Luxury Layout */}
      <div className={styles.mainLayout}>
        {/* LEFT COLUMN: Items, Addresses, Financials */}
        <div className={styles.contentCol}>
          {/* Ordered Line Items */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Package size={16} /> ORDERED ITEMS
              </h2>
              <span className={styles.sectionCount}>
                {order.items?.length || 0} Item{order.items?.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className={styles.itemsList}>
              {(order.items || []).map((item, index) => (
                <div key={`${item.variantSku}-${index}`} className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemThumbWrapper}>
                      {item.thumbnailImage ? (
                        <img
                          src={item.thumbnailImage}
                          alt={item.title}
                          className={styles.itemThumb}
                        />
                      ) : (
                        <Package size={22} color="#A1A1AA" />
                      )}
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemTitle}>{item.title}</h3>
                      <div className={styles.itemMetaPills}>
                        <span className={styles.itemMetaPill}>Size: <strong>{item.size}</strong></span>
                        {item.color && (
                          <span className={styles.itemMetaPill}>Color: {item.color}</span>
                        )}
                        <span className={styles.itemMetaPill}>Qty: <strong>{item.quantity}</strong></span>
                        <span className={styles.itemSku}>SKU: {item.variantSku}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemPricing}>
                    <span className={styles.itemTotalPrice}>
                      ₹{Number(item.totalPrice || item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <span className={styles.itemUnitPrice}>
                      ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')} each
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Address Details (Side-by-Side) */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <User size={16} /> CUSTOMER & DELIVERY SNAPSHOT
              </h2>
            </div>

            <div className={styles.addressGrid}>
              {/* Customer Contact Tile */}
              <div className={styles.infoTile}>
                <div className={styles.infoTileHeader}>
                  <User size={14} /> Customer Profile
                </div>
                <div className={styles.infoTileBody}>
                  <div className={styles.infoTileName}>{order.customerName}</div>
                  <div className={styles.infoTileMeta}>Email: {order.customerEmail}</div>
                  <div className={styles.infoTileMeta}>Phone: {order.customerPhone}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.6875rem', color: '#71717A' }}>
                    Payment Account: {order.paymentMethod === 'ONLINE_GATEWAY' ? 'Prepaid Online' : 'Cash on Delivery'}
                  </div>
                </div>
              </div>

              {/* Shipping Address Tile */}
              <div className={styles.infoTile}>
                <div className={styles.infoTileHeader}>
                  <MapPin size={14} /> Shipping Destination
                </div>
                <div className={styles.infoTileBody}>
                  <div className={styles.infoTileName}>
                    {order.shippingAddress?.recipientName || order.customerName}
                  </div>
                  <div>
                    {[
                      order.shippingAddress?.house,
                      order.shippingAddress?.streetAddress,
                      order.shippingAddress?.landmark,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                  <div>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} —{' '}
                    <strong>{order.shippingAddress?.pincode}</strong>
                  </div>
                  <div className={styles.infoTileMeta} style={{ marginTop: '4px' }}>
                    Phone: {order.shippingAddress?.phone || order.customerPhone}
                  </div>
                  {order.shippingAddress?.addressType && (
                    <span
                      className={styles.itemMetaPill}
                      style={{ width: 'fit-content', marginTop: '4px', textTransform: 'uppercase' }}
                    >
                      {order.shippingAddress.addressType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FileText size={16} /> PRICE BREAKDOWN & FINANCIAL RECONCILIATION
              </h2>
            </div>

            <div className={styles.breakdownList}>
              <div className={styles.breakdownRow}>
                <span>Items Subtotal</span>
                <span>₹{Number(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>

              {(order.pricing?.discountTotal || 0) > 0 && (
                <div className={`${styles.breakdownRow} ${styles.breakdownDiscount}`}>
                  <span>Discounts Applied</span>
                  <span>-₹{Number(order.pricing.discountTotal).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.breakdownRow}>
                <span>Shipping Charges</span>
                <span>
                  {order.pricing?.shippingFee === 0
                    ? 'FREE'
                    : `₹${Number(order.pricing?.shippingFee || 0).toLocaleString('en-IN')}`}
                </span>
              </div>

              {((order.pricing?.giftWrapFee || 0) > 0 || order.giftPackaging) && (
                <div className={styles.breakdownRow} style={{ color: '#059669', fontWeight: 600 }}>
                  <span>🎁 Premium Festive Gift Packaging</span>
                  <span>₹{Number(order.pricing?.giftWrapFee || 99).toLocaleString('en-IN')}</span>
                </div>
              )}

              {(order.pricing?.taxTotal || 0) > 0 && (
                <div className={styles.breakdownRow}>
                  <span>Estimated GST / Tax (Included)</span>
                  <span>₹{Number(order.pricing.taxTotal).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className={styles.breakdownTotal}>
                <span>Total Payable</span>
                <span>₹{Number(order.pricing?.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Status Controls, Tracking, Timeline */}
        <div className={styles.sidebarCol}>
          {/* Status & Fulfillment Management Card */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Truck size={16} /> FULFILLMENT & DISPATCH
              </h2>
            </div>

            {updateSuccessMessage && (
              <div className={styles.alertBannerSuccess}>
                <CheckCircle2 size={16} />
                <span>{updateSuccessMessage}</span>
              </div>
            )}

            {updateErrorMessage && (
              <div className={styles.alertBannerError}>
                <AlertCircle size={16} />
                <span>{updateErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className={styles.statusForm}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Fulfillment Status</label>
                <select
                  className={styles.selectInput}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isUpdatingStatus || isCancelled}
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === currentFulfillment ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                {nextAllowed.length === 0 && !isCancelled && (
                  <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
                    No forward transitions available from current status.
                  </span>
                )}
              </div>

              {/* Carrier Selection & Tracking */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Shipping Carrier</label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. Delhivery, BlueDart, DTDC"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  disabled={isUpdatingStatus || isCancelled}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Tracking / AWB Number</label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g. DEL-894729103"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  disabled={isUpdatingStatus || isCancelled}
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Tracking URL (Optional)</label>
                <input
                  type="url"
                  className={styles.textInput}
                  placeholder="https://delhivery.com/track/..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  disabled={isUpdatingStatus || isCancelled}
                />
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.backLink}
                    style={{ fontSize: '0.75rem', marginTop: '2px' }}
                  >
                    <ExternalLink size={12} /> Test Tracking URL
                  </a>
                )}
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Admin Milestone Note</label>
                <textarea
                  className={styles.textAreaInput}
                  placeholder="Optional internal dispatch note or fulfillment milestone..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  disabled={isUpdatingStatus || isCancelled}
                />
              </div>

              <button
                type="submit"
                className={styles.btnSubmitStatus}
                disabled={isUpdatingStatus || isCancelled}
              >
                {isUpdatingStatus ? 'UPDATING ORDER...' : 'UPDATE ORDER STATUS'}
              </button>
            </form>
          </div>

          {/* Timeline & Audit Trail */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Clock size={16} /> ORDER JOURNEY & AUDIT
              </h2>
            </div>

            <div className={styles.timelineWrapper}>
              <div className={styles.timelineLine} />

              {/* Event 1: Order Placement */}
              <div className={styles.timelineNode}>
                <div className={styles.timelineMarker} />
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineTitle}>Order Placed</span>
                  <span className={styles.timelineTime}>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className={styles.timelineDesc}>
                  Verified order placed by {order.customerName} ({order.customerEmail}) with payment method{' '}
                  {order.paymentMethod}.
                </div>
              </div>

              {/* Status History Events */}
              {(order.statusHistory || []).map((hist, idx) => (
                <div key={idx} className={styles.timelineNode}>
                  <div
                    className={`${styles.timelineMarker} ${
                      hist.status === 'DELIVERED'
                        ? styles.markerGreen
                        : hist.status === 'CANCELLED'
                        ? styles.markerRed
                        : hist.status === 'PROCESSING' || hist.status === 'PACKED'
                        ? styles.markerAmber
                        : ''
                    }`}
                  />
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle}>
                      {hist.status.replace('_', ' ')}
                      {hist.updatedBy ? ` (by ${hist.updatedBy})` : ''}
                    </span>
                    <span className={styles.timelineTime}>{formatDateTime(hist.timestamp)}</span>
                  </div>
                  {hist.description && <div className={styles.timelineDesc}>{hist.description}</div>}
                  {hist.note && hist.note !== hist.description && (
                    <div className={styles.timelineDesc} style={{ fontStyle: 'italic' }}>
                      "{hist.note}"
                    </div>
                  )}
                </div>
              ))}

              {/* Cancellation Detail if applicable */}
              {isCancelled && order.cancellationReason && (
                <div className={styles.timelineNode}>
                  <div className={`${styles.timelineMarker} ${styles.markerRed}`} />
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle} style={{ color: '#DC2626' }}>
                      Order Cancelled
                    </span>
                    <span className={styles.timelineTime}>
                      {formatDateTime(order.cancelledAt || order.updatedAt)}
                    </span>
                  </div>
                  <div className={styles.timelineDesc} style={{ borderLeft: '3px solid #DC2626' }}>
                    Reason: {order.cancellationReason}
                    <br />
                    Inventory: {order.stockRestored ? 'Restocked to catalog' : 'Pending restock'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>CANCEL ORDER {order.orderNumber}</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className={styles.modalCloseBtn}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalAlertDanger}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Cancellation Impact:</strong>
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  <li>All ordered quantities will immediately be restored to active inventory.</li>
                  <li>Order status will become permanently CANCELLED.</li>
                  {order.paymentMethod === 'ONLINE_GATEWAY' && order.paymentStatus === 'PAID' && (
                    <li style={{ color: '#B91C1C', fontWeight: 600 }}>
                      Prepaid payment detected. Process manual refund of ₹{order.pricing?.grandTotal}.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Reason for Cancellation <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                className={styles.textAreaInput}
                placeholder="State the customer request, operational constraint, or inventory reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                ABORT
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleConfirmCancel}
                disabled={isCancelling || !cancelReason.trim()}
              >
                {isCancelling ? 'CANCELLING...' : 'CONFIRM CANCELLATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Invoice Feedback / Config Modal */}
      {emailModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <div className={styles.modalHead}>
              <h3 className={styles.modalTitle}>CUSTOMER INVOICE DISPATCH</h3>
              <button
                onClick={() => setEmailModal({ open: false, loading: false })}
                className={styles.modalCloseBtn}
                title="Close"
              >
                ✕
              </button>
            </div>

            {emailModal.loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#71717A' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                <p>Contacting email delivery service...</p>
              </div>
            ) : emailModal.success ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', fontWeight: 700, color: '#059669' }}>INVOICE SENT</h4>
                <p style={{ fontSize: '0.8125rem', color: '#52525B', margin: 0 }}>{emailModal.message}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.modalAlertWarning}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Email Service Notice:</strong>
                    <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>{emailModal.message}</p>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#71717A', margin: 0 }}>
                  You can immediately download or print the official PDF invoice below to attach to your email client.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a
                    href={`/api/admin/orders/${order._id || order.orderNumber}/invoice?download=true`}
                    className={styles.btnPrimary}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Download size={14} /> DOWNLOAD PDF
                  </a>
                  <a
                    href={`/api/admin/orders/${order._id || order.orderNumber}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnSecondary}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Printer size={14} /> PRINT PDF
                  </a>
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setEmailModal({ open: false, loading: false })}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
