# Phase 3: Analytics & Administration

**Project:** NDC Packaging & Quantity Calculator (QuantRx)  
**Phase:** Analytics & Administration  
**Goal:** Provide administrators with insights, reporting, and management capabilities

---

## Overview

Phase 3 adds an administrator dashboard with analytics, reporting, and user management features. This phase enables administrators to monitor system usage, identify trends, and make data-driven decisions to improve accuracy and efficiency.

### Phase Deliverables

- ✅ Administrator dashboard with key metrics
- ✅ Analytics and reporting system
- ✅ User activity monitoring
- ✅ Accuracy metrics and trends
- ✅ User management interface
- ✅ Bulk calculation processing
- ✅ Advanced search and filtering
- ✅ Export reports functionality
- ✅ Data visualization (charts and graphs)

### Success Criteria

- Admins can view comprehensive dashboard with key metrics
- System tracks accuracy rates, error rates, and usage patterns
- Admins can manage users (create, update, deactivate)
- Reports can be exported in multiple formats
- Data visualizations provide actionable insights
- Bulk operations streamline workflows
- Advanced search enables quick data retrieval

---

## Feature 1: Administrator Dashboard Page

**Goal:** Create a comprehensive dashboard for administrators.

### Steps

1. **Create dashboard route**
   - Create `app/(admin)/dashboard/page.jsx`
   - Use route group `(admin)` for admin-only pages
   - Add middleware to protect route (admin role required)

2. **Design dashboard layout**
   - Create grid layout with metric cards
   - Sections: Overview, Recent Activity, Accuracy Metrics, Usage Trends
   - Responsive layout (stacks on tablet/mobile)

3. **Create dashboard components**
   - Create `components/admin/Dashboard/Dashboard.jsx`
   - Create `components/admin/MetricCard/MetricCard.jsx` for stat display
   - Create `components/admin/ActivityFeed/ActivityFeed.jsx` for recent actions

4. **Add navigation**
   - Update `components/layout/Navigation/Navigation.jsx`
   - Add "Dashboard" link for admins only
   - Show admin badge next to username

5. **Test dashboard access**
   - Verify admins can access dashboard
   - Verify non-admins redirected or see 403 error
   - Test responsive layout

**Validation:** Dashboard accessible to admins only, layout responsive, sections render correctly

---

## Feature 2: Key Metrics Overview

**Goal:** Display critical metrics at a glance on dashboard.

### Steps

1. **Define key metrics**
   - Total calculations (all time, this month, this week)
   - Accuracy rate (% of calculations verified without issues)
   - Error rate (% of calculations with warnings or errors)
   - Active users (users who performed calculations in last 30 days)
   - Average response time (API calculation time)

2. **Create metrics API route**
   - Create `app/api/admin/metrics/route.js`
   - Query calculations table for counts and aggregates
   - Calculate accuracy rate from verification data
   - Calculate error rate from warnings field
   - Return metrics object

3. **Create metrics components**
   - Create `components/admin/MetricsOverview/MetricsOverview.jsx`
   - Display metrics in cards with icons
   - Show trend indicators (up/down arrows, percentage change)
   - Use color coding: green for good, red for concerning

4. **Add time range selector**
   - Add dropdown: Last 7 days, Last 30 days, Last 90 days, All time
   - Filter metrics based on selected range
   - Update metrics when range changes

5. **Test metrics calculation**
   - Verify metrics calculate correctly
   - Test with different time ranges
   - Verify trend indicators accurate

**Validation:** Metrics accurate, display correctly, time range filtering works

---

## Feature 3: Usage Analytics

**Goal:** Track and visualize system usage patterns.

### Steps

1. **Create usage analytics API route**
   - Create `app/api/admin/analytics/usage/route.js`
   - Query calculations by date, user, drug type
   - Aggregate data for charts: calculations per day, per user, per drug category
   - Return time series data

2. **Install charting library**
   - Install Chart.js or Recharts: `npm install recharts`
   - Choose based on needs (Recharts integrates well with React)

3. **Create usage charts**
   - Create `components/admin/UsageChart/UsageChart.jsx`
   - Line chart: Calculations over time (daily, weekly, monthly)
   - Bar chart: Top 10 most calculated drugs
   - Pie chart: Calculations by user role

4. **Add filters and controls**
   - Date range picker for time series data
   - Drug category filter
   - User role filter
   - Export chart data button

5. **Test analytics visualization**
   - Verify charts render correctly with data
   - Test filters update charts
   - Test with edge cases (no data, single data point)

**Validation:** Charts display usage data correctly, filters work, visualizations insightful

---

## Feature 4: Accuracy Metrics and Trends

**Goal:** Monitor calculation accuracy and identify improvement areas.

### Steps

1. **Define accuracy metrics**
   - Verification rate: % of calculations verified by pharmacist
   - Error-free rate: % of calculations with no warnings
   - SIG parsing success rate: % of SIGs parsed successfully (regex + AI)
   - NDC match rate: % of calculations with exact or near-exact NDC match
   - Average overfill/underfill percentage

2. **Create accuracy analytics API route**
   - Create `app/api/admin/analytics/accuracy/route.js`
   - Query calculations and aggregate accuracy metrics
   - Calculate rates and percentages
   - Return time series for trends

3. **Create accuracy dashboard section**
   - Create `components/admin/AccuracyMetrics/AccuracyMetrics.jsx`
   - Display accuracy metrics in cards
   - Show trends: "Accuracy improved 5% this month"
   - Highlight concerning metrics (error rate > 10%)

4. **Create accuracy trend charts**
   - Line chart: Accuracy rate over time
   - Bar chart: Error types distribution (inactive NDC, parsing failure, overfill)
   - Heatmap: Accuracy by drug category (optional)

5. **Test accuracy metrics**
   - Verify metrics calculated correctly
   - Test trend calculations
   - Verify charts display trends accurately

**Validation:** Accuracy metrics accurate, trends calculated correctly, visualizations clear

---

## Feature 5: User Activity Monitoring

**Goal:** Track user actions and activity for audit and compliance.

### Steps

1. **Create user activity API route**
   - Create `app/api/admin/activity/route.js`
   - Query audit_logs table
   - Filter by user, action, date range
   - Paginate results (20-50 per page)

2. **Create activity feed component**
   - Create `components/admin/ActivityFeed/ActivityFeed.jsx`
   - Display recent actions: "User X created calculation", "User Y verified calculation"
   - Show timestamp, user, action, resource
   - Link to calculation details

3. **Add activity filters**
   - Filter by user (dropdown of all users)
   - Filter by action type (calculation, verification, export)
   - Filter by date range
   - Search by calculation ID or drug name

4. **Create detailed activity view**
   - Click on activity item to see full details
   - Show metadata: inputs, outputs, errors, user agent
   - Display in modal or side panel

5. **Test activity monitoring**
   - Verify activities logged and displayed
   - Test filters work correctly
   - Test pagination
   - Test detailed view shows complete information

**Validation:** Activity logged correctly, filters functional, details accessible

---

## Feature 6: User Management

**Goal:** Allow admins to manage user accounts and roles.

### Steps

1. **Create user management page**
   - Create `app/(admin)/users/page.jsx`
   - Display table of all users
   - Show: name, email, role, status (active/inactive), last login, created date

2. **Create users API routes**
   - Create `app/api/admin/users/route.js` for list and create
   - Create `app/api/admin/users/[id]/route.js` for update and delete
   - Implement CRUD operations for users table
   - Sync with Auth0 when updating roles

3. **Add user management actions**
   - Edit user: Change role, update email
   - Deactivate user: Set status to inactive (don't delete)
   - Reactivate user: Set status back to active
   - View user activity: Link to activity feed filtered by user

4. **Create user form modal**
   - Create `components/admin/UserFormModal/UserFormModal.jsx`
   - Form fields: name, email, role
   - Validation: email format, role selection required
   - Submit updates user via API

5. **Test user management**
   - Verify user list displays correctly
   - Test edit user updates database and Auth0
   - Test deactivate/reactivate changes user status
   - Test view activity shows user's actions

**Validation:** User management works, roles update correctly, Auth0 synced

---

## Feature 7: Advanced Search and Filtering

**Goal:** Enable powerful search across calculations.

### Steps

1. **Create advanced search UI**
   - Create `components/search/AdvancedSearch/AdvancedSearch.jsx`
   - Search fields: drug name, NDC, user, date range, status (pending/verified)
   - Add "Advanced Search" toggle to show/hide advanced options

2. **Create search API route**
   - Create `app/api/calculations/search/route.js`
   - Build dynamic SQL query based on search parameters
   - Support multiple filters combined with AND logic
   - Paginate results

3. **Implement full-text search**
   - Add full-text search on drug_name and sig fields
   - Use PostgreSQL full-text search (tsvector)
   - Rank results by relevance

4. **Add saved searches**
   - Allow users to save frequently used searches
   - Store saved searches in user preferences (database or localStorage)
   - Quick access to saved searches from dropdown

5. **Test advanced search**
   - Test each filter individually
   - Test multiple filters combined
   - Test full-text search finds relevant results
   - Test saved searches persist and work

**Validation:** Advanced search functional, filters work, results accurate

---

## Feature 8: Bulk Calculation Processing

**Goal:** Enable processing multiple calculations at once.

### Steps

1. **Create bulk upload interface**
   - Create `app/(admin)/bulk/page.jsx`
   - Allow CSV file upload with multiple prescriptions
   - Show preview of data before processing

2. **Define CSV format**
   - Columns: drug_name, ndc, sig, days_supply
   - Support both drug name and direct NDC entry
   - Validate CSV format before processing

3. **Create bulk processing API route**
   - Create `app/api/calculations/bulk/route.js`
   - Accept CSV data
   - Process calculations sequentially or in batches
   - Return results with success/failure for each row

4. **Display bulk processing results**
   - Show progress indicator during processing
   - Display results table: row number, drug name, status (success/error), message
   - Allow export of results as CSV

5. **Test bulk processing**
   - Test with valid CSV file
   - Test with invalid data (missing fields, wrong format)
   - Verify error handling for individual rows
   - Test with large files (100+ rows)

**Validation:** Bulk upload works, processing completes, errors handled per row

---

## Feature 9: Report Generation

**Goal:** Generate and export comprehensive reports.

### Steps

1. **Define report types**
   - Accuracy Report: Accuracy metrics over time period
   - Usage Report: Calculation volume, top drugs, top users
   - Error Report: List of calculations with warnings/errors
   - User Activity Report: Activity by user or date range

2. **Create report generation UI**
   - Create `components/admin/ReportGenerator/ReportGenerator.jsx`
   - Select report type, date range, filters
   - Choose export format (CSV, PDF, Excel)

3. **Create report API routes**
   - Create `app/api/admin/reports/route.js`
   - Generate report based on type and parameters
   - Query database and aggregate data
   - Return report data

4. **Implement report export**
   - CSV: Use existing CSV export utility
   - PDF: Generate formatted PDF report with charts
   - Excel: Use library like `xlsx` for Excel export

5. **Test report generation**
   - Test each report type
   - Verify data accuracy
   - Test export to all formats
   - Test with various date ranges and filters

**Validation:** Reports generate correctly, data accurate, exports work for all formats

---

## Feature 10: Data Visualization Enhancements

**Goal:** Provide rich visualizations for data insights.

### Steps

1. **Add chart variety**
   - Line charts for trends over time
   - Bar charts for comparisons
   - Pie charts for distributions
   - Heatmaps for patterns (optional)

2. **Create visualization library**
   - Create `components/charts/` directory
   - Create reusable chart components: `LineChart.jsx`, `BarChart.jsx`, `PieChart.jsx`
   - Use Recharts for consistency

3. **Add interactive features**
   - Hover tooltips showing exact values
   - Click to drill down into data
   - Zoom and pan for time series data
   - Toggle data series on/off

4. **Add dashboard customization**
   - Allow admins to customize dashboard layout
   - Save dashboard preferences per user
   - Add/remove widgets
   - Rearrange widgets via drag-and-drop (optional)

5. **Test visualizations**
   - Verify charts render with data
   - Test interactive features work
   - Test responsiveness on different screen sizes
   - Test customization persists

**Validation:** Charts display data correctly, interactions work, customization persists

---

## Feature 11: API Rate Limiting and Monitoring

**Goal:** Monitor and control API usage for external APIs (RxNorm, FDA).

### Steps

1. **Create API usage tracking**
   - Log each external API call: endpoint, timestamp, duration, status
   - Store in `api_usage_logs` table
   - Include user ID and calculation ID

2. **Create API monitoring dashboard**
   - Create `components/admin/APIMonitoring/APIMonitoring.jsx`
   - Display: total calls, calls per hour, average response time, error rate
   - Show charts: API calls over time, response times

3. **Implement rate limit monitoring**
   - Track RxNorm API usage (limit: 20 req/sec)
   - Display current usage vs limit
   - Alert when approaching limit (>80% of limit)

4. **Add API health checks**
   - Periodic health checks for RxNorm and FDA APIs
   - Display API status: operational, degraded, down
   - Show last successful call timestamp

5. **Test API monitoring**
   - Verify API calls logged
   - Test dashboard displays metrics
   - Test rate limit warnings
   - Test health check indicators

**Validation:** API usage tracked, metrics displayed, rate limits monitored

---

## Feature 12: System Configuration

**Goal:** Allow admins to configure system settings.

### Steps

1. **Create settings page**
   - Create `app/(admin)/settings/page.jsx`
   - Sections: General, Calculation Settings, Notifications, Integrations

2. **Define configurable settings**
   - Overfill/underfill tolerance (default: 10%)
   - SIG parsing method preference (regex first, AI fallback)
   - Notification settings (email alerts, Slack integration)
   - API timeout values
   - Cache duration

3. **Create settings API routes**
   - Create `app/api/admin/settings/route.js`
   - Store settings in `system_settings` table
   - Allow get and update operations

4. **Create settings form**
   - Form with sections and fields
   - Validation for numeric values (percentages, timeouts)
   - Save button with confirmation

5. **Test settings**
   - Verify settings save correctly
   - Test updated settings apply to calculations
   - Test default values
   - Test validation

**Validation:** Settings save and apply correctly, validation works

---

## Testing Checklist

Before moving to Phase 4, verify:

- [ ] Admin dashboard displays correctly with metrics
- [ ] Usage analytics charts show accurate data
- [ ] Accuracy metrics calculated correctly
- [ ] User activity monitored and displayed
- [ ] User management works (create, update, deactivate)
- [ ] Advanced search finds calculations correctly
- [ ] Bulk processing handles multiple calculations
- [ ] Reports generate accurately in all formats
- [ ] Data visualizations render correctly and are interactive
- [ ] API usage tracked and monitored
- [ ] System settings save and apply

---

## Known Limitations (Expected at End of Phase 3)

Phase 3 focuses on analytics and administration. Intentionally excluded:

- ❌ Mobile application (Phase 4 - future)
- ❌ Offline mode (Phase 4 - future)
- ❌ External system integrations (Phase 4)
- ❌ Machine learning predictions (Phase 4)
- ❌ Advanced AI features (Phase 4)

---

## Next Phase

**Phase 4: Advanced Integrations & Polish** will add:
- Integration with pharmacy management systems
- Advanced AI features and predictions
- Mobile application (optional)
- Offline mode
- Additional polish and refinements

---

## Estimated Timeline

**Total: 8-12 days**

- Features 1-2: 2 days (dashboard, key metrics)
- Features 3-4: 2 days (usage analytics, accuracy metrics)
- Feature 5-6: 2 days (activity monitoring, user management)
- Feature 7-8: 2 days (advanced search, bulk processing)
- Features 9-10: 2 days (reports, visualizations)
- Features 11-12: 1 day (API monitoring, settings)
- Testing and fixes: 1-2 days

---

## Dependencies

- Phase 2 completed successfully
- Sufficient data in database for meaningful analytics
- Recharts or Chart.js library installed
- Admin users created in Auth0

---

**End of Phase 3 (Analytics & Administration) Document**

