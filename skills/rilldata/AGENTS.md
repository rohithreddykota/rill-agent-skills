# Rill - Compiled Agent Guide

**Version 0.1.0**  
Rill Data  
February 2026

> This document is generated from modular rule files for AI agents.
> It focuses on Rill project file authoring and operational workflows.

---

## Abstract

Comprehensive Rill guidance for AI agents. Includes runtime development instructions and complete project-file references for connectors, models, metrics views, dashboards, themes, sources, APIs, alerts, reports, and project configuration.

---

## Table of Contents

1. [Runtime AI Instructions](#1-runtime-ai-instructions) - **CRITICAL**
   - 1.1 [Instructions for developing `rill.yaml`](#11-instructions-for-developing-rillyaml)
   - 1.2 [Instructions for developing a canvas dashboard in Rill](#12-instructions-for-developing-a-canvas-dashboard-in-rill)
   - 1.3 [Instructions for developing a connector in Rill](#13-instructions-for-developing-a-connector-in-rill)
   - 1.4 [Instructions for developing a metrics view in Rill](#14-instructions-for-developing-a-metrics-view-in-rill)
   - 1.5 [Instructions for developing a model in Rill](#15-instructions-for-developing-a-model-in-rill)
   - 1.6 [Instructions for developing a Rill project](#16-instructions-for-developing-a-rill-project)
   - 1.7 [Instructions for developing a theme in Rill](#17-instructions-for-developing-a-theme-in-rill)
   - 1.8 [Instructions for developing an explore dashboard in Rill](#18-instructions-for-developing-an-explore-dashboard-in-rill)
2. [Project Files Reference](#2-project-files-reference) - **CRITICAL**
   - 2.1 [Alert YAML](#21-alert-yaml)
   - 2.2 [API YAML](#22-api-yaml)
   - 2.3 [Canvas Dashboard YAML](#23-canvas-dashboard-yaml)
   - 2.4 [Component YAML](#24-component-yaml)
   - 2.5 [Connector YAML](#25-connector-yaml)
   - 2.6 [Explore Dashboard YAML](#26-explore-dashboard-yaml)
   - 2.7 [Metrics View YAML](#27-metrics-view-yaml)
   - 2.8 [Models YAML](#28-models-yaml)
   - 2.9 [Project YAML](#29-project-yaml)
   - 2.10 [Report YAML](#210-report-yaml)
   - 2.11 [Source YAML](#211-source-yaml)
   - 2.12 [Theme YAML](#212-theme-yaml)
   - 2.13 [YAML Syntax](#213-yaml-syntax)

---

## 1. Runtime AI Instructions

**Impact: CRITICAL**

Core instructions from `runtime/ai/instructions/data` that define how agents should develop and reason about Rill projects and resource types.

### 1.1 Instructions for developing `rill.yaml`

Source: [runtime/ai/instructions/data/resources/rillyaml.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/rillyaml.md)

> Canonical source: `runtime/ai/instructions/data/resources/rillyaml.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/rillyaml.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing `rill.yaml`

## Introduction

`rill.yaml` is a required configuration file located at the root of every Rill project. It defines project-wide settings, similar to `package.json` in Node.js or `dbt_project.yml` in dbt.

## Core Concepts

### Project metadata

There are no required properties in `rill.yaml`, but it is common to configure:

- `display_name`: Human-readable name shown in the UI
- `description`: Brief description of the project's purpose
- `compiler`: Deprecated property that is commonly found in old projects

### Default OLAP connector

The `olap_connector` property sets the default OLAP database for the project. Models output to this connector by default, and metrics views query from it unless explicitly overridden.

Common values are `duckdb` or `clickhouse`. If not specified, Rill initializes a managed DuckDB database and uses it as the default OLAP connector. 

### Mock users for security testing

The `mock_users` property defines test users for validating security policies during local development. Each mock user can have:

- `email` (required): The user's email address
- `name`: Display name
- `admin`: Boolean indicating admin privileges
- `groups`: List of group memberships
- Custom attributes for use in security policy expressions

When mock users are defined and security policies exist, a "View as" dropdown appears in the dashboard preview.

### Environment variables

The `env` property sets default values for non-sensitive variables. These can be referenced in resource files using templating syntax (`{{ .env.<variable> }}`). Sensitive secrets should go in `.env` instead.

### Resource type defaults

Project-wide defaults can be set for resource types using plural keys:

- `models`: Default settings for all models (e.g., refresh schedules)
- `metrics_views`: Default settings for all metrics views (e.g., `first_day_of_week`)
- `explores`: Default settings for explore dashboards (e.g., `time_ranges`, `time_zones`)
- `canvases`: Default settings for canvas dashboards

Individual resources can override these defaults.

### Path management

- `ignore_paths`: List of paths to exclude from parsing (use leading `/`)
- `public_paths`: List of paths to expose over HTTP (defaults to `['./public']`)

### Environment overrides

The `dev` and `prod` properties allow environment-specific configuration overrides.

## JSON Schema

Here is a full JSON schema for the `rill.yaml` syntax:

```
{% json_schema_for_resource "rill.yaml" %}
```

## Minimal Example

A minimal `rill.yaml` for a new project:

```yaml
display_name: My Analytics Project
```

## Complete Example

A comprehensive `rill.yaml` demonstrating common configurations:

```yaml
display_name: Sales Analytics
description: Sales performance dashboards with partner access controls

olap_connector: duckdb

# Non-sensitive environment variables
env:
  default_lookback: P30D
  data_bucket: gs://my-company-data

# Mock users for testing security policies locally
mock_users:
  - email: admin@mycompany.com
    name: Admin User
    admin: true
  - email: partner@external.com
    groups:
      - partners
  - email: viewer@mycompany.com
    tenant_id: xyz

# Project-wide defaults for models
models:
  refresh:
    cron: 0 0 * * *

# Project-wide defaults for metrics views
metrics_views:
  smallest_time_grain: day

# Project-wide defaults for explore dashboards
explores:
  defaults:
    time_range: P3M
  time_zones:
    - UTC
    - America/New_York
    - Europe/London
  time_ranges:
    - PT24H
    - P7D
    - P30D
    - P3M
    - P12M

# Exclude non-Rill files from parsing
ignore_paths:
  - /docs
```

### 1.2 Instructions for developing a canvas dashboard in Rill

Source: [runtime/ai/instructions/data/resources/canvas.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/canvas.md)

> Canonical source: `runtime/ai/instructions/data/resources/canvas.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/canvas.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a canvas dashboard in Rill

## Introduction

Canvas dashboards are free-form dashboard resources that display custom chart and table components laid out in a grid. They enable building overview and report-style dashboards with multiple visualizations, similar to traditional business intelligence tools.

Canvas dashboards differ from explore dashboards in important ways:
- **Explore dashboards:** Best for explorative analysis, drill-down investigations, and letting users freely slice data by any dimension.
- **Canvas dashboards:** Best for fixed reports, executive summaries, or combining multiple metrics views into a single view.

Canvas dashboards are lightweight resources found downstream of metrics views in the project DAG. Each component within a canvas fetches data individually, typically from a metrics view resource.

**When to use canvas dashboards:**
- Building executive summaries with KPIs and multiple visualizations
- Creating report-style dashboards with markdown explanations
- Comparing metrics across different metrics views
- Designing custom layouts not possible with explore dashboards

## Canvas Structure

A canvas dashboard is defined in a YAML file with `type: canvas`. Here is the basic structure (most canvas dashboards work great without any of the optional properties here):

```yaml
type: canvas
display_name: "Sales Overview Dashboard"

# Optional filter settings
filters:
  enable: true
  pinned:
    - region
    - product_category

# Optional time range presets
time_ranges:
  - P7D
  - P30D
  - P90D
  - inf

# Optional maximum dashboard width
max_width: 1400

# Optional theme reference
theme: my_theme

# Default time settings for all components
defaults:
  time_range: P7D
  comparison_mode: time

# Optional security access control
security:
  access: "'{{ .user.domain }}' == 'company.com'"

# Required dashboard content organized in rows
rows:
  - height: 240px
    items:
      - width: 12
        kpi_grid:
          metrics_view: sales_metrics
          measures:
            - total_revenue
            - order_count

  - height: 400px
    items:
      - width: 6
        line_chart:
          metrics_view: sales_metrics
          title: "Revenue Trend"
          x:
            type: temporal
            field: event_time
          y:
            type: quantitative
            field: total_revenue
      - width: 6
        bar_chart:
          metrics_view: sales_metrics
          title: "Revenue by Region"
          color: primary
          x:
            type: nominal
            field: region
            limit: 10
            sort: -y
          y:
            type: quantitative
            field: total_revenue
```

## Layout System

Canvas dashboards use a 12-unit grid system for layout.

### Row Configuration

Each row defines a horizontal section with a specific height:

```yaml
rows:
  - height: 240px    # Row height in pixels
    items:
      # Components go here
```

**Recommended row heights:**
- Markdown headers: 40px - 80px
- KPI grids: 128px - 240px (depending on number of measures)
- Charts and visualizations: 300px - 500px
- Leaderboards: 300px - 450px
- Tables: 300px - 500px

### Item Widths

Items within a row share the 12-unit width:

```yaml
rows:
  # Full width (1 component per row)
  - items:
    - width: 12
      markdown:
        content: "# Dashboard Title"

  # Half width (2 components per row)
  - items:
    - width: 6     
      line_chart:
        # ...
    - width: 6
      bar_chart:
        # ...

  # Third width (3 components per row)
  - items:
    - width: 4
      donut_chart:
        # ...
    - width: 4
      bar_chart:
        # ...
    - width: 4
      area_chart:
        # ...
```

**Width guidelines:**
- `width: 12` - Full width; use for KPI grids, markdown headers, wide charts
- `width: 6` - Half width; use for side-by-side comparisons
- `width: 4` - Third width; use for three equal charts
- `width: 3` - Quarter width; use for four small components (minimum practical width)

## Dashboard Composition Best Practices

When building a new canvas dashboard, follow this recommended structure:

1. **Row 1 - Context**: Start with a markdown component providing dashboard title and overview
2. **Row 2 - Key Metrics**: Add a KPI grid with 2-4 of the most business-relevant measures
3. **Row 3 - Primary Analysis**: Split into two halves:
   - Left (width 6): A leaderboard showing top entities by a key dimension
   - Right (width 6): A time-series chart (line_chart or stacked_bar) showing trends
4. **Additional Rows**: Add 1-2 more rows with relevant charts based on the data

**Choosing chart types:**
- **Time-series analysis**: Use `line_chart` or `area_chart` with temporal x-axis
- **Categorical comparisons**: Use `bar_chart` or `stacked_bar` with nominal x-axis
- **Part-to-whole**: Use `donut_chart` or `stacked_bar_normalized`
- **Two-dimensional patterns**: Use `heatmap`
- **Dual-metric comparison**: Use `combo_chart` for two measures with different scales
- **Funnel analysis**: Use `funnel_chart` to visualize sequential stage drop-offs


# Field guidelines
The field names are case sensitive and should match exactly to the fields present in the metrics view.

**Time dimension restrictions:**
The time dimension (timeseries field from the metrics view) is special and can ONLY be used in the x-axis field for temporal charts. Never use the time dimension in:
- Leaderboard dimensions
- Color fields
- Any other dimension configuration

## Component Types

### Markdown

Add text content, headers, and documentation:

```yaml
markdown:
  content: |
    ## Dashboard Overview

    This dashboard tracks key sales metrics across all regions.

    ---
  alignment:
    horizontal: left    # left, center, right
    vertical: middle    # top, middle, bottom
```

**Best practices:**
- Use markdown for dashboard titles, section headers, and explanatory text
- Add blank lines between markdown elements for proper rendering
- Use `---` for horizontal rules to separate sections

### KPI Grid

Display key metrics with comparison values and sparklines:

```yaml
kpi_grid:
  metrics_view: sales_metrics
  measures:
    - total_revenue
    - order_count
    - average_order_value
    - customer_count
  comparison:
    - delta           # Absolute change
    - percent_change  # Percentage change
    - previous        # Previous period value
  sparkline: right    # right, bottom, none
```

**With dimension filters:**

```yaml
kpi_grid:
  metrics_view: sales_metrics
  measures:
    - total_revenue
    - order_count
  dimension_filters: region IN ('North America', 'Europe')
  comparison:
    - percent_change
  sparkline: bottom
  hide_time_range: true
```

### Leaderboard

Display ranked dimension values by measures:

```yaml
leaderboard:
  metrics_view: sales_metrics
  title: "Top Products"
  description: "Products ranked by total revenue"
  dimensions:
    - product_category
  measures:
    - total_revenue
    - order_count
  num_rows: 10
```

**With multiple dimensions:**

```yaml
leaderboard:
  metrics_view: sales_metrics
  dimensions:
    - region
    - product_category
  measures:
    - total_revenue
    - average_order_value
    - order_count
  num_rows: 7
```

**Important:** Never use time dimensions in leaderboard dimensions. Leaderboards are for categorical ranking, not time-series analysis.

### Line Chart

Show trends over time:

```yaml
line_chart:
  metrics_view: sales_metrics
  title: "Revenue Trend"
  color: primary
  x:
    field: order_date
    type: temporal
    limit: 30
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

**With color dimension breakdown:**

```yaml
line_chart:
  metrics_view: sales_metrics
  title: "Revenue by Region"
  color:
    field: region
    type: nominal
    limit: 5
    legendOrientation: top
  x:
    field: order_date
    type: temporal
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

**With custom color mapping:**

```yaml
line_chart:
  metrics_view: sales_metrics
  title: "Performance Comparison"
  color:
    field: status
    type: nominal
    colorMapping:
      - value: "active"
        color: hsl(120, 70%, 45%)
      - value: "inactive"
        color: hsl(0, 70%, 50%)
  x:
    field: event_date
    type: temporal
  y:
    field: event_count
    type: quantitative
```

### Bar Chart

Compare values across categories:

```yaml
bar_chart:
  metrics_view: sales_metrics
  title: "Revenue by Product Category"
  color: hsl(210, 70%, 50%)
  x:
    field: product_category
    type: nominal
    limit: 10
    sort: -y
    labelAngle: 0
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

**With color dimension:**

```yaml
bar_chart:
  metrics_view: sales_metrics
  title: "Revenue by Category and Region"
  color:
    field: region
    type: nominal
    limit: 5
  x:
    field: product_category
    type: nominal
    limit: 8
    sort: -y
  y:
    field: total_revenue
    type: quantitative
```

### Stacked Bar

Show cumulative values across categories or time:

```yaml
stacked_bar:
  metrics_view: sales_metrics
  title: "Revenue Over Time by Region"
  color:
    field: region
    type: nominal
    limit: 5
  x:
    field: order_date
    type: temporal
    limit: 20
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

**With multiple measures:**

```yaml
stacked_bar:
  metrics_view: sales_metrics
  title: "Cost Breakdown Over Time"
  color:
    field: rill_measures
    type: value
    legendOrientation: top
  x:
    field: order_date
    type: temporal
    limit: 20
  y:
    field: cost_of_goods
    fields:
      - cost_of_goods
      - shipping_cost
      - marketing_cost
    type: quantitative
    zeroBasedOrigin: true
```

### Stacked Bar Normalized

Show proportional distribution (100% stacked):

```yaml
stacked_bar_normalized:
  metrics_view: sales_metrics
  title: "Revenue Share by Region"
  color:
    field: region
    type: nominal
    limit: 5
  x:
    field: order_date
    type: temporal
    limit: 20
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

**With custom color mapping for measures:**

```yaml
stacked_bar_normalized:
  metrics_view: inventory_metrics
  title: "Inventory Status Distribution"
  color:
    field: rill_measures
    type: value
    legendOrientation: top
    colorMapping:
      - value: "in_stock"
        color: hsl(120, 60%, 50%)
      - value: "low_stock"
        color: hsl(45, 90%, 50%)
      - value: "out_of_stock"
        color: hsl(0, 70%, 50%)
  x:
    field: report_date
    type: temporal
    limit: 20
  y:
    field: in_stock
    fields:
      - in_stock
      - low_stock
      - out_of_stock
    type: quantitative
```

### Area Chart

Show magnitude over time with optional stacking:

```yaml
area_chart:
  metrics_view: sales_metrics
  title: "Order Volume Over Time"
  color: primary
  x:
    field: order_date
    type: temporal
    limit: 30
  y:
    field: order_count
    type: quantitative
    zeroBasedOrigin: true
```

**With color dimension:**

```yaml
area_chart:
  metrics_view: sales_metrics
  title: "Revenue by Channel"
  color:
    field: sales_channel
    type: nominal
    limit: 4
  x:
    field: order_date
    type: temporal
    limit: 20
  y:
    field: total_revenue
    type: quantitative
    zeroBasedOrigin: true
```

### Donut Chart

Show proportional breakdown:

```yaml
donut_chart:
  metrics_view: sales_metrics
  title: "Revenue by Region"
  innerRadius: 50
  color:
    field: region
    type: nominal
    limit: 8
    sort: -measure
  measure:
    field: total_revenue
    type: quantitative
    showTotal: true
```

### Heatmap

Show patterns across two dimensions:

```yaml
heatmap:
  metrics_view: activity_metrics
  title: "Activity by Day and Hour"
  color:
    field: event_count
    type: quantitative
  x:
    field: day_of_week
    type: nominal
    limit: 7
  y:
    field: hour_of_day
    type: nominal
    limit: 24
    sort: -color
```

**With custom color range:**

```yaml
heatmap:
  metrics_view: performance_metrics
  title: "Performance Score Matrix"
  color:
    field: score
    type: quantitative
    colorRange:
      mode: scheme
      scheme: sequential
  x:
    field: category
    type: nominal
    limit: 10
  y:
    field: subcategory
    type: nominal
    limit: 15
```

**With custom Vega-Lite config for colors:**

```yaml
heatmap:
  metrics_view: utilization_metrics
  title: "Resource Utilization"
  vl_config: |
    {
      "range": {
        "heatmap": ["#F4A261", "#D63946", "#457B9D"]
      }
    }
  color:
    field: utilization_rate
    type: quantitative
  x:
    field: resource_name
    type: nominal
    limit: 20
  y:
    field: time_slot
    type: nominal
    limit: 12
```

### Combo Chart

Combine bar and line on dual axes:

```yaml
combo_chart:
  metrics_view: sales_metrics
  title: "Revenue and Order Count"
  color:
    field: measures
    type: value
    legendOrientation: top
  x:
    field: order_date
    type: temporal
    limit: 20
  y1:
    field: total_revenue
    type: quantitative
    mark: bar
    zeroBasedOrigin: true
  y2:
    field: order_count
    type: quantitative
    mark: line
    zeroBasedOrigin: true
```

**With custom color mapping:**

```yaml
combo_chart:
  metrics_view: funnel_metrics
  title: "Conversions and Conversion Rate"
  color:
    field: measures
    type: value
    legendOrientation: top
    colorMapping:
      - value: "Conversions"
        color: hsl(210, 100%, 73%)
      - value: "Conversion Rate"
        color: hsl(280, 70%, 55%)
  x:
    field: event_date
    type: temporal
    limit: 30
  y1:
    field: conversions
    type: quantitative
    mark: bar
  y2:
    field: conversion_rate
    type: quantitative
    mark: line
```

### Funnel Chart

Show flow through stages or conversion processes:

```yaml
funnel_chart:
  metrics_view: conversion_metrics
  title: "Conversion Funnel"
  breakdownMode: dimension
  color: stage
  mode: width
  stage:
    field: funnel_stage
    type: nominal
    limit: 10
  measure:
    field: user_count
    type: quantitative
```

**With multiple measures breakdown:**

```yaml
funnel_chart:
  metrics_view: engagement_metrics
  title: "Engagement Funnel"
  breakdownMode: measures
  color: value
  mode: width
  measure:
    field: impressions
    type: quantitative
    fields:
      - impressions
      - clicks
      - signups
      - purchases
```

**Breakdown modes and color options:**
- `breakdownMode: dimension` with `color: stage` (different colors per stage) or `color: measure` (similar colors by value)
- `breakdownMode: measures` with `color: name` (different colors per measure) or `color: value` (similar colors by value)

### Pivot

Create pivot tables with row and column dimensions:

```yaml
pivot:
  metrics_view: sales_metrics
  title: "Sales by Region and Category"
  row_dimensions:
    - region
    - product_category
  col_dimensions:
    - quarter
  measures:
    - total_revenue
    - order_count
    - average_order_value
```

**Simple pivot (rows only):**

```yaml
pivot:
  metrics_view: sales_metrics
  row_dimensions:
    - region
  col_dimensions: []
  measures:
    - total_revenue
    - order_count
    - margin_rate
```

### Table

Display tabular data with specified columns:

```yaml
table:
  metrics_view: sales_metrics
  title: "Product Performance"
  description: "Detailed breakdown of product metrics"
  columns:
    - product_name
    - product_category
    - total_revenue
    - order_count
    - average_price
```

**With dimension filters:**

```yaml
table:
  metrics_view: sales_metrics
  title: "North America Sales"
  columns:
    - product_name
    - total_revenue
    - order_count
  dimension_filters: region IN ('North America')
```

### Image

Display external images:

```yaml
image:
  url: https://example.com/logo.png
  alignment:
    horizontal: center
    vertical: middle
```

## Field Configuration

### Data Types

- **`nominal`**: Categorical data (strings, categories). Use for dimensions.
- **`temporal`**: Time-based data (dates, timestamps). Use for time dimensions.
- **`quantitative`**: Numerical data (counts, amounts). Use for measures.
- **`value`**: Special type for multiple measures. Use only in color field with `rill_measures`.

### Axis Properties

```yaml
x:
  field: category_name       # Field name from metrics view
  type: nominal              # Data type
  limit: 10                  # Max values to display
  sort: -y                   # Sort order (see below)
  showNull: true             # Include null values
  labelAngle: 45             # Label rotation angle
```

### Sort Options

- `"x"` or `"-x"`: Sort by x-axis values (ascending/descending)
- `"y"` or `"-y"`: Sort by y-axis values (ascending/descending)
- `"color"` or `"-color"`: Sort by color field (heatmaps)
- `"measure"` or `"-measure"`: Sort by measure (donut charts)
- Array of values: Custom sort order (e.g., `["Mon", "Tue", "Wed"]`)

### Y-Axis Properties

```yaml
y:
  field: total_revenue
  type: quantitative
  zeroBasedOrigin: true      # Start y-axis at zero
```

**Multiple measures:**

```yaml
y:
  field: revenue
  fields:
    - revenue
    - cost
    - profit
  type: quantitative
```

### Color Configuration

**Simple color string:**

```yaml
color: primary              # Named color
color: secondary
color: "#FF5733"            # Hex color
color: hsl(210, 70%, 50%)   # HSL color
```

**Field-based color:**

```yaml
color:
  field: region
  type: nominal
  limit: 10
  legendOrientation: top    # top, bottom, left, right, none
```

**Custom color mapping:**

```yaml
color:
  field: status
  type: nominal
  colorMapping:
    - value: "success"
      color: hsl(120, 70%, 45%)
    - value: "warning"
      color: hsl(45, 90%, 50%)
    - value: "error"
      color: hsl(0, 70%, 50%)
```

**Color scheme:**

```yaml
color:
  field: score
  type: quantitative
  colorRange:
    mode: scheme
    scheme: sequential
```

### Special Field: rill_measures

Use `rill_measures` in the color field when displaying multiple measures in stacked charts:

```yaml
color:
  field: rill_measures
  type: value
  legendOrientation: top
y:
  field: revenue
  fields:
    - revenue
    - cost
    - profit
  type: quantitative
```

## Advanced Features

### Dimension Filters

Filter component data without affecting other components:

```yaml
kpi_grid:
  metrics_view: sales_metrics
  measures:
    - total_revenue
  dimension_filters: region IN ('North America') AND status IN ('active')
```

### Time Range Override

Override the default time range for a specific component:

```yaml
heatmap:
  metrics_view: activity_metrics
  time_range:
    preset: last_7_days
  # ... other config
```

### Time Filters

Override time settings with detailed control:

```yaml
stacked_bar:
  metrics_view: sales_metrics
  time_filters: tr=P12M&compare_tr=rill-PY&grain=week
  # ... other config
```

### Vega-Lite Configuration

Customize chart appearance with Vega-Lite config:

```yaml
bar_chart:
  metrics_view: sales_metrics
  vl_config: |
    {
      "axisX": {
        "grid": true,
        "labelAngle": 45
      },
      "range": {
        "category": ["#D63946", "#457B9D", "#F4A261", "#2A9D8F"]
      }
    }
  # ... other config
```

## Complete Example

```yaml
type: canvas
display_name: "Monthly Business Report"

defaults:
  time_range: P30D
  comparison_mode: time

max_width: 1400
theme: corporate_theme

rows:
  - height: 100px
    items:
      - width: 12
        markdown:
          content: |
            # Monthly Business Report

            Comprehensive overview of business performance metrics.

            ---
          alignment:
            horizontal: center
            vertical: middle

  - height: 50px
    items:
      - width: 12
        markdown:
          content: "## Key Metrics"
          alignment:
            horizontal: left
            vertical: middle

  - height: 200px
    items:
      - width: 12
        kpi_grid:
          metrics_view: business_metrics
          measures:
            - revenue
            - profit
            - customers
            - orders
          comparison:
            - percent_change
            - previous
          sparkline: right

  - height: 50px
    items:
      - width: 12
        markdown:
          content: "## Revenue Analysis"
          alignment:
            horizontal: left
            vertical: middle

  - height: 400px
    items:
      - width: 8
        combo_chart:
          metrics_view: business_metrics
          title: "Revenue and Profit Margin"
          color:
            field: measures
            type: value
            legendOrientation: top
          x:
            field: report_date
            type: temporal
            limit: 30
          y1:
            field: revenue
            type: quantitative
            mark: bar
          y2:
            field: profit_margin
            type: quantitative
            mark: line

      - width: 4
        donut_chart:
          metrics_view: business_metrics
          title: "Revenue by Segment"
          innerRadius: 50
          color:
            field: customer_segment
            type: nominal
            limit: 5
          measure:
            field: revenue
            type: quantitative
            showTotal: true

  - height: 50px
    items:
      - width: 12
        markdown:
          content: "## Regional Performance"
          alignment:
            horizontal: left
            vertical: middle

  - height: 350px
    items:
      - width: 6
        leaderboard:
          metrics_view: business_metrics
          dimensions:
            - region
          measures:
            - revenue
            - profit
            - order_count
          num_rows: 8

      - width: 6
        heatmap:
          metrics_view: business_metrics
          title: "Revenue by Region and Product"
          color:
            field: revenue
            type: quantitative
          x:
            field: product_category
            type: nominal
            limit: 8
          y:
            field: region
            type: nominal
            limit: 6
```

### 1.3 Instructions for developing a connector in Rill

Source: [runtime/ai/instructions/data/resources/connector.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/connector.md)

> Canonical source: `runtime/ai/instructions/data/resources/connector.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/connector.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a connector in Rill

## Introduction

Connectors are resources that contain credentials and settings for connecting to external systems. They are typically found at the root of the project's DAG, providing access to data sources and services that power downstream resources like models and metrics views.

Connectors are usually lightweight resources. When reconciled, they validate the connection to the external system but do not move or process data. The main exception is managed OLAP connectors (with `managed: true`), which trigger database provisioning.

### Driver capabilities

Each connector uses a **driver** that implements one or more capabilities:

- **OLAP database**: Can power metrics views and dashboards (e.g., `duckdb`, `clickhouse`)
- **SQL database**: Can run SQL queries as model inputs (e.g., `postgres`, `bigquery`, `snowflake`)
- **Information schema**: Can list tables and their schemas (e.g., `duckdb`, `bigquery`)
- **Object store**: Can list, read, and write flat files (e.g., `s3`, `gcs`)
- **Notifier**: Can send notifications and alerts (e.g., `slack`)
- **AI**: Can generate embeddings or responses (e.g., `openai`)

## Core Concepts

### Naming conventions

Connectors are typically named after their driver (e.g., a file `connectors/duckdb.yaml` creates a connector named `duckdb`). Use descriptive names when you have multiple connectors of the same type:
- `connectors/s3_data.yaml` and `connectors/s3_staging.yaml`
- `connectors/clickhouse_prod.yaml` and `connectors/clickhouse_dev.yaml`

### Secrets management

Always store sensitive credentials in `.env` and reference them using template syntax:

```yaml
type: connector
driver: s3
aws_access_key_id: "{{ .env.aws_access_key_id }}"
aws_secret_access_key: "{{ .env.aws_secret_access_key }}"
```

NOTE: Some legacy projects use the deprecated `.vars` instead of `.env`.

### Managed connectors

OLAP connectors can be provisioned automatically by Rill using `managed: true`. This is supported for `duckdb` and `clickhouse` drivers:

```yaml
type: connector
driver: duckdb
managed: true
```

When a managed connector is reconciled, Rill provisions the database infrastructure. The user is billed for the CPU, memory, and disk usage of the provisioned database.

### Access modes

Control read/write access using the `mode` property:

- `mode: read`: Prevents Rill models from writing to this connector
- `mode: readwrite`: Allows both reading and writing (default for managed connectors)

Use `mode: read` when connecting to external databases with pre-existing tables to prevent unintended modifications.

### Dev/Prod configuration

Use `dev:` and `prod:` blocks for environment-specific settings:

```yaml
type: connector
driver: clickhouse
mode: readwrite

# Use a local database in development to prevent overwriting data in the production cluster when iterating on changes.
dev:
  managed: true

prod:
  host: "{{ .env.clickhouse_host }}"
  port: 9440
  username: "{{ .env.clickhouse_user }}"
  password: "{{ .env.clickhouse_password }}"
  ssl: true
```

## Driver-Specific Notes

### DuckDB

DuckDB is Rill's default embedded OLAP database. Key properties:

- `managed: true`: Rill provisions and manages the database
- `init_sql`: SQL to run at startup (install extensions, create secrets, attach databases)

For MotherDuck (cloud DuckDB), use the `path` property with `md:` prefix:

```yaml
type: connector
driver: duckdb
path: "md:my_database"
token: "{{ .env.motherduck_token }}"
```

### ClickHouse

ClickHouse can be user-managed or Rill-managed. Key properties:

- `managed: true`: Rill provisions and manages an empty Clickhouse cluster. If set, don't set any other connector properties.
- `host`, `port`, `username`, `password`: Connection credentials
- `database`: Target database name
- `ssl: true`: Required for ClickHouse Cloud
- `cluster`: Cluster name for multi-node Clickhouse clusters
- `dsn`: Alternative connection string format (format: `clickhouse://host:port?username=<username>&...`)

Common ports:
- `8443`: HTTPS native protocol (ClickHouse Cloud)
- `9440`: Secure native protocol
- `9000`: Native protocol (non-SSL)

### S3

AWS S3 and S3-compatible storage. Key properties:

- `aws_access_key_id`, `aws_secret_access_key`: AWS credentials
- `region`: AWS region
- `endpoint`: Custom endpoint for S3-compatible services (R2, MinIO, GCS interop)
- `path_prefixes`: A list of bucket paths that the connector can access, e.g. `[s3://my-bucket]`; useful for improving bucket introspection

### GCS

Google Cloud Storage. Key properties:

- `google_application_credentials`: Service account JSON (must be a literal JSON string value)
- `key_id`: HMAC key ID to use instead of a service account JSON; required for direct use with DuckDB and Clickhouse through S3 compatibility
- `secret`: HMAC secret to use instead of a service account JSON; required for direct use with DuckDB and Clickhouse through S3 compatibility

### BigQuery

Google BigQuery. Key properties:

- `project_id`: GCP project ID
- `google_application_credentials`: Service account JSON

### Snowflake

Snowflake data warehouse. Key properties:

- `account`, `user`, `privateKey`, `database`, `schema`, `warehouse`, `role`: Connection parameters
- `dsn`: Connection string to use instead of separate connection parameters

### Postgres

PostgreSQL database. Key properties:

- `host`, `port`, `user`, `password`, `dbname`: Connection parameters
- `sslmode`: SSL mode (`disable`, `require`, `verify-full`, etc.)

### Druid

Apache Druid. Can be configured via host/port or DSN:

- `host`, `port`, `username`, `password`, `ssl`: Direct connection
- `dsn`: Full connection string

### Redshift

Amazon Redshift. Key properties:

- `aws_access_key_id`, `aws_secret_access_key`: AWS credentials
- `workgroup`: Redshift Serverless workgroup name
- `region`: AWS region
- `database`: Database name

### Athena

Amazon Athena. Key properties:

- `aws_access_key_id`, `aws_secret_access_key`: AWS credentials
- `workgroup`: Redshift Serverless workgroup name
- `region`: AWS region
- `output_location`: S3 path in format `s3://bucket/path` to store temporary query results in (Athena only)

### Other drivers

- **Slack**: Use `bot_token` for alert notifications
- **OpenAI** or **Claude**: Use `api_key` for AI-powered features
- **HTTPS**: Simple connector for public HTTP sources
- **Pinot**: Use `broker_host`, `controller_host`, `username`, `password`

## JSON Schema

Here is a full JSON schema for the connector syntax:

```
{% json_schema_for_resource "connector" %}
```

## Examples

### DuckDB: Managed

Explicit:

```yaml
# connectors/duckdb.yaml
type: connector
driver: duckdb
managed: true
```

or relying on defaults:

```yaml
# connectors/duckdb.yaml
type: connector
driver: duckdb
```

### DuckDB: With init_sql for S3 secrets

```yaml
# connectors/duckdb.yaml
type: connector
driver: duckdb

init_sql: |
  CREATE SECRET IF NOT EXISTS s3 (
    TYPE S3,
    KEY_ID '{{ .env.aws_access_key_id }}',
    SECRET '{{ .env.aws_secret_access_key }}',
    REGION 'us-east-1'
  )
```

This is now deprecated in favor of creating a dedicated `s3.yaml` connector file, which Rill will automatically load and create as a secret in DuckDB.

### DuckDB: With extensions

```yaml
# connectors/duckdb.yaml
type: connector
driver: duckdb

init_sql: |
  INSTALL spatial;
  LOAD spatial;
```

### DuckDB: MotherDuck database with existing tables

```yaml
# connectors/motherduck.yaml
type: connector
driver: duckdb
path: "md:my_database"
token: "{{ .env.motherduck_token }}"
schema_name: main
mode: read
```

### ClickHouse: Cloud with SSL

```yaml
# connectors/clickhouse.yaml
type: connector
driver: clickhouse
host: "abc123.us-east-1.aws.clickhouse.cloud"
port: 8443
username: "default"
password: "{{ .env.clickhouse_password }}"
database: "default"
ssl: true
```

### ClickHouse: Readwrite with cluster

```yaml
# connectors/clickhouse.yaml
type: connector
driver: clickhouse
mode: readwrite

host: "{{ .env.clickhouse_host }}"
port: 9440
username: "{{ .env.clickhouse_user }}"
password: "{{ .env.clickhouse_password }}"
database: "default"
cluster: "my_cluster"
ssl: true
```

### ClickHouse: Dev/prod configuration

```yaml
# connectors/clickhouse.yaml
type: connector
driver: clickhouse
mode: readwrite

dev:
  managed: true

prod:
  host: "{{ .env.clickhouse_host }}"
  port: 9440
  username: "{{ .env.clickhouse_user }}"
  password: "{{ .env.clickhouse_password }}"
  database: "default"
  cluster: "{{ .env.clickhouse_cluster }}"
  ssl: true
```

### S3: Basic with credentials and region

```yaml
# connectors/s3.yaml
type: connector
driver: s3
aws_access_key_id: "{{ .env.aws_access_key_id }}"
aws_secret_access_key: "{{ .env.aws_secret_access_key }}"
region: us-west-2
```

### S3: Cloudflare R2 (S3-compatible)

```yaml
# connectors/r2.yaml
type: connector
driver: s3
aws_access_key_id: "{{ .env.r2_access_key_id }}"
aws_secret_access_key: "{{ .env.r2_secret_access_key }}"
endpoint: "https://{{ .env.r2_account_id }}.r2.cloudflarestorage.com"
region: auto
```

### GCS: Minimal (uses default credentials)

```yaml
# connectors/gcs.yaml
type: connector
driver: gcs
```

### GCS: With explicit credentials

```yaml
# connectors/gcs.yaml
type: connector
driver: gcs
google_application_credentials: "{{ .env.gcs_service_account_json }}"
```

### BigQuery

```yaml
# connectors/bigquery.yaml
type: connector
driver: bigquery
project_id: "my-gcp-project"
google_application_credentials: "{{ .env.bigquery_service_account_json }}"
```

### Snowflake: Basic with DSN

```yaml
# connectors/snowflake.yaml
type: connector
driver: snowflake
dsn: "{{ .env.snowflake_dsn }}"
```

### Postgres

```yaml
# connectors/postgres.yaml
type: connector
driver: postgres
host: "{{ .env.postgres_host }}"
port: 5432
user: "{{ .env.postgres_user }}"
password: "{{ .env.postgres_password }}"
dbname: "analytics"
sslmode: require
```

### Druid: Host-based

```yaml
# connectors/druid.yaml
type: connector
driver: druid
host: "{{ .env.druid_host }}"
port: 8888
username: "{{ .env.druid_user }}"
password: "{{ .env.druid_password }}"
ssl: true
```

### Redshift: Serverless

```yaml
# connectors/redshift.yaml
type: connector
driver: redshift
aws_access_key_id: "{{ .env.aws_access_key_id }}"
aws_secret_access_key: "{{ .env.aws_secret_access_key }}"
workgroup: "my-workgroup"
region: us-east-1
database: "analytics"
```

### OpenAI

```yaml
# connectors/openai.yaml
type: connector
driver: openai
api_key: "{{ .env.openai_api_key }}"
```

### Claude

```yaml
# connectors/claude.yaml
type: connector
driver: claude
api_key: "{{ .env.claude_api_key }}"
```

### Slack

```yaml
# connectors/slack.yaml
type: connector
driver: slack
bot_token: "{{ .env.slack_bot_token }}"
```

### Pinot

```yaml
# connectors/pinot.yaml
type: connector
driver: pinot
broker_host: "{{ .env.pinot_broker_host }}"
controller_host: "{{ .env.pinot_controller_host }}"
username: "{{ .env.pinot_user }}"
password: "{{ .env.pinot_password }}"
ssl: true
```

### 1.4 Instructions for developing a metrics view in Rill

Source: [runtime/ai/instructions/data/resources/metrics_view.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/metrics_view.md)

> Canonical source: `runtime/ai/instructions/data/resources/metrics_view.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/metrics_view.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a metrics view in Rill

## Introduction

Metrics views are resources that define queryable business metrics on top of a table in an OLAP database. They implement what other business intelligence tools call a "semantic layer" or "metrics layer".

Metrics views are lightweight resources that only perform validation when reconciled. They are typically found downstream of connectors and models in the project's DAG. They power many user-facing features:

- **Explore dashboards**: Interactive drill-down interfaces for data exploration
- **Canvas dashboards**: Custom chart and table components
- **Alerts**: Notifications when data meets certain criteria
- **Reports**: Scheduled data exports and summaries
- **Custom APIs**: Programmatic access to metrics

## Core Concepts

### Table source

The `model:` property specifies the underlying table that powers the metrics view. It can reference:

1. **A model in the project**: Just use the model name (e.g., `model: events`)
2. **An external table**: Specify the table name as it exists in the OLAP connector

```yaml
# Referencing a model in the project
model: events

# Referencing an external table (connector defaults to project's default OLAP)
connector: clickhouse  # Optional: specify if different from default
model: my_external_table # Note: Doesn't support dot syntax for database/schema name. Use the separate `database:` or `database_schema:` keys for that if relevant (but try without first and see if that works).
```

**Note**: The `table:` property is a legacy alias for referencing external tables. Always prefer `model:` in new metrics views.

### Timeseries

The `timeseries:` property identifies the timestamp column used for time-based filtering and line charts. This column must be a time/timestamp type in the underlying table.

```yaml
timeseries: event_time
```

If the timeseries column is not listed in `dimensions:`, Rill automatically adds it as a time dimension. You can optionally configure additional time-related settings:

```yaml
timeseries: event_time
smallest_time_grain: hour      # Minimum granularity users can select
first_day_of_week: 7           # Sunday (1=Monday, 7=Sunday)
first_month_of_year: 4         # April (fiscal year starting in April)
```

It is _strongly_ recommended that you add a primary timeseries to every metrics view you create (it makes for a much better dashboard experience).

### Dimensions

Dimensions are attributes you can group by or filter on. They are typically categorical (strings, enums) or temporal (dates, timestamps). Rill infers the dimension type from the underlying SQL data type:

- **Categorical**: String, enum, boolean columns
- **Time**: Timestamp, date, datetime columns
- **Geospatial**: Geometry or geography columns

Define dimensions using either a direct column reference or a SQL expression:

```yaml
dimensions:
  # Simple column reference
  - name: country
    column: country

  # Computed expression
  - name: device_category
    expression: CASE WHEN device_type IN ('phone', 'tablet') THEN 'Mobile' ELSE 'Desktop' END

  # With display name and description
  - name: campaign_name
    display_name: Campaign
    description: Marketing campaign that drove the traffic
    column: campaign_name
```

**Naming**: Each dimension needs a `name` (stable identifier used in APIs and references), which defaults to `column:` if provided. The `display_name:` is optional, and defaults to a humanized version of `name` if not specified.

### Measures

Measures are aggregation expressions that compute numeric values when grouped by dimensions. They must use aggregate functions like `SUM()`, `COUNT()`, `AVG()`, `MIN()`, `MAX()`.

```yaml
measures:
  - name: total_revenue
    display_name: Total Revenue
    expression: SUM(revenue)
    description: Sum of all revenue in USD
    format_preset: currency_usd

  - name: unique_users
    display_name: Unique Users
    expression: COUNT(DISTINCT user_id)
    format_preset: humanize

  - name: conversion_rate
    display_name: Conversion Rate
    expression: SUM(conversions) / NULLIF(SUM(visits), 0)
    format_preset: percentage
    valid_percent_of_total: false  # Disable % of total for ratios
```

**Format presets**: Control how values are displayed:
- `none`: Raw number
- `humanize`: Round to K, M, B (e.g., 1.2M)
- `currency_usd`: Dollar format with 2 decimals ($1,234.56)
- `currency_eur`: Euro format
- `percentage`: Multiply by 100 and add % sign
- `interval_ms`: Convert milliseconds to human-readable duration

For custom formatting, use `format_d3` with a [d3-format](https://d3js.org/d3-format) string:

```yaml
format_d3: "$,.2f"  # $1,234.56
format_d3: ".1%"    # 12.3%
format_d3: ",.0f"   # 1,235 (rounded, with thousands separator)
```

### Best practices for dimensions and measures

**Naming conventions:**
- Use `snake_case` for the `name` field (e.g., `total_revenue`, `unique_users`)
- Only add `display_name` and `description` if they provide meaningful context beyond what `name` conveys (display names auto-humanize from the name by default)
- Ensure measure names don't collide with column names in the underlying table

**Getting started with measures:**
- Start with a `COUNT(*)` measure as a baseline (e.g., `total_records` or `total_events`)
- Add `SUM()` measures for numeric columns that represent quantities or values
- Use `humanize` as the default format preset unless the data has a specific format requirement
- Keep initial measures simple using only `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` aggregations
- Add more complex expressions (ratios, conditional aggregations) only when needed

**Dimension selection:**
- Include all categorical columns (strings, enums, booleans) that users might want to filter or group by
- Start with 5-10 dimensions; add more based on user needs

**Timeseries:**
- If there is any date/timestamp column in the underlying table, pick the primary or most interesting one and add it under `dimensions:`
- It is also _strongly_ recommended that you configure a primary time dimension using `timeseries:`

### Auto-generated explore

When you create a metrics view, Rill automatically generates an explore dashboard with the same name, exposing all dimensions and measures. To customize the explore (you usually should not need to), add an `explore:` block:

```yaml
explore:
  display_name: Sales Dashboard
  defaults:
    time_range: P7D
    measures:
      - total_revenue
      - order_count
```

**Legacy behavior**: Files with `version: 1` do NOT auto-generate an explore. Omit `version:` in new metrics views to get the auto-generated explore.

## Full Example

Here is a complete, annotated metrics view:

```yaml
# metrics/orders.yaml
type: metrics_view

# Display metadata
display_name: Orders Analytics
description: Analyze order performance by various dimensions

# Data source - references the 'orders' model in the project
model: orders

# Time column for time-series charts and filtering
timeseries: order_date
smallest_time_grain: day

# Dimensions for grouping and filtering
dimensions:
  - name: order_date
    display_name: Order Date
    column: order_date

  - name: country
    display_name: Country
    column: shipping_country

  - name: product_category
    display_name: Product Category
    column: category
    description: High-level product grouping

  - name: customer_segment
    display_name: Customer Segment
    expression: | 
      CASE
        WHEN lifetime_value > 1000 THEN 'High Value'
        WHEN lifetime_value > 100 THEN 'Medium Value'
        ELSE 'Low Value'
      END

  - name: is_repeat_customer
    display_name: Repeat Customer
    expression: CASE WHEN order_number > 1 THEN 'Yes' ELSE 'No' END

# Measures for aggregation
measures:
  - name: total_orders
    display_name: Total Orders
    expression: COUNT(*)
    format_preset: humanize

  - name: total_revenue
    display_name: Total Revenue
    expression: SUM(order_total)
    format_preset: currency_usd
    description: Gross revenue before refunds

  - name: average_order_value
    display_name: Avg Order Value
    expression: SUM(order_total) / NULLIF(COUNT(*), 0)
    format_preset: currency_usd
    valid_percent_of_total: false

  - name: unique_customers
    display_name: Unique Customers
    expression: COUNT(DISTINCT customer_id)
    format_preset: humanize

  - name: items_per_order
    display_name: Items per Order
    expression: SUM(item_count) / NULLIF(COUNT(*), 0)
    format_d3: ",.1f"
    valid_percent_of_total: false
```

## Security Policies

Security policies control who can access a metrics view and what data they can see. This is a powerful feature for multi-tenant dashboards and role-based access control.

### Basic access control

The `access:` property controls whether users can view the metrics view at all:

```yaml
security:
  # Allow access for everyone
  access: true

  # Deny access for everyone (useful for draft dashboards)
  access: false

  # Conditional access based on user attributes
  access: "'{{ .user.admin }}' = 'true'"
```

The expression syntax should be a DuckDB expression, which will be evaluated in a sandbox without access to any tables.

### Row-level security

The `row_filter:` property restricts which rows a user can see. It's a SQL expression that references user attributes via templating:

```yaml
security:
  access: true
  row_filter: domain = '{{ .user.domain }}'
```

Common user attributes:
- `{{ .user.email }}`: User's email address
- `{{ .user.domain }}`: Email domain (e.g., "acme.com")
- `{{ .user.admin }}`: Boolean admin flag
- Custom attributes configured in Rill Cloud

The row filter should use the SQL syntax of the metrics view's model, and can reference other tables in the model's connector.

### Complex row filters

Use logical operators for sophisticated access patterns:

```yaml
security:
  access: true
  row_filter: >
    {{ .user.admin }}
    OR '{{ .user.domain }}' = 'acme.com'
    {{ if hasKey .user "tenant_id" }}
    OR tenant_id = '{{ .user.tenant_id }}'
    {{ end }}
```

### Hiding dimensions and measures

The `exclude:` property conditionally hides specific dimensions or measures from certain users:

```yaml
security:
  access: true
  exclude:
    - if: "NOT {{ .user.admin }}"
      names:
        - cost_per_acquisition  # Hide sensitive cost data from non-admins
        - internal_notes
```

## Advanced Features

### Annotations

Annotations overlay contextual information (like events or milestones) on time-series charts:

```yaml
annotations:
  - name: product_launches
    model: product_launches  # Must have 'time' and 'description' columns
    measures:
      - total_revenue        # Only show on these measures

  # Optional columns in annotation model:
  # - time_end: For range annotations
  # - grain: Show only at specific time grains (day, week, etc.)
```

### Unnest for array dimensions

When a column contains arrays, use `unnest: true` to flatten it at query time:

```yaml
dimensions:
  - name: tags
    display_name: Tags
    column: tags
    unnest: true  # Allows filtering by individual array elements
```

### Cache configuration

Configure caching for slow metrics views that use external tables:

```yaml
cache:
  enabled: true
  key_ttl: 5m
  key_sql: SELECT MAX(updated_at) FROM orders
```

You should not add a `cache:` config when the metrics view references a model inside the project since Rill does automatic cache management in that case.

## Dialect-Specific Notes

SQL expressions in dimensions and measures use the underlying OLAP database's dialect.

### DuckDB

DuckDB is the default OLAP engine for local development.

**Conditional aggregation with FILTER**:
```yaml
# DuckDB supports FILTER clause for conditional aggregation
expression: COUNT(*) FILTER (WHERE status = 'completed')
```

### ClickHouse

ClickHouse is recommended for production workloads with large datasets.

**Conditional aggregation**:
```yaml
# ClickHouse uses IF or CASE inside aggregations
expression: countIf(status = 'completed')
expression: sumIf(revenue, status = 'completed')
```

**Date functions**:
```yaml
expression: toYear(order_date)
expression: toStartOfMonth(order_date)
expression: toYYYYMMDD(order_date)
```

**Array functions**:
```yaml
expression: arrayJoin(tags)  # Unnest arrays
```

### Druid

**Approximate distinct counts**:
```yaml
expression: APPROX_COUNT_DISTINCT_DS_HLL(user_id)
```

## JSON Schema

```
{% json_schema_for_resource "metrics_view" %}
```

### 1.5 Instructions for developing a model in Rill

Source: [runtime/ai/instructions/data/resources/model.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/model.md)

> Canonical source: `runtime/ai/instructions/data/resources/model.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/model.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a model in Rill

## Introduction

Models are resources that specify ETL or transformation logic, outputting a tabular dataset to one of the project's connectors. They are typically found near the root of the project's DAG, referencing only connectors and other models.

By default, models output data as a table with the same name as the model in the project's default OLAP connector. The core of a model is usually a `SELECT` SQL statement, which Rill executes as `CREATE TABLE <name> AS <SELECT statement>`. The SQL should be a plain SELECT query without a trailing semicolon.

Models in Rill are similar to models in dbt, but support additional advanced features:
- **Different input and output connectors:** Run a query in one database (e.g., BigQuery) and output results to another (e.g., DuckDB or ClickHouse).
- **Stateful incremental ingestion:** Track state and load only new or changed data.
- **Partition support:** Define explicit partitions (e.g., Hive-partitioned files in S3) for scalable, idempotent incremental runs.
- **Scheduled refresh:** Use cron expressions to automatically refresh data on a schedule.

### Model categories

When reasoning about a model, consider these attributes:

- **Source model**: References external data, typically reading from a SQL database or object store connector and writing to an OLAP connector.
- **Derived model**: References other models, usually performing joins or formatting columns to prepare denormalized tables for metrics views and dashboards.
- **Incremental model**: Contains logic for incrementally loading data, processing only new or changed records.
- **Partitioned model**: Loads data in well-defined increments (e.g., daily partitions), enabling scalability and idempotent incremental runs.
- **Materialized model**: Outputs a physical table rather than a SQL view.

### Performance considerations

Models are usually expensive resources that can take a long time to run. Create or edit them with caution.

**Exception:** Non-materialized models with the same input and output connector are cheap because they are created as SQL views rather than physical tables.

**Development tip:** Use a "dev partition" to limit data processed during development. This speeds up iteration and avoids unnecessary costs. See the partitions section below for details.

### Generating synthetic data for prototyping

When developing models for prototyping or demonstration purposes where external data sources are not yet available, generate a `SELECT` query that returns realistic synthetic data with these characteristics:
- Use realistic column names and data types that match typical business scenarios
- Always include a time/timestamp column for time-series analysis
- Generate 6-12 months of historical data with approximately 10,000 rows to enable meaningful analysis
- Space out timestamps realistically across the time period rather than clustering them
- Use realistic data distributions (e.g., varying quantities, diverse categories, plausible geographic distributions)

Only generate synthetic data when the user explicitly requests mock data or when required external sources don't exist in the project. If real data sources are available, always prefer using them.

## Materialization

The `materialize:` property controls whether a model creates a physical table or a SQL view:

- `materialize: true`: Creates a physical table. Use this for source models, expensive transformations, or when downstream queries need fast access.
- `materialize: false`: Creates a SQL view. The query re-executes on every access. Only suitable for lightweight transformations where input and output connectors are the same that never reference external data.

If `materialize` is omitted, it defaults to `true` for all cross-connector models and `false` for single-connector models (i.e. where the input and output connector is the same).

In model files with a `.sql` extension, you can materialize by putting this on the first line of the file:
```sql
-- @materialize: true
```

**Best practices:**
- Always materialize models that reference external data sources.
- Always materialize models that perform expensive joins or aggregations.
- Use views only for simple transformations on top of already-materialized tables.

## Incremental models

Incremental models process only new or changed data instead of reprocessing the entire dataset. This is essential for large datasets where full refreshes would be too slow or expensive.

### Incremental strategies

The `output.incremental_strategy` property controls how new data is merged with existing data:

- `partition_overwrite`: Entire partitions are replaced. This is the default strategy for partition-based incremental models.
- `merge`: New rows are merged based on `output.unique_key`. Use for upsert semantics.
- `append`: New rows are appended to the table. This is the default for state-based incremental models. Generally avoid this since retries will lead to duplicate data.

### Partition-based incremental models

Use the `partitions:` property to define explicit data partitions. Combined with `incremental: true`, Rill tracks which partitions have been processed to avoid duplicate processing. Example:

```yaml
type: model
incremental: true

partitions:
  glob:
    connector: s3
    path: s3://bucket/data/year=*/month=*/day=*/*.parquet

sql: SELECT * FROM read_parquet('{{ .partition.uri }}')
```

Each partition gets inserted using the `partition_overwrite` strategy by default. The `partition_overwrite` strategy overwrites partitions based on the column(s) described in `output.partition_by`. If `partition_by` is not explicitly specified, a column `__rill_partition` is injected into the table and used for partitioning.

### State-based incremental models

You can also do dbt-style state-based incremental ingestion using a watermark (e.g., the maximum timestamp already processed). This is discouraged since it is not idempotent (unlike partitions-based incremental ingestion).

Example:

```yaml
type: model
incremental: true

connector: bigquery
sql: |
  SELECT * FROM events
  {{ if incremental }}
  WHERE event_time > '{{ .state.max_time }}'::TIMESTAMP
  {{ end }}

state:
  sql: SELECT MAX(event_time) AS max_time FROM events
```

The `{{ if incremental }}` block ensures the filter only applies during incremental runs, not during the initial full load. The `state` query is evaluated and stored only after the first non-incremental run. Note that the `state` query runs against the project's default OLAP connector (e.g. DuckDB), which is the default output location for models.

## Partitions

Partitions enable scalable data ingestion by breaking large datasets into manageable chunks. They also enable idempotent reruns; if a partition fails, only that partition needs to be reprocessed.

### Glob-based partitions

Discover partitions from file paths in object storage:

```yaml
partitions:
  glob:
    connector: s3
    path: s3://bucket/data/year=*/month=*/day=*/*.parquet
```

Available template variables:
- `{{ .partition.uri }}`: Full URI of the matched file or directory
- `{{ .partition.path }}`: Path portion without the scheme/bucket prefix

By default, `glob:` matches files only, but you can pass `partition: directory` to have it emit leaf directory names instead. When you use `partition: directory`, the partition's URI will not include an asterisk, so you have to append that in the SQL query, e.g. `{{ .partition.uri }}/*.parquet`.

### SQL-based partitions

Generate partitions using a SQL query:

```yaml
partitions:
  connector: bigquery
  sql: SELECT DISTINCT date_trunc('day', event_time) AS day FROM events
```

## Dev partitions (data limits in local development)

You can override properties in development using either a root-level `dev:` property or the `{{ if dev }}` templating function. 

Example using `dev:` property:
```yaml
dev:
  partitions:
    glob:
      path: s3://bucket/data/year=2025/month=12/day=01/*.parquet
      partition: directory
```

Example using the templating function:
```yaml
connector: bigquery
sql: |
  SELECT * FROM users {{ if dev }} LIMIT 10000 {{ end }}
```

Best practices for dev partitions:
- Always use for large external data sources to keep developer velocity high
- Use mainly for fact tables, not (small) dimension tables
- Don't use for derived models
- When possible, limit data by time range (e.g. 1 day of data) rather than a row limit to get a representative sample of data
- Never try to "guess" a dev partition, use introspection tools like `list_bucket_files` (if available) to find a real directory you can use

## Referencing other models

Use `{{ ref "model_name" }}` to reference parent models in SQL statements that use templating:

```yaml
sql: SELECT * FROM {{ ref "events_raw" }} WHERE country = 'US'
```

**Note:** If your SQL statement contains no other templating, the `ref` function is optional for DuckDB SQL snippets; Rill can in that case invoke DuckDB's SQL parser to automatically detect model references. This does not apply for non-DuckDB SQL models.

## Refresh schedules

By default, models refresh when a parent model in the DAG is refreshed. For source models that don't have a parent model, you can configure a cron refresh schedule:
```yaml
refresh:
  cron: 0 * * * *
```

By default, cron refreshes are disabled in local development. If you need to test them locally, add `run_in_dev: true` under `refresh:`.

## Advanced concepts

### Staging connectors

When the input and output connectors cannot directly read from or write to each other, use a staging connector (typically an object store) as an intermediary:

```yaml
type: model

connector: snowflake
sql: SELECT * FROM events

stage:
  connector: s3
  path: s3://bucket/staging/

output:
  connector: clickhouse
```

This is useful when moving data between incompatible systems (e.g., Snowflake to ClickHouse).

NOTE: This is not a production-ready feature. You may see it in some projects, but you should never suggest it or use it in a project that hasn't adopted it independently.

### Change modes

The `change_mode:` property controls how Rill handles changes to model specifications:

- `reset`: Drop and recreate the model automatically (default).
- `manual`: Require a manual refresh to apply changes (user can choose to do an incremental or full refresh).
- `patch`: Switch to new logic without reprocessing historical data (incremental models only).

### Retry configuration

Configure automatic retries for transient failures:
The default `if_error_matches` values are:
`".*OvercommitTracker.*"`, `".*Bad Gateway.*"`, `".*Timeout.*"`, and `".*Connection refused.*"`.
If `retry.if_error_matches` is set, it overrides these defaults instead of adding to them.

```yaml
retry:
  attempts: 5
  delay: 10s
  exponential_backoff: true
  if_error_matches:
    - ".*OvercommitTracker.*"
    - ".*Bad Gateway.*"
    - ".*Timeout.*"
    - ".*Connection refused.*"
```

This is configured by default for common errors, so only add an explicit `retry` clause if you need to support retries for special errors or long delays.

## Dialect-specific notes

### DuckDB

- **Model references:** When the SQL contains no other templating, `{{ ref "model" }}` is optional; Rill uses DuckDB's SQL parser to detect references.
- **Connector secrets:** By default, all compatible connectors are automatically mounted as DuckDB secrets. Use `create_secrets_from_connectors:` to explicitly control which connectors are available.
- **Pre/post execution:** Use `pre_exec:` and `post_exec:` for setup and teardown queries (e.g., attaching external databases). Some legacy projects configure DuckDB secrets here, but with the automatic secret creation referenced above, it is usually better to create separate connector files instead.
- **Cloud storage paths:** DuckDB can read directly from S3 (`s3://`) and GCS (`gs://`) paths in `read_parquet()`, `read_csv()`, and `read_json()` functions.
- **CSV options:** When reading CSV files, useful options include `auto_detect=true`, `header=true`, `ignore_errors=true`, `union_by_name=true`, and `all_varchar=true` for handling inconsistent schemas.
- **JSON files:** Use `read_json()` with `auto_detect=true` and `format='auto'` for flexible JSON ingestion, including gzipped files.

### ClickHouse

- **S3 credentials:** When using the `s3()` function, reference `.env` values directly using templating since ClickHouse lacks integrated secret management:
  ```yaml
  sql: SELECT * FROM s3('s3://bucket/path/*.parquet', '{{ .env.aws_access_key }}', '{{ .env.aws_secret_key }}', 'Parquet')
  ```
- **Required order_by:** The `output:` section must always include an `order_by` property for materialized ClickHouse tables.
- **MergeTree vs. ReplicatedMergeTree:** You don't need to configure `MergeTree` or `ReplicatedMergeTree` engines explicitly. Rill uses `MergeTree` for materialized models by default, and automatically switches to `ReplicatedMergeTree` (creating distributed tables) when connected to a Clickhouse cluster.
- **LowCardinality types:** Use `LowCardinality(String)` for string columns with limited distinct values (e.g., country, device_type, status) to improve storage and query performance.
- **TTL for data retention:** Use `output.ttl` to automatically expire old data and prevent unbounded growth in incremental models.
- **Performance indexes:** If performance is poor for models powering metrics views, add indexes via `output.columns` to improve query performance. Common index types include `bloom_filter` for high-cardinality columns and `set(N)` for low-cardinality columns.

### Other SQL connectors

- Connector properties should be added to the separate connector YAML file when possible. Some legacy models add properties directly in the model, but this is discouraged. (For example, `project_id` for BigQuery, `output_location` for Athena, or `dsn:` for Postgres.)

## Syntax

Here is a basic scaffold of a model's high-level structure:

```yaml
type: model

# Here goes common properties, like materialize, incremental, change_mode, partitions, etc.
# These are usually needed for source models, but not necessarily for derived models.
# For example:
materialize: true

# Here goes input properties, like connector, sql, pre_exec, etc.
# There's always at least one input property.
# For example:
connector: bigquery
sql: SELECT ...

# Here goes output properties, like connector, incremental_strategy, order_by, etc.
# This is usually omitted for derived models, and for source models that output to DuckDB when it is the default OLAP connector.
# For example:
output:
  connector: clickhouse
  order_by: event_time
```

## JSON Schema

Here is a full JSON schema for the model syntax:

```
{% json_schema_for_resource "model" %}
```

## Examples

### Simple model with mock data as a SQL file

```sql
-- models/mock_data.sql
SELECT now() AS time, 'Denmark' AS country, 1 AS revenue_usd
UNION ALL
SELECT now() AS time, 'United States' AS country, 2 AS revenue_usd
```

### Materialized model as a SQL file

```sql
-- models/events.sql
-- @materialize: true
SELECT * FROM 's3://bucket/path/to/file.parquet'
```

### Simple model as a YAML file

```yaml
# models/mock_data.yaml
type: model
materialize: false

sql: |
  SELECT now() AS time, 'Denmark' AS country, 1 AS revenue_usd
  UNION ALL
  SELECT now() AS time, 'United States' AS country, 2 AS revenue_usd
```

### S3 to DuckDB (Parquet files)

Assuming DuckDB is the default OLAP and there is an `s3.yaml` connector in the project:

```yaml
# models/events_raw.yaml
type: model
materialize: true

sql: |
  SELECT * FROM read_parquet('s3://my-bucket/data/events/*.parquet')
```

### S3 to DuckDB with explicit OLAP connector

Assuming there is an `s3.yaml` connector in the project:

```yaml
# models/orders.yaml
type: model
materialize: true

connector: duckdb
sql: |
  SELECT
    order_id,
    customer_id,
    order_date,
    total_amount
  FROM read_parquet('s3://my-bucket/orders/year=2025/month=*/*.parquet')

output:
  connector: duckdb
```

### GCS to DuckDB (JSON files)

Assuming DuckDB is the default OLAP and there is a `gcs.yaml` connector in the project:

```yaml
# models/commits.yaml
type: model
materialize: true

sql: |
  SELECT * FROM read_json(
    'gs://my-bucket/data/commits.json.gz',
    auto_detect=true,
    format='auto'
  )
```

### BigQuery to DuckDB

Assuming DuckDB is the default OLAP and there is a `bigquery.yaml` connector in the project:

```yaml
# models/orders.yaml
type: model

refresh:
  cron: 0 0 * * *

connector: bigquery
sql: |
  SELECT * FROM my_dataset.orders
  WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
```

### Snowflake to DuckDB with dev data limit

Assuming DuckDB is the default OLAP and there is a `snowflake.yaml` connector in the project:

```yaml
# models/sales.yaml
type: model

refresh:
  cron: 0 6 * * *

connector: snowflake
sql: |
  SELECT * FROM staging.sales
  {{ if dev }} event_time >= '2025-01-01' AND event_time < '2025-02-01' {{ end }}
```

### MySQL to DuckDB

Assuming there is a `mysql.yaml` connector in the project:

```yaml
# models/users.yaml
type: model

refresh:
  cron: 0 * * * *

connector: mysql
sql: |
  SELECT
    id,
    email,
    created_at,
    status
  FROM users
  WHERE status = 'active'
```

### Local CSV file to DuckDB or Clickhouse

```yaml
# models/reference_data.yaml
type: model

connector: local_file
path: data/reference_data.csv
```

### HTTPS source (public Parquet file)

```yaml
# models/public_dataset.yaml
type: model

connector: https
uri: https://example.com/public/dataset.parquet
```

### Partition-based incremental S3 to DuckDB

Assuming DuckDB is the default OLAP and there is a `s3.yaml` connector in the project:

```yaml
# models/daily_events.yaml
type: model
incremental: true

partitions:
  glob:
    path: s3://my-bucket/events/year=*/month=*/day=*/*.parquet
    partition: directory

sql: SELECT * FROM read_parquet('{{ .partition.uri }}/*.parquet')
```

### Basic S3 to ClickHouse

Assuming Clickhouse is the default OLAP and there is an `s3.yaml` connector in the project:

```yaml
# models/events.yaml
type: model
materialize: true

sql: |
  SELECT * FROM s3(
    's3://my-bucket/events/year=*/month=*/day=*/*.parquet',
    '{{ .env.aws_access_key_id }}',
    '{{ .env.aws_secret_access_key }}',
    'Parquet'
  )

output:
  order_by: event_time
```

### Partition-based incremental S3 to ClickHouse

Assuming Clickhouse is the default OLAP and there is an `s3.yaml` connector in the project:

```yaml
# models/events.yaml
type: model
materialize: true
incremental: true

partitions:
  glob:
    connector: s3
    path: s3://my-bucket/events/year=*/month=*/day=*/*.parquet

sql: |
  SELECT * FROM s3(
    '{{ .partition.uri }}',
    '{{ .env.aws_access_key_id }}',
    '{{ .env.aws_secret_access_key }}',
    'Parquet'
  )

output:
  order_by: event_time
```

### ClickHouse with explicit column schema and indexes and TTL

Assuming Clickhouse is the default OLAP and there is an `s3.yaml` connector in the project:

```yaml
# models/impressions.yaml
type: model
materialize: true
incremental: true

partitions:
  glob:
    connector: s3
    path: s3://my-bucket/impressions/year=*/month=*/day=*/*.parquet
    partition: directory

sql: |
  SELECT
    '{{ .partition.uri }}' AS __partition,
    event_time,
    user_id,
    campaign_id,
    country,
    device_type,
    impressions,
    clicks,
    cost
  FROM s3(
    '{{ .partition.uri }}/*.parquet',
    '{{ .env.aws_access_key_id }}',
    '{{ .env.aws_secret_access_key }}',
    'Parquet'
  )

output:
  incremental_strategy: partition_overwrite
  partition_by: toYYYYMMDD(event_time)
  order_by: (event_time, user_id)
  ttl: event_time + INTERVAL 90 DAY DELETE
  columns: |
    (
      event_time DateTime,
      user_id LowCardinality(String),
      campaign_id LowCardinality(String),
      country LowCardinality(String),
      device_type LowCardinality(String),
      impressions UInt32,
      clicks UInt32,
      cost Float64,
      INDEX idx_campaign campaign_id TYPE bloom_filter GRANULARITY 4,
      INDEX idx_country country TYPE set(100) GRANULARITY 4
    )
```

### State-based incremental with merge strategy (upserts)

Assuming DuckDB is the default OLAP and there is a `bigquery.yaml` connector in the project:

```yaml
# models/users.yaml
type: model
incremental: true

connector: bigquery
sql: |
  SELECT * FROM users
  {{ if incremental }}
  WHERE updated_at > '{{ .state.max_updated_at }}'
  {{ end }}

state:
  sql: SELECT MAX(updated_at) as max_updated_at FROM users

output:
  incremental_strategy: merge
  unique_key: [user_id]
```

### Dev partitions for faster development

```yaml
# models/large_dataset.yaml
type: model
incremental: true

partitions:
  glob:
    path: s3://my-bucket/data/year=*/month=*/day=*/*.parquet
    partition: directory

dev:
  partitions:
    glob:
      path: s3://my-bucket/data/year=2025/month=01/day=01/*.parquet
      partition: directory

sql: SELECT * FROM read_parquet('{{ .partition.uri }}/*.parquet')
```

### Partition filtering with transform_sql

```yaml
# models/filtered_partitions.yaml
type: model
incremental: true

partitions:
  glob:
    path: s3://my-bucket/reports/y=*/m=*/d=*/h=*/*.parquet
    partition: directory
    transform_sql: |
      -- Only process partitions after a specific date
      SELECT uri, updated_on
      FROM {{ .table }}
      WHERE uri >= 's3://my-bucket/reports/y=2025/m=06/d=01/h=00'
      {{ if dev }}
      AND uri < 's3://my-bucket/reports/y=2025/m=07/d=01/h=00'
      {{ end }}
      ORDER BY uri ASC

sql: SELECT * FROM read_parquet('{{ .partition.uri }}/*.parquet')
```

### Long timeout for large data processing

```yaml
# models/large_historical.yaml
type: model
materialize: true
incremental: true
timeout: 72h

partitions:
  glob:
    path: s3://my-bucket/historical/year=*/*.parquet
    partition: directory

sql: SELECT * FROM read_parquet('{{ .partition.uri }}/*.parquet')
```

### Non-materialized derived model

```yaml
# models/enriched_orders.yaml
type: model
materialize: false

sql: |
  SELECT
    o.*,
    c.customer_name,
    c.customer_segment,
    p.product_category
  FROM {{ ref "orders" }} o
  LEFT JOIN {{ ref "customers" }} c ON o.customer_id = c.customer_id
  LEFT JOIN {{ ref "products" }} p ON o.product_id = p.product_id
```

### DuckDB model reading from S3 with CSV options

Assuming DuckDB is the default OLAP and there is a `s3.yaml` connector in the project:

```yaml
# models/csv_import.yaml
type: model
materialize: true
connector: duckdb

sql: |
  SELECT * FROM read_csv(
    's3://my-bucket/data/*.csv.gz',
    auto_detect=true,
    header=true,
    ignore_errors=true,
    union_by_name=true,
    all_varchar=true
  )
```

### SQL-based partitions (date range)

```yaml
# models/events_raw.yaml
type: model
incremental: true

partitions:
  connector: snowflake
  sql: SELECT DISTINCT date_trunc('day', event_time) AS day FROM events ORDER BY day

connector: snowflake
sql: |
  SELECT * FROM events
  WHERE date_trunc('day', event_time) = '{{ .partition.day }}'

output:
  incremental_strategy: partition_overwrite
```

### Change mode for incremental models

```yaml
# models/append_only.yaml
type: model
incremental: true
change_mode: patch  # Switch to new logic without reprocessing historical data

partitions:
  glob:
    path: s3://my-bucket/transactions/year=*/month=*/day=*/*.parquet
    partition: directory

sql: |
  SELECT
    event_time,
    country,
    costs_usd + profit_usd + tax_usd AS value_usd
  FROM read_parquet('{{ .partition.uri }}/*.parquet')
```

### 1.6 Instructions for developing a Rill project

Source: [runtime/ai/instructions/data/development.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/development.md)

> Canonical source: `runtime/ai/instructions/data/development.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/development.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a Rill project

This document is intended for data engineering agents specialized in developing projects in the Rill business intelligence platform.

## Introduction to Rill

Rill is a business intelligence platform built around the following principles:
- Code-first: configure projects using versioned and reproducible source code in the form of YAML and SQL files.
- Full stack: go from raw data sources to user-friendly dashboards powered by clean data with a single tool.
- Declarative: describe your business logic and Rill automatically runs the infrastructure, migrations and services necessary to make it real.
- OLAP databases: you can easily provision a fast analytical database and load data into it to build dashboards that stay interactive at scale.

## Project structure

A Rill project consists of resources that are defined using YAML and SQL files in the project's file directory.
Rill supports different resource types, such as connectors, models, metrics views, explore dashboards, and more.

Here is an example listing of files for a small Rill project:
```
.env
connectors/duckdb.yaml
connectors/s3.yaml
models/events_raw.yaml
models/events.sql
metrics/events.yaml
dashboards/events.yaml
rill.yaml
```

Let's start with the project-wide files at the root of the directory:
- `rill.yaml` is a required file that contains project-wide configuration. It can be compared to `package.json` in Node.js or `dbt_project.yml` in dbt.
- `.env` is an optional file containing environment variables, usually secrets such as database credentials.

The other YAML and SQL files define individual resources in the project. They follow a few rules:
- The YAML files must contain a `type:` property that identifies the resource type. The other properties in the file are specific to the selected resource type.
- SQL files are a convenient way of creating model resources. They are equivalent to a YAML file with `type: model` and a `sql:` property.
- Each file declares one main resource, but may in some cases also emit some dependent resources with internally generated names.
- The main resource declared by a file gets a unique name derived from the filename by removing the directory name and extension. For example, `connectors/duckdb.yaml` defines a connector called `duckdb`.
- Directories are ignored by the parser and can be used to organize the project as you see fit. Small projects often have one directory per resource type.
- Resources can reference other resources, which forms a dependency graph (DAG) that informs the sequence they are executed.
- Resource names are unique within a resource type. For example, only one model can be named `events` (regardless of directory), but it is possible for both a model and a metrics view to be called `events`.
- Clear resource names are important as they are widely used as unique identifiers throughout the platform (e.g. in CLI commands, URL slugs, API calls). They are usually lowercase and snake case, but that is not enforced.

## Project execution

Rill automatically watches project files and processes changes. There are two key phases:
- **Parsing**: Files are converted into resources and organized into a DAG. Malformed files produce *parse errors*.
- **Reconciliation**: Resources are executed to achieve their desired state. Failures produce *reconcile errors*.

Some resources are cheap to reconcile (validation, non-materialized models), others are expensive (materialized models, managed connectors). Be cautious with expensive operations; see resource-specific instructions for details.

Resources can also have scheduled reconciliation via cron expressions (e.g. daily model refresh).

## Rill's environments

Rill has a local CLI (`rill`) for development and a cloud service for production. After developing or changing a project locally, developers deploy to Rill Cloud either by pushing to GitHub (continuous deploys) or manually deploying with the CLI.

## OLAP databases

Rill places high emphasis on "operational intelligence", meaning low-latency, high-performance, drill-down dashboards with support for alerts and scheduled reports.
Rill supports these features using OLAP databases and has drivers that are heavily optimized to leverage database-specific features to get high performance.

OLAP databases are configured as any other connector in Rill.
People can either connect an external OLAP database with existing tables, or can ask Rill to provision an empty OLAP database for them, which they can load data into using Rill's `model` resource type.

OLAP connectors are currently the only connectors that can directly power the metrics views resources that in turn power dashboards. So data must be in an OLAP database to power a dashboard.

Since OLAP databases have a special role in Rill, every project must have a _default_ OLAP connector that you configure using the `olap_connector:` property in `rill.yaml`. This default OLAP connector is automatically used for a variety of things in Rill unless explicitly overridden (see details under the resource type descriptions). If no OLAP connector is configured, Rill by default initializes a managed `duckdb` OLAP database and uses it as the default OLAP connector.

## Resource types

The sections below contain descriptions of the different resource types that Rill supports and when to use them.
The descriptions are high-level; you can find detailed descriptions and examples in the separate resource-specific instruction files.

### Connectors

Connectors are resources containing credentials and settings for connecting to an external system.
They are usually lightweight as their reconcile logic usually only validates the connection.
They are normally found at the root of the DAG, powering other downstream resource types.

There are a variety of built-in connector _drivers_, which each implements one or more capabilities:
- **OLAP database:** can power dashboards (e.g. `duckdb`, `clickhouse`)
- **SQL database:** can run SQL queries and models (e.g. `postgres`, `bigquery`, `snowflake`)
- **Information schema:** can list tables and their schemas (e.g. `duckdb`, `bigquery`, `postgres`)
- **Object store:** can list, read and write flat files (e.g. `s3`)
- **Notifier:** can send notifications (e.g. `slack`)

Here are some useful things to know when developing connectors:
- Actual secrets like database passwords should go in `.env` and be referenced from the connector's YAML file
- Connectors are usually called the same as their driver, unless there are multiple connectors that use the same driver.
- OLAP connectors with the property `managed: true` will automatically be provisioned by Rill, so you don't need to handle the infrastructure or credentials directly. This is only supported for the `duckdb` and `clickhouse` drivers. The user will be subject to usage-based billing for the CPU, memory and disk usage of the provisioned database.
- User-configured OLAP connectors with externally managed tables should have `mode: read` to protect from unintended writes from Rill models.
- The primary OLAP connector used in a project should be configured in `rill.yaml` using the `olap_connector:` property.

### Models

Models are resources that specify ETL or transformation logic that outputs a tabular dataset in one of the project's connectors.
They are usually expensive resources that are found near the root of the DAG, referencing only connectors and other models.

Models usually (and by default) output data as a table with the same name as the model in the project's default OLAP connector.
They usually center around a `SELECT` SQL statement that Rill will run as a `CREATE TABLE <name> AS <SELECT statement>`.
This means models in Rill are similar to models in dbt, but they support some additional advanced features, namely:
- Different input and output connectors (making it easy to e.g. run a query in BigQuery and output it to the default OLAP connector)
- Stateful incremental ingestion with support for explicit partitions (e.g. for loading Hive partitioned files from S3)
- Scheduled refresh using a cron expression in the model itself

When reasoning about a model, it can be helpful to think in terms of the following attributes:
- **Source model:** references external data, usually reading data from a SQL or object store connector and writing it into an OLAP connector
- **Derived model:** references other models, usually doing joins or formatting columns to prepare a denormalized table suitable for use in metrics views and dashboards 
- **Materialized model:** outputs a physical table (i.e. not just a SQL view)
- **Incremental model:** has logic for incrementally loading data
- **Partitioned model:** capable of loading data in well-defined increments, such as daily partitions, enabling scalability and idempotent incremental runs

Models are usually expensive resources that can take a long time to run, and should be created or edited with caution.
The only exception is non-materialized models that have the same input and output connector, which get created as cheap SQL views.
In development, you can avoid expensive operations by adding a "dev partition", which limits data processed to a subset. See the instructions for model development for details.

### Metrics views

Metrics views are resources that define queryable business metrics on top of a table in an OLAP database.
They implement what other business intelligence tools call a "semantic layer" or "metrics layer".
They are lightweight resources found downstream of connectors and models in the DAG.
They power many user-facing features, such as dashboards, alerts, and scheduled reports.

Metrics views consist of:
- **Model:** a table in an OLAP database; can either be a pre-existing table in an external OLAP database or a table produced by a model in the Rill project
- **Dimensions:** SQL expressions that can be grouped by (e.g. time, string or geospatial types)
- **Measures:** SQL expressions that define aggregations (usually numeric types)
- **Security policies:** access rules and row filters that reference attributes of the querying user

### Explores

Explore resources define an "explore dashboard", an opinionated dashboard type that comes baked into Rill.
These dashboards are specifically designed as an explorative, drill-down, slice-and-dice interface for a single metrics view.
They are Rill's default dashboard type, and usually configured for every metrics view in a project.
They are lightweight resources that are always found downstream of a metrics view in the DAG.

Explore resources can either be configured as stand-alone files or as part of a metrics view definition (see metrics view instructions for details).
The only required configuration is a metrics view to render, but you can optionally also configure things like a theme, default dimension and measures to show, time range presets, and more.

### Canvases

Canvas resources configure a "canvas dashboard", which is a free-form dashboard type consisting of custom chart and table components laid out in a grid.
They enable users to build overview/report style dashboards with limited drill-down options, similar to those found in traditional business intelligence tools.

Canvas dashboards support a long list of component types, including line charts, bar charts, pie charts, markdown text, tables, and more.
All components are defined in the canvas file, but each component is emitted as a separate resource of type `component`, which gets placed upstream of the canvas in the project DAG.
Each canvas component fetches data individually, almost always from a metrics view resource; so you often find metrics view resources upstream of components in the DAG.

### Themes

Themes are resources that define a custom color palette for a Rill project.
They are referenced from `rill.yaml` or directly from an explore or canvas dashboards.

### Custom APIs

Custom APIs are resources that define a query that serves data from the Rill project on a custom endpoint.
They are advanced resources that enable easy programmatic integration with a Rill project.
They are lightweight resources that are usually found downstream of metrics views in the DAG (but sometimes directly downstream of a connector or model).

Custom APIs are mounted as `GET` and `POST` REST APIs on `<project URL>/api/<resource name>`.
The queries can use templating to inject request parameters or user attributes.

Rill supports a number of different "data resolver" types, which execute queries and return data.
The most common ones are:
- `metrics_sql`: queries a metrics view using a generic SQL syntax (recommended)
- `metrics`: queries a metrics view using a structured query object
- `sql`: queries an OLAP connector using a raw SQL query in its native SQL dialect

### Alerts

Alerts are resources that enable sending alerts when certain criteria matches data in the Rill project.
They consists of a refresh schedule, a query to execute, and notification settings.
Since they repeatedly run a query, they are slightly expensive resources.
They are usually found downstream of a metrics view in the DAG.
Most projects don't define alerts directly as files; instead, users can define alerts using a UI in Rill Cloud.

### Reports

Reports are resources that enable sending scheduled reports of data in the project.
They consists of a delivery schedule, a query to execute, and delivery settings.
Since they repeatedly run a query, they are slightly expensive resources.
They are usually found downstream of a metrics view in the DAG.
Most projects don't define reports directly as files; instead, users can define reports using a UI in Rill Cloud.

### `rill.yaml`

`rill.yaml` is a required file for project-wide config found at the root directory of a Rill project.
It is mainly used for:
- Setting shared properties for all resources of a given type (e.g. giving all dashboards the same theme)
- Setting default values for non-sensitive environment variables
- Customizing feature flags
- Configuring mock users for testing security policies locally

### `.env`

`.env` is an optional file containing environment variables, which Rill loads when running the project.
Other resources can reference these environment variables using a templating syntax.
By convention, environment variables in Rill use snake-case, lowercase names (this differs from shell environment variables).

## Development process

This section describes the recommended workflow for developing resources in a Rill project.

### Understanding the task

Before making changes, determine what kind of task you are performing:
- **Querying**: If you need to answer a question about data in the project, use query tools but do not modify files.
- **Surgical edit**: If you need to create or update a single resource, focus on that resource and its immediate dependencies.
- **Full pipeline**: If you need to go from raw data to dashboard, expect your changes to cover a sequential pipeline through connector(s), source model(s), derived model(s), metrics view(s), and an explore or canvas dashboard.

### Checking project capabilities

Before proceeding, verify what the project supports:
- **Write access**: Do you have access to modify files in the project? If not, you are limited to explaining the project or guiding the developer.
- **Data access**: Does the project have a connector for the relevant data source? If not, you need to create a connector and add the required credentials to `.env`, then ask the user to populate those values before continuing.
- **OLAP mode**: Is the default OLAP connector read-only or readwrite? If read-only, you cannot create models; instead, create metrics views and dashboards directly on existing tables in the OLAP database.

### Recommended workflow

Your workflow will depend on the kind of task you are undertaking. Here follows an idealized workflow for a full data source to dashboard journey:

1. **Survey existing resources**: Check what resources already exist in the project using the project status and file tools. You may be able to reuse or extend existing models, metrics views, or dashboards rather than creating new ones.
2. **Explore available data**: Use connector introspection tools to discover what tables or files are available. For SQL databases, query the information schema. For object stores, list buckets and files.
3. **Handle missing data**: If the project lacks access to the data you need, ask the user whether to generate mock data or help them configure a connector to their data source.
4. **Create or update models** (managed or readwrite OLAP only): Build models that ingest and transform data into denormalized tables suitable for dashboard queries. Materialize models that involve expensive joins or aggregations. Use dev partitions to limit data during development.
5. **Profile the data**: Before creating a metrics view, look at the schema of the underlying model/table to understand its shape. This informs which dimensions and measures you create. Consider using the SQL query tool to do a couple well-chosen queries to the table to get row counts, cardinality of important columns, example column values, date ranges, or similar. Be very careful not to run too many queries or expensive queries.
6. **Create or update the metrics view**: Define dimensions and measures using columns in the underlying model/table. Start small with one time dimension (timeseries), up to 10 dimensions and up to 5 measures, and add more later if relevant.
7. **Ensure there are dashboards**: Create an explore dashboard for drill-down analysis of the metrics view if one doesn't already exist. If the user wants an overview or report-style view, also create a canvas dashboard with components from one or more metrics views.
8. **Keep iterating until errors are fixed:** At each stage, if there are parse or reconcile errors, keep updating the relevant file(s) to fix the error.

### Available tools

The following tools are typically available for project development:
{% if not .external %}
- `file_list`, `file_search` and `file_read` for accessing existing files in the project
- `develop_file` for delegating file development to a sub-agent, which handles writing and iterating on errors
- `file_write` for directly creating, updating or deleting a file (available to sub-agents; waits for parse/reconcile and returns resource status)
{% end %}
- `project_status` for checking resource names and their current status (idle, running, error)
- `query_sql` for running SQL against a connector; use `SELECT` statements with `LIMIT` clauses and low timeouts, and be mindful of performance or making too many queries
- `query_metrics_view` for querying a metrics view; useful for answering data questions and validating dashboard behavior
- `list_tables` and `show_table` for accessing the information schema of a database connector
- `list_buckets` and `list_bucket_files` for exploring files in object stores like S3 or GCS; to preview file contents, load one file into a table using a model and query it with `query_sql`

{% if .external %}

### What to do when tools are not available

You may be running in an external editor that does not have Rill's development MCP server on `localhost:9009` connected. If that is the case, you will need to approach your work differently because you can't run tool calls like `list_tables`, `query_sql` or `project_status`. Instead:
1. Use the `rill validate` CLI command to validate the project and get the status of different resources.
2. Before editing a resource, load the specific instruction file for its resource type (if available).
3. Be more bold in making changes, and rely on `rill validate` or user feedback to inform you of issues.

{% end %}

### Common pitfalls

Avoid these mistakes when developing a project:
- **Duplicating ETL logic**: Ingest data once, then derive from it within the project. Do not create multiple models that pull the same data from an external source.
- **Models as SQL files:** Always create new models as `.yaml` files, not `.sql` files (which are harder to extend later).
- **Not creating connector files:** When Rill has native support for a connector (like S3 or BigQuery), always create a dedicated connector resource file for it.
- **Forgetting to materialize**: Always materialize models that reference external data or perform expensive operations. This also includes models that load external data using a native SQL function, like `read_parquet(...)` or `s3(...)`. Non-materialized models become views, which re-execute on every query.
- **Referencing non-existant environment variables:** Only reference environment variables that are present in `.env` (returned in `env` from `project_status`). If you need the user to add another environment variable, stop and ask them to do so.
- **Processing too much data in development**: Use dev partitions to limit data to a small subset (e.g., one day) during development. This speeds up iteration and avoids unnecessary costs.
- **Not adding a time dimension (timeseries) in metrics views**: Metrics views are much more useful when they have a time dimension. Make sure to set one of them as the primary time dimension using the `timeseries:` property.
{% if not .external %}
- **Doing too much introspection/profiling:** Reading files, introspecting connectors, profiling models/tables can be time consuming and easily load too much context. Stay disciplined and don't do too much open-ended exploration or unnecessarily look into other levels of the DAG, especially if your task is a small/surgical edit.
- **Not using the `develop_file` tool:** You should plan the changes you want to make first, then delegate each change separately to the `develop_file` tool. When calling `develop_file`, pass in any relevant context from your investigation/planning/profiling phase.
- **Doing too much at a time:** Consider the minimal amount of work to accomplish your current task. It's better to make changes incrementally and let the user guide your work.
- **Don't stop if there are errors:** When a file has an error after you made changes, keep looping until you have done your best to fix the error. You should not give up easily, the user does expect you to try and fix errors.
{% end %}

### 1.7 Instructions for developing a theme in Rill

Source: [runtime/ai/instructions/data/resources/theme.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/theme.md)

> Canonical source: `runtime/ai/instructions/data/resources/theme.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/theme.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing a theme in Rill

## Introduction

Themes are resources that define custom color palettes for dashboards in a Rill project. They allow you to customize the visual appearance of explore and canvas dashboards to match your brand or design preferences.

Themes are lightweight resources with no reconciliation cost. When a theme file is saved, Rill validates it but performs no heavy operations. Themes are referenced from `rill.yaml` for project-wide styling or directly from individual explore or canvas dashboards.

## Core Concepts

### Referencing themes

Themes can be applied in two ways:

1. **Project-wide** via `rill.yaml`:
  ```yaml
  # rill.yaml
  explores:
    theme: brand
  canvases:
    theme: brand
  ```

2. **Per-dashboard** in an explore or canvas file:
   ```yaml
   # dashboards/sales.yaml
   type: explore
   metrics_view: sales_metrics
   theme: brand
   ```

### Color formats

Themes support multiple color formats:

- **Hex with `#`** (recommended): `"#FF6A00"`, `"#6366f1"`
- **Hex without `#`**: `FF6A00` (works but less explicit)
- **Named CSS colors**: `blue`, `plum`, `darkgreen`, `seagreen`
- **HSL values**: `hsl(180, 100%, 50%)`, `hsl(236, 34%, 34%)`

For consistency and clarity, we recommend using quoted hex values with the `#` prefix.

## JSON Schema

Here is a full JSON schema for the theme syntax:

```
{% json_schema_for_resource "theme" %}
```

## Recommended Theme Structure

The recommended approach uses separate `light:` and `dark:` blocks to define mode-specific colors. This ensures your dashboards look great in both light and dark modes.

```yaml
# themes/brand.yaml
type: theme

# Light mode colors
light:
  # Core brand colors (required)
  primary: "#6366f1"     # Primary actions, emphasis, selected states
  secondary: "#8b5cf6"   # Secondary elements, supporting colors

  # UI surface colors (optional - defaults used if omitted)
  background: "#f8fafc"  # Page background
  surface: "#ffffff"     # Elevated surfaces, panels
  card: "#f1f5f9"        # Card backgrounds

  # Qualitative palette for categorical data (optional, 24 colors)
  # Used for bar charts, pie charts, legend colors by category
  color-qualitative-1: "#6366f1"   # Indigo
  color-qualitative-2: "#8b5cf6"   # Purple
  color-qualitative-3: "#ec4899"   # Pink
  color-qualitative-4: "#06b6d4"   # Cyan
  color-qualitative-5: "#10b981"   # Emerald
  color-qualitative-6: "#f59e0b"   # Amber
  color-qualitative-7: "#3b82f6"   # Blue
  color-qualitative-8: "#a855f7"   # Violet
  color-qualitative-9: "#ef4444"   # Red
  color-qualitative-10: "#14b8a6"  # Teal
  color-qualitative-11: "#84cc16"  # Lime
  color-qualitative-12: "#f97316"  # Orange
  color-qualitative-13: "#d946ef"  # Fuchsia
  color-qualitative-14: "#eab308"  # Yellow
  color-qualitative-15: "#0ea5e9"  # Sky
  color-qualitative-16: "#a855f7"  # Purple alt
  color-qualitative-17: "#22c55e"  # Green
  color-qualitative-18: "#fb923c"  # Orange alt
  color-qualitative-19: "#f43f5e"  # Rose
  color-qualitative-20: "#6366f1"  # Indigo alt
  color-qualitative-21: "#2dd4bf"  # Teal alt
  color-qualitative-22: "#facc15"  # Yellow alt
  color-qualitative-23: "#c084fc"  # Violet alt
  color-qualitative-24: "#4ade80"  # Green alt

  # Sequential palette for ordered data (optional, 9 colors)
  # Used for heatmaps, choropleth maps, intensity scales
  color-sequential-1: "#eef2ff"   # Lightest
  color-sequential-2: "#e0e7ff"
  color-sequential-3: "#c7d2fe"
  color-sequential-4: "#a5b4fc"
  color-sequential-5: "#818cf8"
  color-sequential-6: "#6366f1"
  color-sequential-7: "#4f46e5"
  color-sequential-8: "#4338ca"
  color-sequential-9: "#3730a3"   # Darkest

  # Diverging palette for data with a meaningful midpoint (optional, 11 colors)
  # Used for showing positive/negative deviation from a baseline
  color-diverging-1: "#dc2626"    # Negative extreme (red)
  color-diverging-2: "#f87171"
  color-diverging-3: "#fca5a5"
  color-diverging-4: "#fecaca"
  color-diverging-5: "#fee2e2"
  color-diverging-6: "#f3f4f6"    # Neutral midpoint
  color-diverging-7: "#dbeafe"
  color-diverging-8: "#93c5fd"
  color-diverging-9: "#60a5fa"
  color-diverging-10: "#3b82f6"
  color-diverging-11: "#2563eb"   # Positive extreme (blue)

# Dark mode colors
dark:
  # Core brand colors (brighter for visibility on dark backgrounds)
  primary: "#818cf8"
  secondary: "#a78bfa"

  # UI surface colors
  background: "#0f172a"  # Deep slate background
  surface: "#1e293b"     # Elevated surfaces
  card: "#334155"        # Card backgrounds

  # Qualitative palette (adjusted for dark mode visibility)
  color-qualitative-1: "#818cf8"
  color-qualitative-2: "#a78bfa"
  color-qualitative-3: "#f472b6"
  color-qualitative-4: "#22d3ee"
  color-qualitative-5: "#34d399"
  color-qualitative-6: "#fbbf24"
  color-qualitative-7: "#60a5fa"
  color-qualitative-8: "#c084fc"
  color-qualitative-9: "#f87171"
  color-qualitative-10: "#2dd4bf"
  color-qualitative-11: "#a3e635"
  color-qualitative-12: "#fb923c"
  color-qualitative-13: "#e879f9"
  color-qualitative-14: "#facc15"
  color-qualitative-15: "#38bdf8"
  color-qualitative-16: "#c084fc"
  color-qualitative-17: "#4ade80"
  color-qualitative-18: "#fdba74"
  color-qualitative-19: "#fb7185"
  color-qualitative-20: "#818cf8"
  color-qualitative-21: "#5eead4"
  color-qualitative-22: "#fde047"
  color-qualitative-23: "#d8b4fe"
  color-qualitative-24: "#86efac"

  # Sequential palette (reversed for dark mode)
  color-sequential-1: "#312e81"   # Darkest
  color-sequential-2: "#3730a3"
  color-sequential-3: "#4338ca"
  color-sequential-4: "#4f46e5"
  color-sequential-5: "#6366f1"
  color-sequential-6: "#818cf8"
  color-sequential-7: "#a5b4fc"
  color-sequential-8: "#c7d2fe"
  color-sequential-9: "#e0e7ff"   # Lightest

  # Diverging palette (adjusted for dark backgrounds)
  color-diverging-1: "#ef4444"
  color-diverging-2: "#f87171"
  color-diverging-3: "#fca5a5"
  color-diverging-4: "#fecaca"
  color-diverging-5: "#fee2e2"
  color-diverging-6: "#475569"    # Neutral slate midpoint
  color-diverging-7: "#bfdbfe"
  color-diverging-8: "#93c5fd"
  color-diverging-9: "#60a5fa"
  color-diverging-10: "#3b82f6"
  color-diverging-11: "#2563eb"
```

## Minimal Theme Example

If you only need to set brand colors without customizing palettes, use this minimal structure:

```yaml
# themes/brand.yaml
type: theme

light:
  primary: "#0369a1"
  secondary: "#06b6d4"

dark:
  primary: "#38bdf8"
  secondary: "#22d3ee"
```

## Legacy Format

Older Rill projects may use a simpler format with a top-level `colors:` block. This format is still supported but deprecated in favor of the `light:`/`dark:` structure:

```yaml
# Legacy format (deprecated)
type: theme
colors:
  primary: "#FF6A00"
  secondary: "#0F46A3"
```

### 1.8 Instructions for developing an explore dashboard in Rill

Source: [runtime/ai/instructions/data/resources/explore.md](https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/explore.md)

> Canonical source: `runtime/ai/instructions/data/resources/explore.md`
> Source URL: <https://github.com/rilldata/rill/blob/main/runtime/ai/instructions/data/resources/explore.md>
> Extraction: Original markdown body preserved verbatim after this header.

# Instructions for developing an explore dashboard in Rill

## Introduction

Explore dashboards are resources that configure an interactive, drill-down dashboard for a metrics view. They are Rill's default dashboard type, designed for explorative slice-and-dice analysis of a single metrics view.

Explore dashboards are lightweight resources that sit downstream of a metrics view in the project DAG. Their reconcile logic is fast (validation only), so they can be created and modified freely without performance concerns.

### When to use explores vs canvases

- **Explore dashboards:** Best for explorative analysis, drill-down investigations, and letting users freely slice data by any dimension.
- **Canvas dashboards:** Best for fixed reports, executive summaries, or combining multiple metrics views into a single view.

## Development approach

Explore dashboards require minimal configuration. In most cases, you only need to:

1. Reference the metrics view
2. Select which dimensions and measures to expose (usually all, indicated by `'*'`)
3. Optionally configure defaults and time ranges

**Best practice:** Keep explore configurations simple. Only add advanced features (security policies, custom themes, restricted dimensions) when there is a clear requirement. The metrics view already defines the business logic; the explore just controls presentation and access.

## Inline explores in metrics views

Metrics views create an explore resource by default with the same name as the metrics view. For legacy reasons, this does not happen for metrics views containing `version: 1`. You can customize a metrics view's explore with the `explore:` property inside the metrics view file:

```yaml
# metrics/sales.yaml
type: metrics_view
display_name: Sales Analytics

model: sales_model
timeseries: order_date

dimensions:
  - column: region
  - column: product_category

measures:
  - name: total_revenue
    expression: SUM(revenue)

# Inline explore configuration (optional)
explore:
  time_ranges:
    - P7D
    - P30D
    - P90D
  defaults:
    time_range: P30D
```

Use inline explores for simple cases where you want to keep the metrics view and its dashboard configuration together. Use separate explore files when you need multiple explores for the same metrics view or more complex configurations.

## Example with annotations

Note that most explore dashboards work great without any of the optional properties shown here.

```yaml
# dashboards/sales_explore.yaml

# Required: resource type
type: explore

# Required: the metrics view this dashboard renders
metrics_view: sales_metrics

# Optional: display name shown in the navigation and header
display_name: "Sales Performance"

# Optional: informational banner at the top of the dashboard
banner: "Data refreshes daily at 6 AM UTC"

# Optional: which dimensions to expose (use '*' for all)
dimensions: '*'

# Optional: which measures to expose (use '*' for all)
measures: '*'

# Optional: customize the time range dropdown
time_ranges:
  - P7D
  - P30D
  - P90D
  - P12M
  - rill-MTD
  - rill-YTD

# Optional: default dashboard state on first load
defaults:
  time_range: P30D
  comparison_mode: time

# Optional: pin specific time zones to the top of the selector
time_zones:
  - America/Los_Angeles
  - America/New_York

# Optional: custom theme
theme: my_theme

# Optional: restrict access to specific users.
# Note: usually you should do this in the metrics view, not the explore resource.
security:
  access: "{{ .user.admin }} OR '{{ .user.email }}' LIKE '%@example.com'"
```

## Minimal example

For most use cases, a minimal explore is sufficient:

```yaml
type: explore
metrics_view: sales_metrics
display_name: "Sales Dashboard"
dimensions: '*'
measures: '*'
```

## JSON Schema

```
{% json_schema_for_resource "explore" %}
```

---

## 2. Project Files Reference

**Impact: CRITICAL**

Complete reference documentation from `docs.rilldata.com/reference/project-files`, including connectors, models, metrics views, dashboards, alerts, reports, APIs, and project configuration files.

### 2.1 Alert YAML

Source: [docs/docs/reference/project-files/alerts.md](https://docs.rilldata.com/reference/project-files/alerts)

> Canonical source: `docs/docs/reference/project-files/alerts.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/alerts>
> Extraction: Original markdown body preserved verbatim after this header.

Along with alertings at the dashboard level and can be created via the UI, there might be more extensive alerting that you might want to develop and can be done so the an alert.yaml. When creating an alert via a YAML file, you'll see this denoted in the UI as `Created through code`.

## Properties

### `type`

_[string]_ - Refers to the resource type and must be `alert` _(required)_

### `refresh`

_[object]_ - Refresh schedule for the alert
  ```yaml
  refresh:
    cron: "* * * * *"
    #every: "24h"
  ```
 _(required)_

  - **`cron`** - _[string]_ - A cron expression that defines the execution schedule 

  - **`time_zone`** - _[string]_ - Time zone to interpret the schedule in (e.g., 'UTC', 'America/Los_Angeles'). 

  - **`disable`** - _[boolean]_ - If true, disables the resource without deleting it. 

  - **`ref_update`** - _[boolean]_ - If true, allows the resource to run when a dependency updates. 

  - **`run_in_dev`** - _[boolean]_ - If true, allows the schedule to run in development mode. 

### `display_name`

_[string]_ - Display name for the alert 

### `description`

_[string]_ - Description for the alert 

### `intervals`

_[object]_ - define the interval of the alert to check 

  - **`duration`** - _[string]_ - a valid ISO8601 duration to define the interval duration 

  - **`limit`** - _[integer]_ - maximum number of intervals to check for on invocation 

  - **`check_unclosed`** - _[boolean]_ - boolean, whether unclosed intervals should be checked 

### `watermark`

_[string]_ - Specifies how the watermark is determined for incremental processing. Use 'trigger_time' to set it at runtime or 'inherit' to use the upstream model's watermark. 

### `timeout`

_[string]_ - define the timeout of the alert in seconds (optional). 

### `data`

_[oneOf]_ - Data source for the alert _(required)_

  - **option 1** - _[object]_ - Executes a raw SQL query against the project's data models.

    - **`sql`** - _[string]_ - Raw SQL query to run against existing models in the project. _(required)_

    - **`connector`** - _[string]_ - specifies the connector to use when running SQL or glob queries. 

  - **option 2** - _[object]_ - Executes a SQL query that targets a defined metrics view.

    - **`metrics_sql`** - _[string]_ - SQL query that targets a metrics view in the project _(required)_

  - **option 3** - _[object]_ - Calls a custom API defined in the project to compute data.

    - **`api`** - _[string]_ - Name of a custom API defined in the project. _(required)_

    - **`args`** - _[object]_ - Arguments to pass to the custom API. 

  - **option 4** - _[object]_ - Uses a file-matching pattern (glob) to query data from a connector.

    - **`glob`** - _[anyOf]_ - Defines the file path or pattern to query from the specified connector. _(required)_

      - **option 1** - _[string]_ - A simple file path/glob pattern as a string.

      - **option 2** - _[object]_ - An object-based configuration for specifying a file path/glob pattern with advanced options.

    - **`connector`** - _[string]_ - Specifies the connector to use with the glob input. 

  - **option 5** - _[object]_ - Uses the status of a resource as data.

    - **`resource_status`** - _[object]_ - Based on resource status _(required)_

      - **`where_error`** - _[boolean]_ - Indicates whether the condition should trigger when the resource is in an error state. 

  - **option 6** - _[object]_ - Uses AI to generate insights and analysis from metrics data. Only available for reports.

    - **`ai`** - _[object]_ - AI resolver configuration for generating automated insights _(required)_

      - **`prompt`** - _[string]_ - Custom prompt to guide the AI analysis. If not provided, a default analysis prompt is used. 

      - **`time_range`** - _[object]_ - Time range for the analysis period 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration (e.g., P7D for 7 days, P1M for 1 month) 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset from current time (e.g., P1D to start from yesterday) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression (e.g., 'last 7 days', 'this month') 

      - **`comparison_time_range`** - _[object]_ - Optional comparison time range for period-over-period analysis 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration for comparison period 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset for comparison period (e.g., P7D to compare with previous week) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression for comparison period 

      - **`context`** - _[object]_ - Context to constrain the AI analysis 

        - **`explore`** - _[string]_ - Name of the explore dashboard to analyze 

        - **`dimensions`** - _[array of string]_ - List of dimensions to include in analysis 

        - **`measures`** - _[array of string]_ - List of measures to include in analysis 

### `for`

_[oneOf]_ - Specifies how user identity or attributes should be evaluated for security policy enforcement. 

  - **option 1** - _[object]_ - Specifies a unique user identifier for applying security policies.

    - **`user_id`** - _[string]_ - The unique user ID used to evaluate security policies. _(required)_

  - **option 2** - _[object]_ - Specifies a user's email address for applying security policies.

    - **`user_email`** - _[string]_ - The user's email address used to evaluate security policies. _(required)_

  - **option 3** - _[object]_ - Specifies a set of arbitrary user attributes for applying security policies.

    - **`attributes`** - _[object]_ - A dictionary of user attributes used to evaluate security policies. _(required)_

### `on_recover`

_[boolean]_ - Send an alert when a previously failing alert recovers. Defaults to false. 

### `on_fail`

_[boolean]_ - Send an alert when a failure occurs. Defaults to true. 

### `on_error`

_[boolean]_ - Send an alert when an error occurs during evaluation. Defaults to false. 

### `renotify`

_[boolean]_ - Enable repeated notifications for unresolved alerts. Defaults to false. 

### `renotify_after`

_[string]_ - Defines the re-notification interval for the alert (e.g., '10m','24h'), equivalent to snooze duration in UI, defaults to 'Off' 

### `notify`

_[object]_ - Notification configuration for email and Slack delivery _(required)_

  - **`email`** - _[object]_ - Send notifications via email. 

    - **`recipients`** - _[array of string]_ - An array of email addresses to notify. _(required)_

  - **`slack`** - _[object]_ - Send notifications via Slack. 

    - **`users`** - _[array of string]_ - An array of Slack user IDs to notify. 

    - **`channels`** - _[array of string]_ - An array of Slack channel names to notify. 

    - **`webhooks`** - _[array of string]_ - An array of Slack webhook URLs to send notifications to. 

### `annotations`

_[object]_ - Key value pair used for annotations 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Examples

```yaml
# Example: To send alert when data lags by more than 1 day to slack channel #rill-cloud-alerts
type: alert
display_name: Data lags by more than 1 day
# Check the alert every hour.
refresh:
    cron: 0 * * * *
# Query that returns non-empty results if the measures lag by more than 1 day.
data:
    sql: |-
        SELECT  *
        FROM
        (
          SELECT  MAX(event_time) AS max_time
          FROM rill_metrics_model
        )
        WHERE max_time < NOW() - INTERVAL '1 day'
# Send notifications in Slack.
notify:
    slack:
        channels:
            - '#rill-cloud-alerts'
```

### 2.2 API YAML

Source: [docs/docs/reference/project-files/apis.md](https://docs.rilldata.com/reference/project-files/apis)

> Canonical source: `docs/docs/reference/project-files/apis.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/apis>
> Extraction: Original markdown body preserved verbatim after this header.

Custom APIs allow you to create endpoints that can be called to retrieve or manipulate data.

## Properties

### `type`

_[string]_ - Refers to the resource type and must be `api` _(required)_

### `openapi`

_[object]_ - OpenAPI specification for the API endpoint 

  - **`summary`** - _[string]_ - A brief description of what the API endpoint does 

  - **`parameters`** - _[array of object]_ - List of parameters that the API endpoint accepts 

  - **`request_schema`** - _[object]_ - JSON schema for the request body (use nested YAML instead of a JSON string) 

  - **`response_schema`** - _[object]_ - JSON schema for the response body (use nested YAML instead of a JSON string) 

### `security`

_[object]_ - Defines [security rules and access control policies](/developers/build/metrics-view/security) for resources 

  - **`access`** - _[oneOf]_ - Expression indicating if the user should be granted access to the dashboard. If not defined, it will resolve to false and the dashboard won't be accessible to anyone. Needs to be a valid SQL expression that evaluates to a boolean. 

    - **option 1** - _[string]_ - SQL expression that evaluates to a boolean to determine access

    - **option 2** - _[boolean]_ - Direct boolean value to allow or deny access

  - **`row_filter`** - _[string]_ - SQL expression to filter the underlying model by. Can leverage templated user attributes to customize the filter for the requesting user. Needs to be a valid SQL expression that can be injected into a WHERE clause 

  - **`include`** - _[array of object]_ - List of dimension or measure names to include in the dashboard. If include is defined all other dimensions and measures are excluded 

    - **`if`** - _[string]_ - Expression to decide if the column should be included or not. It can leverage templated user attributes. Needs to be a valid SQL expression that evaluates to a boolean _(required)_

    - **`names`** - _[anyOf]_ - List of fields to include. Should match the name of one of the dashboard's dimensions or measures _(required)_

      - **option 1** - _[array of string]_ - List of specific field names to include

      - **option 2** - _[string]_ - Wildcard '*' to include all fields

  - **`exclude`** - _[array of object]_ - List of dimension or measure names to exclude from the dashboard. If exclude is defined all other dimensions and measures are included 

    - **`if`** - _[string]_ - Expression to decide if the column should be excluded or not. It can leverage templated user attributes. Needs to be a valid SQL expression that evaluates to a boolean _(required)_

    - **`names`** - _[anyOf]_ - List of fields to exclude. Should match the name of one of the dashboard's dimensions or measures _(required)_

      - **option 1** - _[array of string]_ - List of specific field names to exclude

      - **option 2** - _[string]_ - Wildcard '*' to exclude all fields

  - **`rules`** - _[array of object]_ - List of detailed security rules that can be used to define complex access control policies 

    - **`type`** - _[string]_ - Type of security rule - access (overall access), field_access (field-level access), or row_filter (row-level filtering) _(required)_

    - **`action`** - _[string]_ - Whether to allow or deny access for this rule 

    - **`if`** - _[string]_ - Conditional expression that determines when this rule applies. Must be a valid SQL expression that evaluates to a boolean 

    - **`names`** - _[array of string]_ - List of field names this rule applies to (for field_access type rules) 

    - **`all`** - _[boolean]_ - When true, applies the rule to all fields (for field_access type rules) 

    - **`sql`** - _[string]_ - SQL expression for row filtering (for row_filter type rules) 

### `skip_nested_security`

_[boolean]_ - Flag to control security inheritance 

## One of Properties Options
- [SQL Query](#sql-query)
- [Metrics View Query](#metrics-view-query)
- [Custom API Call](#custom-api-call)
- [File Glob Query](#file-glob-query)
- [Resource Status Check](#resource-status-check)

## SQL Query

Executes a raw SQL query against the project's data models.

### `sql`

_[string]_ - Raw SQL query to run against existing models in the project. _(required)_

### `connector`

_[string]_ - specifies the connector to use when running SQL or glob queries. 

```yaml
type: api
sql: "SELECT * FROM table_name WHERE date >= '2024-01-01'"
```

## Metrics View Query

Executes a SQL query that targets a defined metrics view.

### `metrics_sql`

_[string]_ - SQL query that targets a metrics view in the project _(required)_

```yaml
type: api
metrics_sql: "SELECT * FROM user_metrics WHERE date >= '2024-01-01'"
```

## Custom API Call

Calls a custom API defined in the project to compute data.

### `api`

_[string]_ - Name of a custom API defined in the project. _(required)_

### `args`

_[object]_ - Arguments to pass to the custom API. 

```yaml
type: api
api: "user_analytics_api"
args:
    start_date: "2024-01-01"
    limit: 10
```

## File Glob Query

Uses a file-matching pattern (glob) to query data from a connector.

### `glob`

_[anyOf]_ - Defines the file path or pattern to query from the specified connector. _(required)_

  - **option 1** - _[string]_ - A simple file path/glob pattern as a string.

  - **option 2** - _[object]_ - An object-based configuration for specifying a file path/glob pattern with advanced options.

### `connector`

_[string]_ - Specifies the connector to use with the glob input. 

```yaml
type: api
glob: "data/*.csv"
```

## Resource Status Check

Uses the status of a resource as data.

### `resource_status`

_[object]_ - Based on resource status _(required)_

  - **`where_error`** - _[boolean]_ - Indicates whether the condition should trigger when the resource is in an error state. 

```yaml
type: api
resource_status:
    where_error: true
```

### 2.3 Canvas Dashboard YAML

Source: [docs/docs/reference/project-files/canvas-dashboards.md](https://docs.rilldata.com/reference/project-files/canvas-dashboards)

> Canonical source: `docs/docs/reference/project-files/canvas-dashboards.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/canvas-dashboards>
> Extraction: Original markdown body preserved verbatim after this header.

Canvas dashboards provide a flexible way to create custom dashboards with drag-and-drop components.

## Properties

### `type`

_[string]_ - Refers to the resource type and must be `canvas` _(required)_

### `display_name`

_[string]_ - Refers to the display name for the canvas _(required)_

### `title`

_[string]_ - Deprecated: use display_name instead. Refers to the display name for the canvas 

### `description`

_[string]_ - Description for the canvas dashboard 

### `banner`

_[string]_ - Refers to the custom banner displayed at the header of an Canvas dashboard 

### `rows`

_[array of object]_ - Refers to all of the rows displayed on the Canvas 

  - **`height`** - _[string]_ - Height of the row in px 

  - **`items`** - _[array of object]_ - List of components to display in the row 

    - **`component`** - _[string]_ - Name of the component to display. Each component type has its own set of properties.
    Available component types:
    
        - **markdown** - Text component, uses markdown formatting
        - **kpi_grid** - KPI component, similar to TDD in Rill Explore, display quick KPI charts
        - **stacked_bar_normalized** - Bar chart normalized to 100% values
        - **line_chart** - Normal Line chart
        - **bar_chart** - Normal Bar chart
        - **stacked_bar** - Stacked Bar chart
        - **area_chart** - Line chart with area
        - **image** - Provide a URL to embed into canvas dashboard
        - **table** - Similar to Pivot table, add dimensions and measures to visualize your data
        - **heatmap** - Heat Map chart to visualize distribution of data
        - **donut_chart** - Donut or Pie chart to display sums of total
 

    - **`width`** - _[string, integer]_ - Width of the component (can be a number or string with unit) 

### `max_width`

_[integer]_ - Max width in pixels of the canvas 

### `gap_x`

_[integer]_ - Horizontal gap in pixels of the canvas 

### `gap_y`

_[integer]_ - Vertical gap in pixels of the canvas 

### `filters`

_[object]_ - Indicates if filters should be enabled for the canvas. 

  - **`enable`** - _[boolean]_ - Toggles filtering functionality for the canvas dashboard. 

### `allow_custom_time_range`

_[boolean]_ - Defaults to true, when set to false it will hide the ability to set a custom time range for the user. 

### `allow_filter_add`

_[boolean]_ - Whether users can add new filters to the canvas dashboard. 

### `time_ranges`

_[array of oneOf]_ - Overrides the list of default time range selections available in the dropdown. It can be string or an object with a 'range' and optional 'comparison_offsets'
  ```yaml
  time_ranges:
    - PT15M // Simplified syntax to specify only the range
    - PT1H
    - PT6H
    - P7D
    - range: P5D // Advanced syntax to specify comparison_offsets as well
    - P4W
    - rill-TD // Today
    - rill-WTD // Week-To-date
  ```
 

  - **option 1** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection

  - **option 2** - _[object]_ - Object containing time range and comparison configuration

    - **`range`** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection _(required)_

    - **`comparison_offsets`** - _[array of oneOf]_ - list of time comparison options for this time range selection (optional). Must be one of the [Rill ISO 8601 extensions](https://docs.rilldata.com/reference/rill-iso-extensions#extensions) 

      - **option 1** - _[string]_ - Offset string only (range is inferred)

      - **option 2** - _[object]_ - Object containing offset and range configuration for time comparison

        - **`offset`** - _[string]_ - Time offset for comparison (e.g., 'P1D' for one day ago) 

        - **`range`** - _[string]_ - Custom time range for comparison period 

### `time_zones`

_[array of string]_ - Refers to the time zones that should be pinned to the top of the time zone selector. It should be a list of [IANA time zone identifiers](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 

### `defaults`

_[object]_ - defines the defaults YAML struct
  ```yaml
  defaults: #define all the defaults within here
    time_range: P1M
    comparison_mode: dimension #time, none
    comparison_dimension: filename
    filters:
      dimensions:
        - dimension: country
          values: ["US", "CA"]
          mode: in_list
      measures:
        - measure: revenue
          operator: gt
          values: ["1000"]
  ```
 

  - **`time_range`** - _[string]_ - Refers to the default time range shown when a user initially loads the dashboard. The value must be either a valid [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) (for example, PT12H for 12 hours, P1M for 1 month, or P26W for 26 weeks) or one of the [Rill ISO 8601 extensions](https://docs.rilldata.com/reference/rill-iso-extensions#extensions) 

  - **`comparison_mode`** - _[string]_ - Controls how to compare current data with historical or categorical baselines. Options: `none` (no comparison), `time` (compares with past based on default_time_range), `dimension` (compares based on comparison_dimension values) 

  - **`comparison_dimension`** - _[string]_ - for dimension mode, specify the comparison dimension by name 

  - **`filters`** - _[object]_ - Default filter configuration 

    - **`dimensions`** - _[array of object]_ - List of default dimension filters 

      - **`dimension`** - _[string]_ - Name of the dimension to filter on 

      - **`values`** - _[array of string]_ - List of values to filter by 

      - **`limit`** - _[integer]_ - Maximum number of values to show in the filter 

      - **`removable`** - _[boolean]_ - Whether the filter can be removed by the user 

      - **`locked`** - _[boolean]_ - Whether the filter is locked and cannot be modified 

      - **`hidden`** - _[boolean]_ - Whether the filter is hidden from the UI 

      - **`mode`** - _[string]_ - Filter mode - select for dropdown, in_list for multi-select, contains for text search 

      - **`exclude`** - _[boolean]_ - Whether to exclude the specified values instead of including them 

    - **`measures`** - _[array of object]_ - List of default measure filters 

      - **`measure`** - _[string]_ - Name of the measure to filter on 

      - **`by_dimension`** - _[string]_ - Dimension to group the measure filter by 

      - **`operator`** - _[string]_ - Operator for the measure filter (e.g., eq, gt, lt, gte, lte) 

      - **`values`** - _[array of string]_ - List of values to filter by 

      - **`removable`** - _[boolean]_ - Whether the filter can be removed by the user 

      - **`locked`** - _[boolean]_ - Whether the filter is locked and cannot be modified 

      - **`hidden`** - _[boolean]_ - Whether the filter is hidden from the UI 

### `theme`

_[oneOf]_ - Name of the theme to use. Only one of theme and embedded_theme can be set. 

  - **option 1** - _[string]_ - Name of an existing theme to apply to the dashboard

  - **option 2** - _[object]_ - Inline theme configuration.

    - **`colors`** - _[object]_ - Used to override the dashboard colors. Either primary or secondary color must be provided. 

      - **`primary`** - _[string]_ - Overrides the primary blue color in the dashboard. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. Note that the hue of the input colors is used for variants but the saturation and lightness is copied over from the [blue color palette](https://tailwindcss.com/docs/customizing-colors). 

      - **`secondary`** - _[string]_ - Overrides the secondary color in the dashboard. Applies to the loading spinner only as of now. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

    - **`light`** - _[object]_ - Light theme color configuration 

      - **`primary`** - _[string]_ - Primary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`secondary`** - _[string]_ - Secondary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`variables`** - _[object]_ - Custom CSS variables for light theme 

    - **`dark`** - _[object]_ - Dark theme color configuration 

      - **`primary`** - _[string]_ - Primary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`secondary`** - _[string]_ - Secondary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`variables`** - _[object]_ - Custom CSS variables for dark theme 

### `security`

_[object]_ - Defines [security rules and access control policies](/developers/build/metrics-view/security) for dashboards (without row filtering) 

  - **`access`** - _[oneOf]_ - Expression indicating if the user should be granted access to the dashboard. If not defined, it will resolve to false and the dashboard won't be accessible to anyone. Needs to be a valid SQL expression that evaluates to a boolean. 

    - **option 1** - _[string]_ - SQL expression that evaluates to a boolean to determine access

    - **option 2** - _[boolean]_ - Direct boolean value to allow or deny access

### `variables`

_[array of object]_ - Variables that can be used in the canvas 

  - **`name`** - _[string]_ - Unique identifier for the variable _(required)_

  - **`type`** - _[string]_ - Data type of the variable (e.g., string, number, boolean) _(required)_

  - **`value`** - _[string, number, boolean, object, array]_ - Default value for the variable. Can be any valid JSON value type 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment.

### 2.4 Component YAML

Source: [docs/docs/reference/project-files/component.md](https://docs.rilldata.com/reference/project-files/component)

> Canonical source: `docs/docs/reference/project-files/component.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/component>
> Extraction: Original markdown body preserved verbatim after this header.

Defines a reusable dashboard component that can be embedded in canvas dashboards

## Properties

### `type`

_[string]_ - Refers to the resource type and must be `component` _(required)_

### `display_name`

_[string]_ - Refers to the display name for the component 

### `description`

_[string]_ - Detailed description of the component's purpose and functionality 

### `input`

_[array of object]_ - List of input variables that can be passed to the component 

  - **`name`** - _[string]_ - Unique identifier for the variable _(required)_

  - **`type`** - _[string]_ - Data type of the variable (e.g., string, number, boolean) _(required)_

  - **`value`** - _[string, number, boolean, object, array]_ - Default value for the variable. Can be any valid JSON value type 

### `output`

_[object]_ - Output variable that the component produces 

  - **`name`** - _[string]_ - Unique identifier for the variable _(required)_

  - **`type`** - _[string]_ - Data type of the variable (e.g., string, number, boolean) _(required)_

  - **`value`** - _[string, number, boolean, object, array]_ - Default value for the variable. Can be any valid JSON value type 

### `line_chart`

_[object]_ - (no description) 

  - **`config`** - _[object]_ - (no description) _(required)_

    - **`metrics_view`** - _[string]_ - Reference to the metrics view to use _(required)_

    - **`x`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`y`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`color`** - _[oneOf]_ - (no description) 

      - **option 1** - _[object]_ - (no description)

        - **`field`** - _[string]_ - Field name from the metrics view _(required)_

        - **`title`** - _[string]_ - Display title for the field 

        - **`format`** - _[string]_ - Format string for the field 

        - **`type`** - _[string]_ - Data type of the field _(required)_

        - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

      - **option 2** - _[string]_ - (no description)

    - **`tooltip`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

  - **`title`** - _[string]_ - Chart title 

  - **`description`** - _[string]_ - Chart description 

### `bar_chart`

_[object]_ - (no description) 

  - **`config`** - _[object]_ - (no description) _(required)_

    - **`metrics_view`** - _[string]_ - Reference to the metrics view to use _(required)_

    - **`x`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`y`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`color`** - _[oneOf]_ - (no description) 

      - **option 1** - _[object]_ - (no description)

        - **`field`** - _[string]_ - Field name from the metrics view _(required)_

        - **`title`** - _[string]_ - Display title for the field 

        - **`format`** - _[string]_ - Format string for the field 

        - **`type`** - _[string]_ - Data type of the field _(required)_

        - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

      - **option 2** - _[string]_ - (no description)

    - **`tooltip`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

  - **`title`** - _[string]_ - Chart title 

  - **`description`** - _[string]_ - Chart description 

### `stacked_bar_chart`

_[object]_ - (no description) 

  - **`config`** - _[object]_ - (no description) _(required)_

    - **`metrics_view`** - _[string]_ - Reference to the metrics view to use _(required)_

    - **`x`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`y`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

    - **`color`** - _[oneOf]_ - (no description) 

      - **option 1** - _[object]_ - (no description)

        - **`field`** - _[string]_ - Field name from the metrics view _(required)_

        - **`title`** - _[string]_ - Display title for the field 

        - **`format`** - _[string]_ - Format string for the field 

        - **`type`** - _[string]_ - Data type of the field _(required)_

        - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

      - **option 2** - _[string]_ - (no description)

    - **`tooltip`** - _[object]_ - (no description) 

      - **`field`** - _[string]_ - Field name from the metrics view _(required)_

      - **`title`** - _[string]_ - Display title for the field 

      - **`format`** - _[string]_ - Format string for the field 

      - **`type`** - _[string]_ - Data type of the field _(required)_

      - **`timeUnit`** - _[string]_ - Time unit for temporal fields 

  - **`title`** - _[string]_ - Chart title 

  - **`description`** - _[string]_ - Chart description 

### `vega_lite`

_[object]_ - (no description) 

  - **`spec`** - _[string]_ - Vega-Lite specification as a string _(required)_

### `kpi`

_[object]_ - (no description) 

  - **`metrics_view`** - _[string]_ - Reference to the metrics view to use _(required)_

  - **`measure`** - _[string]_ - Measure to display _(required)_

  - **`time_range`** - _[string]_ - Time range for the KPI _(required)_

  - **`comparison_range`** - _[string]_ - Comparison time range 

  - **`filter`** - _[string]_ - Filter expression 

  - **`title`** - _[string]_ - KPI title 

  - **`description`** - _[string]_ - KPI description 

### `table`

_[object]_ - (no description) 

  - **`metrics_view`** - _[string]_ - Reference to the metrics view to use _(required)_

  - **`measures`** - _[array of string]_ - List of measures to display _(required)_

  - **`time_range`** - _[string]_ - Time range for the table _(required)_

  - **`row_dimensions`** - _[array of string]_ - Dimensions for table rows 

  - **`col_dimensions`** - _[array of string]_ - Dimensions for table columns 

  - **`comparison_range`** - _[string]_ - Comparison time range 

  - **`filter`** - _[string]_ - Filter expression 

  - **`title`** - _[string]_ - Table title 

  - **`description`** - _[string]_ - Table description 

### `markdown`

_[object]_ - (no description) 

  - **`content`** - _[string]_ - Markdown content _(required)_

  - **`css`** - _[object]_ - CSS styles 

  - **`title`** - _[string]_ - Markdown title 

  - **`description`** - _[string]_ - Markdown description 

### `image`

_[object]_ - (no description) 

  - **`url`** - _[string]_ - Image URL _(required)_

  - **`css`** - _[object]_ - CSS styles 

  - **`title`** - _[string]_ - Image title 

  - **`description`** - _[string]_ - Image description

### 2.5 Connector YAML

Source: [docs/docs/reference/project-files/connectors.md](https://docs.rilldata.com/reference/project-files/connectors)

> Canonical source: `docs/docs/reference/project-files/connectors.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/connectors>
> Extraction: Original markdown body preserved verbatim after this header.

Connector YAML files define how Rill connects to external data sources and OLAP engines. Each connector specifies a driver type and its required connection parameters.

## Available Connector Types

### _OLAP Engines_
- [**ClickHouse**](#clickhouse) - ClickHouse analytical database
- [**Druid**](#druid) - Apache Druid
- [**DuckDB**](#duckdb) - Embedded DuckDB engine (default)
- [**External DuckDB**](#external-duckdb) - External DuckDB database
- [**MotherDuck**](#motherduck) - MotherDuck cloud database
- [**Pinot**](#pinot) - Apache Pinot
- [**StarRocks**](#starrocks) - StarRocks analytical database

### _Data Warehouses_
- [**Athena**](#athena) - Amazon Athena
- [**BigQuery**](#bigquery) - Google BigQuery
- [**Redshift**](#redshift) - Amazon Redshift
- [**Snowflake**](#snowflake) - Snowflake data warehouse

### _Databases_
- [**MySQL**](#mysql) - MySQL databases
- [**PostgreSQL**](#postgres) - PostgreSQL databases
- [**SQLite**](#sqlite) - SQLite databases
- [**Supabase**](#supabase) - Supabase (managed PostgreSQL)

### _Object Storage_
- [**Azure**](#azure) - Azure Blob Storage
- [**GCS**](#gcs) - Google Cloud Storage
- [**S3**](#s3) - Amazon S3 storage

### Service Integrations
- [**Claude**](#claude) - Claude connector for chat with your own API key
- [**OpenAI**](#openai) - OpenAI connector for chat with your own API key
- [**Gemini**](#gemini) - Gemini connector for chat with your own API key
- [**Slack**](#slack) - Slack data

### _Other_
- [**HTTPS**](#https) - Public files via HTTP/HTTPS
- [**Salesforce**](#salesforce) - Salesforce data

:::warning Security Recommendation
For all credential parameters (passwords, tokens, keys), use environment variables with the syntax `{{ .env.KEY_NAME }}`. This keeps sensitive data out of your YAML files and version control. See our [credentials documentation](/developers/build/connectors/credentials/) for complete setup instructions.
:::


## Properties

### `type`

_[string]_ - Refers to the resource type and must be `connector` _(required)_

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Athena

### `driver`

_[string]_ - Refers to the driver type and must be driver `athena` _(required)_

### `aws_access_key_id`

_[string]_ - AWS Access Key ID used for authentication. Required when using static credentials directly or as base credentials for assuming a role. 

### `aws_secret_access_key`

_[string]_ - AWS Secret Access Key paired with the Access Key ID. Required when using static credentials directly or as base credentials for assuming a role. 

### `aws_access_token`

_[string]_ - AWS session token used with temporary credentials. Required only if the Access Key and Secret Key are part of a temporary session credentials. 

### `role_arn`

_[string]_ - ARN of the IAM role to assume. When specified, the SDK uses the base credentials to call STS AssumeRole and obtain temporary credentials scoped to this role. 

### `role_session_name`

_[string]_ - Session name to associate with the STS AssumeRole session. Used only if 'role_arn' is specified. Useful for identifying and auditing the session. 

### `external_id`

_[string]_ - External ID required by some roles when assuming them, typically for cross-account access. Used only if 'role_arn' is specified and the role's trust policy requires it. 

### `workgroup`

_[string]_ - Athena workgroup to use for query execution. Defaults to 'primary' if not specified. 

### `output_location`

_[string]_ - S3 URI where Athena query results should be stored (e.g., s3://your-bucket/athena/results/). Optional if the selected workgroup has a default result configuration. 

### `aws_region`

_[string]_ - AWS region where Athena and the result S3 bucket are located (e.g., us-east-1). Defaults to 'us-east-1' if not specified. 

### `allow_host_access`

_[boolean]_ - Allow the Athena client to access host environment configurations such as environment variables or local AWS credential files. Defaults to true, enabling use of credentials and settings from the host environment unless explicitly disabled. 

```yaml
# Example: Athena connector configuration
type: connector # Must be `connector` (required)
driver: athena # Must be `athena` _(required)_
aws_access_key_id: "{{ .env.AWS_ACCESS_KEY_ID }}" # AWS Access Key ID for authentication
aws_secret_access_key: "{{ .env.AWS_SECRET_ACCESS_KEY }}" # AWS Secret Access Key for authentication
aws_access_token: "{{ .env.AWS_ACCESS_TOKEN }}" # AWS session token for temporary credentials
role_arn: "arn:aws:iam::123456789012:role/MyRole" # ARN of the IAM role to assume
role_session_name: "MySession" # Session name for STS AssumeRole
external_id: "MyExternalID" # External ID for cross-account access
workgroup: "primary" # Athena workgroup (defaults to 'primary')
output_location: "s3://my-bucket/athena-output/" # S3 URI for query results
aws_region: "us-east-1" # AWS region (defaults to 'us-east-1')
allow_host_access: true # Allow host environment access _(default: true)_
```

## Azure

### `driver`

_[string]_ - Refers to the driver type and must be driver `azure` _(required)_

### `azure_storage_account`

_[string]_ - Azure storage account name _(required)_

### `azure_storage_key`

_[string]_ - Azure storage access key _(required)_

### `azure_storage_sas_token`

_[string]_ - Optional azure SAS token for authentication 

### `azure_storage_connection_string`

_[string]_ - Optional azure connection string for storage account 

### `path_prefixes`

_[string, array]_ - A list of container or virtual directory prefixes that this connector is allowed to access.
Useful when different containers or paths use different credentials, allowing the system
to route access through the appropriate connector based on the blob path.
Example: `azure://my-bucket/`, ` azure://my-bucket/path/` ,`azure://my-bucket/path/prefix`
 

### `allow_host_access`

_[boolean]_ - Allow access to host environment configuration 

```yaml
# Example: Azure connector configuration
type: connector # Must be `connector` (required)
driver: azure # Must be `azure` _(required)_
azure_storage_account: "mystorageaccount" # Azure storage account name   _(required)_
azure_storage_key: "{{ .env.AZURE_STORAGE_KEY }}" # Azure storage access key   _(required)_
```

## BigQuery

### `driver`

_[string]_ - Refers to the driver type and must be driver `bigquery` _(required)_

### `google_application_credentials`

_[string]_ - Raw contents of the Google Cloud service account key (in JSON format) used for authentication. 

### `project_id`

_[string]_ - Google Cloud project ID 

### `dataset_id`

_[string]_ - BigQuery dataset ID 

### `location`

_[string]_ - BigQuery dataset location 

### `allow_host_access`

_[boolean]_ - Enable the BigQuery client to use credentials from the host environment when no service account JSON is provided. This includes Application Default Credentials from environment variables, local credential files, or the Google Compute Engine metadata server. Defaults to true, allowing seamless authentication in GCP environments. 

```yaml
# Example: BigQuery connector configuration
type: connector # Must be `connector` (required)
driver: bigquery # Must be `bigquery` _(required)_
google_application_credentials: "{{ .env.GOOGLE_APPLICATION_CREDENTIALS }}" # Google Cloud service account JSON
project_id: "my-project-id" # Google Cloud project ID
allow_host_access: true # Allow host environment access _(default: true)_
```

## ClickHouse

### `driver`

_[string]_ - Refers to the driver type and must be driver `clickhouse` _(required)_

### `managed`

_[boolean]_ - `true` means Rill will provision the connector using the default provisioner. `false` disables automatic provisioning. 

### `mode`

_[string]_ - `read` - Controls the operation mode for the ClickHouse connection. Defaults to 'read' for safe operation with external databases. Set to 'readwrite' to enable model creation and table mutations. Note: When 'managed: true', this is automatically set to 'readwrite'. 

### `dsn`

_[string]_ - DSN(Data Source Name) for the ClickHouse connection 

### `username`

_[string]_ - Username for authentication 

### `password`

_[string]_ - Password for authentication 

### `host`

_[string]_ - Host where the ClickHouse instance is running 

### `port`

_[integer]_ - Port where the ClickHouse instance is accessible 

### `database`

_[string]_ - Name of the ClickHouse database within the cluster 

### `ssl`

_[boolean]_ - Indicates whether a secured SSL connection is required 

### `cluster`

_[string]_ - Cluster name, required for running distributed queries 

### `log_queries`

_[boolean]_ - Controls whether to log raw SQL queries 

### `query_settings_override`

_[string]_ - override the default settings used in queries. Changing the default settings can lead to incorrect query results and is generally not recommended. If you need to add settings, use `query_settings` 

### `query_settings`

_[string]_ - query settings to be set on dashboard queries. `query_settings_override` takes precedence over these settings and if set these are ignored. Each setting must be separated by a comma. Example `max_threads = 8, max_memory_usage = 10000000000` 

### `embed_port`

_[integer]_ - Port to run ClickHouse locally (0 for random port) 

### `can_scale_to_zero`

_[boolean]_ - Indicates if the database can scale to zero 

### `max_open_conns`

_[integer]_ - Maximum number of open connections to the database 

### `max_idle_conns`

_[integer]_ - Maximum number of idle connections in the pool 

### `dial_timeout`

_[string]_ - Timeout for dialing the ClickHouse server 

### `conn_max_lifetime`

_[string]_ - Maximum time a connection may be reused 

### `read_timeout`

_[string]_ - Maximum time for a connection to read data 

```yaml
# Example: ClickHouse connector configuration
type: connector # Must be `connector` (required)
driver: clickhouse # Must be `clickhouse` _(required)_
managed: false # Provision the connector using the default provisioner
mode: "readwrite" # Enable model creation and table mutations
username: "myusername" # Username for authentication
password: "{{ .env.CLICKHOUSE_PASSWORD }}" # Password for authentication
host: "localhost" # Hostname of the ClickHouse server
port: 9000 # Port number of the ClickHouse server
database: "mydatabase" # Name of the ClickHouse database
ssl: true # Enable SSL for secure connection
cluster: "mycluster" # Cluster name
```

## Druid

### `driver`

_[string]_ - Refers to the driver type and must be driver `druid` _(required)_

### `dsn`

_[string]_ - Data Source Name (DSN) for connecting to Druid _(required)_

### `username`

_[string]_ - Username for authenticating with Druid 

### `password`

_[string]_ - Password for authenticating with Druid 

### `host`

_[string]_ - Hostname of the Druid coordinator or broker 

### `port`

_[integer]_ - Port number of the Druid service 

### `ssl`

_[boolean]_ - Enable SSL for secure connection 

### `log_queries`

_[boolean]_ - Log raw SQL queries sent to Druid 

### `max_open_conns`

_[integer]_ - Maximum number of open database connections (0 = default, -1 = unlimited) 

### `skip_version_check`

_[boolean]_ - Skip checking Druid version compatibility 

```yaml
# Example: Druid connector configuration
type: connector # Must be `connector` (required)
driver: druid # Must be `druid` _(required)_
username: "myusername" # Username for authentication
password: "{{ .env.DRUID_PASSWORD }}" # Password for authentication
host: "localhost" # Hostname of the Druid coordinator or broker
port: 8082 # Port number of the Druid service
ssl: true # Enable SSL for secure connection
```

## DuckDB

### `driver`

_[string]_ - Must be "duckdb" _(required)_

### `mode`

_[string]_ - Set the mode for the DuckDB connection. 

### `path`

_[string]_ - Path to external DuckDB database 

### `attach`

_[string]_ - Full ATTACH statement to attach a DuckDB database 

### `pool_size`

_[integer]_ - Number of concurrent connections and queries allowed 

### `cpu`

_[integer]_ - Number of CPU cores available to the database 

### `memory_limit_gb`

_[integer]_ - Amount of memory in GB available to the database 

### `read_write_ratio`

_[number]_ - Ratio of resources allocated to read vs write operations 

### `allow_host_access`

_[boolean]_ - Whether access to local environment and file system is allowed 

### `init_sql`

_[string]_ - SQL executed during database initialization 

### `conn_init_sql`

_[string]_ - SQL executed when a new connection is initialized 

### `boot_queries`

_[string]_ - Deprecated - Use init_sql instead 

### `log_queries`

_[boolean]_ - Whether to log raw SQL queries executed through OLAP 

### `create_secrets_from_connectors`

_[string, array]_ - List of connector names for which temporary secrets should be created before executing the SQL. 

### `database_name`

_[string]_ - Name of the attached DuckDB database (auto-detected if not set) 

### `schema_name`

_[string]_ - Default schema used by the DuckDB database 

```yaml
# Example: DuckDB connector configuration
type: connector # Must be `connector` (required)
driver: duckdb # Must be `duckdb` _(required)_
mode: "readwrite" # Set the mode for the DuckDB connection. 
allow_host_access: true # Whether access to the local environment and file system is allowed  
cpu: 4 # Number of CPU cores available to the database  
memory_limit_gb: 16 # Amount of memory in GB available to the database
pool_size: 5 # Number of concurrent connections and queries allowed
read_write_ratio: 0.7 # Ratio of resources allocated to read vs write operations
init_sql: "INSTALL httpfs; LOAD httpfs;" # SQL executed during database initialization
log_queries: true # Whether to log raw SQL queries executed through OLAP
```

## External DuckDB

### `driver`

_[string]_ - Refers to the driver type and must be driver `duckdb` _(required)_

### `path`

_[string]_ - Path to the DuckDB database 

### `mode`

_[string]_ - Set the mode for the DuckDB connection. 

```yaml
# Example: DuckDB as a source connector configuration
type: connector # Must be `connector` (required)
driver: duckdb # Must be `duckdb` _(required)_
path: "/path/to/my-duckdb-database.db" # Name of the DuckDB database  
mode: "read" # Set the mode for the DuckDB connection. 
```

## GCS

### `driver`

_[string]_ - Refers to the driver type and must be driver `gcs` _(required)_

### `google_application_credentials`

_[string]_ - Google Cloud credentials JSON string 

### `key_id`

_[string]_ - Optional S3-compatible Key ID when used in compatibility mode 

### `secret`

_[string]_ - Optional S3-compatible Secret when used in compatibility mode 

### `path_prefixes`

_[string, array]_ - A list of bucket path prefixes that this connector is allowed to access. 
Useful when different buckets or bucket prefixes use different credentials, 
allowing the system to select the appropriate connector based on the bucket path.
Example: `gs://my-bucket/`, ` gs://my-bucket/path/` ,`gs://my-bucket/path/prefix`
 

### `allow_host_access`

_[boolean]_ - Allow access to host environment configuration 

```yaml
# Example: GCS connector configuration
type: connector # Must be `connector` (required)
driver: gcs # Must be `gcs` _(required)_
google_application_credentials: "{{ .env.GOOGLE_APPLICATION_CREDENTIALS }}" # Google Cloud credentials JSON string
```

## HTTPS

### `driver`

_[string]_ - Refers to the driver type and must be driver `https` _(required)_

### `headers`

_[object]_ - HTTP headers to include in the request 

### `path_prefixes`

_[string, array]_ - A list of HTTP/HTTPS URL prefixes that this connector is allowed to access.
Useful when different URL namespaces use different credentials, enabling the
system to choose the appropriate connector based on the URL path.
Example: `https://example.com/`, ` https://example.com/path/` ,`https://example.com/path/prefix`
 

```yaml
# Example: HTTPS connector configuration
type: connector # Must be `connector` (required)
driver: https # Must be `https` _(required)_
headers:
    "Authorization": 'Bearer {{ .env.HTTPS_TOKEN }}' # HTTP headers to include in the request
```

## MotherDuck

### `driver`

_[string]_ - Refers to the driver type and must be driver `duckdb`. _(required)_

### `path`

_[string]_ - Path to your MD database _(required)_

### `schema_name`

_[string]_ - Define your schema if not main, uses main by default 

### `token`

_[string]_ - MotherDuck token _(required)_

### `init_sql`

_[string]_ - SQL executed during database initialization. 

### `mode`

_[string]_ - Set the mode for the MotherDuck connection. By default, it is set to 'read' which allows only read operations. Set to 'readwrite' to enable model creation and table mutations. 

### `create_secrets_from_connectors`

_[string, array]_ - List of connector names for which temporary secrets should be created before executing the SQL. 

```yaml
# Example: MotherDuck connector configuration
type: connector # Must be `connector` (required)
driver: duckdb # Must be `duckdb` _(required)_
token: "{{ .env.MOTHERDUCK_TOKEN }}" # Set the MotherDuck token from your .env file _(required)_
path: "md:my_database" # Path to your MD database
schema_name: "my_schema" # Define your schema if not main, uses main by default
```

## MySQL

### `driver`

_[string]_ - Refers to the driver type and must be driver `mysql` _(required)_

### `dsn`

_[string]_ - **Data Source Name (DSN)** for the MySQL connection, provided in [MySQL URI format](https://dev.mysql.com/doc/refman/8.4/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri).
The DSN must follow the standard MySQL URI scheme:
```text
mysql://user:password@host:3306/my-db
```
Rules for special characters in password:
- The following characters are allowed [unescaped in the URI](https://datatracker.ietf.org/doc/html/rfc3986#section-2.3): `~` `.` `_` `-`
- All other special characters must be percent-encoded (`%XX` format).
```text
mysql://user:pa%40ss@localhost:3306/my-db   # password contains '@'
mysql://user:pa%3Ass@localhost:3306/my-db   # password contains ':'
```
 

### `host`

_[string]_ - Hostname of the MySQL server 

### `port`

_[integer]_ - Port number for the MySQL server 

### `database`

_[string]_ - Name of the MySQL database 

### `user`

_[string]_ - Username for authentication 

### `password`

_[string]_ - Password for authentication 

### `ssl-mode`

_[string]_ - ssl mode options: `disabled`, `preferred`, or `required`. 

```yaml
# Example: MySQL connector configured using individual properties
type: connector
driver: mysql
host: localhost
port: 3306
database: mydb
user: user
password: "{{ .env.MYSQL_PASSWORD }}"
ssl-mode: preferred
```

```yaml
# Example: MySQL connector configured using dsn
type: connector
driver: mysql
dsn: "{{ .env.MYSQL_DSN }}" # Define DSN in .env file
```

## OpenAI

### `driver`

_[string]_ - The driver type, must be set to "openai" 

### `api_key`

_[string]_ - API key for connecting to OpenAI _(required)_

### `model`

_[string]_ - The OpenAI model to use (e.g., 'gpt-4o') 

### `base_url`

_[string]_ - The base URL for the OpenAI API (e.g., 'https://api.openai.com/v1') 

### `api_type`

_[string]_ - The type of OpenAI API to use 

### `api_version`

_[string]_ - The version of the OpenAI API to use (e.g., '2023-05-15'). Required when API Type is AZURE or AZURE_AD 

```yaml
# Example: OpenAI connector configuration
type: connector # Must be `connector` (required)
driver: openai # Must be `openai` _(required)_
api_key: "{{ .env.OPENAI_API_KEY }}" # API key for connecting to OpenAI
model: "gpt-4o" # The OpenAI model to use (e.g., 'gpt-4o')
base_url: "https://api.openai.com/v1" # The base URL for the OpenAI API (e.g., 'https://api.openai.com/v1')
api_type: "openai" # The type of OpenAI API to use
api_version: "2023-05-15" # The version of the OpenAI API to use (e.g., '2023-05-15'). Required when API Type is AZURE or AZURE_AD
```

## Claude

### `driver`

_[string]_ - The driver type, must be set to "claude" 

### `api_key`

_[string]_ - API key for connecting to Claude _(required)_

### `model`

_[string]_ - The Claude model to use (e.g., 'claude-opus-4-5') 

### `max_tokens`

_[number]_ - Maximum number of tokens in the response (e.g., 8192) 

### `temperature`

_[number]_ - Sampling temperature to use (e.g., 0.0) 

### `base_url`

_[string]_ - The base URL for the Claude API 

```yaml
# Example: Claude connector configuration
type: connector
driver: claude
api_key: "{{ .env.claude_api_key }}"
model: claude-opus-4-5
```

## Gemini

### `driver`

_[string]_ - The driver type, must be set to "gemini" 

### `api_key`

_[string]_ - API key for connecting to Gemini _(required)_

### `model`

_[string]_ - The Gemini model to use (e.g., 'gemini-2.5-pro-preview-05-06') 

### `include_thoughts`

_[boolean]_ - Whether to include thinking/reasoning in the response 

### `thinking_level`

_[string]_ - Level of 'thinking' for the model's response (e.g., 'MINIMAL', 'LOW', 'MEDIUM', 'HIGH'). Default is 'LOW'. 

### `max_output_tokens`

_[number]_ - Maximum number of tokens in the response (e.g., 8192) 

### `temperature`

_[number]_ - Sampling temperature to use (0.0-2.0) 

### `top_p`

_[number]_ - Nucleus sampling parameter 

### `top_k`

_[number]_ - Top-K sampling parameter 

```yaml
# Example: Gemini connector configuration
type: connector
driver: gemini
api_key: "{{ .env.gemini_api_key }}"
model: gemini-2.5-pro-preview-05-06
```

## Pinot

### `driver`

_[string]_ - Refers to the driver type and must be driver `pinot` _(required)_

### `dsn`

_[string]_ - DSN(Data Source Name) for the Pinot connection _(required)_

### `username`

_[string]_ - Username for authenticating with Pinot 

### `password`

_[string]_ - Password for authenticating with Pinot 

### `broker_host`

_[string]_ - Hostname of the Pinot broker _(required)_

### `broker_port`

_[integer]_ - Port number for the Pinot broker 

### `controller_host`

_[string]_ - Hostname of the Pinot controller _(required)_

### `controller_port`

_[integer]_ - Port number for the Pinot controller 

### `ssl`

_[boolean]_ - Enable SSL connection to Pinot 

### `log_queries`

_[boolean]_ - Log raw SQL queries executed through Pinot 

### `max_open_conns`

_[integer]_ - Maximum number of open connections to the Pinot database 

### `timeout_ms`

_[integer]_ - Query timeout in milliseconds 

```yaml
# Example: Pinot connector configuration
type: connector # Must be `connector` (required)
driver: pinot # Must be `pinot` _(required)_
username: "myusername" # Username for authentication
password: "{{ .env.PINOT_PASSWORD }}" # Password for authentication
broker_host: "localhost" # Hostname of the Pinot broker
broker_port: 9000 # Port number for the Pinot broker
controller_host: "localhost" # Hostname of the Pinot controller
controller_port: 9000 # Port number for the Pinot controller
ssl: true # Enable SSL connection to Pinot
log_queries: true # Log raw SQL queries executed through Pinot
max_open_conns: 100 # Maximum number of open connections to the Pinot database
timeout_ms: 30000 # Query timeout in milliseconds
```

## StarRocks

### `driver`

_[string]_ - Refers to the driver type and must be driver `starrocks` _(required)_

### `dsn`

_[string]_ - DSN (Data Source Name) for the StarRocks connection. Follows MySQL protocol format. 

### `host`

_[string]_ - StarRocks FE (Frontend) server hostname 

### `port`

_[integer]_ - MySQL protocol port of StarRocks FE 

### `username`

_[string]_ - Username for authentication 

### `password`

_[string]_ - Password for authentication 

### `catalog`

_[string]_ - StarRocks catalog name (for external catalogs like Iceberg, Hive) 

### `database`

_[string]_ - StarRocks database name 

### `ssl`

_[boolean]_ - Enable SSL/TLS encryption 

```yaml
# Example: StarRocks connector configuration
type: connector # Must be `connector` (required)
driver: starrocks # Must be `starrocks` _(required)_
host: "starrocks-fe.example.com" # Hostname of the StarRocks FE server  
port: 9030 # MySQL protocol port of StarRocks FE  
username: "analyst" # Username for authentication  
password: "{{ .env.STARROCKS_PASSWORD }}" # Password for authentication  
catalog: "default_catalog" # StarRocks catalog name  
database: "my_database" # StarRocks database name  
ssl: false # Enable SSL/TLS encryption
```

## Postgres

### `driver`

_[string]_ - Refers to the driver type and must be driver `postgres` _(required)_

### `dsn`

_[string]_ - **Data Source Name (DSN)** for the PostgreSQL connection, provided in
[PostgreSQL connection string format](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING).
PostgreSQL supports both **key=value format** and **URI format**.

key=value format example:
```text
user=user password=password host=host port=5432 dbname=mydb
```
Rules for key=value format for special characters:
- To write an empty value, or a value containing spaces, `=`, single quotes, or backslashes, surround it with single quotes.
- Single quotes and backslashes inside a value must be escaped with a backslash (`\'` and `\\`).

URI format example:
```text
postgres://user:password@host:5432/mydb
```

Rules for URI format:
- The following characters are allowed [unescaped in the URI](https://datatracker.ietf.org/doc/html/rfc3986#section-2.3): `~` `.` `_` `-`
- All other special characters must be percent-encoded (`%XX` format).

Examples (URI format with encoded characters):
```text
postgres://user:pa%40ss@localhost:5432/my-db   # '@' is encoded as %40
postgres://user:pa%3Ass@localhost:5432/my-db   # ':' is encoded as %3A
```
 

### `host`

_[string]_ - Hostname of the Postgres server 

### `port`

_[string]_ - Port number for the Postgres server 

### `dbname`

_[string]_ - Name of the Postgres database 

### `user`

_[string]_ - Username for authentication 

### `password`

_[string]_ - Password for authentication 

### `sslmode`

_[string]_ - ssl mode options: `disable`, `allow`, `prefer` or `require`. 

```yaml
# Example: Postgres connector configured using individual properties
type: connector
driver: postgres
host: localhost
port: 5432
dbname: mydatabase
user: myusername
password: "{{ .env.POSTGRES_PASSWORD }}"
sslmode: prefer
```

```yaml
# Example: Postgres connector configured using dsn
type: connector
driver: postgres
dsn: "{{ .env.POSTGRES_DSN }}" # Define DSN in .env file
```

## Supabase

### `driver`

_[string]_ - Refers to the driver type and must be driver `postgres` _(required)_

### `dsn`

_[string]_ - **Data Source Name (DSN)** for the Supabase connection, provided in
[PostgreSQL connection string format](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING).
Supabase uses PostgreSQL under the hood, so all PostgreSQL connection formats are supported.

URI format example:
```text
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
 

### `host`

_[string]_ - Hostname of the Supabase database (e.g. aws-0-us-east-1.pooler.supabase.com) 

### `port`

_[string]_ - Port number for the Supabase database 

### `dbname`

_[string]_ - Name of the Supabase database 

### `user`

_[string]_ - Username for authentication (e.g. postgres.[your-project-ref]) 

### `password`

_[string]_ - Password for authentication 

### `sslmode`

_[string]_ - ssl mode options: `disable`, `allow`, `prefer` or `require`. 

```yaml
# Example: Supabase connector configured using individual properties
type: connector
driver: postgres
host: aws-0-us-east-1.pooler.supabase.com
port: 5432
dbname: postgres
user: "postgres.[your-project-ref]"
password: "{{ .env.SUPABASE_PASSWORD }}"
sslmode: require
```

```yaml
# Example: Supabase connector configured using dsn
type: connector
driver: postgres
dsn: "{{ .env.SUPABASE_DSN }}" # Define DSN in .env file
```

## Redshift

### `driver`

_[string]_ - Refers to the driver type and must be driver `redshift` _(required)_

### `aws_access_key_id`

_[string]_ - AWS Access Key ID used for authenticating with Redshift. _(required)_

### `aws_secret_access_key`

_[string]_ - AWS Secret Access Key used for authenticating with Redshift. _(required)_

### `aws_access_token`

_[string]_ - AWS Session Token for temporary credentials (optional). 

### `region`

_[string]_ - AWS region where the Redshift cluster or workgroup is hosted (e.g., 'us-east-1'). 

### `database`

_[string]_ - Name of the Redshift database to query. _(required)_

### `workgroup`

_[string]_ - Workgroup name for Redshift Serverless, in case of provisioned Redshift clusters use 'cluster_identifier'. 

### `cluster_identifier`

_[string]_ - Cluster identifier for provisioned Redshift clusters, in case of Redshift Serverless use 'workgroup' . 

```yaml
# Example: Redshift connector configuration
type: connector # Must be `connector` (required)
driver: redshift # Must be `redshift` _(required)_
aws_access_key_id: "{{ .env.AWS_ACCESS_KEY_ID }}" # AWS Access Key ID used for authenticating with Redshift.
aws_secret_access_key: "{{ .env.AWS_SECRET_ACCESS_KEY }}" # AWS Secret Access Key used for authenticating with Redshift.
aws_access_token: "{{ .env.AWS_ACCESS_TOKEN }}" # AWS Session Token for temporary credentials (optional).
region: "us-east-1" # AWS region where the Redshift cluster or workgroup is hosted (e.g., 'us-east-1').
database: "mydatabase" # Name of the Redshift database to query.
workgroup: "my-workgroup" # Workgroup name for Redshift Serverless, in case of provisioned Redshift clusters use 'cluster_identifier'.
cluster_identifier: "my-cluster-identifier" # Cluster identifier for provisioned Redshift clusters, in case of Redshift Serverless use 'workgroup' .
```

## S3

### `driver`

_[string]_ - Refers to the driver type and must be driver `s3` _(required)_

### `aws_access_key_id`

_[string]_ - AWS Access Key ID used for authentication 

### `aws_secret_access_key`

_[string]_ - AWS Secret Access Key used for authentication 

### `aws_access_token`

_[string]_ - Optional AWS session token for temporary credentials 

### `endpoint`

_[string]_ - Optional custom endpoint URL for S3-compatible storage 

### `region`

_[string]_ - AWS region of the S3 bucket 

### `aws_role_arn`

_[string]_ - ARN of the IAM role to assume for accessing S3 resources 

### `aws_role_session_name`

_[string]_ - Session name to use when assuming the IAM role 

### `aws_external_id`

_[string]_ - External ID for cross-account role assumption 

### `path_prefixes`

_[string, array]_ - A list of bucket path prefixes that this connector is allowed to access.
Useful when different buckets or bucket prefixes use different credentials,
allowing the system to select the appropriate connector based on the bucket path.
Example: `s3://my-bucket/`, ` s3://my-bucket/path/` ,`s3://my-bucket/path/prefix`
 

### `allow_host_access`

_[boolean]_ - Allow access to host environment configuration 

```yaml
# Example: S3 connector configuration
type: connector # Must be `connector` (required)
driver: s3 # Must be `s3` _(required)_
aws_access_key_id: "{{ .env.AWS_ACCESS_KEY_ID }}" # AWS Access Key ID used for authentication
aws_secret_access_key: "{{ .env.AWS_SECRET_ACCESS_KEY }}" # AWS Secret Access Key used for authentication
aws_access_token: "{{ .env.AWS_ACCESS_TOKEN }}" # Optional AWS session token for temporary credentials
endpoint: "https://my-s3-endpoint.com" # Optional custom endpoint URL for S3-compatible storage
region: "us-east-1" # AWS region of the S3 bucket
```

## Salesforce

### `driver`

_[string]_ - Refers to the driver type and must be driver `salesforce` _(required)_

### `username`

_[string]_ - Salesforce account username _(required)_

### `password`

_[string]_ - Salesforce account password (secret) 

### `key`

_[string]_ - Authentication key for Salesforce (secret) 

### `endpoint`

_[string]_ - Salesforce API endpoint URL _(required)_

### `client_id`

_[string]_ - Client ID used for Salesforce OAuth authentication _(required)_

```yaml
# Example: Salesforce connector configuration
type: connector # Must be `connector` (required)
driver: salesforce # Must be `salesforce` _(required)_
username: "myusername" # Salesforce account username
password: "{{ .env.SALESFORCE_PASSWORD }}" # Salesforce account password (secret)
key: "{{ .env.SALESFORCE_KEY }}" # Authentication key for Salesforce (secret)
endpoint: "https://login.salesforce.com" # Salesforce API endpoint URL
client_id: "my-client-id" # Client ID used for Salesforce OAuth authentication
```

## Slack

### `driver`

_[string]_ - Refers to the driver type and must be driver `slack` _(required)_

### `bot_token`

_[string]_ - Bot token used for authenticating Slack API requests _(required)_

```yaml
# Example: Slack connector configuration
type: connector # Must be `connector` (required)
driver: slack # Must be `slack` _(required)_
bot_token: "{{ .env.SLACK_BOT_TOKEN }}" # Bot token used for authenticating Slack API requests
```

## Snowflake

### `driver`

_[string]_ - Refers to the driver type and must be driver `snowflake` _(required)_

### `account`

_[string]_ - Snowflake account identifier. To find your Snowflake account identifier, look at your Snowflake account URL. The account identifier is everything before .snowflakecomputing.com 

### `user`

_[string]_ - Username for the Snowflake connection. 

### `password`

_[string]_ - Password for the Snowflake connection. _(deprecated, use privateKey instead)_ 

### `privateKey`

_[string]_ - Private key for JWT authentication.
:::tip
Private key must be generated as a **PKCS#8 (nocrypt) key**, since the Snowflake Go driver
only supports unencrypted private keys. After generating, it must be **base64 URL encoded**.

Example commands to generate and encode:

```bash
# Generate a 2048-bit unencrypted PKCS#8 private key
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt

# Convert URL safe format for Snowflake
cat rsa_key.p8 | grep -v "\----" | tr -d '\n' | tr '+/' '-_'
```
See: https://docs.snowflake.com/en/guide/key-pair-auth
:::
 

### `authenticator`

_[string]_ - Optional authenticator type (e.g., SNOWFLAKE_JWT). 

### `database`

_[string]_ - Name of the Snowflake database. 

### `schema`

_[string]_ - Schema within the database to use. 

### `warehouse`

_[string]_ - Compute warehouse to use for queries. 

### `role`

_[string]_ - Snowflake role to use. 

### `dsn`

_[string]_ - DSN (Data Source Name) for the Snowflake connection.

This is intended for **advanced configuration** where you want to specify
properties that are not explicitly defined above.  
It can only be used when the other connection fields (account, user, password,
database, schema, warehouse, role, authenticator, privateKey) are **not used**.

For details on private key generation and encoding, see the `privateKey` property.
 

### `parallel_fetch_limit`

_[integer]_ - Maximum number of concurrent fetches during query execution. 

```yaml
# Example: Snowflake connector basic configuration
type: connector
driver: snowflake
account: my_account_identifier
user: my_user
privateKey: "{{ .env.SNOWFLAKE_PRIVATE_KEY }}" # define SNOWFLAKE_PRIVATE_KEY in .env file
database: my_db
schema: my_schema
warehouse: my_wh
role: my_role
parallel_fetch_limit: 2
```

```yaml
# Example: Snowflake connector advance configuration
type: connector
driver: snowflake
dsn: "{{ .env.SNOWFLAKE_DSN }}" # define SNOWFLAKE_DSN in .env file
parallel_fetch_limit: 2
```

## SQLite

### `driver`

_[string]_ - Refers to the driver type and must be driver `sqlite` _(required)_

### `dsn`

_[string]_ - DSN(Data Source Name) for the sqlite connection _(required)_

```yaml
# Example: SQLite connector configuration
type: connector # Must be `connector` (required)
driver: sqlite # Must be `sqlite` _(required)_
dsn: "file:mydatabase.db" # DSN for the sqlite connection
```

### 2.6 Explore Dashboard YAML

Source: [docs/docs/reference/project-files/explore-dashboards.md](https://docs.rilldata.com/reference/project-files/explore-dashboards)

> Canonical source: `docs/docs/reference/project-files/explore-dashboards.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/explore-dashboards>
> Extraction: Original markdown body preserved verbatim after this header.

Explore dashboards provide an interactive way to explore data with predefined measures and dimensions.

## Properties

### `type`

_[string]_ - Refers to the resource type and must be `explore` _(required)_

### `display_name`

_[string]_ - Refers to the display name for the explore dashboard _(required)_

### `metrics_view`

_[string]_ - Refers to the metrics view resource _(required)_

### `description`

_[string]_ - Refers to the description of the explore dashboard 

### `banner`

_[string]_ - Refers to the custom banner displayed at the header of an explore dashboard 

### `dimensions`

_[oneOf]_ - List of dimension names. Use '*' to select all dimensions (default) 

  - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

  - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

  - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

    - **`regex`** - _[string]_ - Select fields using a regular expression 

    - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

    - **`exclude`** - _[object]_ - Select all fields except those listed here 

```yaml
# Example: Select a dimension
dimensions:
    - country
```

```yaml
# Example: Select all dimensions except one
dimensions:
    exclude:
        - country
```

```yaml
# Example: Select all dimensions that match a regex
dimensions:
    expr: "^public_.*$"
```

### `measures`

_[oneOf]_ - List of measure names. Use '*' to select all measures (default) 

  - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

  - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

  - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

    - **`regex`** - _[string]_ - Select fields using a regular expression 

    - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

    - **`exclude`** - _[object]_ - Select all fields except those listed here 

```yaml
# Example: Select a measure
measures:
    - sum_of_total
```

```yaml
# Example: Select all measures except one
measures:
    exclude:
        - sum_of_total
```

```yaml
# Example: Select all measures that match a regex
measures:
    expr: "^public_.*$"
```

### `theme`

_[oneOf]_ - Name of the theme to use. Only one of theme and embedded_theme can be set. 

  - **option 1** - _[string]_ - Name of an existing theme to apply to the dashboard

  - **option 2** - _[object]_ - Inline theme configuration.

    - **`colors`** - _[object]_ - Used to override the dashboard colors. Either primary or secondary color must be provided. 

      - **`primary`** - _[string]_ - Overrides the primary blue color in the dashboard. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. Note that the hue of the input colors is used for variants but the saturation and lightness is copied over from the [blue color palette](https://tailwindcss.com/docs/customizing-colors). 

      - **`secondary`** - _[string]_ - Overrides the secondary color in the dashboard. Applies to the loading spinner only as of now. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

    - **`light`** - _[object]_ - Light theme color configuration 

      - **`primary`** - _[string]_ - Primary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`secondary`** - _[string]_ - Secondary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`variables`** - _[object]_ - Custom CSS variables for light theme 

    - **`dark`** - _[object]_ - Dark theme color configuration 

      - **`primary`** - _[string]_ - Primary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`secondary`** - _[string]_ - Secondary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`variables`** - _[object]_ - Custom CSS variables for dark theme 

### `time_ranges`

_[array of oneOf]_ - Overrides the list of default time range selections available in the dropdown. It can be string or an object with a 'range' and optional 'comparison_offsets'
  ```yaml
  time_ranges:
    - PT15M // Simplified syntax to specify only the range
    - PT1H
    - PT6H
    - P7D
    - range: P5D // Advanced syntax to specify comparison_offsets as well
    - P4W
    - rill-TD // Today
    - rill-WTD // Week-To-date
  ```
 

  - **option 1** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection

  - **option 2** - _[object]_ - Object containing time range and comparison configuration

    - **`range`** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection _(required)_

    - **`comparison_offsets`** - _[array of oneOf]_ - list of time comparison options for this time range selection (optional). Must be one of the [Rill ISO 8601 extensions](https://docs.rilldata.com/reference/rill-iso-extensions#extensions) 

      - **option 1** - _[string]_ - Offset string only (range is inferred)

      - **option 2** - _[object]_ - Object containing offset and range configuration for time comparison

        - **`offset`** - _[string]_ - Time offset for comparison (e.g., 'P1D' for one day ago) 

        - **`range`** - _[string]_ - Custom time range for comparison period 

### `time_zones`

_[array of string]_ - Refers to the time zones that should be pinned to the top of the time zone selector. It should be a list of [IANA time zone identifiers](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 

### `lock_time_zone`

_[boolean]_ - When true, the dashboard will be locked to the first time provided in the time_zones list. When no time_zones are provided, the dashboard will be locked to UTC 

### `allow_custom_time_range`

_[boolean]_ - Defaults to true, when set to false it will hide the ability to set a custom time range for the user. 

### `defaults`

_[object]_ - defines the defaults YAML struct
  ```yaml
  defaults: #define all the defaults within here
    dimensions:
      - dim_1
      - dim_2
    measures:
      - measure_1
      - measure_2
    time_range: P1M
    comparison_mode: dimension #time, none
    comparison_dimension: filename
  ```
 

  - **`dimensions`** - _[oneOf]_ - Provides the default dimensions to load on viewing the dashboard 

    - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

    - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

    - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

      - **`regex`** - _[string]_ - Select fields using a regular expression 

      - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

      - **`exclude`** - _[object]_ - Select all fields except those listed here 

  - **`measures`** - _[oneOf]_ - Provides the default measures to load on viewing the dashboard 

    - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

    - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

    - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

      - **`regex`** - _[string]_ - Select fields using a regular expression 

      - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

      - **`exclude`** - _[object]_ - Select all fields except those listed here 

  - **`time_range`** - _[string]_ - Refers to the default time range shown when a user initially loads the dashboard. The value must be either a valid [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) (for example, PT12H for 12 hours, P1M for 1 month, or P26W for 26 weeks) or one of the [Rill ISO 8601 extensions](https://docs.rilldata.com/reference/rill-iso-extensions#extensions) 

  - **`comparison_mode`** - _[string]_ - Controls how to compare current data with historical or categorical baselines. Options: `none` (no comparison), `time` (compares with past based on default_time_range), `dimension` (compares based on comparison_dimension values) 

  - **`comparison_dimension`** - _[string]_ - for dimension mode, specify the comparison dimension by name 

### `embeds`

_[object]_ - Configuration options for embedded dashboard views 

  - **`hide_pivot`** - _[boolean]_ - When true, hides the pivot table view in embedded mode 

### `security`

_[object]_ - Defines [security rules and access control policies](/developers/build/metrics-view/security) for dashboards (without row filtering) 

  - **`access`** - _[oneOf]_ - Expression indicating if the user should be granted access to the dashboard. If not defined, it will resolve to false and the dashboard won't be accessible to anyone. Needs to be a valid SQL expression that evaluates to a boolean. 

    - **option 1** - _[string]_ - SQL expression that evaluates to a boolean to determine access

    - **option 2** - _[boolean]_ - Direct boolean value to allow or deny access

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment.

### 2.7 Metrics View YAML

Source: [docs/docs/reference/project-files/metrics-views.md](https://docs.rilldata.com/reference/project-files/metrics-views)

> Canonical source: `docs/docs/reference/project-files/metrics-views.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/metrics-views>
> Extraction: Original markdown body preserved verbatim after this header.

In your Rill project directory, create a metrics view, `<metrics_view>.yaml`, file in the `metrics` directory. Rill will ingest the metric view definition next time you run `rill start`.

## Properties

### `version`

_[string]_ - The version of the metrics view schema 

### `type`

_[string]_ - Refers to the resource type and must be `metrics_view` 

### `connector`

_[string]_ - Refers to the connector type for the metrics view, see [OLAP engines](/developers/build/connectors/olap) for more information 

### `display_name`

_[string]_ - Refers to the display name for the metrics view 

### `description`

_[string]_ - Refers to the description for the metrics view 

### `ai_instructions`

_[string]_ - Extra instructions for [AI agents](/guide/ai/mcp). Used to guide natural language question answering and routing. 

### `parent`

_[string]_ - Refers to the parent metrics view from which this metrics view is derived. If specified, this will inherit properties from the parent metrics view 

### `model`

_[string]_ - Refers to the model powering the dashboard (either model or table is required) 

### `database`

_[string]_ - Refers to the database to use in the OLAP engine (to be used in conjunction with table). Otherwise, will use the default database or schema if not specified 

### `database_schema`

_[string]_ - Refers to the schema to use in the OLAP engine (to be used in conjunction with table). Otherwise, will use the default database or schema if not specified 

### `table`

_[string]_ - Refers to the table powering the dashboard, should be used instead of model for dashboards create from external OLAP tables (either table or model is required) 

### `timeseries`

_[string]_ - Refers to the timestamp column from your model that will underlie x-axis data in the line charts. If not specified, the line charts will not appear 

### `watermark`

_[string]_ - A SQL expression that tells us the max timestamp that the measures are considered valid for. Usually does not need to be overwritten 

### `smallest_time_grain`

_[string]_ - Refers to the smallest time granularity the user is allowed to view. The valid values are: millisecond, second, minute, hour, day, week, month, quarter, year 

### `first_day_of_week`

_[integer]_ - Refers to the first day of the week for time grain aggregation (for example, Sunday instead of Monday). The valid values are 1 through 7 where Monday=1 and Sunday=7 

### `first_month_of_year`

_[integer]_ - Refers to the first month of the year for time grain aggregation. The valid values are 1 through 12 where January=1 and December=12 

### `dimensions`

_[array of object]_ - Relates to exploring segments or dimensions of your data and filtering the dashboard 

  - **`name`** - _[string]_ - a stable identifier for the dimension 

  - **`display_name`** - _[string]_ - a display name for your dimension 

  - **`description`** - _[string]_ - a freeform text description of the dimension 

  - **`tags`** - _[array of string]_ - optional list of tags for categorizing the dimension (defaults to empty) 

  - **`type`** - _[string]_ - Dimension type: "geo" for geospatial dimensions, "time" for time dimensions or "categorical" for categorial dimensions. Default is undefined and the type will be inferred instead 

  - **`column`** - _[string]_ - a categorical column 

  - **`expression`** - _[string]_ - a non-aggregate expression such as string_split(domain, '.'). One of column and expression is required but cannot have both at the same time 

  - **`unnest`** - _[boolean]_ - if true, allows multi-valued dimension to be unnested (such as lists) and filters will automatically switch to "contains" instead of exact match 

  - **`uri`** - _[string, boolean]_ - enable if your dimension is a clickable URL to enable single click navigation (boolean or valid SQL expression) 

### `measures`

_[array of object]_ - Used to define the numeric aggregates of columns from your data model 

  - **`name`** - _[string]_ - a stable identifier for the measure _(required)_

  - **`display_name`** - _[string]_ - the display name of your measure. _(required)_

  - **`label`** - _[string]_ - a label for your measure, deprecated use display_name 

  - **`description`** - _[string]_ - a freeform text description of the measure 

  - **`tags`** - _[array of string]_ - optional list of tags for categorizing the measure (defaults to empty) 

  - **`type`** - _[string]_ - Measure calculation type: "simple" for basic aggregations, "derived" for calculations using other measures, or "time_comparison" for period-over-period analysis. Defaults to "simple" unless dependencies exist. 

  - **`expression`** - _[string]_ - a combination of operators and functions for aggregations _(required)_

  - **`window`** - _[anyOf]_ - A measure window can be defined as a keyword string (e.g. 'time' or 'all') or an object with detailed window configuration. For more information, see the [window functions](/developers/build/metrics-view/measures/windows) documentation. 

    - **option 1** - _[string]_ - Shorthand: `time` or `true` means time-partitioned, `all` means non-partitioned.

    - **option 2** - _[object]_ - Detailed window configuration for measure calculations, allowing control over partitioning, ordering, and frame definition.

      - **`partition`** - _[boolean]_ - Controls whether the window is partitioned. When true, calculations are performed within each partition separately. 

      - **`order`** - _[string]_ - Specifies the fields to order the window by, determining the sequence of rows within each partition. 

        - **option 1** - _[string]_ - Simple field name as a string.

        - **option 2** - _[array of oneOf]_ - List of field selectors, each can be a string or an object with detailed configuration.

          - **option 1** - _[string]_ - Shorthand field selector, interpreted as the name.

          - **option 2** - _[object]_ - Detailed field selector configuration with name and optional time grain.

            - **`name`** - _[string]_ - Name of the field to select. _(required)_

            - **`time_grain`** - _[string]_ - Time grain for time-based dimensions. 

      - **`frame`** - _[string]_ - Defines the window frame boundaries for calculations, specifying which rows are included in the window relative to the current row. 

  - **`per`** - _[oneOf]_ - for per dimensions 

    - **option 1** - _[string]_ - Simple field name as a string.

    - **option 2** - _[array of oneOf]_ - List of field selectors, each can be a string or an object with detailed configuration.

      - **option 1** - _[string]_ - Shorthand field selector, interpreted as the name.

      - **option 2** - _[object]_ - Detailed field selector configuration with name and optional time grain.

        - **`name`** - _[string]_ - Name of the field to select. _(required)_

        - **`time_grain`** - _[string]_ - Time grain for time-based dimensions. 

  - **`requires`** - _[oneOf]_ - using an available measure or dimension in your metrics view to set a required parameter, cannot be used with simple measures. See [referencing measures](/developers/build/metrics-view/measures/referencing) for more information. 

    - **option 1** - _[string]_ - Simple field name as a string.

    - **option 2** - _[array of oneOf]_ - List of field selectors, each can be a string or an object with detailed configuration.

      - **option 1** - _[string]_ - Shorthand field selector, interpreted as the name.

      - **option 2** - _[object]_ - Detailed field selector configuration with name and optional time grain.

        - **`name`** - _[string]_ - Name of the field to select. _(required)_

        - **`time_grain`** - _[string]_ - Time grain for time-based dimensions. 

  - **`valid_percent_of_total`** - _[boolean]_ - a boolean indicating whether percent-of-total values should be rendered for this measure 

  - **`format_preset`** - _[string]_ - Controls the formatting of this measure using a predefined preset. Measures cannot have both `format_preset` and `format_d3`. If neither is supplied, the measure will be formatted using the `humanize` preset by default.
  
    Available options:
    - `humanize`: Round numbers into thousands (K), millions(M), billions (B), etc.
    - `none`: Raw output.
    - `currency_usd`: Round to 2 decimal points with a dollar sign ($).
    - `currency_eur`: Round to 2 decimal points with a euro sign (€).
    - `percentage`: Convert a rate into a percentage with a % sign.
    - `interval_ms`: Convert milliseconds into human-readable durations like hours (h), days (d), years (y), etc. (optional)
 

  - **`format_d3`** - _[string]_ - Controls the formatting of this measure using a [d3-format](https://d3js.org/d3-format) string. If an invalid format string is supplied, the measure will fall back to `format_preset: humanize`. A measure cannot have both `format_preset` and `format_d3`. If neither is provided, the humanize preset is used by default. Example: `format_d3: ".2f"` formats using fixed-point notation with two decimal places. Example: `format_d3: ",.2r"` formats using grouped thousands with two significant digits. (optional) 

  - **`format_d3_locale`** - _[object]_ - locale configuration passed through to D3, enabling changing the currency symbol among other things. For details, see the docs for D3's formatLocale.
    ```yaml
    format_d3: "$,"
    format_d3_locale:
      grouping: [3, 2]
      currency: ["₹", ""]
    ```
 

    - **`grouping`** - _[array]_ - the grouping of the currency symbol 

    - **`currency`** - _[array]_ - the currency symbol 

  - **`treat_nulls_as`** - _[string]_ - used to configure what value to fill in for missing time buckets. This also works generally as COALESCING over non empty time buckets. 

### `parent_dimensions`

_[oneOf]_ - Optional field selectors for dimensions to inherit from the parent metrics view. 

  - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

  - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

  - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

    - **`regex`** - _[string]_ - Select fields using a regular expression 

    - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

    - **`exclude`** - _[object]_ - Select all fields except those listed here 

### `parent_measures`

_[oneOf]_ - Optional field selectors for measures to inherit from the parent metrics view. 

  - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

  - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

  - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

    - **`regex`** - _[string]_ - Select fields using a regular expression 

    - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

    - **`exclude`** - _[object]_ - Select all fields except those listed here 

### `annotations`

_[array of object]_ - Used to define annotations that can be displayed on charts 

  - **`name`** - _[string]_ - A stable identifier for the annotation. Defaults to model or table names when not specified 

  - **`model`** - _[string]_ - Refers to the model powering the annotation (either table or model is required). The model must have 'time' and 'description' columns. Optional columns include 'time_end' for range annotations and 'grain' to specify when the annotation should appear based on dashboard grain level. 

  - **`database`** - _[string]_ - Refers to the database to use in the OLAP engine (to be used in conjunction with table). Otherwise, will use the default database or schema if not specified 

  - **`database_schema`** - _[string]_ - Refers to the schema to use in the OLAP engine (to be used in conjunction with table). Otherwise, will use the default database or schema if not specified 

  - **`table`** - _[string]_ - Refers to the table powering the annotation, should be used instead of model for annotations from external OLAP tables (either table or model is required) 

  - **`connector`** - _[string]_ - Refers to the connector to use for the annotation 

  - **`measures`** - _[anyOf]_ - Specifies which measures to apply the annotation to. Applies to all measures if not specified 

    - **option 1** - _[string]_ - Simple field name as a string.

    - **option 2** - _[array of anyOf]_ - List of field selectors, each can be a string or an object with detailed configuration.

      - **option 1** - _[string]_ - Shorthand field selector, interpreted as the name.

      - **option 2** - _[object]_ - Detailed field selector configuration with name and optional time grain.

        - **`name`** - _[string]_ - Name of the field to select. _(required)_

        - **`time_grain`** - _[string]_ - Time grain for time-based dimensions. 

### `security`

_[object]_ - Defines [security rules and access control policies](/developers/build/metrics-view/security) for resources 

  - **`access`** - _[oneOf]_ - Expression indicating if the user should be granted access to the dashboard. If not defined, it will resolve to false and the dashboard won't be accessible to anyone. Needs to be a valid SQL expression that evaluates to a boolean. 

    - **option 1** - _[string]_ - SQL expression that evaluates to a boolean to determine access

    - **option 2** - _[boolean]_ - Direct boolean value to allow or deny access

  - **`row_filter`** - _[string]_ - SQL expression to filter the underlying model by. Can leverage templated user attributes to customize the filter for the requesting user. Needs to be a valid SQL expression that can be injected into a WHERE clause 

  - **`include`** - _[array of object]_ - List of dimension or measure names to include in the dashboard. If include is defined all other dimensions and measures are excluded 

    - **`if`** - _[string]_ - Expression to decide if the column should be included or not. It can leverage templated user attributes. Needs to be a valid SQL expression that evaluates to a boolean _(required)_

    - **`names`** - _[anyOf]_ - List of fields to include. Should match the name of one of the dashboard's dimensions or measures _(required)_

      - **option 1** - _[array of string]_ - List of specific field names to include

      - **option 2** - _[string]_ - Wildcard '*' to include all fields

  - **`exclude`** - _[array of object]_ - List of dimension or measure names to exclude from the dashboard. If exclude is defined all other dimensions and measures are included 

    - **`if`** - _[string]_ - Expression to decide if the column should be excluded or not. It can leverage templated user attributes. Needs to be a valid SQL expression that evaluates to a boolean _(required)_

    - **`names`** - _[anyOf]_ - List of fields to exclude. Should match the name of one of the dashboard's dimensions or measures _(required)_

      - **option 1** - _[array of string]_ - List of specific field names to exclude

      - **option 2** - _[string]_ - Wildcard '*' to exclude all fields

  - **`rules`** - _[array of object]_ - List of detailed security rules that can be used to define complex access control policies 

    - **`type`** - _[string]_ - Type of security rule - access (overall access), field_access (field-level access), or row_filter (row-level filtering) _(required)_

    - **`action`** - _[string]_ - Whether to allow or deny access for this rule 

    - **`if`** - _[string]_ - Conditional expression that determines when this rule applies. Must be a valid SQL expression that evaluates to a boolean 

    - **`names`** - _[array of string]_ - List of field names this rule applies to (for field_access type rules) 

    - **`all`** - _[boolean]_ - When true, applies the rule to all fields (for field_access type rules) 

    - **`sql`** - _[string]_ - SQL expression for row filtering (for row_filter type rules) 

### `explore`

_[object]_ - Defines an optional inline explore view for the metrics view. If not specified a default explore will be emitted unless `skip` is set to true. 

  - **`skip`** - _[boolean]_ - If true, disables the explore view for this metrics view. 

  - **`name`** - _[string]_ - Name of the explore view. 

  - **`display_name`** - _[string]_ - Display name for the explore view. 

  - **`description`** - _[string]_ - Description for the explore view. 

  - **`banner`** - _[string]_ - Custom banner displayed at the header of the explore view. 

  - **`theme`** - _[oneOf]_ - Name of the theme to use or define a theme inline. Either theme name or inline theme can be set. 

    - **option 1** - _[string]_ - Name of an existing theme to apply to the explore view.

    - **option 2** - _[object]_ - Inline theme configuration.

      - **`colors`** - _[object]_ - Used to override the dashboard colors. Either primary or secondary color must be provided. 

        - **`primary`** - _[string]_ - Overrides the primary blue color in the dashboard. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. Note that the hue of the input colors is used for variants but the saturation and lightness is copied over from the [blue color palette](https://tailwindcss.com/docs/customizing-colors). 

        - **`secondary`** - _[string]_ - Overrides the secondary color in the dashboard. Applies to the loading spinner only as of now. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

      - **`light`** - _[object]_ - Light theme color configuration 

        - **`primary`** - _[string]_ - Primary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

        - **`secondary`** - _[string]_ - Secondary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

        - **`variables`** - _[object]_ - Custom CSS variables for light theme 

      - **`dark`** - _[object]_ - Dark theme color configuration 

        - **`primary`** - _[string]_ - Primary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

        - **`secondary`** - _[string]_ - Secondary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

        - **`variables`** - _[object]_ - Custom CSS variables for dark theme 

  - **`time_ranges`** - _[array of oneOf]_ - Overrides the list of default time range selections available in the dropdown. It can be string or an object with a 'range' and optional 'comparison_offsets'. 

    - **option 1** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection

    - **option 2** - _[object]_ - Object containing time range and comparison configuration

      - **`range`** - _[string]_ - a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration or one of the [Rill ISO 8601 extensions](/reference/time-syntax/rill-iso-extensions#extensions) extensions for the selection _(required)_

      - **`comparison_offsets`** - _[array of oneOf]_ - list of time comparison options for this time range selection (optional). Must be one of the [Rill ISO 8601 extensions](https://docs.rilldata.com/reference/rill-iso-extensions#extensions) 

        - **option 1** - _[string]_ - Offset string only (range is inferred)

        - **option 2** - _[object]_ - Object containing offset and range configuration for time comparison

          - **`offset`** - _[string]_ - Time offset for comparison (e.g., 'P1D' for one day ago) 

          - **`range`** - _[string]_ - Custom time range for comparison period 

  - **`time_zones`** - _[array of string]_ - List of time zones to pin to the top of the time zone selector. Should be a list of IANA time zone identifiers. 

  - **`lock_time_zone`** - _[boolean]_ - When true, the explore view will be locked to the first time zone provided in the time_zones list. If no time_zones are provided, it will be locked to UTC. 

  - **`allow_custom_time_range`** - _[boolean]_ - Defaults to true. When set to false, hides the ability to set a custom time range for the user. 

  - **`defaults`** - _[object]_ - Preset UI state to show by default. 

    - **`dimensions`** - _[oneOf]_ - Default dimensions to load on viewing the explore view. 

      - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

      - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

      - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

        - **`regex`** - _[string]_ - Select fields using a regular expression 

        - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

        - **`exclude`** - _[object]_ - Select all fields except those listed here 

    - **`measures`** - _[oneOf]_ - Default measures to load on viewing the explore view. 

      - **option 1** - _[string]_ - Wildcard(*) selector that includes all available fields in the selection

      - **option 2** - _[array of string]_ - Explicit list of fields to include in the selection

      - **option 3** - _[object]_ - Advanced matching using regex, DuckDB expression, or exclusion

        - **`regex`** - _[string]_ - Select fields using a regular expression 

        - **`expr`** - _[string]_ - DuckDB SQL expression to select fields based on custom logic 

        - **`exclude`** - _[object]_ - Select all fields except those listed here 

    - **`time_range`** - _[string]_ - Default time range to display when the explore view loads. 

    - **`comparison_mode`** - _[string]_ - Default comparison mode for metrics (none, time, or dimension). 

    - **`comparison_dimension`** - _[string]_ - Default dimension to use for comparison when comparison_mode is 'dimension'. 

  - **`embeds`** - _[object]_ - Configuration options for embedded explore views. 

    - **`hide_pivot`** - _[boolean]_ - When true, hides the pivot table view in embedded mode. 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment.

### 2.8 Models YAML

Source: [docs/docs/reference/project-files/models.md](https://docs.rilldata.com/reference/project-files/models)

> Canonical source: `docs/docs/reference/project-files/models.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/models>
> Extraction: Original markdown body preserved verbatim after this header.

This file is used to define YAML models. For more information on our SQL models, see the [SQL models](/developers/build/models/) documentation.
:::tip

Both regular models and source models can use the Model YAML specification described on this page. While [SQL models](/developers/build/models) are perfect for simple transformations, Model YAML files provide advanced capabilities for complex data processing scenarios.

**When to use Model YAML:**
- **Partitions** - Optimize performance with data partitioning strategies
- **Incremental models** - Process only new or changed data efficiently
- **Pre/post execution hooks** - Run custom logic before or after model execution
- **Staging** - Create intermediate tables for complex transformations
- **Output configuration** - Define specific output formats and destinations

Model YAML files give you fine-grained control over how your data is processed and transformed, making them ideal for production workloads and complex analytics pipelines.

:::


## Properties

### `type`

_[string]_ - Refers to the resource type and must be `model` _(required)_

### `refresh`

_[object]_ - Specifies the refresh schedule that Rill should follow to re-ingest and update the underlying model data 

  - **`cron`** - _[string]_ - A cron expression that defines the execution schedule 

  - **`time_zone`** - _[string]_ - Time zone to interpret the schedule in (e.g., 'UTC', 'America/Los_Angeles'). 

  - **`disable`** - _[boolean]_ - If true, disables the resource without deleting it. 

  - **`ref_update`** - _[boolean]_ - If true, allows the resource to run when a dependency updates. 

  - **`run_in_dev`** - _[boolean]_ - If true, allows the schedule to run in development mode. 

```yaml
refresh:
    cron: "* * * * *"
```

### `connector`

_[string]_ - Refers to the resource type and is needed if setting an explicit OLAP engine. IE `clickhouse` 

### `sql`

_[string]_ - Raw SQL query to run against source _(required)_

### `pre_exec`

_[string]_ - Refers to SQL queries to run before the main query, available for DuckDB-based and ClickHouse-based models. (optional). Ensure pre_exec queries are idempotent. Use IF NOT EXISTS statements when applicable. 

```yaml
pre_exec: ATTACH IF NOT EXISTS 'dbname=postgres host=localhost port=5432 user=postgres password=postgres' AS postgres_db (TYPE POSTGRES)
```

### `post_exec`

_[string]_ - Refers to a SQL query that is run after the main query, available for DuckDB-based and ClickHouse-based models. (optional). Ensure post_exec queries are idempotent. Use IF EXISTS statements when applicable. 

```yaml
post_exec: DETACH DATABASE IF EXISTS postgres_db
```

### `create_secrets_from_connectors`

_[string, array]_ - List of connector names for which temporary secrets should be created before executing the SQL. This allows DuckDB-based models to access cloud storage (S3, GCS, Azure) using credentials from named connectors. 

```yaml
create_secrets_from_connectors: my_s3_connector
```

```yaml
create_secrets_from_connectors:
    - my_s3_connector
    - my_other_s3_connector
```

### `retry`

_[object]_ - Refers to the retry configuration for the model. (optional) 

  - **`attempts`** - _[integer]_ - The number of attempts to retry the model. 

  - **`delay`** - _[string]_ - The delay between attempts. 

  - **`exponential_backoff`** - _[boolean]_ - Whether to use exponential backoff. 

  - **`if_error_matches`** - _[array of string]_ - The error messages to match. 

```yaml
retry:
    attempts: 5
    delay: 10s
    exponential_backoff: true
    if_error_matches:
        - ".*OvercommitTracker.*"
        - ".*Bad Gateway.*"
        - ".*Timeout.*"
        - ".*Connection refused.*"
```

### `timeout`

_[string]_ - The maximum time to wait for model ingestion 

### `incremental`

_[boolean]_ - whether incremental modeling is required (optional) 

### `change_mode`

_[string]_ - Configure how changes to the model specifications are applied (optional). 'reset' will drop and recreate the model automatically, 'manual' will require a manual full or incremental refresh to apply changes, and 'patch' will switch to the new logic without re-processing historical data (only applies for incremental models). 

### `state`

_[oneOf]_ - Refers to the explicitly defined state of your model, cannot be used with partitions (optional) 

  - **option 1** - _[object]_ - Executes a raw SQL query against the project's data models.

    - **`sql`** - _[string]_ - Raw SQL query to run against existing models in the project. _(required)_

    - **`connector`** - _[string]_ - specifies the connector to use when running SQL or glob queries. 

  - **option 2** - _[object]_ - Executes a SQL query that targets a defined metrics view.

    - **`metrics_sql`** - _[string]_ - SQL query that targets a metrics view in the project _(required)_

  - **option 3** - _[object]_ - Calls a custom API defined in the project to compute data.

    - **`api`** - _[string]_ - Name of a custom API defined in the project. _(required)_

    - **`args`** - _[object]_ - Arguments to pass to the custom API. 

  - **option 4** - _[object]_ - Uses a file-matching pattern (glob) to query data from a connector.

    - **`glob`** - _[anyOf]_ - Defines the file path or pattern to query from the specified connector. _(required)_

      - **option 1** - _[string]_ - A simple file path/glob pattern as a string.

      - **option 2** - _[object]_ - An object-based configuration for specifying a file path/glob pattern with advanced options.

    - **`connector`** - _[string]_ - Specifies the connector to use with the glob input. 

  - **option 5** - _[object]_ - Uses the status of a resource as data.

    - **`resource_status`** - _[object]_ - Based on resource status _(required)_

      - **`where_error`** - _[boolean]_ - Indicates whether the condition should trigger when the resource is in an error state. 

  - **option 6** - _[object]_ - Uses AI to generate insights and analysis from metrics data. Only available for reports.

    - **`ai`** - _[object]_ - AI resolver configuration for generating automated insights _(required)_

      - **`prompt`** - _[string]_ - Custom prompt to guide the AI analysis. If not provided, a default analysis prompt is used. 

      - **`time_range`** - _[object]_ - Time range for the analysis period 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration (e.g., P7D for 7 days, P1M for 1 month) 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset from current time (e.g., P1D to start from yesterday) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression (e.g., 'last 7 days', 'this month') 

      - **`comparison_time_range`** - _[object]_ - Optional comparison time range for period-over-period analysis 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration for comparison period 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset for comparison period (e.g., P7D to compare with previous week) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression for comparison period 

      - **`context`** - _[object]_ - Context to constrain the AI analysis 

        - **`explore`** - _[string]_ - Name of the explore dashboard to analyze 

        - **`dimensions`** - _[array of string]_ - List of dimensions to include in analysis 

        - **`measures`** - _[array of string]_ - List of measures to include in analysis 

```yaml
state:
    sql: SELECT MAX(date) as max_date
```

### `partitions`

_[oneOf]_ - Refers to the how your data is partitioned, cannot be used with state. (optional) 

  - **option 1** - _[object]_ - Executes a raw SQL query against the project's data models.

    - **`sql`** - _[string]_ - Raw SQL query to run against existing models in the project. _(required)_

    - **`connector`** - _[string]_ - specifies the connector to use when running SQL or glob queries. 

  - **option 2** - _[object]_ - Executes a SQL query that targets a defined metrics view.

    - **`metrics_sql`** - _[string]_ - SQL query that targets a metrics view in the project _(required)_

  - **option 3** - _[object]_ - Calls a custom API defined in the project to compute data.

    - **`api`** - _[string]_ - Name of a custom API defined in the project. _(required)_

    - **`args`** - _[object]_ - Arguments to pass to the custom API. 

  - **option 4** - _[object]_ - Uses a file-matching pattern (glob) to query data from a connector.

    - **`glob`** - _[anyOf]_ - Defines the file path or pattern to query from the specified connector. _(required)_

      - **option 1** - _[string]_ - A simple file path/glob pattern as a string.

      - **option 2** - _[object]_ - An object-based configuration for specifying a file path/glob pattern with advanced options.

    - **`connector`** - _[string]_ - Specifies the connector to use with the glob input. 

  - **option 5** - _[object]_ - Uses the status of a resource as data.

    - **`resource_status`** - _[object]_ - Based on resource status _(required)_

      - **`where_error`** - _[boolean]_ - Indicates whether the condition should trigger when the resource is in an error state. 

  - **option 6** - _[object]_ - Uses AI to generate insights and analysis from metrics data. Only available for reports.

    - **`ai`** - _[object]_ - AI resolver configuration for generating automated insights _(required)_

      - **`prompt`** - _[string]_ - Custom prompt to guide the AI analysis. If not provided, a default analysis prompt is used. 

      - **`time_range`** - _[object]_ - Time range for the analysis period 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration (e.g., P7D for 7 days, P1M for 1 month) 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset from current time (e.g., P1D to start from yesterday) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression (e.g., 'last 7 days', 'this month') 

      - **`comparison_time_range`** - _[object]_ - Optional comparison time range for period-over-period analysis 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration for comparison period 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset for comparison period (e.g., P7D to compare with previous week) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression for comparison period 

      - **`context`** - _[object]_ - Context to constrain the AI analysis 

        - **`explore`** - _[string]_ - Name of the explore dashboard to analyze 

        - **`dimensions`** - _[array of string]_ - List of dimensions to include in analysis 

        - **`measures`** - _[array of string]_ - List of measures to include in analysis 

```yaml
partitions:
    glob: gcs://my_bucket/y=*/m=*/d=*/*.parquet
```

```yaml
partitions:
    connector: duckdb
    sql: SELECT range AS num FROM range(0,10)
```

### `tests`

_[array of object]_ - Define data quality tests for the model. Each test must have a `name` and either an `assert` expression or a `sql` query. An `assert` test passes when no rows violate the condition. A `sql` test passes when the query returns zero rows. 

  - **`name`** - _[string]_ - A unique name for the test. _(required)_

  - **`assert`** - _[string]_ - A SQL boolean expression applied to each row of the model. The test passes if no rows violate the condition (i.e., all rows satisfy `assert`). Cannot be combined with `sql`. 

  - **`sql`** - _[string]_ - A SQL query that returns rows representing test failures. The test passes if the query returns zero rows. Cannot be combined with `assert`. 

  - **`connector`** - _[string]_ - The connector to use when executing the test query. Defaults to the model's connector. 

```yaml
tests:
    - name: assert_positive_revenue
      assert: revenue >= 0
    - name: no_null_ids
      assert: id IS NOT NULL
```

```yaml
tests:
    - name: row_count_check
      sql: SELECT 'fail' WHERE (SELECT COUNT(*) FROM my_model) = 0
```

### `materialize`

_[boolean]_ - models will be materialized in olap 

### `partitions_watermark`

_[string]_ - Refers to a customizable timestamp that can be set to check if an object has been updated (optional). 

### `partitions_concurrency`

_[integer]_ - Refers to the number of concurrent partitions that can be read at the same time (optional). 

### `stage`

_[object]_ - in the case of staging models, where an input source does not support direct write to the output and a staging table is required 

  - **`connector`** - _[string]_ - Refers to the connector type for the staging table _(required)_

  - **`path`** - _[string]_ - Refers to the path to the staging table 

```yaml
stage:
    connector: s3
    path: s3://my_bucket/my_staging_table
```

### `output`

_[object]_ - to define the properties of output 

  - **`table`** - _[string]_ - Name of the output table. If not specified, the model name is used. 

  - **`materialize`** - _[boolean]_ - Whether to materialize the model as a table or view 

  - **`connector`** - _[string]_ - Refers to the connector type for the output table. Can be `clickhouse` or `duckdb` and their named connector 

  - **`incremental_strategy`** - _[string]_ - Strategy to use for incremental updates. Can be 'append', 'merge' or 'partition_overwrite' 

  - **`unique_key`** - _[array of string]_ - List of columns that uniquely identify a row for merge strategy 

  - **`partition_by`** - _[string]_ - Column or expression to partition the table by 

  **Additional properties for `output` when `connector` is `clickhouse`**

  - **`type`** - _[string]_ - Type to materialize the model into. Can be 'TABLE', 'VIEW' or 'DICTIONARY' 

  - **`columns`** - _[string]_ - Column names and types. Can also include indexes. If unspecified, detected from the query. 

  - **`engine_full`** - _[string]_ - Full engine definition in SQL format. Can include partition keys, order, TTL, etc. 

  - **`engine`** - _[string]_ - Table engine to use. Default is MergeTree 

  - **`order_by`** - _[string]_ - ORDER BY clause. 

  - **`partition_by`** - _[string]_ - Partition BY clause. 

  - **`primary_key`** - _[string]_ - PRIMARY KEY clause. 

  - **`sample_by`** - _[string]_ - SAMPLE BY clause. 

  - **`ttl`** - _[string]_ - TTL settings for the table or columns. 

  - **`table_settings`** - _[string]_ - Table-specific settings. 

  - **`query_settings`** - _[string]_ - Settings used in insert/create table as select queries. 

  - **`distributed_settings`** - _[string]_ - Settings for distributed table. 

  - **`distributed_sharding_key`** - _[string]_ - Sharding key for distributed table. 

  - **`dictionary_source_user`** - _[string]_ - User for accessing the source dictionary table (used if type is DICTIONARY). 

  - **`dictionary_source_password`** - _[string]_ - Password for the dictionary source user. 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Additional properties for `output` when `connector` is `clickhouse`

### `type`

_[string]_ - Type to materialize the model into. Can be 'TABLE', 'VIEW' or 'DICTIONARY' 

### `columns`

_[string]_ - Column names and types. Can also include indexes. If unspecified, detected from the query. 

### `engine_full`

_[string]_ - Full engine definition in SQL format. Can include partition keys, order, TTL, etc. 

### `engine`

_[string]_ - Table engine to use. Default is MergeTree 

### `order_by`

_[string]_ - ORDER BY clause. 

### `partition_by`

_[string]_ - Partition BY clause. 

### `primary_key`

_[string]_ - PRIMARY KEY clause. 

### `sample_by`

_[string]_ - SAMPLE BY clause. 

### `ttl`

_[string]_ - TTL settings for the table or columns. 

### `table_settings`

_[string]_ - Table-specific settings. 

### `query_settings`

_[string]_ - Settings used in insert/create table as select queries. 

### `distributed_settings`

_[string]_ - Settings for distributed table. 

### `distributed_sharding_key`

_[string]_ - Sharding key for distributed table. 

### `dictionary_source_user`

_[string]_ - User for accessing the source dictionary table (used if type is DICTIONARY). 

### `dictionary_source_password`

_[string]_ - Password for the dictionary source user. 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Additional properties when `connector` is `athena` or [named connector](./connectors#athena) for athena

### `output_location`

_[string]_ - Output location for query results in S3. 

### `workgroup`

_[string]_ - AWS Athena workgroup to use for queries. 

### `region`

_[string]_ - AWS region to connect to Athena and the output location. 

## Additional properties when `connector` is `azure` or [named connector](./connectors#azure) of azure

### `path`

_[string]_ - Path to the source 

### `account`

_[string]_ - Account identifier 

### `uri`

_[string]_ - Source URI 

### `extract`

_[object]_ - Arbitrary key-value pairs for extraction settings 

### `glob`

_[object]_ - Settings related to glob file matching. 

  - **`max_total_size`** - _[integer]_ - Maximum total size (in bytes) matched by glob 

  - **`max_objects_matched`** - _[integer]_ - Maximum number of objects matched by glob 

  - **`max_objects_listed`** - _[integer]_ - Maximum number of objects listed in glob 

  - **`page_size`** - _[integer]_ - Page size for glob listing 

### `batch_size`

_[string]_ - Size of a batch (e.g., '100MB') 

## Additional properties when `connector` is `bigquery` or [named connector](./connectors#bigquery) of bigquery

### `project_id`

_[string]_ - ID of the BigQuery project. 

## Additional properties when `connector` is `duckdb` or [named connector](./connectors#duckdb) of duckdb

### `path`

_[string]_ - Path to the data source. 

### `format`

_[string]_ - Format of the data source (e.g., csv, json, parquet). 

### `pre_exec`

_[string]_ - refers to SQL queries to run before the main query, available for DuckDB-based and ClickHouse-based models. _(optional)_. Ensure `pre_exec` queries are idempotent. Use `IF NOT EXISTS` statements when applicable. 

### `post_exec`

_[string]_ - refers to a SQL query that is run after the main query, available for DuckDB-based and ClickHouse-based models. _(optional)_. Ensure `post_exec` queries are idempotent. Use `IF EXISTS` statements when applicable. 

```yaml
pre_exec: ATTACH IF NOT EXISTS 'dbname=postgres host=localhost port=5432 user=postgres password=postgres' AS postgres_db (TYPE POSTGRES);
sql: SELECT * FROM postgres_query('postgres_db', 'SELECT * FROM USERS')
post_exec: DETACH DATABASE IF EXISTS postgres_db
```

### `create_secrets_from_connectors`

_[string, array]_ - List of connector names for which temporary secrets should be created before executing the SQL. 

## Additional properties when `connector` is `gcs` or [named connector](./connectors#gcs) of gcs

### `path`

_[string]_ - Path to the source 

### `uri`

_[string]_ - Source URI 

### `extract`

_[object]_ - key-value pairs for extraction settings 

### `glob`

_[object]_ - Settings related to glob file matching. 

  - **`max_total_size`** - _[integer]_ - Maximum total size (in bytes) matched by glob 

  - **`max_objects_matched`** - _[integer]_ - Maximum number of objects matched by glob 

  - **`max_objects_listed`** - _[integer]_ - Maximum number of objects listed in glob 

  - **`page_size`** - _[integer]_ - Page size for glob listing 

### `batch_size`

_[string]_ - Size of a batch (e.g., '100MB') 

## Additional properties when `connector` is `local_file` or [named connector](/developers/build/connectors/data-source/local-file) of local_file

### `path`

_[string]_ - Path to the data source. 

### `format`

_[string]_ - Format of the data source (e.g., csv, json, parquet). 

### `invalidate_on_change`

_[boolean]_ - When true, the model will be invalidated and re-processed if the source file changes. 

## Additional properties when `connector` is `redshift` or [named connector](./connectors#redshift) of redshift

### `output_location`

_[string]_ - S3 location where query results are stored. 

### `workgroup`

_[string]_ - Redshift Serverless workgroup to use. 

### `database`

_[string]_ - Name of the Redshift database. 

### `cluster_identifier`

_[string]_ - Identifier of the Redshift cluster. 

### `role_arn`

_[string]_ - ARN of the IAM role to assume for Redshift access. 

### `region`

_[string]_ - AWS region of the Redshift deployment. 

## Additional properties when `connector` is `s3` or [named connector](./connectors#s3) of s3

### `region`

_[string]_ - AWS region 

### `endpoint`

_[string]_ - AWS Endpoint 

### `path`

_[string]_ - Path to the source 

### `uri`

_[string]_ - Source URI 

### `extract`

_[object]_ - key-value pairs for extraction settings 

### `glob`

_[object]_ - Settings related to glob file matching. 

  - **`max_total_size`** - _[integer]_ - Maximum total size (in bytes) matched by glob 

  - **`max_objects_matched`** - _[integer]_ - Maximum number of objects matched by glob 

  - **`max_objects_listed`** - _[integer]_ - Maximum number of objects listed in glob 

  - **`page_size`** - _[integer]_ - Page size for glob listing 

### `batch_size`

_[string]_ - Size of a batch (e.g., '100MB') 

## Additional properties when `connector` is `salesforce` or [named connector](./connectors#salesforce) of salesforce

### `soql`

_[string]_ - SOQL query to execute against the Salesforce instance. 

### `sobject`

_[string]_ - Salesforce object (e.g., Account, Contact) targeted by the query. 

### `queryAll`

_[boolean]_ - Whether to include deleted and archived records in the query (uses queryAll API). 

## Examples

```yaml
### Incremental model 
type: model
incremental: true
connector: bigquery
state:
    sql: SELECT MAX(date) as max_date
sql: "SELECT ... FROM events \n  {{ if incremental }} \n      WHERE event_time > '{{.state.max_date}}' \n  {{end}}\n"
output:
    connector: duckdb
```

```yaml
### Partitioned model 
type: model
partitions:
    glob:
        connector: gcs
        path: gs://rilldata-public/github-analytics/Clickhouse/2025/*/commits_*.parquet
sql: SELECT * FROM read_parquet('{{ .partition.uri }}')
output:
    connector: duckdb
    incremental_strategy: append
```

```yaml
### Partitioned Incremental model 
type: model
incremental: true
refresh:
    cron: "0 8 * * *"
partitions:
    glob:
        path: gs://rilldata-public/github-analytics/Clickhouse/2025/*/*
        partition: directory
sql: "SELECT * \n  FROM read_parquet('gs://rilldata-public/{{ .partition.path }}/commits_*.parquet') \n  WHERE '{{ .partition.path }}' IS NOT NULL\n"
output:
    connector: duckdb
    incremental_strategy: append
```

```yaml
### Staging model 
type: model
connector: snowflake
# Use DuckDB to generate a range of days from 1st Jan to today
partitions:
    connector: duckdb
    sql: SELECT range as day FROM range(TIMESTAMPTZ '2024-01-01', now(), INTERVAL 1 DAY)
# Don't reload previously ingested partitions on every refresh
incremental: true
# Query Snowflake for all events belonging to the current partition
sql: SELECT * FROM events WHERE date_trunc('day', event_time) = '{{ .partition.day }}'
# Since ClickHouse can't ingest from Snowflake or vice versa, we use S3 as a temporary staging connector
stage:
    connector: s3
    path: s3://bucket/temp-data
# Produce the final output into ClickHouse, requires a clickhouse.yaml connector defined.
output:
    connector: clickhouse
```

### 2.9 Project YAML

Source: [docs/docs/reference/project-files/rill-yaml.md](https://docs.rilldata.com/reference/project-files/rill-yaml)

> Canonical source: `docs/docs/reference/project-files/rill-yaml.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/rill-yaml>
> Extraction: Original markdown body preserved verbatim after this header.

The `rill.yaml` file contains metadata about your project.

## Properties

### `compiler`

_[string]_ - Specifies the parser version to use for compiling resources 

### `display_name`

_[string]_ - The display name of the project, shown in the upper-left corner of the UI 

### `description`

_[string]_ - A brief description of the project 

### `features`

_[object]_ - Optional feature flags. Can be specified as a map of feature names to booleans. 

### `ai_connector`

_[string]_ - Specifies the default AI connector for the project. Defaults to Rill's internal AI connector if not set. 

### `ai_instructions`

_[string]_ - Extra instructions for LLM/AI features. Used to guide natural language question answering and routing. 

## Configuring the default OLAP Engine

Rill allows you to specify the default OLAP engine to use in your project via `rill.yaml`.
:::info Curious about OLAP Engines?
Please see our reference documentation on [OLAP Engines](/developers/build/connectors/olap).
:::


### `olap_connector`

_[string]_ - Specifies the default OLAP engine for the project. Defaults to duckdb if not set. 

```yaml
olap_connector: clickhouse
```

## Project-wide defaults

In `rill.yaml`, project-wide defaults can be specified for a resource type within a project. Unless otherwise specified, _individual resources will inherit any defaults_ that have been specified in `rill.yaml`. For available properties that can be configured, please refer to the YAML specification for each individual resource type - [model](models.md), [metrics_view](metrics-views.md), and [explore](explore-dashboards.md)

:::note Use plurals when specifying project-wide defaults
In your `rill.yaml`, the top level property for the resource type needs to be **plural**, such as `models`, `metrics_views` and `explores`.
:::

:::info Hierarchy of inheritance and property overrides
As a general rule of thumb, properties that have been specified at a more _granular_ level will supercede or override higher level properties that have been inherited. Therefore, in order of inheritance, Rill will prioritize properties in the following order:
1. Individual [models](models.md)/[metrics_views](metrics-views.md)/[explore](explore-dashboards.md) object level properties (e.g. `models.yaml` or `explore-dashboards.yaml`)
2. [Environment](/developers/build/models/templating) level properties (e.g. a specific property that have been set for `dev`)
3. [Project-wide defaults](#project-wide-defaults) for a specific property and resource type
:::


### `models`

_[object]_ - Defines project-wide default settings for models. Unless overridden, individual models will inherit these defaults. 

### `metrics_views`

_[object]_ - Defines project-wide default settings for metrics_views. Unless overridden, individual metrics_views will inherit these defaults. 

### `explores`

_[object]_ - Defines project-wide default settings for explores. Unless overridden, individual explores will inherit these defaults. 

### `canvases`

_[object]_ - Defines project-wide default settings for canvases. Unless overridden, individual canvases will inherit these defaults. 

```yaml
# For complete examples, see: 
# https://docs.rilldata.com/developers/build/rill-project-file#dashboard-defaults
models:
    refresh:
        cron: '0 * * * *'
metrics_views:
    first_day_of_week: 1
    smallest_time_grain: month
explores:
    defaults:
        time_range: P24M
    time_zones:
        - UTC
    time_ranges:
        - PT24H
        - P6M
canvases:
    defaults:
        time_range: P7D
    time_zones:
        - UTC
    time_ranges:
        - PT24H
        - P7D
```

## Setting variables

Primarily useful for [templating](/developers/build/connectors/templating), variables can be set in the `rill.yaml` file directly. This allows variables to be set for your projects deployed to Rill Cloud while still being able to use different variable values locally if you prefer. 
:::info Overriding variables locally
Variables also follow an order of precedence and can be overridden locally. By default, any variables defined will be inherited from `rill.yaml`. However, if you manually pass in a variable when starting Rill Developer locally via the CLI, this value will be used instead for the current instance of your running project:
```bash
rill start --env numeric_var=100 --env string_var="different_value"
```
:::
:::tip Setting variables through `.env`
Variables can also be set through your project's `<RILL_PROJECT_HOME>/.env` file (or using the `rill env set` CLI command), such as:
```bash
variable=xyz
```
Similar to how [connector credentials can be pushed / pulled](/developers/build/connectors/credentials#pulling-credentials-and-variables-from-a-deployed-project-on-rill-cloud) from local to cloud or vice versa, project variables set locally in Rill Developer can be pushed to Rill Cloud and/or pulled back to your local instance from your deployed project by using the `rill env push` and `rill env pull` commands respectively.
:::


### `env`

_[object]_ - To define a variable in `rill.yaml`, pass in the appropriate key-value pair for the variable under the `env` key 

```yaml
env:
    numeric_var: 10
    string_var: "string_value"
```

## Managing Paths in Rill

The public_paths and ignore_paths properties in the rill.yaml file provide control over which files and directories are processed or exposed by Rill. The public_paths property defines a list of file or directory paths to expose over HTTP. By default, it includes ['./public']. The ignore_paths property specifies a list of files or directories that Rill excludes during ingestion and parsing. This prevents unnecessary or incompatible content from affecting the project.
:::tip
Don't forget the leading `/` when specifying the path for `ignore_paths` and this path is also assuming the relative path from your project root.
:::


### `public_paths`

_[array of string]_ - List of file or directory paths to expose over HTTP. Defaults to ['./public'] 

### `ignore_paths`

_[array of string]_ - A list of file or directory paths to exclude from parsing. Useful for ignoring extraneous or non-Rill files in the project 

```yaml
ignore_paths:
    - /path/to/ignore
    - /file_to_ignore.yaml
```

## Testing access policies

During development, it is always a good idea to check if your [access policies](/developers/build/metrics-view/security) are behaving the way you designed them to before pushing these changes into production. You can set mock users which enables a drop down in the dashboard preview to view as a specific user. 
:::info The View as selector is not visible in my dashboard, why?
This feature is _only_ enabled when you have set a security policy on the dashboard. By default, the dashboard and it's contents is viewable by every user.
:::


### `mock_users`

_[array of object]_ - A list of mock users used to test dashboard security policies within the project 

  - **`email`** - _[string]_ - The email address of the mock user. This field is required _(required)_

  - **`name`** - _[string]_ - The name of the mock user. 

  - **`admin`** - _[boolean]_ - Indicates whether the mock user has administrative privileges 

  - **`groups`** - _[array of string]_ - An array of group names that the mock user is a member of 

```yaml
mock_users:
    - email: john@yourcompany.com
      name: John Doe
      admin: true
    - email: jane@partnercompany.com
      groups:
        - partners
    - email: anon@unknown.com
    - email: embed@rilldata.com
      name: embed
      custom_variable_1: Value_1
      custom_variable_2: Value_2
```

## Common Properties

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment.

### 2.10 Report YAML

Source: [docs/docs/reference/project-files/reports.md](https://docs.rilldata.com/reference/project-files/reports)

> Canonical source: `docs/docs/reference/project-files/reports.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/reports>
> Extraction: Original markdown body preserved verbatim after this header.

Reports allow you to schedule and deliver data exports or AI-powered insights to recipients via email or Slack.


## Properties

### `type`

_[string]_ - Refers to the resource type and must be `report` _(required)_

### `display_name`

_[string]_ - Display name for the report shown in notifications and UI 

### `title`

_[string]_ - Deprecated: use display_name instead 

### `refresh`

_[object]_ - Refresh schedule for the report
```yaml
refresh:
  cron: "0 9 * * *"
```
 

  - **`cron`** - _[string]_ - A cron expression that defines the execution schedule 

  - **`time_zone`** - _[string]_ - Time zone to interpret the schedule in (e.g., 'UTC', 'America/Los_Angeles'). 

  - **`disable`** - _[boolean]_ - If true, disables the resource without deleting it. 

  - **`ref_update`** - _[boolean]_ - If true, allows the resource to run when a dependency updates. 

  - **`run_in_dev`** - _[boolean]_ - If true, allows the schedule to run in development mode. 

### `watermark`

_[string]_ - Specifies how the watermark is determined for incremental processing. Use 'trigger_time' to set it at runtime or 'inherit' to use the upstream model's watermark. 

### `intervals`

_[object]_ - Define the interval of the report to check 

  - **`duration`** - _[string]_ - A valid ISO8601 duration to define the interval duration 

  - **`limit`** - _[integer]_ - Maximum number of intervals to check for on invocation 

  - **`check_unclosed`** - _[boolean]_ - Whether unclosed intervals should be checked 

### `timeout`

_[string]_ - Define the timeout for the report execution (e.g., '5m', '1h') 

### `data`

_[oneOf]_ - Data source for the report using the generic resolver pattern.
Supports ai resolvers only as of now.
 

  - **option 1** - _[object]_ - Executes a raw SQL query against the project's data models.

    - **`sql`** - _[string]_ - Raw SQL query to run against existing models in the project. _(required)_

    - **`connector`** - _[string]_ - specifies the connector to use when running SQL or glob queries. 

  - **option 2** - _[object]_ - Executes a SQL query that targets a defined metrics view.

    - **`metrics_sql`** - _[string]_ - SQL query that targets a metrics view in the project _(required)_

  - **option 3** - _[object]_ - Calls a custom API defined in the project to compute data.

    - **`api`** - _[string]_ - Name of a custom API defined in the project. _(required)_

    - **`args`** - _[object]_ - Arguments to pass to the custom API. 

  - **option 4** - _[object]_ - Uses a file-matching pattern (glob) to query data from a connector.

    - **`glob`** - _[anyOf]_ - Defines the file path or pattern to query from the specified connector. _(required)_

      - **option 1** - _[string]_ - A simple file path/glob pattern as a string.

      - **option 2** - _[object]_ - An object-based configuration for specifying a file path/glob pattern with advanced options.

    - **`connector`** - _[string]_ - Specifies the connector to use with the glob input. 

  - **option 5** - _[object]_ - Uses the status of a resource as data.

    - **`resource_status`** - _[object]_ - Based on resource status _(required)_

      - **`where_error`** - _[boolean]_ - Indicates whether the condition should trigger when the resource is in an error state. 

  - **option 6** - _[object]_ - Uses AI to generate insights and analysis from metrics data. Only available for reports.

    - **`ai`** - _[object]_ - AI resolver configuration for generating automated insights _(required)_

      - **`prompt`** - _[string]_ - Custom prompt to guide the AI analysis. If not provided, a default analysis prompt is used. 

      - **`time_range`** - _[object]_ - Time range for the analysis period 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration (e.g., P7D for 7 days, P1M for 1 month) 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset from current time (e.g., P1D to start from yesterday) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression (e.g., 'last 7 days', 'this month') 

      - **`comparison_time_range`** - _[object]_ - Optional comparison time range for period-over-period analysis 

        - **`iso_duration`** - _[string]_ - ISO 8601 duration for comparison period 

        - **`iso_offset`** - _[string]_ - ISO 8601 offset for comparison period (e.g., P7D to compare with previous week) 

        - **`start`** - _[string]_ - Start timestamp in ISO 8601 format 

        - **`end`** - _[string]_ - End timestamp in ISO 8601 format 

        - **`expression`** - _[string]_ - Rill time expression for comparison period 

      - **`context`** - _[object]_ - Context to constrain the AI analysis 

        - **`explore`** - _[string]_ - Name of the explore dashboard to analyze 

        - **`dimensions`** - _[array of string]_ - List of dimensions to include in analysis 

        - **`measures`** - _[array of string]_ - List of measures to include in analysis 

### `query`

_[object]_ - Legacy query-based report configuration 

  - **`name`** - _[string]_ - Name of the query to execute (e.g., MetricsViewAggregation) 

  - **`args`** - _[object]_ - Arguments to pass to the query 

  - **`args_json`** - _[string]_ - Query arguments as a JSON string (alternative to args) 

### `export`

_[object]_ - Export configuration for query-based reports 

  - **`format`** - _[string]_ - Export file format 

  - **`include_header`** - _[boolean]_ - Include column headers in the export 

  - **`limit`** - _[integer]_ - Maximum number of rows to export 

### `notify`

_[object]_ - Notification configuration for email and Slack delivery 

  - **`email`** - _[object]_ - Send notifications via email. 

    - **`recipients`** - _[array of string]_ - An array of email addresses to notify. _(required)_

  - **`slack`** - _[object]_ - Send notifications via Slack. 

    - **`users`** - _[array of string]_ - An array of Slack user IDs to notify. 

    - **`channels`** - _[array of string]_ - An array of Slack channel names to notify. 

    - **`webhooks`** - _[array of string]_ - An array of Slack webhook URLs to send notifications to. 

### `annotations`

_[object]_ - Key-value pairs for report metadata (e.g., admin_owner_user_id for AI reports) 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Examples

```yaml
# Example: query-based report with CSV export
type: report
display_name: Weekly Sales Report
refresh:
    cron: "0 9 * * 1"
data:
    metrics:
        metrics_view: sales_metrics
        dimensions:
            - name: region
        measures:
            - name: total_sales
        time_range:
            expression: "7D as of latest/D"
export:
    format: csv
    limit: 1000
notify:
    email:
        recipients:
            - sales@example.com
annotations:
    admin_owner_user_id: user-123
    web_open_mode: recipient # report will use recipient's permission to run the query
```

```yaml
# Example: AI-powered insight report
type: report
display_name: Daily AI Insights
refresh:
    cron: "0 8 * * *"
data:
    ai:
        prompt: "Analyze key metrics and identify significant changes"
        time_range:
            expression: "1D as of latest/D"
        comparison_time_range:
            expression: "1D as of latest/D offset -1D"
        context:
            explore: my_explore
notify:
    email:
        recipients:
            - team@example.com
annotations:
    admin_owner_user_id: user-123 # report will be run with this user permission
```

### 2.11 Source YAML

Source: [docs/docs/reference/project-files/sources.md](https://docs.rilldata.com/reference/project-files/sources)

> Canonical source: `docs/docs/reference/project-files/sources.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/sources>
> Extraction: Original markdown body preserved verbatim after this header.

:::warning Deprecated Feature
**Sources have been deprecated** and are now considered "source models." While sources remain backward compatible, we recommend migrating to the new source model format for access to the latest features and improvements.

**Next steps:**
- Continue using sources if needed (backward compatible)
- Migrate to source models via the `type:model` parameter for existing projects
- See our [model YAML reference](models) for current documentation and best practices
:::


## Properties

### `type`

_[string]_ - Refers to the resource type and must be `connector` _(required)_

### `connector`

_[string]_ - Refers to the connector type for the source, see [connectors](/reference/project-files/connectors) for more information _(required)_

### `uri`

_[string]_ - Refers to the URI of the remote connector you are using for the source. Rill also supports glob patterns as part of the URI for S3 and GCS (required for type: http, s3, gcs).

- `s3://your-org/bucket/file.parquet` — the s3 URI of your file
- `gs://your-org/bucket/file.parquet` — the gsutil URI of your file
- `https://data.example.org/path/to/file.parquet` — the web address of your file
 

### `path`

_[string]_ - Refers to the local path of the connector you are using for the source 

### `sql`

_[string]_ - Sets the SQL query to extract data from a SQL source 

### `region`

_[string]_ - Sets the cloud region of the S3 bucket or Athena 

### `endpoint`

_[string]_ - Overrides the S3 endpoint to connect to 

### `output_location`

_[string]_ - Sets the query output location and result files in Athena 

### `workgroup`

_[string]_ - Sets a workgroup for Athena connector 

### `project_id`

_[string]_ - Sets a project id to be used to run BigQuery jobs 

### `timeout`

_[string]_ - The maximum time to wait for source ingestion 

### `refresh`

_[object]_ - Specifies the refresh schedule that Rill should follow to re-ingest and update the underlying source data (optional).
```yaml
refresh:
  cron: "* * * * *"
  every: "24h"
```
 

  - **`cron`** - _[string]_ - A cron schedule expression, which should be encapsulated in single quotes, e.g. `* * * * *` 

  - **`every`** - _[string]_ - A Go duration string, such as `24h` 

### `db`

_[string]_ - Sets the database for motherduck connections and/or the path to the DuckDB/SQLite db file 

### `database_url`

_[string]_ - Postgres connection string that should be used 

### `duckdb`

_[object]_ - Specifies the raw parameters to inject into the DuckDB read_csv, read_json or read_parquet statement 

### `dsn`

_[string]_ - Used to set the Snowflake connection string 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment.

### 2.12 Theme YAML

Source: [docs/docs/reference/project-files/themes.md](https://docs.rilldata.com/reference/project-files/themes)

> Canonical source: `docs/docs/reference/project-files/themes.md`
> Source URL: <https://docs.rilldata.com/reference/project-files/themes>
> Extraction: Original markdown body preserved verbatim after this header.

In your Rill project directory, create a `<theme_name>.yaml` file in any directory containing `type: theme`. Rill will automatically ingest the theme next time you run `rill start` or deploy to Rill Cloud.

To apply that theme to a dashboard, add `default_theme: <name of theme>` to the yaml file for that dashboard. Alternatively, you can add this to the end of the URL in your browser: `?theme=<name of theme>`


## Properties

### `type`

_[string]_ - Refers to the resource type and must be `theme` _(required)_

### `colors`

_[object]_ - Color palette for the theme 

  - **`primary`** - _[string]_ - Primary color 

  - **`secondary`** - _[string]_ - Secondary color 

### `light`

_[object]_ - Light theme color configuration 

  - **`primary`** - _[string]_ - Primary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

  - **`secondary`** - _[string]_ - Secondary color for light theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

  - **`variables`** - _[object]_ - Custom CSS variables for light theme 

### `dark`

_[object]_ - Dark theme color configuration 

  - **`primary`** - _[string]_ - Primary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

  - **`secondary`** - _[string]_ - Secondary color for dark theme. Can have any hex, [named colors](https://www.w3.org/TR/css-color-4/#named-colors) or hsl() formats. 

  - **`variables`** - _[object]_ - Custom CSS variables for dark theme 

## Common Properties

### `name`

_[string]_ - Name is usually inferred from the filename, but can be specified manually. 

### `refs`

_[array of string]_ - List of resource references 

### `dev`

_[object]_ - Overrides any properties in development environment. 

### `prod`

_[object]_ - Overrides any properties in production environment. 

## Examples

```yaml
# Example: Basic theme with light and dark mode colors
type: theme
light:
    primary: "#4F46E5" # Indigo-600
    secondary: "#8B5CF6" # Purple-500
dark:
    primary: "#818CF8" # Indigo-400
    secondary: "#A78BFA" # Purple-400
```

```yaml
# Example: Advanced theme with custom color palettes
type: theme
light:
    primary: "#14B8A6" # Teal
    secondary: "#10B981" # Emerald
    color-sequential-1: "hsl(180deg 80% 95%)"
    color-sequential-5: "hsl(180deg 80% 50%)"
    color-sequential-9: "hsl(180deg 80% 25%)"
    color-qualitative-1: "hsl(156deg 56% 52%)"
    color-qualitative-2: "hsl(27deg 100% 65%)"
dark:
    primary: "2DD4BF"
    secondary: "34D399"
    color-sequential-1: "hsl(180deg 40% 30%)"
    color-sequential-5: "hsl(180deg 50% 50%)"
    color-sequential-9: "hsl(180deg 60% 70%)"
```

### 2.13 YAML Syntax

Source: [docs/docs/reference/project-files/index.md](https://docs.rilldata.com/reference/project-files)

> Canonical source: `docs/docs/reference/project-files/index.md`
> Source URL: <https://docs.rilldata.com/reference/project-files>
> Extraction: Original markdown body preserved verbatim after this header.

## Overview

When you create models and dashboards, these objects are represented as object files on the file system. You can find these files in your `models` and `dashboards` folders in your project by default. 

:::info Working with resources outside their native folders

It is possible to define resources (such as [models](models.md), [metrics-views](metrics-views.md), [dashboards](explore-dashboards.md), [custom APIs](apis.md), or [themes](themes.md)) within <u>any</u> nested folder within your Rill project directory. However, for any YAML configuration file, it is then imperative that the `type` property is then appropriately defined within the underlying resource configuration or Rill will not able to resolve the resource type correctly!

:::

Projects can simply be rehydrated from Rill project files into an explorable data application as long as there is sufficient access and credentials to the source data - figuring out the dependencies, pulling down data, & validating your model queries and metrics view configurations. The result is a set of functioning exploratory dashboards.

You can see a few different example projects by visiting our [example github repository](https://github.com/rilldata/rill-examples).

:::tip

For more information about using Git or cloning projects locally, please see our page on [GitHub Basics](/developers/deploy/deploy-dashboard/github-101).

:::


## Project files types


- [Connector YAML](connectors.md)
- [Source YAML](sources.md)
- [Models YAML](models.md)
- [Metrics View YAML](metrics-views.md)
- [Canvas Dashboard YAML](canvas-dashboards.md)
- [Explore Dashboard YAML](explore-dashboards.md)
- [Alert YAML](alerts.md)
- [Report YAML](reports.md)
- [API YAML](apis.md)
- [Theme YAML](themes.md)
- [Component YAML](component.md)
- [Project YAML](rill-yaml.md)

---

## References

1. [https://docs.rilldata.com/reference/project-files](https://docs.rilldata.com/reference/project-files)
2. [https://github.com/rilldata/rill/tree/main/runtime/ai/instructions/data](https://github.com/rilldata/rill/tree/main/runtime/ai/instructions/data)
3. [https://github.com/rilldata/rill/tree/main/docs/docs/reference/project-files](https://github.com/rilldata/rill/tree/main/docs/docs/reference/project-files)

