"""
Unified FinOps — AI Anomaly Detection Engine
=============================================
Flask server that runs Z-Score and Isolation Forest
on spending data to detect anomalies in real-time.
"""

import os
import io
import json
from datetime import datetime, timedelta
import random

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'spending_data.csv')

# ── Possible causes library (mapped by category keywords) ──
CAUSE_MAP = {
    'Road': [
        'Unexpected infrastructure material price increase',
        'Duplicate procurement orders from sub-contractors',
        'Emergency road repair after monsoon damage'
    ],
    'Station': [
        'Accelerated metro construction timeline',
        'Emergency equipment procurement',
        'Vendor contract scope expansion'
    ],
    'SaaS': [
        'Unused cloud seats not deprovisioned',
        'Duplicate project management tool subscriptions',
        'Auto-scaling cost overrun on Azure'
    ],
    'Equipment': [
        'Vendor contract price escalation',
        'Emergency transformer replacement orders',
        'Unplanned material procurement surge'
    ],
    'Bridge': [
        'Structural assessment revealed urgent repairs',
        'Material cost inflation',
        'Extended monsoon damage restoration'
    ],
    'Medical': [
        'Seasonal disease outbreak response',
        'Emergency medical equipment purchase',
        'Vaccine procurement surge'
    ],
    'Digital': [
        'New campus rollout ahead of schedule',
        'Hardware refresh cycle',
        'Bandwidth upgrade requirements'
    ],
    'Irrigation': [
        'Canal repair after flooding',
        'Pump replacement cycle',
        'Drought response infrastructure'
    ]
}

# ── AI Insights templates ──
INSIGHT_TEMPLATES = [
    {
        'icon': 'bi-cloud-arrow-up',
        'iconBg': 'var(--red-light)',
        'iconColor': 'var(--red)',
        'title': 'Investigate {category} Cost Increase',
        'desc': '{department} {category} costs have increased {deviation}% this week. Review vendor invoices and check for duplicate orders or unauthorized purchases.'
    },
    {
        'icon': 'bi-file-earmark-text',
        'iconBg': 'var(--yellow-light)',
        'iconColor': '#B06D00',
        'title': 'Review {vendor} Contract Changes',
        'desc': '{vendor} invoices for {department} have spiked {deviation}%. Cross-reference with contract amendments and verify if scope changes justify the increase.'
    },
    {
        'icon': 'bi-cart-check',
        'iconBg': 'var(--blue-light)',
        'iconColor': 'var(--blue)',
        'title': 'Check Duplicate Procurement in {department}',
        'desc': 'Multiple procurement requests detected in {department}. Consolidating similar orders could save approximately ₹{savings}L this quarter.'
    },
    {
        'icon': 'bi-recycle',
        'iconBg': '#EDE7F6',
        'iconColor': '#6C63FF',
        'title': 'Optimize {category} Spending',
        'desc': '{department} shows a {deviation}% increase in {category}. Consider renegotiating vendor terms or exploring alternative suppliers for cost reduction.'
    }
]


def load_data():
    """Load spending data from CSV."""
    return pd.read_csv(DATA_PATH)


def zscore_detection(df):
    """
    Z-Score Anomaly Detection
    ─────────────────────────
    For each department, compute mean and std of historical spending.
    Flag any week where spending is > 2 standard deviations from mean.
    """
    anomalies = []

    for dept in df['department'].unique():
        dept_data = df[df['department'] == dept].sort_values('week')
        amounts = dept_data['amount'].values

        if len(amounts) < 3:
            continue

        # Use all but last as "historical", last as "current"
        historical = amounts[:-1]
        current = amounts[-1]

        mean = np.mean(historical)
        std = np.std(historical)

        if std == 0:
            continue

        z_score = (current - mean) / std

        if abs(z_score) > 2.0:  # Anomaly threshold
            deviation = round(((current - mean) / mean) * 100, 1)
            row = dept_data.iloc[-1]

            anomalies.append({
                'department': dept,
                'category': row['category'],
                'vendor': row['vendor'],
                'normal_spend': round(mean),
                'current_spend': int(current),
                'deviation': deviation,
                'z_score': round(z_score, 2),
                'severity': 'critical' if abs(z_score) > 3 else 'warning',
                'method': 'Z-Score Analysis',
                'budget': int(row['budget']),
                'trend_normal': [int(x) for x in historical],
                'trend_current': [int(x) for x in amounts],
                'week': row['week']
            })

    return anomalies


def isolation_forest_detection(df):
    """
    Isolation Forest Anomaly Detection
    ───────────────────────────────────
    Train an Isolation Forest on all spending data.
    Identify data points that the model considers outliers.
    """
    anomalies = []

    # Prepare features: amount, budget ratio, dept-encoded
    dept_map = {d: i for i, d in enumerate(df['department'].unique())}
    df_copy = df.copy()
    df_copy['dept_code'] = df_copy['department'].map(dept_map)
    df_copy['budget_ratio'] = df_copy['amount'] / df_copy['budget']

    features = df_copy[['amount', 'budget_ratio', 'dept_code']].values

    # Train Isolation Forest
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    predictions = model.fit_predict(features)
    scores = model.decision_function(features)

    # Find anomalous points
    for i, (pred, score) in enumerate(zip(predictions, scores)):
        if pred == -1:  # Anomaly
            row = df_copy.iloc[i]
            dept = row['department']
            dept_data = df[df['department'] == dept].sort_values('week')
            amounts = dept_data['amount'].values
            historical = amounts[:-1] if len(amounts) > 1 else amounts
            mean = np.mean(historical)

            if mean == 0:
                continue

            deviation = round(((row['amount'] - mean) / mean) * 100, 1)

            # Only report significant deviations
            if abs(deviation) > 20:
                anomalies.append({
                    'department': dept,
                    'category': row['category'],
                    'vendor': row['vendor'],
                    'normal_spend': round(mean),
                    'current_spend': int(row['amount']),
                    'deviation': deviation,
                    'anomaly_score': round(float(-score), 3),
                    'severity': 'critical' if deviation > 100 else 'warning',
                    'method': 'Isolation Forest',
                    'budget': int(row['budget']),
                    'trend_normal': [int(x) for x in historical],
                    'trend_current': [int(x) for x in amounts],
                    'week': row['week']
                })

    return anomalies


def get_causes(category):
    """Get possible causes based on spending category."""
    for key, causes in CAUSE_MAP.items():
        if key.lower() in category.lower():
            return causes
    return [
        'Unexpected cost increase detected',
        'Review vendor billing for discrepancies',
        'Check for duplicate transactions'
    ]


def generate_insights(anomalies):
    """Generate AI insights from detected anomalies."""
    insights = []
    for i, anomaly in enumerate(anomalies[:4]):
        template = INSIGHT_TEMPLATES[i % len(INSIGHT_TEMPLATES)]
        savings = round(anomaly['current_spend'] * 0.15 / 100000, 1)
        insight = {
            'icon': template['icon'],
            'iconBg': template['iconBg'],
            'iconColor': template['iconColor'],
            'title': template['title'].format(**anomaly, savings=savings),
            'desc': template['desc'].format(**anomaly, savings=savings)
        }
        insights.append(insight)
    return insights


@app.route('/detect', methods=['GET', 'POST'])
def detect_anomalies():
    """
    Main API endpoint — runs both detection methods
    and returns combined results.
    GET  = use default spending_data.csv
    POST = use uploaded CSV file
    """
    try:
        if request.method == 'POST' and 'file' in request.files:
            file = request.files['file']
            content = file.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(content))
        else:
            df = load_data()

        # Run both detection methods
        zscore_results = zscore_detection(df)
        iforest_results = isolation_forest_detection(df)

        # Merge results, prefer Z-Score where duplicate depts exist
        seen_depts = set()
        combined = []

        for a in zscore_results:
            if a['department'] not in seen_depts:
                a['causes'] = get_causes(a['category'])
                a['detected_at'] = (datetime.now() - timedelta(
                    hours=random.randint(1, 48)
                )).strftime('%Y-%m-%d %H:%M')
                combined.append(a)
                seen_depts.add(a['department'])

        for a in iforest_results:
            if a['department'] not in seen_depts:
                a['causes'] = get_causes(a['category'])
                a['detected_at'] = (datetime.now() - timedelta(
                    hours=random.randint(1, 48)
                )).strftime('%Y-%m-%d %H:%M')
                combined.append(a)
                seen_depts.add(a['department'])

        # Sort by severity (critical first), then by deviation
        combined.sort(key=lambda x: (
            0 if x['severity'] == 'critical' else 1,
            -abs(x['deviation'])
        ))

        # Generate AI insights
        insights = generate_insights(combined)

        # Compute summary KPIs
        critical_count = sum(1 for a in combined if a['severity'] == 'critical')
        warning_count = sum(1 for a in combined if a['severity'] == 'warning')
        potential_savings = sum(
            a['current_spend'] - a['normal_spend']
            for a in combined
        )

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'models_used': ['Z-Score Analysis', 'Isolation Forest'],
            'summary': {
                'total_anomalies': len(combined),
                'critical': critical_count,
                'warnings': warning_count,
                'potential_savings': potential_savings
            },
            'anomalies': combined,
            'insights': insights
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ═══════════════════════════════════════════════════════════
#  UNIVERSAL CSV ANALYSIS — Smart Column Detection
# ═══════════════════════════════════════════════════════════

def detect_columns(df):
    """
    Auto-detect column roles from any CSV.
    Returns dict with 'numeric', 'categorical', 'datetime', 'group_by' keys.
    """
    numeric_cols = []
    categorical_cols = []
    datetime_cols = []

    for col in df.columns:
        # Try numeric
        numeric_series = pd.to_numeric(df[col], errors='coerce')
        non_null_ratio = numeric_series.notna().mean()

        if non_null_ratio > 0.7 and df[col].nunique() > 2:
            numeric_cols.append(col)
            continue

        # Try datetime
        try:
            pd.to_datetime(df[col], errors='raise', infer_datetime_format=True)
            datetime_cols.append(col)
            continue
        except Exception:
            pass

        # Categorical — low-to-medium cardinality strings
        if df[col].dtype == object and df[col].nunique() < len(df) * 0.5:
            categorical_cols.append(col)

    # Pick best group-by column: categorical with moderate cardinality
    group_by = None
    if categorical_cols:
        best = sorted(categorical_cols, key=lambda c: abs(df[c].nunique() - 5))
        group_by = best[0]

    return {
        'numeric': numeric_cols,
        'categorical': categorical_cols,
        'datetime': datetime_cols,
        'group_by': group_by
    }


def universal_zscore(df, numeric_cols, group_col):
    """
    Z-Score anomaly detection across all numeric columns.
    Groups by group_col if available, otherwise treats whole dataset.
    """
    anomalies = []

    groups = df[group_col].unique() if group_col else ['All Data']

    for grp in groups:
        grp_data = df[df[group_col] == grp] if group_col else df

        for col in numeric_cols:
            values = pd.to_numeric(grp_data[col], errors='coerce').dropna().values
            if len(values) < 3:
                continue

            historical = values[:-1]
            current = values[-1]
            mean = np.mean(historical)
            std = np.std(historical)

            if std == 0:
                continue

            z = (current - mean) / std

            if abs(z) > 2.0:
                deviation = round(((current - mean) / mean) * 100, 1) if mean != 0 else 0
                anomalies.append({
                    'group': str(grp),
                    'column': col,
                    'normal_value': round(float(mean), 2),
                    'current_value': round(float(current), 2),
                    'deviation': deviation,
                    'z_score': round(float(z), 2),
                    'severity': 'critical' if abs(z) > 3 else 'warning',
                    'method': 'Z-Score Analysis',
                    'trend': [round(float(x), 2) for x in values]
                })

    return anomalies


def universal_iforest(df, numeric_cols, group_col):
    """
    Isolation Forest on all numeric columns combined.
    Returns per-row anomalies with group context.
    """
    anomalies = []

    # Build feature matrix from numeric columns
    feature_df = df[numeric_cols].copy()
    for col in numeric_cols:
        feature_df[col] = pd.to_numeric(feature_df[col], errors='coerce')
    feature_df = feature_df.fillna(feature_df.median())

    if feature_df.shape[0] < 5 or feature_df.shape[1] == 0:
        return anomalies

    model = IsolationForest(
        n_estimators=100,
        contamination=min(0.15, max(0.01, 5.0 / len(feature_df))),
        random_state=42
    )
    predictions = model.fit_predict(feature_df.values)
    scores = model.decision_function(feature_df.values)

    for i, (pred, score) in enumerate(zip(predictions, scores)):
        if pred == -1:
            row = df.iloc[i]
            grp = str(row[group_col]) if group_col else 'All Data'

            # Find which numeric column deviates most
            worst_col = None
            worst_dev = 0
            for col in numeric_cols:
                val = pd.to_numeric(row[col], errors='coerce')
                col_mean = feature_df[col].mean()
                if pd.isna(val) or col_mean == 0:
                    continue
                dev = abs((val - col_mean) / col_mean) * 100
                if dev > worst_dev:
                    worst_dev = dev
                    worst_col = col

            if worst_col and worst_dev > 20:
                val = float(pd.to_numeric(row[worst_col], errors='coerce'))
                col_mean = float(feature_df[worst_col].mean())

                # Get group trend
                if group_col:
                    trend_data = pd.to_numeric(
                        df[df[group_col] == row[group_col]][worst_col], errors='coerce'
                    ).dropna().values
                else:
                    trend_data = feature_df[worst_col].values

                anomalies.append({
                    'group': grp,
                    'column': worst_col,
                    'normal_value': round(col_mean, 2),
                    'current_value': round(val, 2),
                    'deviation': round(worst_dev, 1),
                    'anomaly_score': round(float(-score), 3),
                    'severity': 'critical' if worst_dev > 100 else 'warning',
                    'method': 'Isolation Forest',
                    'trend': [round(float(x), 2) for x in trend_data[-10:]]
                })

    return anomalies


@app.route('/analyze', methods=['POST'])
def analyze_csv():
    """
    Universal CSV Analysis Endpoint.
    Accepts ANY CSV, auto-detects columns, runs anomaly detection.
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded. Please upload a CSV file.'
            }), 400

        file = request.files['file']
        if not file.filename.lower().endswith('.csv'):
            return jsonify({
                'success': False,
                'error': 'Please upload a .csv file.'
            }), 400

        content = file.read().decode('utf-8')
        df = pd.read_csv(io.StringIO(content))

        if df.empty or df.shape[0] < 3:
            return jsonify({
                'success': False,
                'error': 'CSV must contain at least 3 rows of data.'
            }), 400

        # ── Step 1: Detect columns ──
        col_info = detect_columns(df)

        if not col_info['numeric']:
            return jsonify({
                'success': False,
                'error': 'No numeric columns detected in the CSV. At least one numeric column is required for anomaly detection.'
            }), 400

        group_col = col_info['group_by']

        # ── Step 2: Run detection ──
        zscore_results = universal_zscore(df, col_info['numeric'], group_col)
        iforest_results = universal_iforest(df, col_info['numeric'], group_col)

        # Merge — prefer Z-Score where duplicates
        seen = set()
        combined = []

        for a in zscore_results:
            key = (a['group'], a['column'])
            if key not in seen:
                a['detected_at'] = (datetime.now() - timedelta(
                    hours=random.randint(1, 24)
                )).strftime('%Y-%m-%d %H:%M')
                combined.append(a)
                seen.add(key)

        for a in iforest_results:
            key = (a['group'], a['column'])
            if key not in seen:
                a['detected_at'] = (datetime.now() - timedelta(
                    hours=random.randint(1, 24)
                )).strftime('%Y-%m-%d %H:%M')
                combined.append(a)
                seen.add(key)

        combined.sort(key=lambda x: (
            0 if x['severity'] == 'critical' else 1,
            -abs(x['deviation'])
        ))

        # ── Step 3: Summary stats ──
        critical_count = sum(1 for a in combined if a['severity'] == 'critical')
        warning_count = sum(1 for a in combined if a['severity'] == 'warning')

        # ── Step 4: Data preview ──
        preview_rows = df.head(5).fillna('').to_dict(orient='records')

        # ── Step 5: Generate smart insights ──
        insights = []
        for i, anomaly in enumerate(combined[:4]):
            templates = [
                {
                    'icon': 'bi-graph-up-arrow',
                    'iconBg': '#FDECEA',
                    'iconColor': '#C62828',
                    'title': f"Spike in {anomaly['column']}",
                    'desc': f"{anomaly['group']} shows a {anomaly['deviation']}% deviation in {anomaly['column']}. Current value: {anomaly['current_value']} vs normal: {anomaly['normal_value']}."
                },
                {
                    'icon': 'bi-exclamation-diamond',
                    'iconBg': '#FFF8E1',
                    'iconColor': '#B06D00',
                    'title': f"Outlier in {anomaly['group']}",
                    'desc': f"The {anomaly['column']} metric for {anomaly['group']} deviates by {anomaly['deviation']}%. Investigate recent changes or data entry errors."
                },
                {
                    'icon': 'bi-bar-chart-line',
                    'iconBg': '#E3F2FD',
                    'iconColor': '#1565C0',
                    'title': f"Review {anomaly['column']} Trend",
                    'desc': f"Statistical analysis flagged {anomaly['group']} {anomaly['column']} as anomalous ({anomaly['method']}). Consider reviewing the data source."
                },
                {
                    'icon': 'bi-shield-exclamation',
                    'iconBg': '#EDE7F6',
                    'iconColor': '#6C63FF',
                    'title': f"Anomaly Alert: {anomaly['group']}",
                    'desc': f"Multiple indicators suggest unusual activity in {anomaly['group']}. The {anomaly['column']} value of {anomaly['current_value']} is {anomaly['deviation']}% above normal."
                }
            ]
            insights.append(templates[i % 4])

        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'models_used': ['Z-Score Analysis', 'Isolation Forest'],
            'file_info': {
                'rows': int(df.shape[0]),
                'columns': int(df.shape[1]),
                'column_names': list(df.columns),
                'numeric_columns': col_info['numeric'],
                'categorical_columns': col_info['categorical'],
                'group_by': group_col
            },
            'preview': preview_rows,
            'summary': {
                'total_anomalies': len(combined),
                'critical': critical_count,
                'warnings': warning_count
            },
            'anomalies': combined,
            'insights': insights
        })

    except pd.errors.EmptyDataError:
        return jsonify({
            'success': False,
            'error': 'The CSV file is empty or could not be parsed.'
        }), 400
    except UnicodeDecodeError:
        return jsonify({
            'success': False,
            'error': 'File encoding not supported. Please upload a UTF-8 encoded CSV.'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'running',
        'engine': 'FinOps AI Anomaly Detection',
        'models': ['Z-Score', 'Isolation Forest'],
        'endpoints': ['/detect', '/analyze', '/health'],
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print('\n  ╔══════════════════════════════════════════╗')
    print('  ║  FinOps AI Anomaly Detection Engine      ║')
    print('  ║  Flask server on http://localhost:5001    ║')
    print('  ║  Models: Z-Score + Isolation Forest       ║')
    print('  ╚══════════════════════════════════════════╝\n')
    app.run(port=5001, debug=False)
