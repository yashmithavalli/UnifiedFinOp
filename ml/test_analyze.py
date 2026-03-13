import requests

r = requests.post('http://localhost:5001/analyze', files={'file': open('ml/test_custom.csv', 'rb')})
d = r.json()
print('Success:', d.get('success'))
print()

fi = d.get('file_info', {})
print('File Info:')
print(f"  Rows: {fi.get('rows')}, Columns: {fi.get('columns')}")
print(f"  Numeric: {fi.get('numeric_columns')}")
print(f"  Categorical: {fi.get('categorical_columns')}")
print(f"  Group By: {fi.get('group_by')}")
print()

s = d.get('summary', {})
print(f"Summary: {s.get('total_anomalies')} anomalies ({s.get('critical')} critical, {s.get('warnings')} warnings)")
print()

for a in d.get('anomalies', []):
    print(f"  [{a['severity'].upper()}] {a['group']} / {a['column']}: {a['deviation']}% deviation ({a['method']})")

print()
print(f"Insights: {len(d.get('insights', []))} generated")
for ins in d.get('insights', []):
    print(f"  - {ins['title']}")
