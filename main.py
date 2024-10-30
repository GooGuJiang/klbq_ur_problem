from flask import Flask, request, Response
import requests
import os
import hashlib
from datetime import timedelta
from flask_caching import Cache
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 604800})  # 缓存一周 (604800 秒)

@app.route('/avatar/<int:qq_id>')
@cache.cached(timeout=604800, query_string=True)
def proxy_avatar(qq_id):
    avatar_url = f"https://q1.qlogo.cn/g?b=qq&nk={qq_id}&s=640"
    
    response = requests.get(avatar_url)
    
    if response.status_code == 200:
        return Response(response.content, content_type=response.headers['Content-Type'])
    else:
        return Response("Failed to fetch avatar", status=response.status_code)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
