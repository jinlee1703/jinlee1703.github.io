---
layout: post
title: NestJS - Task Scheduling
description: >
  .
sitemap: false
hide_last_modified: false
---

---

## Background

&nbsp; NestJS를 사용하여 구현한 WAS에서, 데이터베이스에 저장된 데이터가 특정 날짜를 경과했을 때 이를 완료 처리하고 추가 연산을 수행해야 하는 작업이 필요하게 되었다. 이러한 작업을 자동화하기 위해 매일 특정 시점에 해당 작업을 수행하는 Cron 작업을 도입하기로 결정하였고, 이를 위해 NestJS에서 Task Scheduling을 구현하는 방법을 조사하였다.

## CronJob?

&nbsp; Unix 계열 운영체제에서 주기적으로 작업을 실행하기 위해 사용되는 스케줄러이다. `cron` 데몬이 일정한 간격으로 명령어나 스크립트를 실행하도록 예약한다.<br>

&nbsp; 매우 세밀하게 시간 단위로 작업을 예약할 수 있는데, 매일, 매주, 매월 특정 시간에 작업을 실행할 수 있다. 일반적으로 주기적인 시스템 관리 작업(예: 로그 회전, 디스크 정리), 정기적인 데이터 수집, 이메일 알림 등에 사용된다.

### Differences from Batch

&nbsp; **Batch 작업**은 일괄 작업을 의미하며, 한 번에 여러 작업을 모아서 처리하는 방식이다. 대게 많은 양의 데이터를 처리하거나 여러 작업을 한 번에 실행할 때 사용된다.<br>

&nbsp; 단순하게 생각하면 **Batch**는 한 번에 많은 작업을 모아서 처리하는 것, **Cron**은 개별 작업을 주기적으로 실행하는 것으로 이해할 수 있다.<br>

&nbsp; 만약 주기적으로 Batch 작업을 실행시키기 위해서는 Cron 작업을 통해 Batch 작업을 실행하는 것이 일반적이다.

## `@nestjs/schedule`

&nbsp; NestJS에서 특정 시간에 작업을 실행(Cron)하기 위해서는 `@nestjs/schedule` 패키지를 사용하여 작업 스케줄링을 할 수 있다. 이 패키지는 cron 작업, 타임아웃, 인터벌 등을 통해 작업을 예약할 수 있는 기능을 제공한다.

### Installation

```bash
npm install --save @nestjs/schedule
```

### Module Setting

&nbsp; 애플리케이션에 `ScheduleModule`을 import하여야 스케줄링을 할 수 있다.

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TaskService } from "./task.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TaskService],
})
export class AppModule {}
```

### Service Implementation

```typescript
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  // 매일 특정 시간에 실행 (예: 매일 자정에 실행)
  @Cron("0 0 * * *")
  handleCron() {
    console.log("매일 자정에 실행되는 작업입니다.");
    // 작업 로직을 여기에 추가
  }
}
```

#### Cron Expression

```
* * * * * *
| | | | | |
| | | | | 요일
| | | | 월
| | | 일
| | 시
| 분
초 (optional)
```

&nbsp; Cron 표현식은 주기적으로 실행되는 작업의 시간을 지정하기 위해 사용한다. 필드는 5개 혹은 6개로 구분되며 각 필드는 분, 시, 일, 월, 요일 등을 의미한다. 다양한 조합을 통해 복잡한 스케줄을 설정할 수 있다. 필드는 공백으로 구분되는데, 아래에서 각 필드의 의미와 범위에 대해서 살펴보자.

1. (선택) 초 (0 - 59)
1. 분 (0 - 59)
1. 시 (0 - 23)
1. 일 (1 - 31)
1. 월 (1 - 12)
1. 요일 (0 - 7) // 일요일은 0 혹은 7로 표현

&nbsp; 표현식에서 숫자만 사용할 수 있는 것은 아니다. 특수문자 또한 사용할 수 있다.

- `*`: 모든 값을 의미 (예를 들어, 시 필드에서 `*`는 매 시간을 의미)
- `,`: 여러 값을 나열할 때 사용 (예를 들어, 시 필드에서 `1,2,5` 입력 시, 1시, 2시, 5시를 의미)
- `-`: 범위를 지정할 때 사용 (예를 들어, 시 필드에서 `1-5`는 1시부터 5시까지를 의미)
- `/`: 간격을 지정할 때 사용 (예를 들어, 시 필드에서 `*/5`는 5시간 간격을 의미)

&nbsp; 복잡한 스케줄링 작업일 수록 당연히 표현식 역시 복잡해질 수 밖에 없다. [crontab guru](https://crontab.guru/)와 같은 사이트를 활용하면 표현식을 보다 편리하게 작성해준다. 하지만 최근에는 ChatGPT 등의 LLM 서비스를 활용하면 Regex 등의 표현식을 매우 잘 작성해주므로 이를 활용하도록 하자.

#### enum

&nbsp; `@nestjs/schedule` 패키지에서는 enum을 통해 스케줄링 작업을 제어할 수도 있다.

```typescript
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  // 매일 자정에 batch 작업 실행
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    console.log("매일 자정에 batch 작업을 실행합니다.");
    // batch 작업 로직을 여기에 추가
  }

  // 30초마다 실행
  @Cron(CronExpression.EVERY_30_SECONDS)
  handleEveryThirtySeconds() {
    this.logger.debug("Called every 30 seconds");
  }

  // 5분마다 실행
  @Cron(CronExpression.EVERY_5_MINUTES)
  handleEveryFiveMinutes() {
    console.log("5분마다 실행되는 작업입니다.");
    // 작업 로직을 여기에 추가
  }
}
```

#### Additional options

&nbsp; `@Cron` 어노테이션의 두 번째 인자를 통해 추가 옵션을 설정할 수도 있다.

| 이름      | 설명                                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| name      | 선언된 Cron 작업 식별 및 제어를 위해 사용한다.                                                                    |
| timeZone  | 실행을 위한 시간대를 지정하여, 해당 시간대로 변환하여 작업을 실행할 수 있다. 예: `America/New_York`, `Asia/Seoul` |
| utcOffset | `timeZone` 매개변수를 사용하는 대신 시간대의 UTC 오프셋을 지정할 수 있다. 예: `+0900` (한국 표준시)               |
| disabled  | `true`로 설정하여, Cron 작업을 비활성화하여 실행하지 않을 수 있다.                                                |

```typescript
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  // 매일 자정에 작업을 실행하며, 서울 시간대를 기준으로 실행
  @Cron("0 0 * * *", {
    name: "dailyJob",
    timeZone: "Asia/Seoul",
    disabled: false,
  })
  handleCron() {
    console.log("매일 자정에 실행되는 작업입니다.");
    // 작업 로직을 여기에 추가
  }
}
```

#### `@Timeout`

&nbsp; 특정 시간 후에 한 번 실행되는 작업을 설정할 때 사용한다.

```typescript
import { Injectable } from "@nestjs/common";
import { Timeout } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  @Timeout(5000)
  handleTimeout() {
    console.log("5초 후에 실행되는 작업입니다.");
  }
}
```

#### `@Interval`

&nbsp; 일정 간격으로 반복 실행되는 작업을 설정할 때 사용한다.

```typescript
import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  @Interval(10000)
  handleInterval() {
    console.log("10초마다 실행되는 작업입니다.");
  }
}
```

#### schedulerRegistry

&nbsp; 동적으로 Cron, Interval, Timeout 작업을 추가, 제거, 제어할 수도 있다.

```typescript
import { Injectable } from "@nestjs/common";
import { SchedulerRegistry, CronJob } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addCronJob(name: string, cronTime: string) {
    const job = new CronJob(cronTime, () => {
      console.log(`Cron job ${name} 실행됨`);
    });
    this.schedulerRegistry.addCronJob(name, job);
    job.start();
  }

  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    console.log(`Cron job ${name} 삭제됨`);
  }
}
```

---

## References

- [NestJS - Task Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
