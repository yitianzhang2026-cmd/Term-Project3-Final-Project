from datetime import date, timedelta


def summarize_contract(contract_text):
    text = (contract_text or '').lower()
    points = []
    if 'renewal' in text:
        points.append('renewal obligations')
    if 'termination' in text:
        points.append('notice and termination provisions')
    if 'indemnity' in text:
        points.append('indemnity exposure')
    if 'data' in text:
        points.append('data handling obligations')
    if not points:
        points.append('core service obligations')

    topic_summary = ', '.join(points[:3])
    return (
        f'This contract highlights {topic_summary} and presents a practical basis for ongoing risk monitoring. '
        'The system flags renewal timing, liability exposure, and governance requirements for proactive follow-up.'
    )


def calculate_risk_score(contract_text, metadata=None):
    text = (contract_text or '').lower()
    base_score = 25

    if metadata and metadata.get('category', '').lower() in {'vendor', 'service'}:
        base_score += 10
    if 'termination' in text:
        base_score += 12
    if 'indemnity' in text:
        base_score += 12
    if 'renewal' in text:
        base_score += 8
    if 'data' in text:
        base_score += 8
    if 'penalty' in text:
        base_score += 10

    score = min(max(base_score, 10), 95)
    if score >= 75:
        level = 'High'
    elif score >= 45:
        level = 'Medium'
    else:
        level = 'Low'

    return {'risk_score': score, 'risk_level': level}


def extract_deadlines(contract_text):
    text = (contract_text or '').lower()
    today = date.today()
    deadlines = [
        {
            'title': 'Contract Renewal Review',
            'due_date': (today + timedelta(days=90)).isoformat(),
            'status': 'Pending',
        },
        {
            'title': 'Termination Notice Check',
            'due_date': (today + timedelta(days=60)).isoformat(),
            'status': 'Pending',
        },
    ]

    if 'renewal' in text:
        deadlines[0]['status'] = 'Priority'
    if 'termination' in text:
        deadlines[1]['status'] = 'Priority'

    return deadlines


def find_risky_clauses(contract_text):
    text = (contract_text or '').lower()
    risks = [
        {
            'risk_type': 'Limited Liability',
            'severity': 'Medium',
            'description': 'The liability cap is low relative to contract value and may not protect the business in case of breach.',
        },
        {
            'risk_type': 'Automatic Renewal',
            'severity': 'High',
            'description': 'Automatic renewal terms could lead to missed renewal actions if not tracked carefully.',
        },
    ]

    if 'indemnity' in text:
        risks.append({
            'risk_type': 'Broad Indemnity',
            'severity': 'High',
            'description': 'Indemnity language could increase exposure if claims or service failures occur.',
        })

    return risks
