
import { ReactNode } from "react";

export interface TreatmentType {
  id: number;
  name: string;
  nickname: string;
  form: string;
  content: string;
  goal: string;
  effect: string;
  additional: string;
  icon: ReactNode;
  image: string;
}

export interface AdvantageType {
  title: string;
  description: string;
}

export interface StimulatorCategory {
  category: string;
  items: string[];
}

export interface GrowthFactorType {
  name: string;
  fullName: string;
}
