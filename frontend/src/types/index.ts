import type { LucideIcon } from "lucide-react";

export type TestimonialType = {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
};

export type FeatureType = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type StepType = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
};
