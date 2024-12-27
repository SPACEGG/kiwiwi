# 🥝 kiwiwi - private discord music bot

| 가정용 디스코드 음악 봇 - kiwiwi 사용설명서

![KiwiwiPlayer](https://i.imgur.com/Ceb5rFx.png)

---

## Features

-   고품질 음악 재생
-   텍스트 기반 뮤직 플레이어 UI
-   유튜브 음악 검색
-   kiwiwi는 가정용 봇이기 때문에 누가 신청한 음악이든지 아무나 skip/remove 할 수 있어요.
-   사용 가능한 url 타입:
    -   youtube
    -   soundcloud
    -   spotify
    -   bandcamp

## Requirements

-   docker + docker-compose
-   디스코드 봇 애플리케이션 ([Discord Developer Portal](https://discord.com/developers/)에서 생성하세요.)

## Setup

1. 리포지토리 폴더로 작업영역을 이동하세요.
2. `.env.tmp` 파일의 빈 부분을 채우세요.
    - DISCORD_TOKEN: 봇 토큰
    - CLIENT_ID: OAuth2 클라이언트 토큰
    - DATABASE\_어쩌구: 하고싶은대로 하세요. (최소한 PASSWORD라도 바꾸기)
    - EMOJI\_어쩌구: 서버 커스텀 이모지 id를 적용할 수 있어요 (<> 포함).
    - DEV\_어쩌구: 개발용 환경변수라 비워둬도 상관없어요.
3. `.env.tmp` 파일을 `.env` 으로 이름을 변경하세요.
4. docker compose를 실행하세요.
    - `docker-compose up -d`

## Invite

1. [Discord Developer Portal](https://discord.com/developers/)의 OAuth2 탭에서 다음 scope를 선택하세요:
    - application.commands
    - bot
2. `BOT PERMISSIONS`은 다음 scope를 선택하세요:
    - Send Messages
    - Embed Links
    - Read Message History
    - Use External Emojis
    - Add Reactions
    - Use Slash Commands
    - Connect
    - Speak
    - 이거 다 귀찮으면 그냥 Administrator 하나만 해도 됨
3. `GENERATED URL`에 생성된 링크를 통해 서버에 kiwiwi를 데려오세요.

## How To Use

1. kiwiwi 전용 채팅 채널을 만드세요.
2. kiwiwi에게 해당 채널의 메시지 관리 권한을 부여하세요.
3. 해당 채널에서 /sethome 명령을 사용하세요.

## License

kiwiwi는 MIT License를 제공해요.

-   출처/라이선스 표기
-   상업적/개인적 이용 가능
-   수정/배포 가능
