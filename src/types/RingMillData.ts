/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RingMillData {
  id: string;
  manufacturingNo: string; // 제조번호 (6-5-3 포맷)
  sn: string; // 시리얼 넘버 (001-999)
  size: string; // 규격 (OD x ID x T mm)
  margin: string; // 여유치 (OD x ID x T mm)
  appliedMargin: string; // 실적용여유치 (OD x ID x T mm)
  material: string; // 재질
  heatTreatmentType: 'QT' | 'N' | 'S/A' | '기타'; // 열처리종류
  resultDimension: number; // 결과치수 (단일값 유지 또는 필요시 확장)
  workDate: string; // 작업일자
  worker: string; // 작업자
  thermalExpansionCoefficient: number; // 열팽창계수
  hotDimension: string; // 열간치수 (OD x ID x T mm)
  coldDimension: string; // 냉간치수 (OD x ID x T mm)
  createdAt: string;
}

export type RingMillDataInput = Omit<RingMillData, 'id' | 'createdAt'>;
