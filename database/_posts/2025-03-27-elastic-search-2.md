---
layout: post
title: Mac에서 ElasticSearch 설치 및 실행하기
description: >
  필자의 로컬 개발 환경인 Mac에서 ElasticSearch를 설치하고, 실행하는 과정을 기록하려 한다.
sitemap: false
hide_last_modified: false
published: true
---

---

* this unordered seed list will be replaced by the toc
{:toc}

---

## 1. 시작하기 전에

### 1.1. 필수 요구사항

필자는 ElasticSearch 8.x를 Mac에 설치할 것이고, 이를 위해 이전에 필요한 요구사항은 아래와 같다.

- macOS 10.15 (Catalina) 이상
- Java 17 이상 (ElasticSearch 8.x는 JDK 17 이상 필요)
- 최소 4GB RAM (프로덕션 환경에서는 8GB 이상 권장)
- 터미널 사용에 대한 기본 지식

Java 설치 여부는 다음 명령어로 확인할 수 있다.

```bash
java -version
```

Java가 설치되어 있지 않거나 버전이 17 미만이라면, 먼저 설치해야 한다.

```bash
brew install openjdk@17
```

설치 후에는 경로를 설정해주어야 할 수 있다.

```bash
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 1.2. 설치 방법 선택

Mac에서 ElasticSearch를 설치하는 방법은 크게 세 가지가 있다.

1. 직접 바이너리 설치: 공식 사이트에서 바이너리를 다운로드하여 설치
2. Homebrew를 이용한 설치: Mac의 패키지 관리자를 통한 설치
3. Docker를 이용한 설치: 컨테이너화된 환경에서 실행 (필자 채택)

필자는 각 방법의 장단점을 비교하여 상황에 맞는 설치 방법을 선택할 것을 권장한다.

## 2. Homebrew를 이용한 설치

### 2.1. Homebrew 설치

Homebrew가 설치되어 있지 않다면, 아래 명령어로 먼저 설치한다.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2.2. ElasticSearch 설치

Homebrew를 통해 ElasticSearch 8.x를 설치하는 방법은 간단하다.

```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full
```

위 명령어를 실행하면 최신 버전의 ElasticSearch가 설치된다. 설치가 완료되면 아래와 같은 메시지가 출력될 것이다.

```plaintext
ElasticSearch has been installed.
To start elasticsearch now and restart at login:
  brew services start elastic/tap/elasticsearch-full
Or, if you don't want/need a background service you can just run:
  elasticsearch
```

### 2.3. ElasticSearch 실행

ElasticSearch를 백그라운드 서비스로 실행하려면 아래 명령어를 사용한다.

```bash
brew services start elastic/tap/elasticsearch-full
```

직접 터미널에서 실행하려면 아래 명령어를 사용한다.

```bash
elasticsearch
```

ElasticSearch 8.x 버전은 기본적으로 보안이 활성화되어 있다. 첫 실행 시 자동으로 비밀번호가 생성되며, 이를 반드시 메모해둬야 한다. 터미널에 아래와 같은 메시지가 표시된다.

```plaintext
--------------------------- Security autoconfiguration information ------------------------------

Authentication and authorization are enabled.
TLS for the transport and HTTP layers is enabled and configured.

The generated password for the elastic built-in superuser is: <password>

If this node should join an existing cluster, you can reconfigure this with
'/usr/local/bin/elasticsearch-reconfigure-node --enrollment-token <token-here>'

You can complete the following actions at any time:

Reset the password of the elastic built-in superuser:
'/usr/local/bin/elasticsearch-reset-password -u elastic'

Generate an enrollment token for Kibana instances:
'/usr/local/bin/elasticsearch-create-enrollment-token -s kibana'

Generate an enrollment token for Elasticsearch nodes:
'/usr/local/bin/elasticsearch-create-enrollment-token -s node'
-----------------------------------------------------------------------------------------
```

정상적으로 실행되었는지 확인하기 위해 다음 명령어를 실행해보자.

```bash
curl --cacert /usr/local/etc/elasticsearch/certs/http_ca.crt -u elastic https://localhost:9200
```

비밀번호를 입력하라는 프롬프트가 나타나면, 초기 설정 시 제공된 비밀번호를 입력한다.

## 3. 바이너리 직접 설치

### 3.1. ElasticSearch 다운로드

공식 사이트에서 ElasticSearch 8.x 바이너리를 직접 다운로드하는 방법이다. 본 게시글 작성 일자(`25.03.27.)를 기준으로, 최신 버전을 다운로드하려면 아래 명령어를 사용한다.

```bash
curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.12.1-darwin-x86_64.tar.gz
```

Apple Silicon(M1/M2) Mac을 사용하는 경우는 아래 명령어를 사용한다.

```bash
curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.12.1-darwin-aarch64.tar.gz
```

### 3.2. 압축 해제 및 설치

다운로드한 파일의 압축을 해제한다.

```bash
# Intel Mac
tar -xzf elasticsearch-8.12.1-darwin-x86_64.tar.gz

# Apple Silicon Mac
tar -xzf elasticsearch-8.12.1-darwin-aarch64.tar.gz
```

압축 해제된 디렉토리로 이동한다.

```bash
cd elasticsearch-8.12.1
```

### 3.3 ElasticSearch 실행

바이너리로 설치한 ElasticSearch를 실행하려면 다음 명령어를 사용한다.

```bash
./bin/elasticsearch
```

마찬가지로 ElasticSearch 8.x는 첫 실행 시 자동으로 보안을 설정한다. 아래와 같은 정보가 표시된다.

- 자동 생성된 elastic 사용자 비밀번호
- 인증서 정보
- 토큰 생성 방법

이 정보는 반드시 메모해두어야 한다. ElasticSearch 실행을 확인하려면 다음 명령어를 사용한다.

```bash
curl --cacert config/certs/http_ca.crt -u elastic https://localhost:9200
```

비밀번호를 입력하라는 프롬프트가 나타나면, 초기 설정 시 제공된 비밀번호를 입력한다.

## 4. Docker를 이용한 설치 (필자 채택)

### 4.1. Docker 설치

먼저 Docker Desktop for Mac이 설치되어 있어야 한다. 설치되어 있지 않다면 공식 웹사이트에서 다운로드하여 설치한다.

Docker가 정상적으로 설치되었는지 확인하려면 다음 명령어를 실행한다.

```bash
docker --version
```

### 4.2. ElasticSearch Docker 이미지 실행

Docker를 사용하여 ElasticSearch 8.x를 실행하는 방법은 다음과 같다.

```bash
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

위 명령어에서 각 옵션은 아래와 같은 의미이다.

- `-d`: 백그라운드에서 컨테이너 실행
- `--name elasticsearch`: 컨테이너 이름 지정
- `-p 9200:9200 -p 9300:9300`: 호스트와 컨테이너 간 포트 매핑
- `-e "discovery.type=single-node"`: 단일 노드 모드로 실행
- `-e "xpack.security.enabled=false"`: 개발 목적으로 보안 비활성화
- `docker.elastic.co/elasticsearch/elasticsearch:8.12.1`: 사용할 ElasticSearch 이미지

참고로 위 명령어는 개발 환경에서 테스트 목적으로 보안을 비활성화한 것이므로, 프로덕션 환경에서는 적절한 보안 설정이 필요하다.

ElasticSearch가 정상적으로 실행되었는지 확인하기 위해 아래의 명령어를 실행하자.

```bash
curl http://localhost:9200
```

### 4.3. Docker Compose를 이용한 설정

더 복잡한 설정이 필요하거나 ELK 스택 전체를 실행하려면 Docker Compose를 사용하는 것이 좋다. 아래는 기본적인 docker-compose.yml 파일 예시이다.

```bash
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.1
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - 9200:9200
      - 9300:9300
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - elastic

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.1
    container_name: kibana
    ports:
      - 5601:5601
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - elastic

networks:
  elastic:
    driver: bridge

volumes:
  elasticsearch_data:
    driver: local
```

이 파일을 저장한 후, 다음 명령어로 실행한다.

```bash
docker-compose up -d
```

이렇게 하면 ElasticSearch와 Kibana가 함께 실행된다. Kibana 접속은 `http://localhost:5601`로 할 수 있다.

## 5. 기본 설정 변경하기

### 5.1. 설정 파일 위치

ElasticSearch 8.x의 설정 파일은 설치 방법에 따라 위치가 다르다.

- **Homebrew 설치**: `/usr/local/etc/elasticsearch/elasticsearch.yml` 또는 `/opt/homebrew/etc/elasticsearch/elasticsearch.yml`
- **바이너리 설치**: `[설치 디렉토리]/config/elasticsearch.yml`
- **Docker 설치**: 볼륨 매핑을 통해 설정 파일을 제공해야 함

### 5.2. 주요 설정 옵션

필자가 작성한 ElasticSearch 8.x의 주요 설정 옵션은 아래와 같다.

```yaml
# 클러스터 이름
cluster.name: my-cluster

# 노드 이름
node.name: mac-node-1

# 데이터와 로그를 저장할 경로
path.data: /path/to/data
path.logs: /path/to/logs

# 네트워크 설정
network.host: 0.0.0.0
http.port: 9200

# 메모리 설정
bootstrap.memory_lock: true

# 디스커버리 설정
discovery.seed_hosts: ["127.0.0.1"]
cluster.initial_master_nodes: ["mac-node-1"]

# 보안 설정 (8.x 기본 활성화)
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
```

필자와 같이 테스트 목적으로 사용하는 개발 환경에서는 기본 설정을 크게 변경하지 않고 사용하는 것을 권장하지만, **프로덕션 환경에서는 반드시 적절한 설정을 통해 성능과 안정성을 확보**해야 한다.

### 5.3. JVM 메모리 설정

ElasticSearch는 Java 기반이므로 JVM 메모리 설정이 중요하다. ElasticSearch에서 JVM 메모리 설정은 단순한 숫자 조정이 아니라 워크로드 특성에 맞춘 중요한 튜닝 포인트이다. 이 설정은 `jvm.options` 파일에서 변경할 수 있다.

```plaintext
# 최소 힙 사이즈
-Xms2g
# 최대 힙 사이즈
-Xmx2g
```

Mac의 사양에 따라 적절히 조정하는 것이 좋다. 일반적으로 사용 가능한 물리 메모리의 50%를 ElasticSearch에 할당하는 것이 권장된다고 한다. 단, 최소값과 최대값은 동일하게 설정하는 것이 좋다.

## 6. 기본 작업 실습

### 6.1. 인덱스 생성

ElasticSearch 8.x에서 인덱스를 생성하는 기본 예제이다. 보안이 활성화된 경우 인증이 필요하다.

```bash
# 보안이 비활성화된 경우
curl -X PUT "localhost:9200/my_first_index?pretty"

# 보안이 활성화된 경우
curl -X PUT "https://localhost:9200/my_first_index?pretty" --cacert /path/to/http_ca.crt -u elastic
```

위와 같이 요청했을 때 올바른 응답은 다음과 같을 것이다.

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "my_first_index"
}
```

### 6.2. 문서 추가

생성한 인덱스에 문서를 추가하는 예제이다.

```bash
# 보안이 비활성화된 경우
curl -X POST "localhost:9200/my_first_index/_doc?pretty" -H "Content-Type: application/json" -d'
{
  "title": "Mac에서 ElasticSearch 설치하기",
  "content": "이 글에서는 Mac에서 ElasticSearch를 설치하는 방법을 설명합니다.",
  "tags": ["elasticsearch", "mac", "설치"],
  "created_at": "2025-03-27T10:00:00"
}
'

# 보안이 활성화된 경우
curl -X POST "https://localhost:9200/my_first_index/_doc?pretty" --cacert /path/to/http_ca.crt -u elastic -H "Content-Type: application/json" -d'
{
  "title": "Mac에서 ElasticSearch 설치하기",
  "content": "이 글에서는 Mac에서 ElasticSearch를 설치하는 방법을 설명합니다.",
  "tags": ["elasticsearch", "mac", "설치"],
  "created_at": "2025-03-27T10:00:00"
}
'
```

### 6.3. 문서 검색

추가한 문서를 검색하는 예제이다.

```bash
# 전체 문서 검색 (보안이 비활성화된 경우)
curl -X GET "localhost:9200/my_first_index/_search?pretty"

# 전체 문서 검색 (보안이 활성화된 경우)
curl -X GET "https://localhost:9200/my_first_index/_search?pretty" --cacert /path/to/http_ca.crt -u elastic

# 특정 키워드로 검색 (보안이 비활성화된 경우)
curl -X GET "localhost:9200/my_first_index/_search?pretty" -H "Content-Type: application/json" -d'
{
  "query": {
    "match": {
      "content": "elasticsearch"
    }
  }
}
'

# 특정 키워드로 검색 (보안이 활성화된 경우)
curl -X GET "https://localhost:9200/my_first_index/_search?pretty" --cacert /path/to/http_ca.crt -u elastic -H "Content-Type: application/json" -d'
{
  "query": {
    "match": {
      "content": "elasticsearch"
    }
  }
}
'
```

## 7. 클러스터 상태 모니터링

### 7.1. 클러스터 헬스 체크

ElasticSearch 클러스터를 헬스 체킹하는 방법이다.

```bash
# 보안이 비활성화된 경우
curl -X GET "localhost:9200/_cluster/health?pretty"

# 보안이 활성화된 경우
curl -X GET "https://localhost:9200/_cluster/health?pretty" --cacert /path/to/http_ca.crt -u elastic
```

위와 같이 요청했을 때 올바른 응답은 다음과 같을 것이다.

```json
{
  "cluster_name" : "elasticsearch",
  "status" : "green",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 1,
  "active_shards" : 1,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 0,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 100.0
}
```

이 중 가장 메인이 되는 상태값(`status`)은 green, yellow, red로 표시되며, 각각의 의미는 다음과 같다.

- `green`: 모든 샤드가 정상적으로 할당됨
- `yellow`: 모든 프라이머리 샤드는 할당되었지만, 일부 레플리카 샤드가 할당되지 않음
- `red`: 일부 프라이머리 샤드가 할당되지 않음

### 7.2. 노드 정보 확인

클러스터의 노드 정보를 확인하는 방법이다.

```bash
# 보안이 비활성화된 경우
curl -X GET "localhost:9200/_cat/nodes?v"

# 보안이 활성화된 경우
curl -X GET "https://localhost:9200/_cat/nodes?v" --cacert /path/to/http_ca.crt -u elastic
```

## 8. ElasticSearch 중지 및 제거

설치 방법에 따른 ElasticSearch 중지 방법은 아래와 같다.

### 8.1. Homebrew 설치 시

```bash
# 중지
brew services stop elastic/tap/elasticsearch-full

# 제거
brew uninstall elastic/tap/elasticsearch-full
```

### 8.2. 바이너리 설치 시

- `Ctrl + C`로 프로세스 종료
- 설치 디렉토리 삭제

### 8.3. Docker 설치 시

```bash
# 중지
docker stop elasticsearch

# 제거
docker rm elasticsearch
docker rmi docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

### 8.4. Docker Compose 사용 시

```bash
# 중지
docker-compose down

# 볼륨까지 제거
docker-compose down -v
```

## 9. 문제 해결

### 9.1. 메모리 관련 문제

ElasticSearch 실행 시 메모리 부족 오류가 발생할 경우, JVM 메모리 설정을 조정해야 한다. jvm.options 파일에서 -Xms와 -Xmx 값을 낮추거나, 시스템의 가상 메모리 제한을 확인한다.

### 9.2. 포트 충돌 문제

9200 또는 9300 포트가 이미 사용 중인 경우, ElasticSearch 설정 파일에서 포트 번호를 변경하거나, 기존에 실행 중인 ElasticSearch 인스턴스를 중지해야 한다.

### 9.3. 보안 관련 문제

ElasticSearch 8.x는 기본적으로 보안이 활성화되어 있다. 인증서나 비밀번호 관련 문제가 발생하는 경우 다음을 확인한다.

- 올바른 인증서 경로 사용
- 정확한 사용자 이름과 비밀번호 사용
- 개발 환경에서는 xpack.security.enabled 설정을 false로 변경 가능

비밀번호를 잊어버린 경우, 재설정할 수 있다.

```bash
# Homebrew 설치의 경우
/usr/local/bin/elasticsearch-reset-password -u elastic

# 바이너리 설치의 경우
./bin/elasticsearch-reset-password -u elastic
```

### 9.4. 권한 문제

파일 권한 문제가 발생할 경우, 데이터 및 로그 디렉토리에 대한 적절한 권한을 부여해주자.

```bash
sudo chown -R $(whoami) [ElasticSearch 디렉토리]
```

### 10. 결론 및 다음 단계

### 10.1. ElasticSearch 설치 요약

이 글에서는 Mac 환경에서 ElasticSearch 8.x를 설치하고 기본적인 사용법을 알아보았다. 세 가지 설치 방법(Homebrew, 바이너리, Docker)을 모두 다루었으며, 각각의 장단점에 따라 본인이 적절한 방법을 사용토록 해야한다.

ElasticSearch 8.x는 이전 버전과 달리 기본적으로 보안이 활성화되어 있어 초기 설정 시 생성된 비밀번호와 인증서를 잘 관리해야 한다. 개발 환경에서는 Docker를 이용한 설치가 가장 편리한데, 필요에 따라 보안 설정을 간소화할 수 있기 때문이다.

### 10.2. 다음 포스트 예고: ElasticSearch 기반으로 Spring 문서 검색 프로그램 만들기

다음 포스트에서는 ElasticSearch를 Spring Boot 애플리케이션과 연동하여 실용적인 문서 검색 프로그램을 만드는 방법을 알아볼 예정이다. Spring Data Elasticsearch를 활용하여 모델 매핑, 저장소 구현, 검색 기능을 구축하는 과정을 단계별로 다룰 것이다. 또한, 한글 형태소 분석기 설정과 다양한 검색 기능(자동완성, 하이라이팅, 필터링 등)을 구현하여 실제 프로젝트에 바로 적용할 수 있는 실전 코드와 지식을 공유하고자 한다.

---

## Referneces

- [ElasticSearch 8.12. Reference](https://www.elastic.co/guide/en/elasticsearch/reference/8.12/setup.html)