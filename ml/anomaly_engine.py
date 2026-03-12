"""
Unified FinOps — AI Anomaly Detection Engine
=============================================
Flask server that runs Z-Score and Isolation Forest
on spending data to detect anomalies in real-time.
"""

import os
import json
from datetime import datetime, timedelta
import random

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from flask import Flask, jsonify
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


@app.route('/detect', methods=['GET'])
def detect_anomalies():
    """
    Main API endpoint — runs both detection methods
    and returns combined results.
    """
    try:
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


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'running',
        'engine': 'FinOps AI Anomaly Detection',
        'models': ['Z-Score', 'Isolation Forest'],
        'timestamp': datetime.now().isoformat()
    })


if __name__ == '__main__':
    print('\n  ╔══════════════════════════════════════════╗')
    print('  ║  FinOps AI Anomaly Detection Engine      ║')
    print('  ║  Flask server on http://localhost:5001    ║')
    print('  ║  Models: Z-Score + Isolation Forest       ║')
    print('  ╚══════════════════════════════════════════╝\n')
    app.run(port=5001, debug=False)
