"""
暖学帮 API 网关服务
端口: 8000
职责: 统一API入口，路由到各微服务
"""
import os
import time
import json
import random
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)

RAG_AGENT_URL = os.getenv("RAG_AGENT_URL", "http://localhost:5177")

mock_database = {
    "students": {},
    "parents": {},
    "checkins": {},
    "psych_tests": {},
    "psych_status": {}
}

def generate_code():
    return str(random.randint(100000, 999999))

def get_current_user():
    return request.headers.get("X-User-ID", "student_001")

def format_response(data):
    return {"success": True, **data}

def format_error(message, code=400):
    return jsonify({"success": False, "error": message}), code

@app.route("/api/auth/send-code", methods=["POST"])
def send_code():
    data = request.get_json()
    phone = data.get("phone")
    if not phone:
        return format_error("手机号不能为空")

    code = generate_code()
    print(f"[验证码] {phone}: {code}")

    return jsonify({"success": True, "message": "验证码已发送", "code": code})

@app.route("/api/auth/login/phone", methods=["POST"])
def login_by_phone():
    data = request.get_json()
    phone = data.get("phone")
    code = data.get("code")
    role = data.get("role", "student")

    if not phone or not code:
        return format_error("手机号和验证码必填")

    user_id = f"{role}_{phone[-4:]}"
    name = f"用户{phone[-4:]}"

    mock_database["students"][user_id] = {
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "role": role
    }

    return jsonify({
        "success": True,
        "data": {
            "user_id": user_id,
            "name": name,
            "phone": phone,
            "role": role,
            "token": f"token_{user_id}_{int(time.time())}"
        }
    })

@app.route("/api/student/chat", methods=["POST"])
def student_chat():
    data = request.get_json()
    user_id = data.get("user_id", get_current_user())
    message = data.get("message", "")

    if not message:
        return format_error("消息内容不能为空")

    try:
        import requests
        resp = requests.post(
            f"{RAG_AGENT_URL}/api/chat",
            json={"query": message, "use_hybrid": True},
            timeout=30
        )
        if resp.status_code == 200:
            result = resp.json()
            return jsonify({
                "success": True,
                "response": result.get("answer", "抱歉，我现在无法回答这个问题。"),
                "ai_name": "暖暖"
            })
    except Exception as e:
        print(f"[聊天] 调用RAG服务失败: {e}")

    ai_responses = [
        "我理解你的感受。每个人都会有压力大的时候，这很正常。",
        "听起来你遇到了困难。让我们一起想办法解决好吗？",
        "你很棒！继续保持积极的心态，一切都会好起来的。",
        "学习固然重要，但也要注意休息和放松哦。",
        "遇到问题不要着急，慢慢来，你一定能克服的！"
    ]

    return jsonify({
        "success": True,
        "response": random.choice(ai_responses),
        "ai_name": "暖暖"
    })

@app.route("/api/student/checkin", methods=["POST"])
def student_checkin():
    data = request.get_json()
    user_id = data.get("user_id", get_current_user())

    checkin_data = {
        "user_id": user_id,
        "emotion": data.get("emotion", 3),
        "sleep": data.get("sleep", 7),
        "study": data.get("study", 6),
        "social": data.get("social", 5),
        "note": data.get("note", ""),
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    if user_id not in mock_database["checkins"]:
        mock_database["checkins"][user_id] = []

    mock_database["checkins"][user_id].append(checkin_data)

    return jsonify({
        "success": True,
        "message": "打卡成功",
        "data": checkin_data
    })

@app.route("/api/student/checkin/<user_id>", methods=["GET"])
def get_checkin_history(user_id, days=7):
    days = int(request.args.get("days", 7))

    checkins = mock_database["checkins"].get(user_id, [])
    cutoff = datetime.now() - timedelta(days=days)
    recent = [
        c for c in checkins
        if datetime.strptime(c["date"], "%Y-%m-%d %H:%M:%S") > cutoff
    ]

    return jsonify({
        "success": True,
        "data": recent,
        "count": len(recent)
    })

@app.route("/api/student/psych/test", methods=["POST"])
def submit_psych_test():
    data = request.get_json()
    user_id = data.get("user_id", get_current_user())
    answers = data.get("answers", [])
    test_type = data.get("test_type", "weekly")

    score = sum(answers) if answers else 0
    max_score = len(answers) * 5 if answers else 25

    normalized = (score / max_score * 100) if max_score > 0 else 50

    if normalized >= 80:
        level = "excellent"
        level_label = "优秀"
    elif normalized >= 60:
        level = "good"
        level_label = "良好"
    elif normalized >= 40:
        level = "fair"
        level_label = "一般"
    else:
        level = "concerning"
        level_label = "需关注"

    test_result = {
        "user_id": user_id,
        "test_type": test_type,
        "score": score,
        "max_score": max_score,
        "normalized": round(normalized, 1),
        "level": level,
        "level_label": level_label,
        "summary": f"本次测评得分{normalized:.0f}分，处于{level_label}水平。",
        "advice": "继续保持良好的生活习惯，多与家人朋友交流。",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "answers": answers
    }

    mock_database["psych_tests"][user_id] = test_result
    mock_database["psych_status"][user_id] = {
        "level": level,
        "normalized": normalized,
        "last_test": datetime.now().strftime("%Y-%m-%d")
    }

    return jsonify({
        "success": True,
        "message": "测评提交成功",
        "data": test_result
    })

@app.route("/api/student/psych/status/<user_id>", methods=["GET"])
def get_psych_status(user_id):
    status = mock_database["psych_status"].get(user_id)

    if not status:
        return jsonify({
            "success": True,
            "data": {
                "user_id": user_id,
                "level": "unknown",
                "normalized": 0,
                "last_test": None,
                "message": "暂无测评记录"
            }
        })

    return jsonify({
        "success": True,
        "data": {
            "user_id": user_id,
            **status
        }
    })

@app.route("/api/parent/chat", methods=["POST"])
def parent_chat():
    data = request.get_json()
    user_id = data.get("user_id", get_current_user())
    message = data.get("message", "")

    if not message:
        return format_error("消息内容不能为空")

    advice_responses = [
        "建议您多关注孩子的情绪变化，保持良好的沟通。",
        "每个孩子都有自己的节奏，不要过于焦虑。",
        "可以尝试和孩子一起做一些轻松的活动，增进亲子关系。",
        "注意观察孩子的学习状态，适时给予鼓励和支持。",
        "建议保持规律的作息时间，这对孩子的身心发展很重要。"
    ]

    return jsonify({
        "success": True,
        "response": random.choice(advice_responses)
    })

@app.route("/api/parent/child/<child_id>/status", methods=["GET"])
def get_child_status(child_id):
    checkins = mock_database["checkins"].get(child_id, [])
    recent = checkins[-7:] if len(checkins) > 7 else checkins

    avg_emotion = sum(c.get("emotion", 3) for c in recent) / max(len(recent), 1)
    avg_sleep = sum(c.get("sleep", 7) for c in recent) / max(len(recent), 1)
    avg_study = sum(c.get("study", 6) for c in recent) / max(len(recent), 1)

    return jsonify({
        "success": True,
        "data": {
            "child_id": child_id,
            "avg_emotion": round(avg_emotion, 1),
            "avg_sleep": round(avg_sleep, 1),
            "avg_study": round(avg_study, 1),
            "checkin_count": len(checkins),
            "last_checkin": checkins[-1]["date"] if checkins else None
        }
    })

@app.route("/api/parent/child/<child_id>/checkins", methods=["GET"])
def get_child_checkins(child_id):
    days = int(request.args.get("days", 7))
    checkins = mock_database["checkins"].get(child_id, [])

    cutoff = datetime.now() - timedelta(days=days)
    recent = [
        c for c in checkins
        if datetime.strptime(c["date"], "%Y-%m-%d %H:%M:%S") > cutoff
    ]

    return jsonify({
        "success": True,
        "data": recent,
        "count": len(recent)
    })

@app.route("/api/parent/child/<child_id>/ai_advice", methods=["GET"])
def get_daily_advice(child_id):
    advices = [
        {"advice": "今天天气不错，建议带孩子户外活动一下。", "focus": "运动"},
        {"advice": "注意观察孩子的情绪变化，及时沟通。", "focus": "情绪"},
        {"advice": "保持规律的作息对孩子的身心发展很重要。", "focus": "作息"},
        {"advice": "学习之余，也要注意孩子的休息和放松。", "focus": "休息"},
        {"advice": "多给孩子一些正面的鼓励和支持。", "focus": "鼓励"}
    ]

    return jsonify({
        "success": True,
        **random.choice(advices)
    })

@app.route("/api/parent/child/grade", methods=["POST"])
def submit_grade():
    data = request.get_json()
    return jsonify({
        "success": True,
        "message": "成绩录入成功"
    })

@app.route("/api/parent/login", methods=["POST"])
def parent_login():
    data = request.get_json()
    phone = data.get("phone")

    if not phone:
        return format_error("手机号不能为空")

    parent_id = f"parent_{phone[-4:]}"
    return jsonify({
        "success": True,
        "account": {
            "id": int(phone[-4:]),
            "phone": phone,
            "name": f"家长{phone[-4:]}",
            "qr_token": f"qr_{parent_id}"
        },
        "bound_children": ["student_001"]
    })

@app.route("/api/parent/children/profiles", methods=["POST"])
def get_children_profiles():
    data = request.get_json()
    child_ids = data.get("child_ids", "").split(",")

    profiles = [
        {"user_id": cid.strip(), "name": f"学生{cid.strip()[-3:]}", "grade": "初一"}
        for cid in child_ids if cid.strip()
    ]

    return jsonify({
        "success": True,
        "profiles": profiles
    })

@app.route("/api/parent/alerts", methods=["GET"])
def get_parent_alerts():
    parent_id = request.args.get("parent_id", "parent_001")

    alerts = [
        {
            "id": 1,
            "child_id": "student_001",
            "child_name": "小明",
            "alert_type": "emotion_drop",
            "title": "情绪波动提醒",
            "content": "孩子最近情绪波动较大，建议关注。",
            "is_read": False,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]

    return jsonify({
        "success": True,
        "alerts": alerts,
        "unread_count": 1
    })

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "warmstudy-api-gateway",
        "version": "1.0.0"
    })

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "暖学帮 API Gateway",
        "version": "1.0.0",
        "endpoints": [
            "/api/auth/*",
            "/api/student/*",
            "/api/parent/*",
            "/api/health"
        ]
    })

if __name__ == "__main__":
    print("\n" + "="*50)
    print("暖学帮 API 网关服务")
    print(f"RAG Agent URL: {RAG_AGENT_URL}")
    print("端口: 8000")
    print("="*50 + "\n")

    app.run(host="0.0.0.0", port=8000, debug=False)
