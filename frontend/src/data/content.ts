import type { FeatureType, StepType, TestimonialType } from "@/types/index";
import {
  Brain,
  ClipboardList,
  Cpu,
  FileCheck,
  Search,

} from "lucide-react";

export const features: FeatureType[] = [
  {
    id: 1,
    title: "AI-Powered Analysis",
    description:
      "Our advanced algorithms analyze symptoms and medical data to predict potential health issues with high accuracy.",
    icon: Brain,
  },
  {
    id: 2,
    title: "Early Detection",
    description:
      "Identify diseases at their earliest stages, increasing treatment effectiveness and improving outcomes.",
    icon: Search,
  },


];

export const steps: StepType[] = [
  {
    id: 1,
    title: "Input Your Symptoms",
    description:
      "Enter your symptoms and health information through our user-friendly interface.",
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "AI Analysis",
    description:
      "Our AI system analyzes your data against millions of medical records and latest research.",
    icon: Cpu,
  },
 
  {
    id: 4,
    title: "Receive Results",
    description:
      "Get your comprehensive health prediction report with actionable insights.",
    icon: FileCheck,
  },
];

export const testimonials: TestimonialType[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    content:
      "This prediction tool has transformed how I approach early diagnosis. The accuracy is remarkable, and it's helped me identify several critical conditions before they became serious.",
    avatar:
      "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Patient",
    content:
      "Thanks to this service, doctors caught my condition early. The interface was easy to use, and the predictions were spot-on. I'm incredibly grateful for this technology.",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Neurologist",
    content:
      "As a specialist, I appreciate the detailed analysis this tool provides. It helps me make more informed decisions and gives my patients peace of mind.",
    avatar:
      "https://images.pexels.com/photos/5214413/pexels-photo-5214413.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];
