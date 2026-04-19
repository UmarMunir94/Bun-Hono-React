import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { z } from 'zod';
import { type QueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

// Layouts
import { Demo1Layout } from "@/layouts/demo1/layout";

// Pages
import {
  AccountActivityPage,
  AccountAllowedIPAddressesPage,
  AccountApiKeysPage,
  AccountAppearancePage,
  AccountBackupAndRecoveryPage,
  AccountBasicPage,
  AccountCompanyProfilePage,
  AccountCurrentSessionsPage,
  AccountDeviceManagementPage,
  AccountEnterprisePage,
  AccountGetStartedPage,
  AccountHistoryPage,
  AccountImportMembersPage,
  AccountIntegrationsPage,
  AccountInviteAFriendPage,
  AccountMembersStarterPage,
  AccountNotificationsPage,
  AccountOverviewPage,
  AccountPermissionsCheckPage,
  AccountPermissionsTogglePage,
  AccountPlansPage,
  AccountPrivacySettingsPage,
  AccountRolesPage,
  AccountSecurityGetStartedPage,
  AccountSecurityLogPage,
  AccountSettingsEnterprisePage,
  AccountSettingsModalPage,
  AccountSettingsPlainPage,
  AccountSettingsSidebarPage,
  AccountTeamInfoPage,
  AccountTeamMembersPage,
  AccountTeamsPage,
  AccountTeamsStarterPage,
  AccountUserProfilePage,
} from '@/pages/account';
import {
  AuthAccountDeactivatedPage,
  AuthWelcomeMessagePage,
} from '@/pages/auth';
import { DefaultPage, Demo1DarkSidebarPage } from '@/pages/dashboards';
import {
  NetworkAppRosterPage,
  NetworkAuthorPage,
  NetworkGetStartedPage,
  NetworkMarketAuthorsPage,
  NetworkMiniCardsPage,
  NetworkNFTPage,
  NetworkSaasUsersPage,
  NetworkSocialPage,
  NetworkStoreClientsPage,
  NetworkUserCardsTeamCrewPage,
  NetworkUserTableTeamCrewPage,
  NetworkVisitorsPage,
} from '@/pages/network';
import {
  CampaignsCardPage,
  CampaignsListPage,
  ProfileActivityPage,
  ProfileBloggerPage,
  ProfileCompanyPage,
  ProfileCreatorPage,
  ProfileCRMPage,
  ProfileDefaultPage,
  ProfileEmptyPage,
  ProfileFeedsPage,
  ProfileGamerPage,
  ProfileModalPage,
  ProfileNetworkPage,
  ProfileNFTPage,
  ProfilePlainPage,
  ProfileTeamsPage,
  ProfileWorksPage,
  ProjectColumn2Page,
  ProjectColumn3Page,
} from '@/pages/public-profile';
import { AllProductsPage, DashboardPage } from '@/pages/store-admin';
import {
  MyOrdersPage,
  OrderPlacedPage,
  OrderReceiptPage,
  OrderSummaryPage,
  PaymentMethodPage,
  ProductDetailsPage,
  SearchResultsGridPage,
  SearchResultsListPage,
  ShippingInfoPage,
  StoreClientPage,
  WishlistPage,
} from '@/pages/store-client';
import { EducationPage } from "@/pages/education/education-page";
import { WorkExperiencePage } from "@/pages/work-experience/work-experience-page";

// Store Inventory Imports
import { DefaultLayout as InventoryLayout } from "@/store-inventory/layout";
import { Dashboard as InventoryDashboard } from "@/store-inventory/pages/dashboard/page";
import { AllStock } from "@/store-inventory/pages/all-stock/page";
import { CategoryDetails } from "@/store-inventory/pages/category-details/page";
import { CategoryList } from "@/store-inventory/pages/category-list/page";
import { CreateCategoryPage } from "@/store-inventory/pages/create-category/page";
import { CreateProductPage } from "@/store-inventory/pages/create-product/page";
import { CreateShippingLabelPage } from "@/store-inventory/pages/create-shipping-label/page";
import { CurrentStock } from "@/store-inventory/pages/current-stock/page";
import { InboundStock } from "@/store-inventory/pages/inbound-stock/page";
import { ManageVariantsPage } from "@/store-inventory/pages/manage-variants/page";
import { OrderList } from "@/store-inventory/pages/order-list/page";
import { OrderDetailsPage as InventoryOrderDetailsPage } from "@/store-inventory/pages/order-detials/page";
import { OrderTrackingPage } from "@/store-inventory/pages/order-tracking/page";
import { OutboundStock } from "@/store-inventory/pages/outbound-stock/page";
import { PerProductStockPage } from "@/store-inventory/pages/per-product-stock/page";
import { ProductDetailsPage as InventoryProductDetailsPage } from "@/store-inventory/pages/product-details/page";
import { ProductList } from "@/store-inventory/pages/product-list/page";
import { StockPlanner } from "@/store-inventory/pages/stock-planner/page";
import { TrackShippingPage } from "@/store-inventory/pages/track-shipping/page";
import { EditCategoryPage } from "@/store-inventory/pages/edit-category/page";
import { EditProductPage } from "@/store-inventory/pages/edit-product/page";
import { ProductInfoPage } from "@/store-inventory/pages/product-info/page";
import { CustomerList } from "@/store-inventory/pages/customer-list/page";
import { CustomerListDetails } from "@/store-inventory/pages/customer-list-details/page";
import { OrderListProducts } from "@/store-inventory/pages/order-list-products/page";
import { SettingsModal } from "@/store-inventory/pages/settings-modal/page";

// CRM Imports
import { DefaultLayout as CrmLayout } from "@/crm/layout";
import { CompanyPage } from "@/crm/pages/companies/company/page";
import { CompaniesListPage } from "@/crm/pages/companies/page";
import ContactsPage from "@/crm/pages/contacts/page";
import { Dashboard as CrmDashboard } from "@/crm/pages/dashboard/page";
import { DealsPage } from "@/crm/pages/deals/page";
import { NotesPage } from "@/crm/pages/notes/page";
import { TasksPage } from "@/crm/pages/tasks/page";

// Mail Imports
import { DefaultLayout as MailLayout } from "@/mail/layout";
import { InboxPage } from "@/mail/pages/inbox/page";
import { SentPage } from "@/mail/pages/sent/page";
import { DraftPage } from "@/mail/pages/draft/page";

// AI Imports
import { DefaultLayout as AiLayout } from "@/ai/layout";
import { AIChatPage } from "@/ai/pages/chat";
import { AIStartPage } from "@/ai/pages/start";

// Calendar Imports
import { DefaultLayout as CalendarLayout } from "@/calendar/layout";
import { CalendarPage } from "@/calendar/pages/page";

// Todo Imports
import { DefaultLayout as TodoLayout } from "@/todo/layout";
import { AllTasksPage } from "@/todo/pages/all-tasks/page";
import { TodayPage } from "@/todo/pages/today/page";
import { UpcomingPage } from "@/todo/pages/upcoming/page";
import { PriorityPage } from "@/todo/pages/priority/page";
import { CompletedPage } from "@/todo/pages/completed/page";

// Real Estate Imports
import { DefaultLayout as RealEstateLayout } from "@/real-estate/layout";
import { Page as RealEstatePage } from "@/real-estate/pages/page";

// Error Imports
import { ErrorLayout } from "@/layouts/error/layout";
import { Error404 } from "@/errors/error-404";
import { Error500 } from "@/errors/error-500";

import { SignInPage } from "@/auth/pages/signin-page";
import { SignUpPage } from '@/auth/pages/signup-page';
import { CallbackPage } from '@/auth/pages/callback-page';
import { ChangePasswordPage } from '@/auth/pages/change-password-page';
import { ResetPasswordPage } from '@/auth/pages/reset-password-page';
import { TwoFactorAuth } from '@/auth/pages/extended/tfa';
import { CheckEmail } from '@/auth/pages/extended/check-email';
import { ResetPasswordCheckEmail } from '@/auth/pages/extended/reset-password-check-email';
import { ResetPasswordChanged } from '@/auth/pages/extended/reset-password-changed';

import { BrandedLayout } from '@/auth/layouts/branded';
import { ClassicLayout } from '@/auth/layouts/classic';

// Import QueryOptions for pre-fetching
import {
  getAllEducationQueryOptions,
  getAllWorkExperienceQueryOptions,
} from "@/lib/api";

interface MyRouterContext {
  queryClient: QueryClient;
}

// ── Root Route ──────────────────────────────────────────────────────────────
export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
});

// ── Auth Layout / Guard ─────────────────────────────────────────────────────
// This route acts as a wrapper for all protected routes
export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({
        to: "/auth/signin",
        search: {
          next: location.pathname,
        },
      });
    }
  },
  component: () => <Demo1Layout />, // Using the layout from frontend2
});

// ── Protected Routes ───────────────────────────────────────────────────────

// ── Public Routes ──────────────────────────────────────────────────────────

const signinSearchSchema = z.object({
  next: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
  pwd_reset: z.string().optional(),
});

// Auth Layouts
export const brandedAuthLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "branded-auth",
  component: BrandedLayout,
});

export const classicAuthLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "classic-auth",
  component: ClassicLayout,
});

const changePasswordSearchSchema = z.object({
  token: z.string().optional(),
});

// Branded Auth Routes
export const signinRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/signin",
  validateSearch: (search) => signinSearchSchema.parse(search),
  component: SignInPage,
});

export const signupRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/signup",
  component: SignUpPage,
});

export const changePasswordRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/change-password",
  validateSearch: (search) => changePasswordSearchSchema.parse(search),
  component: ChangePasswordPage,
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/reset-password",
  component: ResetPasswordPage,
});

export const tfaRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/2fa",
  component: TwoFactorAuth,
});

export const checkEmailRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/check-email",
  component: CheckEmail,
});

export const resetPasswordCheckEmailRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/reset-password/check-email",
  component: ResetPasswordCheckEmail,
});

export const resetPasswordChangedRoute = createRoute({
  getParentRoute: () => brandedAuthLayoutRoute,
  path: "/auth/reset-password/changed",
  component: ResetPasswordChanged,
});

// Classic Auth Routes
export const classicSigninRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/signin",
  validateSearch: (search) => signinSearchSchema.parse(search),
  component: SignInPage,
});

export const classicSignupRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/signup",
  component: SignUpPage,
});

export const classicChangePasswordRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/change-password",
  validateSearch: (search) => changePasswordSearchSchema.parse(search),
  component: ChangePasswordPage,
});

export const classicResetPasswordRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/reset-password",
  component: ResetPasswordPage,
});

export const classicTfaRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/2fa",
  component: TwoFactorAuth,
});

export const classicCheckEmailRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/check-email",
  component: CheckEmail,
});

export const classicResetPasswordCheckEmailRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/reset-password/check-email",
  component: ResetPasswordCheckEmail,
});

export const classicResetPasswordChangedRoute = createRoute({
  getParentRoute: () => classicAuthLayoutRoute,
  path: "/auth/classic/reset-password/changed",
  component: ResetPasswordChanged,
});

const callbackSearchSchema = z.object({
  next: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const callbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  validateSearch: (search) => callbackSearchSchema.parse(search),
  component: CallbackPage,
});

export const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/welcome-message",
  component: AuthWelcomeMessagePage,
});

export const deactivatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/account-deactivated",
  component: AuthAccountDeactivatedPage,
});

// ── Protected Routes ───────────────────────────────────────────────────────

export const indexRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/",
  component: DefaultPage,
});

export const educationRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/education",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getAllEducationQueryOptions),
  component: EducationPage,
});

export const workExperienceRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/work-experience",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(getAllWorkExperienceQueryOptions),
  component: WorkExperiencePage,
});

export const darkSidebarRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/dark-sidebar",
  component: Demo1DarkSidebarPage,
});

// Profile Routes
export const profileDefaultRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/default",
  component: ProfileDefaultPage,
});

export const profileCreatorRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/creator",
  component: ProfileCreatorPage,
});

export const profileCompanyRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/company",
  component: ProfileCompanyPage,
});

export const profileNFTRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/nft",
  component: ProfileNFTPage,
});

export const profileBloggerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/blogger",
  component: ProfileBloggerPage,
});

export const profileCRMRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/crm",
  component: ProfileCRMPage,
});

export const profileGamerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/gamer",
  component: ProfileGamerPage,
});

export const profileFeedsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/feeds",
  component: ProfileFeedsPage,
});

export const profilePlainRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/plain",
  component: ProfilePlainPage,
});

export const profileModalRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/profiles/modal",
  component: ProfileModalPage,
});

export const project3ColRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/projects/3-columns",
  component: ProjectColumn3Page,
});

export const project2ColRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/projects/2-columns",
  component: ProjectColumn2Page,
});

export const profileWorksRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/works",
  component: ProfileWorksPage,
});

export const profileTeamsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/teams",
  component: ProfileTeamsPage,
});

export const profileNetworkRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/network",
  component: ProfileNetworkPage,
});

export const profileActivityRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/activity",
  component: ProfileActivityPage,
});

export const campaignsCardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/campaigns/card",
  component: CampaignsCardPage,
});

export const campaignsListRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/campaigns/list",
  component: CampaignsListPage,
});

export const profileEmptyRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/public-profile/empty",
  component: ProfileEmptyPage,
});

// Account Routes
export const accountGetStartedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/get-started",
  component: AccountGetStartedPage,
});

export const accountUserProfileRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/user-profile",
  component: AccountUserProfilePage,
});

export const accountCompanyProfileRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/company-profile",
  component: AccountCompanyProfilePage,
});

export const accountSettingsSidebarRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/settings-sidebar",
  component: AccountSettingsSidebarPage,
});

export const accountSettingsEnterpriseRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/settings-enterprise",
  component: AccountSettingsEnterprisePage,
});

export const accountSettingsPlainRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/settings-plain",
  component: AccountSettingsPlainPage,
});

export const accountSettingsModalRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/home/settings-modal",
  component: AccountSettingsModalPage,
});

export const accountBillingBasicRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/billing/basic",
  component: AccountBasicPage,
});

export const accountBillingEnterpriseRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/billing/enterprise",
  component: AccountEnterprisePage,
});

export const accountBillingPlansRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/billing/plans",
  component: AccountPlansPage,
});

export const accountBillingHistoryRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/billing/history",
  component: AccountHistoryPage,
});

export const accountSecurityGetStartedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/get-started",
  component: AccountSecurityGetStartedPage,
});

export const accountSecurityOverviewRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/overview",
  component: AccountOverviewPage,
});

export const accountSecurityIPRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/allowed-ip-addresses",
  component: AccountAllowedIPAddressesPage,
});

export const accountSecurityPrivacyRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/privacy-settings",
  component: AccountPrivacySettingsPage,
});

export const accountSecurityDeviceRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/device-management",
  component: AccountDeviceManagementPage,
});

export const accountSecurityBackupRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/backup-and-recovery",
  component: AccountBackupAndRecoveryPage,
});

export const accountSecuritySessionsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/current-sessions",
  component: AccountCurrentSessionsPage,
});

export const accountSecurityLogRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/security/security-log",
  component: AccountSecurityLogPage,
});

export const accountMembersStarterRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/team-starter",
  component: AccountTeamsStarterPage,
});

export const accountTeamsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/teams",
  component: AccountTeamsPage,
});

export const accountTeamInfoRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/team-info",
  component: AccountTeamInfoPage,
});

export const accountMembersRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/members-starter",
  component: AccountMembersStarterPage,
});

export const accountTeamMembersRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/team-members",
  component: AccountTeamMembersPage,
});

export const accountImportMembersRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/import-members",
  component: AccountImportMembersPage,
});

export const accountRolesRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/roles",
  component: AccountRolesPage,
});

export const accountPermsToggleRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/permissions-toggle",
  component: AccountPermissionsTogglePage,
});

export const accountPermsCheckRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/members/permissions-check",
  component: AccountPermissionsCheckPage,
});

export const accountIntegrationsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/integrations",
  component: AccountIntegrationsPage,
});

export const accountNotificationsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/notifications",
  component: AccountNotificationsPage,
});

export const accountApiKeysRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/api-keys",
  component: AccountApiKeysPage,
});

export const accountAppearanceRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/appearance",
  component: AccountAppearancePage,
});

export const accountInviteFriendRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/invite-a-friend",
  component: AccountInviteAFriendPage,
});

export const accountActivityRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/account/activity",
  component: AccountActivityPage,
});

// Network Routes
export const networkGetStartedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/get-started",
  component: NetworkGetStartedPage,
});

export const networkMiniCardsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-cards/mini-cards",
  component: NetworkMiniCardsPage,
});

export const networkTeamCrewRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-cards/team-crew",
  component: NetworkUserCardsTeamCrewPage,
});

export const networkAuthorRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-cards/author",
  component: NetworkAuthorPage,
});

export const networkNFTRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-cards/nft",
  component: NetworkNFTPage,
});

export const networkSocialRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-cards/social",
  component: NetworkSocialPage,
});

export const networkTeamCrewTableRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/team-crew",
  component: NetworkUserTableTeamCrewPage,
});

export const networkAppRosterRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/app-roster",
  component: NetworkAppRosterPage,
});

export const networkMarketAuthorsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/market-authors",
  component: NetworkMarketAuthorsPage,
});

export const networkSaasUsersRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/saas-users",
  component: NetworkSaasUsersPage,
});

export const networkStoreClientsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/store-clients",
  component: NetworkStoreClientsPage,
});

export const networkVisitorsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/network/user-table/visitors",
  component: NetworkVisitorsPage,
});

// Store Routes
export const storeHomeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/home",
  component: StoreClientPage,
});

export const storeSearchGridRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/search-results-grid",
  component: SearchResultsGridPage,
});

export const storeSearchListRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/search-results-list",
  component: SearchResultsListPage,
});

export const storeProductRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/product-details",
  component: ProductDetailsPage,
});

export const storeWishlistRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/wishlist",
  component: WishlistPage,
});

export const storeOrderSummaryRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/checkout/order-summary",
  component: OrderSummaryPage,
});

export const storeShippingRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/checkout/shipping-info",
  component: ShippingInfoPage,
});

export const storePaymentRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/checkout/payment-method",
  component: PaymentMethodPage,
});

export const storeOrderPlacedRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/checkout/order-placed",
  component: OrderPlacedPage,
});

export const storeMyOrdersRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/my-orders",
  component: MyOrdersPage,
});

export const storeReceiptRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-client/order-receipt",
  component: OrderReceiptPage,
});

export const storeAdminDashboardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-admin/dashboard",
  component: DashboardPage,
});

export const storeAdminInventoryRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-admin/inventory/all-products",
  component: AllProductsPage,
});

export const getStartedAuthRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/auth/get-started",
  component: AccountGetStartedPage,
});

// Store Inventory Routes
export const inventoryLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/store-inventory",
  component: InventoryLayout,
});

export const inventoryDashboardRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/dashboard",
  component: InventoryDashboard,
});

export const inventoryDarkSidebarRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/dark-sidebar",
  component: InventoryDashboard,
});

export const inventoryAllStockRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/all-stock",
  component: AllStock,
});

export const inventoryCurrentStockRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/current-stock",
  component: CurrentStock,
});

export const inventoryInboundStockRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/inbound-stock",
  component: InboundStock,
});

export const inventoryOutboundStockRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/outbound-stock",
  component: OutboundStock,
});

export const inventoryStockPlannerRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/stock-planner",
  component: StockPlanner,
});

export const inventoryProductListRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/product-list",
  component: ProductList,
});

export const inventoryProductDetailsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/product-details",
  component: InventoryProductDetailsPage,
});

export const inventoryCreateProductRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/create-product",
  component: CreateProductPage,
});

export const inventoryEditProductRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/edit-product",
  component: EditProductPage,
});

export const inventoryPerProductStockRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/per-product-stock",
  component: PerProductStockPage,
});

export const inventoryTrackShippingRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/track-shipping",
  component: TrackShippingPage,
});

export const inventoryProductInfoRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/product-info",
  component: ProductInfoPage,
});

export const inventoryCustomerListRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/customer-list",
  component: CustomerList,
});

export const inventoryCustomerListDetailsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/customer-list-details",
  component: CustomerListDetails,
});

export const inventorySettingsModalRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/settings-modal",
  component: SettingsModal,
});

export const inventoryCreateShippingLabelRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/create-shipping-label",
  component: CreateShippingLabelPage,
});

export const inventoryManageVariantsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/manage-variants",
  component: ManageVariantsPage,
});

export const inventoryCategoryListRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/category-list",
  component: CategoryList,
});

export const inventoryCreateCategoryRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/create-category",
  component: CreateCategoryPage,
});

export const inventoryEditCategoryRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/edit-category",
  component: EditCategoryPage,
});

export const inventoryCategoryDetailsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/category-details",
  component: CategoryDetails,
});

export const inventoryOrderListRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/order-list",
  component: OrderList,
});

export const inventoryOrderListProductsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/order-list-products",
  component: OrderListProducts,
});

export const inventoryOrderDetailsRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/order-details",
  component: InventoryOrderDetailsPage,
});

export const inventoryOrderTrackingRoute = createRoute({
  getParentRoute: () => inventoryLayoutRoute,
  path: "/order-tracking",
  component: OrderTrackingPage,
});

// CRM Routes
export const crmLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/crm",
  component: CrmLayout,
});

export const crmDashboardRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/dashboard",
  component: CrmDashboard,
});

export const crmTasksRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/tasks",
  component: TasksPage,
});

export const crmNotesRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/notes",
  component: NotesPage,
});

export const crmCompaniesListRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/companies",
  component: CompaniesListPage,
});

export const crmCompanyRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/company",
  component: CompanyPage,
});

const crmCompanyParamsSchema = z.object({
  companyId: z.string(),
});

export const crmCompanyDetailsRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/companies/$companyId",
  component: CompanyPage,
  parseParams: (params) => crmCompanyParamsSchema.parse(params),
});

export const crmContactsRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/contacts",
  component: ContactsPage,
});

const crmContactParamsSchema = z.object({
  contactId: z.string(),
});

export const crmContactDetailsRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/contacts/$contactId",
  component: CompanyPage, // Reusing CompanyPage for contact details per legacy index
  parseParams: (params) => crmContactParamsSchema.parse(params),
});

export const crmDealsRoute = createRoute({
  getParentRoute: () => crmLayoutRoute,
  path: "/deals",
  component: DealsPage,
});

// Mail Routes
export const mailLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/mail",
  component: MailLayout,
});

export const mailInboxRoute = createRoute({
  getParentRoute: () => mailLayoutRoute,
  path: "/inbox",
  component: InboxPage,
});

export const mailSentRoute = createRoute({
  getParentRoute: () => mailLayoutRoute,
  path: "/sent",
  component: SentPage,
});

export const mailDraftRoute = createRoute({
  getParentRoute: () => mailLayoutRoute,
  path: "/draft",
  component: DraftPage,
});

// AI Routes
export const aiLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/ai",
  component: AiLayout,
});

export const aiStartRoute = createRoute({
  getParentRoute: () => aiLayoutRoute,
  path: "/start",
  component: AIStartPage,
});

export const aiChatRoute = createRoute({
  getParentRoute: () => aiLayoutRoute,
  path: "/chat",
  component: AIChatPage,
});

// Calendar Routes
export const calendarLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/calendar",
  component: CalendarLayout,
});

export const calendarPageRoute = createRoute({
  getParentRoute: () => calendarLayoutRoute,
  path: "/page",
  component: CalendarPage,
});

// Todo Routes
export const todoLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/todo",
  component: TodoLayout,
});

export const todoAllTasksRoute = createRoute({
  getParentRoute: () => todoLayoutRoute,
  path: "/all-tasks",
  component: AllTasksPage,
});

export const todoTodayRoute = createRoute({
  getParentRoute: () => todoLayoutRoute,
  path: "/today",
  component: TodayPage,
});

export const todoUpcomingRoute = createRoute({
  getParentRoute: () => todoLayoutRoute,
  path: "/upcoming",
  component: UpcomingPage,
});

export const todoPriorityRoute = createRoute({
  getParentRoute: () => todoLayoutRoute,
  path: "/priority",
  component: PriorityPage,
});

export const todoCompletedRoute = createRoute({
  getParentRoute: () => todoLayoutRoute,
  path: "/completed",
  component: CompletedPage,
});

// Real Estate Routes
export const realEstateLayoutRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/real-estate",
  component: RealEstateLayout,
});

export const realEstatePageRoute = createRoute({
  getParentRoute: () => realEstateLayoutRoute,
  path: "/page",
  component: RealEstatePage,
});

// Error Routes
export const errorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "error-layout",
  component: ErrorLayout,
});

export const error404Route = createRoute({
  getParentRoute: () => errorLayoutRoute,
  path: "/error/404",
  component: Error404,
});

export const error500Route = createRoute({
  getParentRoute: () => errorLayoutRoute,
  path: "/error/500",
  component: Error500,
});

// ── Route Tree ──────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([
    indexRoute,
    educationRoute,
    workExperienceRoute,
    darkSidebarRoute,
    profileDefaultRoute,
    profileCreatorRoute,
    profileCompanyRoute,
    profileNFTRoute,
    profileBloggerRoute,
    profileCRMRoute,
    profileGamerRoute,
    profileFeedsRoute,
    profilePlainRoute,
    profileModalRoute,
    project3ColRoute,
    project2ColRoute,
    profileWorksRoute,
    profileTeamsRoute,
    profileNetworkRoute,
    profileActivityRoute,
    campaignsCardRoute,
    campaignsListRoute,
    profileEmptyRoute,
    accountGetStartedRoute,
    accountUserProfileRoute,
    accountCompanyProfileRoute,
    accountSettingsSidebarRoute,
    accountSettingsEnterpriseRoute,
    accountSettingsPlainRoute,
    accountSettingsModalRoute,
    accountBillingBasicRoute,
    accountBillingEnterpriseRoute,
    accountBillingPlansRoute,
    accountBillingHistoryRoute,
    accountSecurityGetStartedRoute,
    accountSecurityOverviewRoute,
    accountSecurityIPRoute,
    accountSecurityPrivacyRoute,
    accountSecurityDeviceRoute,
    accountSecurityBackupRoute,
    accountSecuritySessionsRoute,
    accountSecurityLogRoute,
    accountMembersStarterRoute,
    accountTeamsRoute,
    accountTeamInfoRoute,
    accountMembersRoute,
    accountTeamMembersRoute,
    accountImportMembersRoute,
    accountRolesRoute,
    accountPermsToggleRoute,
    accountPermsCheckRoute,
    accountIntegrationsRoute,
    accountNotificationsRoute,
    accountApiKeysRoute,
    accountAppearanceRoute,
    accountInviteFriendRoute,
    accountActivityRoute,
    networkGetStartedRoute,
    networkMiniCardsRoute,
    networkTeamCrewRoute,
    networkAuthorRoute,
    networkNFTRoute,
    networkSocialRoute,
    networkTeamCrewTableRoute,
    networkAppRosterRoute,
    networkMarketAuthorsRoute,
    networkSaasUsersRoute,
    networkStoreClientsRoute,
    networkVisitorsRoute,
    storeHomeRoute,
    storeSearchGridRoute,
    storeSearchListRoute,
    storeProductRoute,
    storeWishlistRoute,
    storeOrderSummaryRoute,
    storeShippingRoute,
    storePaymentRoute,
    storeOrderPlacedRoute,
    storeMyOrdersRoute,
    storeReceiptRoute,
    storeAdminDashboardRoute,
    storeAdminInventoryRoute,
    getStartedAuthRoute,
    inventoryLayoutRoute.addChildren([
      inventoryDashboardRoute,
      inventoryDarkSidebarRoute,
      inventoryAllStockRoute,
      inventoryCurrentStockRoute,
      inventoryInboundStockRoute,
      inventoryOutboundStockRoute,
      inventoryStockPlannerRoute,
      inventoryProductListRoute,
      inventoryProductDetailsRoute,
      inventoryCreateProductRoute,
      inventoryEditProductRoute,
      inventoryPerProductStockRoute,
      inventoryTrackShippingRoute,
      inventoryProductInfoRoute,
      inventoryCustomerListRoute,
      inventoryCustomerListDetailsRoute,
      inventorySettingsModalRoute,
      inventoryCreateShippingLabelRoute,
      inventoryManageVariantsRoute,
      inventoryCategoryListRoute,
      inventoryCreateCategoryRoute,
      inventoryEditCategoryRoute,
      inventoryCategoryDetailsRoute,
      inventoryOrderListRoute,
      inventoryOrderListProductsRoute,
      inventoryOrderDetailsRoute,
      inventoryOrderTrackingRoute,
    ]),
    crmLayoutRoute.addChildren([
      crmDashboardRoute,
      crmTasksRoute,
      crmNotesRoute,
      crmCompaniesListRoute,
      crmCompanyRoute,
      crmCompanyDetailsRoute,
      crmContactsRoute,
      crmContactDetailsRoute,
      crmDealsRoute,
    ]),
    mailLayoutRoute.addChildren([
      mailInboxRoute,
      mailSentRoute,
      mailDraftRoute,
    ]),
    aiLayoutRoute.addChildren([
      aiStartRoute,
      aiChatRoute,
    ]),
    calendarLayoutRoute.addChildren([
      calendarPageRoute,
    ]),
    todoLayoutRoute.addChildren([
      todoAllTasksRoute,
      todoTodayRoute,
      todoUpcomingRoute,
      todoPriorityRoute,
      todoCompletedRoute,
    ]),
    realEstateLayoutRoute.addChildren([
      realEstatePageRoute,
    ]),
  ]),
  errorLayoutRoute.addChildren([
    error404Route,
    error500Route,
  ]),
  brandedAuthLayoutRoute.addChildren([
    signinRoute,
    signupRoute,
    changePasswordRoute,
    resetPasswordRoute,
    tfaRoute,
    checkEmailRoute,
    resetPasswordCheckEmailRoute,
    resetPasswordChangedRoute,
  ]),
  classicAuthLayoutRoute.addChildren([
    classicSigninRoute,
    classicSignupRoute,
    classicChangePasswordRoute,
    classicResetPasswordRoute,
    classicTfaRoute,
    classicCheckEmailRoute,
    classicResetPasswordCheckEmailRoute,
    classicResetPasswordChangedRoute,
  ]),
  callbackRoute,
  welcomeRoute,
  deactivatedRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!, // This will be set in the Provider
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
