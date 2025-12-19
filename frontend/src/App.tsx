import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./modules/user/Home";
import Search from "./modules/user/Search";
import Orders from "./modules/user/Orders";
import OrderDetail from "./modules/user/OrderDetail";
import OrderAgain from "./modules/user/OrderAgain";
import Account from "./modules/user/Account";
import Wallet from "./modules/user/Wallet"; // Customer Wallet
import Categories from "./modules/user/Categories";
import Category from "./modules/user/Category";
import Cart from "./modules/user/Cart";
import Checkout from "./modules/user/Checkout";
import CheckoutAddress from "./modules/user/CheckoutAddress";
import ProductDetail from "./modules/user/ProductDetail";
import AddressBook from "./modules/user/AddressBook";
import Wishlist from "./modules/user/Wishlist";
import SpiritualStore from "./modules/user/SpiritualStore";
import PharmaStore from "./modules/user/PharmaStore";
import EGiftStore from "./modules/user/EGiftStore";
import PetStore from "./modules/user/PetStore";
import SportsStore from "./modules/user/SportsStore";
import FashionStore from "./modules/user/FashionStore";
import ToyStore from "./modules/user/ToyStore";
import HobbyStore from "./modules/user/HobbyStore";
import Login from "./modules/user/Login";
import SignUp from "./modules/user/SignUp";
import AboutUs from "./modules/user/AboutUs";
import DeliveryLayout from "./modules/delivery/components/DeliveryLayout";
import DeliveryDashboard from "./modules/delivery/pages/DeliveryDashboard";
import DeliveryOrders from "./modules/delivery/pages/DeliveryOrders";
import DeliveryNotifications from "./modules/delivery/pages/DeliveryNotifications";
import DeliveryMenu from "./modules/delivery/pages/DeliveryMenu";
import DeliveryPendingOrders from "./modules/delivery/pages/DeliveryPendingOrders";
import DeliveryAllOrders from "./modules/delivery/pages/DeliveryAllOrders";
import DeliveryReturnOrders from "./modules/delivery/pages/DeliveryReturnOrders";
import DeliveryProfile from "./modules/delivery/pages/DeliveryProfile";
import DeliveryEarnings from "./modules/delivery/pages/DeliveryEarnings";
import DeliverySettings from "./modules/delivery/pages/DeliverySettings";
import DeliveryHelp from "./modules/delivery/pages/DeliveryHelp";
import DeliveryAbout from "./modules/delivery/pages/DeliveryAbout";
import DeliveryLogin from "./modules/delivery/pages/DeliveryLogin";
import SellerLayout from "./modules/seller/components/SellerLayout";
import SellerDashboard from "./modules/seller/pages/SellerDashboard";
import SellerOrders from "./modules/seller/pages/SellerOrders";
import SellerOrderDetail from "./modules/seller/pages/SellerOrderDetail";
import SellerCategory from "./modules/seller/pages/SellerCategory";
import SellerSubCategory from "./modules/seller/pages/SellerSubCategory";
import SellerAddProduct from "./modules/seller/pages/SellerAddProduct";
import SellerTaxes from "./modules/seller/pages/SellerTaxes";
import SellerProductList from "./modules/seller/pages/SellerProductList";
import SellerStockManagement from "./modules/seller/pages/SellerStockManagement";
import SellerWallet from "./modules/seller/pages/SellerWallet";
import SellerSalesReport from "./modules/seller/pages/SellerSalesReport";
import SellerReturnRequest from "./modules/seller/pages/SellerReturnRequest";
import SellerAccountSettings from "./modules/seller/pages/SellerAccountSettings";
import SellerLogin from "./modules/seller/pages/SellerLogin";
import SellerSignUp from "./modules/seller/pages/SellerSignUp";
import DeliverySignUp from "./modules/delivery/pages/DeliverySignUp";
import AdminLayout from "./modules/admin/components/AdminLayout";
import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import AdminLogin from "./modules/admin/pages/AdminLogin";

import AdminCategory from "./modules/admin/pages/AdminCategory";
import AdminHeaderCategory from "./modules/admin/pages/AdminHeaderCategory";
import AdminSubCategory from "./modules/admin/pages/AdminSubCategory";
import AdminBrand from "./modules/admin/pages/AdminBrand";
import AdminAddProduct from "./modules/admin/pages/AdminAddProduct";
import AdminBulkImport from "./modules/admin/pages/AdminBulkImport";
import AdminBulkUpdate from "./modules/admin/pages/AdminBulkUpdate";
import AdminTaxes from "./modules/admin/pages/AdminTaxes";
import AdminProductOrder from "./modules/admin/pages/AdminProductOrder";
import AdminProductRequest from "./modules/admin/pages/AdminProductRequest";
import AdminCategoryOrder from "./modules/admin/pages/AdminCategoryOrder";
import AdminAddSeller from "./modules/admin/pages/AdminAddSeller";
import AdminSellerTransaction from "./modules/admin/pages/AdminSellerTransaction";
import AdminStockManagement from "./modules/admin/pages/AdminStockManagement";
import AdminSubcategoryOrder from "./modules/admin/pages/AdminSubcategoryOrder";
import AdminManageSellerList from "./modules/admin/pages/AdminManageSellerList";
import AdminCoupon from "./modules/admin/pages/AdminCoupon";
import AdminNotification from "./modules/admin/pages/AdminNotification";
import AdminSellerLocation from "./modules/admin/pages/AdminSellerLocation";
import AdminWallet from "./modules/admin/pages/AdminWallet";
import AdminAddDeliveryBoy from "./modules/admin/pages/AdminAddDeliveryBoy";
import AdminManageDeliveryBoy from "./modules/admin/pages/AdminManageDeliveryBoy";
import AdminFundTransfer from "./modules/admin/pages/AdminFundTransfer";
import AdminCashCollection from "./modules/admin/pages/AdminCashCollection";
import AdminReturnRequest from "./modules/admin/pages/AdminReturnRequest";
import AdminPaymentList from "./modules/admin/pages/AdminPaymentList";
import AdminSmsGateway from "./modules/admin/pages/AdminSmsGateway";
import AdminSystemUser from "./modules/admin/pages/AdminSystemUser";
import AdminManageRoles from "./modules/admin/pages/AdminManageRoles";
import AdminUsers from "./modules/admin/pages/AdminUsers";
import AdminFAQ from "./modules/admin/pages/AdminFAQ";
import AdminHomeSection from "./modules/admin/pages/AdminHomeSection";
import AdminShopByStore from "./modules/admin/pages/AdminShopByStore";
import AdminAllOrders from "./modules/admin/pages/AdminAllOrders";
import AdminPendingOrders from "./modules/admin/pages/AdminPendingOrders";
import AdminReceivedOrders from "./modules/admin/pages/AdminReceivedOrders";
import AdminProcessedOrders from "./modules/admin/pages/AdminProcessedOrders";
import AdminShippedOrders from "./modules/admin/pages/AdminShippedOrders";
import AdminOutForDeliveryOrders from "./modules/admin/pages/AdminOutForDeliveryOrders";
import AdminDeliveredOrders from "./modules/admin/pages/AdminDeliveredOrders";
import AdminCancelledOrders from "./modules/admin/pages/AdminCancelledOrders";
import AdminCustomerAppPolicy from "./modules/admin/pages/AdminCustomerAppPolicy";
import AdminDeliveryAppPolicy from "./modules/admin/pages/AdminDeliveryAppPolicy";
import AdminOrders from "./modules/admin/pages/AdminOrders";
import AdminSettings from "./modules/admin/pages/AdminSettings";
import AdminManageCustomer from "./modules/admin/pages/AdminManageCustomer";

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <OrdersProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/seller/login" element={<SellerLogin />} />
                <Route path="/seller/signup" element={<SellerSignUp />} />
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route path="/delivery/signup" element={<DeliverySignUp />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Delivery App Routes */}
                <Route
                  path="/delivery/*"
                  element={
                    <DeliveryLayout>
                      <Routes>
                        <Route path="" element={<DeliveryDashboard />} />
                        <Route path="orders" element={<DeliveryOrders />} />
                        <Route
                          path="orders/pending"
                          element={<DeliveryPendingOrders />}
                        />
                        <Route
                          path="orders/all"
                          element={<DeliveryAllOrders />}
                        />
                        <Route
                          path="orders/return"
                          element={<DeliveryReturnOrders />}
                        />
                        <Route
                          path="notifications"
                          element={<DeliveryNotifications />}
                        />
                        <Route path="menu" element={<DeliveryMenu />} />
                        <Route path="profile" element={<DeliveryProfile />} />
                        <Route path="earnings" element={<DeliveryEarnings />} />
                        <Route path="settings" element={<DeliverySettings />} />
                        <Route path="help" element={<DeliveryHelp />} />
                        <Route path="about" element={<DeliveryAbout />} />
                      </Routes>
                    </DeliveryLayout>
                  }
                />
                {/* Seller App Routes */}
                <Route
                  path="/seller/*"
                  element={
                    <SellerLayout>
                      <Routes>
                        <Route path="" element={<SellerDashboard />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route
                          path="orders/:id"
                          element={<SellerOrderDetail />}
                        />
                        <Route path="category" element={<SellerCategory />} />
                        <Route
                          path="subcategory"
                          element={<SellerSubCategory />}
                        />
                        <Route
                          path="product/add"
                          element={<SellerAddProduct />}
                        />
                        <Route path="product/taxes" element={<SellerTaxes />} />
                        <Route
                          path="product/list"
                          element={<SellerProductList />}
                        />
                        <Route
                          path="product/stock"
                          element={<SellerStockManagement />}
                        />
                        <Route
                          path="return"
                          element={<SellerReturnRequest />}
                        />
                        <Route
                          path="return-order"
                          element={<SellerReturnRequest />}
                        />
                        <Route
                          path="wallet"
                          element={<SellerWallet />}
                        />
                        <Route
                          path="reports/sales"
                          element={<SellerSalesReport />}
                        />
                        <Route
                          path="account-settings"
                          element={<SellerAccountSettings />}
                        />
                      </Routes>
                    </SellerLayout>
                  }
                />
                {/* Admin App Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute
                      requiredUserType="Admin"
                      redirectTo="/admin/login">
                      <AdminLayout>
                        <Routes>
                          <Route path="" element={<AdminDashboard />} />

                          <Route path="category" element={<AdminCategory />} />
                          <Route
                            path="category/header"
                            element={<AdminHeaderCategory />}
                          />
                          <Route
                            path="subcategory"
                            element={<AdminSubCategory />}
                          />
                          <Route
                            path="subcategory-order"
                            element={<AdminSubcategoryOrder />}
                          />
                          <Route path="brand" element={<AdminBrand />} />
                          <Route
                            path="product/add"
                            element={<AdminAddProduct />}
                          />
                          <Route
                            path="product/bulk-import"
                            element={<AdminBulkImport />}
                          />
                          <Route
                            path="product/bulk-update"
                            element={<AdminBulkUpdate />}
                          />
                          <Route
                            path="product/taxes"
                            element={<AdminTaxes />}
                          />
                          <Route
                            path="product/list"
                            element={<AdminStockManagement />}
                          />
                          <Route
                            path="product/order"
                            element={<AdminProductOrder />}
                          />
                          <Route
                            path="product/request"
                            element={<AdminProductRequest />}
                          />
                          <Route
                            path="category-order"
                            element={<AdminCategoryOrder />}
                          />
                          <Route
                            path="manage-seller/add"
                            element={<AdminAddSeller />}
                          />
                          <Route
                            path="manage-seller/list"
                            element={<AdminManageSellerList />}
                          />
                          <Route
                            path="manage-seller/transaction"
                            element={<AdminSellerTransaction />}
                          />
                          <Route
                            path="delivery-boy/add"
                            element={<AdminAddDeliveryBoy />}
                          />
                          <Route
                            path="delivery-boy/manage"
                            element={<AdminManageDeliveryBoy />}
                          />
                          <Route
                            path="delivery-boy/fund-transfer"
                            element={<AdminFundTransfer />}
                          />
                          <Route
                            path="delivery-boy/cash-collection"
                            element={<AdminCashCollection />}
                          />
                          <Route
                            path="stock-management"
                            element={<AdminStockManagement />}
                          />
                          <Route
                            path="manage-location/seller-location"
                            element={<AdminSellerLocation />}
                          />
                          <Route path="wallet" element={<AdminWallet />} />
                          <Route path="coupon" element={<AdminCoupon />} />
                          <Route
                            path="return"
                            element={<AdminReturnRequest />}
                          />
                          <Route
                            path="notification"
                            element={<AdminNotification />}
                          />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route
                            path="customers"
                            element={<AdminManageCustomer />}
                          />
                          <Route
                            path="collect-cash"
                            element={<AdminCashCollection />}
                          />
                          <Route
                            path="payment-list"
                            element={<AdminPaymentList />}
                          />
                          <Route
                            path="sms-gateway"
                            element={<AdminSmsGateway />}
                          />
                          <Route
                            path="system-user"
                            element={<AdminSystemUser />}
                          />
                          <Route
                            path="manage-roles"
                            element={<AdminManageRoles />}
                          />
                          <Route
                            path="customer-app-policy"
                            element={<AdminCustomerAppPolicy />}
                          />
                          <Route
                            path="delivery-app-policy"
                            element={<AdminDeliveryAppPolicy />}
                          />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="faq" element={<AdminFAQ />} />
                          <Route
                            path="home-section"
                            element={<AdminHomeSection />}
                          />
                          <Route
                            path="shop-by-store"
                            element={<AdminShopByStore />}
                          />
                          <Route
                            path="orders/all"
                            element={<AdminAllOrders />}
                          />
                          <Route
                            path="orders/pending"
                            element={<AdminPendingOrders />}
                          />
                          <Route
                            path="orders/received"
                            element={<AdminReceivedOrders />}
                          />
                          <Route
                            path="orders/processed"
                            element={<AdminProcessedOrders />}
                          />
                          <Route
                            path="orders/shipped"
                            element={<AdminShippedOrders />}
                          />
                          <Route
                            path="orders/out-for-delivery"
                            element={<AdminOutForDeliveryOrders />}
                          />
                          <Route
                            path="orders/delivered"
                            element={<AdminDeliveredOrders />}
                          />
                          <Route
                            path="orders/cancelled"
                            element={<AdminCancelledOrders />}
                          />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Main App Routes */}
                <Route
                  path="/*"
                  element={
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/user/home" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetail />} />
                        <Route path="/order-again" element={<OrderAgain />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/address-book" element={<AddressBook />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/category/:id" element={<Category />} />
                        <Route
                          path="/product/:id"
                          element={<ProductDetail />}
                        />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route
                          path="/checkout/address"
                          element={<CheckoutAddress />}
                        />
                        <Route
                          path="/store/spiritual"
                          element={<SpiritualStore />}
                        />
                        <Route path="/store/pharma" element={<PharmaStore />} />
                        <Route path="/store/e-gifts" element={<EGiftStore />} />
                        <Route path="/store/pet" element={<PetStore />} />
                        <Route path="/store/sports" element={<SportsStore />} />
                        <Route
                          path="/store/fashion-basics"
                          element={<FashionStore />}
                        />
                        <Route path="/store/toy" element={<ToyStore />} />
                        <Route path="/store/hobby" element={<HobbyStore />} />
                      </Routes>
                    </AppLayout>
                  }
                />
              </Routes>
            </BrowserRouter>
          </OrdersProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
