---
layout: post
title: Spring Batch - 배치 작업과 스케줄러 연동하기
description: >
  다수의 시스템에서는 대용량 데이터 처리, 정기적인 리포트 생성, 데이터 마이그레이션 등 주기적으로 실행해야 하는 작업들이 많다. 필자 역시도 인턴십 등 서비스 개발을 진행하며 이러한 작업들을 마주하곤 했다. Spring 생태계에서는 이런 반복적인 작업들을 효율적으로 처리하기 위한 도구로 Spring Batch와 Scheduler를 제공한다. 본 글에서는 Spring Batch의 핵심 개념을 소개하고, 이를 Scheduler와 어떻게 효과적으로 연동할 수 있는지 실제 경험을 바탕으로 설명하고자 한다.
sitemap: false
hide_last_modified: false
---

---

* this unordered seed list will be replaced by the toc
{:toc}

## 1. Spring Batch와 Scheduler: 명확히 다른 개념

필자를 포함한 많은 개발자들이 혼동하는 부분을 명확히 짚고 넘어가고자 한다. **Batch**와 **Schduler**는 서로 다른 개념이다.

### 1.1. Spring Batch: '무엇을' 처리할 것인가

Spring Batch는 **대용량 데이터 처리**를 위한 경량 프레임워크이다. 배치 작업의 실행 흐름, 데이터 처리 방식, 오류 처리 전략 등 '무엇을 어떻게 처리할 것인가'에 중점을 둔다. 주요 특징은 아래와 같다.

- 대용량 데이터의 효율적인 처리를 위한 청크(Chunk) 기반 처리
- 재시작 가능한 작업 (Restartbility)
- 단계별 처리 (Step-by-Step Processing)
- 트랜잭션 관리
- 작업 상태 및 통계 관리

예를 들면, 수천만 건의 거래 내역을 '집계'하는 로직을 Spring Batch로 구현할 수 있다.

### 1.2. Scheduler: '언제' 실행할 것인가

반면, Scheduler는 **작업의 실행 시점을 관리하는 도구**이다. 즉 '언제 실행할 것인가'에 중점을 둔다. 대표적인 스케줄러로는 Spring의 내장 Scheduler와 Quartz, cron 등이 있다. 주요 특징은 다음과 같다.

- 주기적 실행 (매일, 매주, 매월 등)
- 특정 시간 실행 (매일 오전 3시 등)
- 조건부 실행 (특정 이벤트 발생 시)
- 작업 실행 관리 (중지, 재개, 취소 등)

예를 들면, 매일 자정에 특정 작업을 실행하게 하는 것이 Scheduler의 역할이다.

## 2. Spring Batch 기본 구조

Spring Batch는 크기 `Job`, `Step`, `ItemReader`, `ItemProcessor`, `ItemWriter`로 구성된다.

### 2.1. Job

배치 작업의 최상위 개념으로, 하나 이상의 Step으로 구성된다.

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {
    
    @Autowired
    private JobBuilderFactory jobBuilderFactory;
    
    @Bean
    public Job sampleJob() {
        return jobBuilderFactory.get("sampleJob")
                .start(step1())
                .next(step2())
                .build();
    }
}
```

### 2.2. Step

Job의 실제 처리 단위로, Tasklet 방식 또는 Chunk 방식으로 구현할 수 있다.

```java
@Autowired
private StepBuilderFactory stepBuilderFactory;

@Bean
public Step step1() {
    return stepBuilderFactory.get("step1")
            .<InputData, OutputData>chunk(100)
            .reader(itemReader())
            .processor(itemProcessor())
            .writer(itemWriter())
            .build();
}
```

### 2.3. ItemReader, ItemProcessor, ItemWriter

데이터를 읽고, 처리하고, 쓰는 역할을 담당한다.

```java
// ItemReader: 데이터를 읽어오는 컴포넌트
@Bean
public ItemReader<InputData> itemReader() {
    return new JdbcCursorItemReaderBuilder<InputData>()
            .name("inputDataReader")
            .dataSource(dataSource)
            .sql("SELECT * FROM input_table")
            .rowMapper(new InputDataRowMapper())
            .build();
}

// ItemProcessor: 읽어온 데이터를 가공하는 컴포넌트
@Bean
public ItemProcessor<InputData, OutputData> itemProcessor() {
    return inputData -> {
        OutputData outputData = new OutputData();
        outputData.setId(inputData.getId());
        outputData.setProcessedValue(inputData.getValue() * 2);
        outputData.setProcessedDate(new Date());
        return outputData;
    };
}

// ItemWriter: 가공된 데이터를 저장하는 컴포넌트
@Bean
public ItemWriter<OutputData> itemWriter() {
    return new JdbcBatchItemWriterBuilder<OutputData>()
            .dataSource(dataSource)
            .sql("INSERT INTO output_table (id, processed_value, processed_date) VALUES (:id, :processedValue, :processedDate)")
            .beanMapped()
            .build();
}
```

## 3. Spring Batch와 Scheduler 연동하기

Spring Batch로 '무엇을' 처리할지 정의했다면, 이제 Scheduler를 통해 '언제' 실행할지 설정해야 한다. 연동 방법은 크게 두 가지가 있다.

### 3.1. Spring의 내장 Scheduler 사용

```java
@Configuration
@EnableScheduling
public class SchedulerConfig {
    
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    private Job sampleJob;
    
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    public void runJob() throws Exception {
        JobParameters parameters = new JobParametersBuilder()
                .addDate("runTime", new Date())
                .toJobParameters();
        
        jobLauncher.run(sampleJob, parameters);
    }
}
```

### 3.2. Quartz Scheduler 사용

Quartz는 더 복잡한 스케줄링 요구사항을 처리할 수 있는 강력한 스케줄러이다.

```java
@Configuration
public class QuartzConfig {
    
    @Bean
    public JobDetail jobDetail() {
        return JobBuilder.newJob(BatchJobQuartzJob.class)
                .withIdentity("sampleJob")
                .storeDurably()
                .build();
    }
    
    @Bean
    public Trigger trigger(JobDetail jobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withIdentity("sampleTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 0 * * ?"))
                .build();
    }
}

public class BatchJobQuartzJob extends QuartzJobBean {
    
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    private Job sampleJob;
    
    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        try {
            JobParameters parameters = new JobParametersBuilder()
                    .addDate("runTime", new Date())
                    .toJobParameters();
            
            jobLauncher.run(sampleJob, parameters);
        } catch (Exception e) {
            throw new JobExecutionException(e);
        }
    }
}
```

### 3.3. Job Parameters 이해하기

Spring Batch에서 **Job Parameters**는 배치 작업을 실행할 때 전달하는 파라미터 집합이다. 이는 배치 작업의 식별과 실행 제어에 중요한 역할을 한다.

#### 3.3.1. Job Parameters의 중요성

Spring Batch는 기본적으로 동일한 Job과 Job Parameters 조합으로 중복 실행을 방지한다. 따라서 스케줄러를 통해 반복 실행할 때는 매번 다른 Job Parameters를 제공해야 한다.

```java
// 현재 시간을 파라미터로 사용하여 매번 다른 파라미터 생성
JobParameters parameters = new JobParametersBuilder()
        .addDate("currentTime", new Date())
        .toJobParameters();
```

## 4. 주의사항 및 베스트 프랙티스

1. JobParameters 관리: 매번 다른 JobParameters를 사용해야 Spring Batch가 동일한 Job을 중복 실행하지 않는다.
2. 오류 처리 전략: 배치 작업 실패 시 알림 또는 로깅 시스템을 통합하여 빠른 대응이 가능하도록 한다.
3. 모니터링: Spring Batch Admin 또는 별도의 모니터링 도구를 통해 배치 작업의 상태와 성능을 모니터링한다.
4. 테스트: 실제 운영 환경과 유사한 데이터셋을 사용하여 철저히 테스트한다.

## 5. 결론

Spring Batch와 Scheduler는 서로 다른 개념이지만, 함께 사용할 때 그 가치가 극대화된다. Spring Batch는 '무엇을 어떻게 처리할 것인가'를 정의하고, Scheduler는 '언제 실행할 것인가'를 관리한다. 이 두 가지 도구를 올바르게 이해하고 활용하면 기업의 정기적인 대용량 데이터 처리 작업을 효율적으로 자동화할 수 있다.

다음 글에서는 Spring Batch의 처리 방식인 Tasklet과 Chunk에 대해 더 자세히 살펴볼 예정이다.

---

### *Spring Batch 시리즈*

- Spring Batch 입문: 배치 작업과 스케줄러 연동하기 (현재 글)
- Spring Batch 처리 방식 비교: Tasklet vs Chunk 상세 분석 (예정)
- 고성능 Spring Batch 구현: 멀티스레드 적용 실전 사례 (예정)
