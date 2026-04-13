/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MeasurementRecord {
  round: number; // 회차 (1차, 2차 ...)
  measuredOD: string;
  measuredID: string;
  measuredT: string;
  remainingOD: string;
  remainingID: string;
  remainingT: string;
  averageDimension: string; // 평균치수 (OD, ID, T의 평균)
  averageMargin: string; // 평균여유치 (남은 여유치의 평균)
}

export interface RingMillData {
  id: string;
  manufacturingNo: string; // 제조번호 (텍스트 포함 가능)
  sn: string; // 시리얼 넘버 (001-999)
  size: string; // 수주치수 (SIZE) (OD x ID x T mm)
  margin: string; // 여유치 (OD x ID x T mm)
  appliedMargin: string; // 실적용여유치 (OD x ID x T mm)
  material: string; // 재질
  heatTreatmentType: 'QT' | 'N' | 'S/A' | '기타' | string; // 열처리종류
  measurements: MeasurementRecord[]; // 다중 측정 기록부
  coldDimension: string; // 목표 냉간치수 (OD x ID x T mm)
  hotDimension: string; // 목표 열간치수 (OD x ID x T mm)
  workDate: string; // 작업일자
  shift: 'Day' | 'Night'; // 주간/야간
  worker: string; // 작업자
  thermalExpansionCoefficient: number; // 설정된 열팽창계수
  appliedThermalExpansionCoefficient: number; // 적용된 열팽창계수
  createdAt: string;
}

export type RingMillDataInput = Omit<RingMillData, 'id' | 'createdAt'>;
