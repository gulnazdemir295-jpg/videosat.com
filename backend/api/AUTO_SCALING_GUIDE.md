# 📈 Auto Scaling Yapılandırma Rehberi

## 📋 Genel Bakış

Auto Scaling, uygulamanızın yük artışına otomatik olarak yanıt vermesini sağlar.

---

## 🎯 Auto Scaling Senaryoları

### 1. **EC2 Auto Scaling**
- CPU/Memory kullanımına göre instance sayısını artır/azalt
- Health check ile unhealthy instance'ları değiştir

### 2. **ECS Auto Scaling**
- Container-based scaling
- Service-level auto scaling

### 3. **Application Load Balancer (ALB)**
- Traffic distribution
- Health checks
- SSL termination

---

## 🚀 EC2 Auto Scaling Kurulumu

### 1. Launch Template Oluştur

```bash
# Launch template oluştur
aws ec2 create-launch-template \
  --launch-template-name videosat-backend-template \
  --launch-template-data '{
    "ImageId": "ami-xxx",
    "InstanceType": "t3.medium",
    "KeyName": "videosat-key",
    "SecurityGroupIds": ["sg-xxx"],
    "UserData": "base64-encoded-user-data",
    "IamInstanceProfile": {
      "Arn": "arn:aws:iam::xxx:instance-profile/videosat-backend"
    },
    "TagSpecifications": [{
      "ResourceType": "instance",
      "Tags": [
        {"Key": "Name", "Value": "videosat-backend"},
        {"Key": "Project", "Value": "VideoSat"},
        {"Key": "Environment", "Value": "Production"}
      ]
    }]
  }'
```

### 2. Auto Scaling Group Oluştur

```bash
# Auto Scaling Group oluştur
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name videosat-backend-asg \
  --launch-template LaunchTemplateName=videosat-backend-template,Version='$Latest' \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-xxx,subnet-yyy" \
  --target-group-arns "arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/videosat-backend/xxx" \
  --health-check-type ELB \
  --health-check-grace-period 300
```

### 3. Scaling Policies

#### CPU-Based Scaling
```bash
# Scale-up policy (CPU > 70%)
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name videosat-backend-asg \
  --policy-name scale-up-cpu \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 70.0
  }'
```

#### Memory-Based Scaling
```bash
# Custom metric için CloudWatch metric oluştur
aws cloudwatch put-metric-alarm \
  --alarm-name videosat-high-memory \
  --alarm-description "High memory usage" \
  --metric-name MemoryUtilization \
  --namespace VideoSat/EC2 \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:autoscaling:us-east-1:xxx:scalingPolicy:xxx:autoScalingGroupName/videosat-backend-asg:policyName/scale-up-memory"
```

### 4. Scheduled Scaling

```bash
# Peak hours için scale-up
aws autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name videosat-backend-asg \
  --scheduled-action-name scale-up-peak-hours \
  --recurrence "0 8 * * *" \
  --min-size 4 \
  --max-size 10 \
  --desired-capacity 6

# Off-peak hours için scale-down
aws autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name videosat-backend-asg \
  --scheduled-action-name scale-down-off-peak \
  --recurrence "0 2 * * *" \
  --min-size 2 \
  --max-size 6 \
  --desired-capacity 2
```

---

## 🚀 ECS Auto Scaling Kurulumu

### 1. ECS Service Oluştur

```bash
# ECS service oluştur
aws ecs create-service \
  --cluster videosat-cluster \
  --service-name videosat-backend \
  --task-definition videosat-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/videosat-backend/xxx,containerName=videosat-backend,containerPort=3000"
```

### 2. Service Auto Scaling

```bash
# Service auto scaling yapılandır
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/videosat-cluster/videosat-backend \
  --min-capacity 2 \
  --max-capacity 10

# Target tracking scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/videosat-cluster/videosat-backend \
  --policy-name ecs-target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

---

## 📊 Monitoring & Metrics

### CloudWatch Metrics
- **CPUUtilization**: CPU kullanımı
- **MemoryUtilization**: Memory kullanımı
- **NetworkIn/Out**: Network trafiği
- **RequestCount**: API request sayısı
- **ResponseTime**: API response time

### Auto Scaling Metrics
- **GroupDesiredCapacity**: İstenen kapasite
- **GroupInServiceInstances**: Çalışan instance sayısı
- **GroupTotalInstances**: Toplam instance sayısı

---

## 🔧 Best Practices

### 1. **Gradual Scaling**
- Scale-out: Hızlı (60 saniye cooldown)
- Scale-in: Yavaş (300 saniye cooldown)
- Ani trafik artışlarına hazır ol

### 2. **Health Checks**
- ELB health checks kullan
- Grace period: 300 saniye
- Unhealthy instance'ları hemen değiştir

### 3. **Cost Optimization**
- Min size: 2 (high availability için)
- Max size: Trafiğe göre ayarla
- Scheduled scaling kullan (peak hours)

### 4. **Monitoring**
- CloudWatch alarms kur
- Auto scaling event'lerini logla
- Cost monitoring aktif et

---

## 💰 Maliyet

### EC2 Auto Scaling
- **Instance Cost**: Kullanılan instance sayısına göre
- **Data Transfer**: Instance'lar arası data transfer
- **Load Balancer**: ALB maliyeti (~$16/ay)

### ECS Auto Scaling
- **Fargate**: vCPU ve memory kullanımına göre
- **ALB**: Load balancer maliyeti
- **CloudWatch**: Metric ve log maliyeti

**Tahmini Aylık Maliyet**: $100-500 (kullanıma göre)

---

## 🧪 Test Senaryoları

### 1. **Load Test**
```bash
# Yük testi ile auto scaling'i test et
ab -n 10000 -c 100 https://api.basvideo.com/api/health

# CloudWatch'da instance sayısını izle
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names videosat-backend-asg \
  --query 'AutoScalingGroups[0].Instances[*].InstanceId' \
  --output table
```

### 2. **Scale-Out Test**
- CPU kullanımını yapay olarak artır
- Auto scaling'in devreye girdiğini kontrol et
- Yeni instance'ların sağlıklı olduğunu doğrula

### 3. **Scale-In Test**
- Trafiği azalt
- Auto scaling'in instance'ları azalttığını kontrol et
- Grace period'un çalıştığını doğrula

---

## 📝 Notlar

- Auto scaling için ALB veya NLB gerekli
- Health checks düzgün yapılandırılmalı
- Cooldown period'ları optimize edilmeli
- Cost monitoring aktif olmalı

---

**Son Güncelleme**: 2024-11-06

