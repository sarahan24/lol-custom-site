# 🔌 API 문서

모든 API는 `/api/players` 엔드포인트를 기반으로 합니다.

## GET /api/players
모든 참가자 목록 조회

**요청:**
```http
GET /api/players
```

**응답 (200 OK):**
```json
[
  {
    "nickname": "신튜렁",
    "tier": "S",
    "mt": 1520
  },
  {
    "nickname": "미드괴물",
    "tier": "S",
    "mt": 1490
  }
]
```

## POST /api/players
새로운 참가자 추가

**요청:**
```http
POST /api/players
Content-Type: application/json

{
  "nickname": "새로운참가자",
  "tier": "A",
  "mt": 1400
}
```

**응답 (201 Created):**
```json
{
  "nickname": "새로운참가자",
  "tier": "A",
  "mt": 1400
}
```

**에러 응답 (400 Bad Request):**
```json
{
  "error": "nickname is required"
}
```

## PUT /api/players/<index>
특정 참가자 정보 수정

**요청:**
```http
PUT /api/players/0
Content-Type: application/json

{
  "nickname": "수정된닉네임",
  "tier": "S",
  "mt": 1550
}
```

**응답 (200 OK):**
```json
{
  "nickname": "수정된닉네임",
  "tier": "S",
  "mt": 1550
}
```

**에러 응답 (404 Not Found):**
```json
{
  "error": "Player not found"
}
```

## DELETE /api/players/<index>
특정 참가자 삭제

**요청:**
```http
DELETE /api/players/0
```

**응답 (204 No Content):**
```
(본문 없음)
```

**에러 응답 (404 Not Found):**
```json
{
  "error": "Player not found"
}
```
