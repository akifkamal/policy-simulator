{{/*
Expand the name of the chart.
*/}}
{{- define "policy-simulator.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "policy-simulator.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label
*/}}
{{- define "policy-simulator.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "policy-simulator.labels" -}}
helm.sh/chart: {{ include "policy-simulator.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "policy-simulator.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "policy-simulator.name" . }}-backend
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Worker selector labels
*/}}
{{- define "policy-simulator.worker.selectorLabels" -}}
app.kubernetes.io/name: {{ include "policy-simulator.name" . }}-worker
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: worker
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "policy-simulator.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "policy-simulator.name" . }}-frontend
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
PostgreSQL host
*/}}
{{- define "policy-simulator.postgresql.host" -}}
{{- printf "%s-postgresql" .Release.Name }}
{{- end }}

{{/*
Redis host
*/}}
{{- define "policy-simulator.redis.host" -}}
{{- printf "%s-redis-master" .Release.Name }}
{{- end }}

{{/*
Database URL
*/}}
{{- define "policy-simulator.databaseUrl" -}}
{{- printf "postgresql://postgres:%s@%s:5432/%s" .Values.postgresql.auth.postgresPassword (include "policy-simulator.postgresql.host" .) .Values.postgresql.auth.database }}
{{- end }}

{{/*
Celery broker URL
*/}}
{{- define "policy-simulator.celeryBrokerUrl" -}}
{{- printf "redis://%s:6379/0" (include "policy-simulator.redis.host" .) }}
{{- end }}
